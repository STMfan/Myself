import assert from 'node:assert/strict';
import { canvasScale, motionRetention, RenderBudget, RenderClock } from '../src/lib/renderQuality.ts';

// Deterministic scheduling and motion tests. These are NOT GPU/FPS benchmarks.
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
const close = (actual, expected, tolerance, message) => check(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);
const rows = [];
for (const inputHz of [24, 30, 30.5, 45, 59.94, 60, 75, 90, 120, 144, 240]) {
  for (const cap of [0, 60, 45]) {
    const clock = new RenderClock();
    const times = [];
    let callbacks = 0;
    let totalDraws = 0;
    for (let i = 0; i < inputHz * 20; i++) {
      const now = i * 1000 / inputHz;
      callbacks++;
      const delta = clock.tick(now, cap);
      if (delta === null) continue;
      totalDraws++;
      if (now >= 1000) times.push(now);
    }
    const drawHz = (times.length - 1) * 1000 / (times.at(-1) - times[0]);
    close(drawHz, cap ? Math.min(inputHz, cap) : inputHz, 0.06, `cadence ${inputHz}Hz, cap=${cap}`);
    if (!cap) check(totalDraws === callbacks, `uncapped ${inputHz}Hz must use every callback`);
    rows.push({ inputCallbackHz: inputHz, cap, drawHz: +drawHz.toFixed(3) });
  }
}

function simulation(inputHz, cost, duration = 40000) {
  const clock = new RenderClock();
  const budget = new RenderBudget(0);
  const transitions = [];
  const checkpoints = [];
  let rate = budget.fps;
  for (let i = 0; i * 1000 / inputHz < duration; i++) {
    const now = i * 1000 / inputHz;
    budget.frame(now);
    if (rate !== budget.fps) {
      rate = budget.fps;
      transitions.push({ at: +now.toFixed(2), fps: rate });
    }
    if (clock.tick(now, rate) !== null) budget.recordRender(typeof cost === 'function' ? cost(now, rate) : cost);
    if (i % inputHz === 0) checkpoints.push(rate);
  }
  return { budget, transitions, checkpoints };
}

// Sufficient CPU headroom must never acquire an application cap.
for (const hz of [24, 30.5, 60, 75, 120, 144, 240]) {
  check(simulation(hz, 0.5).transitions.length === 0, `cheap draw at ${hz}Hz stays native`);
}
// Global callback stalls are not charged to this renderer.
const slow = new RenderBudget(0);
let now = 0;
for (let i = 0; i < 3000; i++) {
  now += i % 5 === 0 ? 50 : 1000 / 60;
  slow.frame(now);
  slow.recordRender(0);
}
check(slow.fps === 0, 'unrelated slow callbacks do not trigger CPU backpressure');

const overloaded = simulation(60, 12, 18000);
check(overloaded.transitions.map(t => t.fps).join(',') === '60,45', 'sustained own CPU cost steps through 60 to 45 only');
check(overloaded.transitions[0].at >= 5900, 'warm-up and two sustained windows precede a cap');
const highRefresh = simulation(120, 6);
check(highRefresh.transitions.map(t => t.fps).join(',') === '60', '120Hz own CPU saturation settles at 60 without needless 45/native oscillation');

const recovery = simulation(60, time => time < 15000 ? 12 : 1, 50000);
check(recovery.transitions.map(t => t.fps).join(',') === '60,45,60,0', 'sustained recovery returns through 60 to native');
check(recovery.transitions.at(-1).at > 35000, 'recovery uses healthy windows, not one cheap frame');
const spike = simulation(60, time => time >= 3000 && time < 3020 ? 100 : 0.5);
check(spike.transitions.length === 0, 'isolated shader/load cost spike does not cap rendering');
overloaded.budget.reset(20000);
check(overloaded.budget.fps === 0, 'visibility/size reset clears an old cap');

// Suspension resets temporal debt; a clock call never creates catch-up draws.
const paused = new RenderClock();
paused.tick(0, 45);
paused.tick(20, 45);
close(paused.tick(10000, 45), 1 / 30, 1e-12, 'background suspension does not cause a large simulation step');
check(paused.tick(10000, 45) === null, 'no burst of catch-up frames after resumption');
paused.reset();
check(paused.tick(10001, 0) !== null, 'reset restores the next uncapped callback immediately');

// Integrating the existing damping and inertia over one second should give the
// same result on 30, 45, 60 and 144Hz callbacks, not a faster moon on fast screens.
function integrate(hz) {
  let velocity = 0.03;
  let distance = 0;
  let residual = 1;
  for (let i = 0; i < hz; i++) {
    const keep = motionRetention(0.94, 1 / hz);
    distance += velocity * (1 - keep) / (1 - 0.94);
    velocity *= keep;
    residual *= motionRetention(0.88, 1 / hz);
  }
  return { distance, velocity, residual };
}
const reference = integrate(30);
for (const hz of [45, 60, 75, 120, 144, 240]) {
  const result = integrate(hz);
  for (const key of Object.keys(reference)) close(result[key], reference[key], 1e-10, `time-based ${key} at ${hz}Hz`);
}

// Existing normal allocation ceilings stay independent of cadence adaptation.
globalThis.window = { devicePixelRatio: 1 };
let allocations = 0;
for (const width of [320, 390, 844, 1280, 1440, 3840, 7680]) {
  for (const height of [180, 390, 720, 844, 900, 2160, 4320]) {
    for (const dpr of [1, 1.25, 1.5, 2, 3]) {
      window.devicePixelRatio = dpr;
      for (const pixels of [800000, 1048576]) {
        const scale = canvasScale(width, height, pixels);
        check(Math.floor(width * scale) * Math.floor(height * scale) <= pixels, 'allocation stays within the original normal pixel ceiling');
        check(width * scale <= 4096 && height * scale <= 4096, 'allocation stays within maximum side');
        allocations++;
      }
    }
  }
}
console.log(JSON.stringify({ kind: 'source-scheduling-tests-NOT-presented-FPS', checks, allocationCombinations: allocations, cadence: rows, overload: overloaded.transitions, highRefresh: highRefresh.transitions, recovery: recovery.transitions }, null, 2));

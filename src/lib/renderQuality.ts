/** Limit allocation by rendered pixel area, independently of screen DPR. */
export function canvasScale(width: number, height: number, maxPixels: number): number {
  return Math.min(
    window.devicePixelRatio || 1,
    1.5,
    Math.sqrt(maxPixels / Math.max(1, width * height)),
    4096 / Math.max(width, height, 1),
  );
}

/** 0 follows rAF without an application frame-rate cap. */
export type RenderFrameRate = 0 | 60 | 45;

/**
 * CPU backpressure for this renderer only. Slow rAF callbacks alone do not prove
 * that a canvas is expensive, and WebGL submission time is not GPU completion.
 * Keep resolution independent of this policy. GPU pressure needs separate data.
 */
export class RenderBudget {
  private target: RenderFrameRate = 0;
  private previous: number | null = null;
  private windowStart: number;
  private warmUntil: number;
  private gaps: number[] = [];
  private draws = 0;
  private cost = 0;
  private measuring = false;
  private overloadedWindows = 0;
  private healthyWindows = 0;

  constructor(now = performance.now()) {
    this.windowStart = now;
    this.warmUntil = now + 2000;
  }

  get fps(): RenderFrameRate {
    return this.target;
  }

  /** A new visibility / size / motion context starts without a stale cap. */
  reset(now = performance.now()): void {
    this.target = 0;
    this.previous = null;
    this.restart(now);
  }

  private restart(now: number): void {
    this.windowStart = now;
    this.warmUntil = now + 2000;
    this.gaps = [];
    this.draws = this.cost = 0;
    this.measuring = false;
    this.overloadedWindows = this.healthyWindows = 0;
  }

  /** Observe each active rAF, including callbacks where the clock skips drawing. */
  frame(now: number): void {
    const gap = this.previous === null ? 0 : now - this.previous;
    this.previous = now;
    if (gap < 0 || gap > 250) {
      // A suspension or debugger pause is not evidence of sustained draw cost.
      this.restart(now);
      return;
    }
    this.measuring = now >= this.warmUntil;
    if (!this.measuring) return;
    if (this.windowStart < this.warmUntil) this.windowStart = now;
    if (gap > 0 && this.gaps.length < 1024) this.gaps.push(gap);

    const elapsed = now - this.windowStart;
    if (elapsed < 2000) return;
    if (this.draws > 0 && this.gaps.length > 0) {
      const meanCost = this.cost / this.draws;
      const utilization = this.cost / elapsed;
      this.gaps.sort((a, b) => a - b);
      // A callback-cadence estimate, never presented FPS or a GPU measurement.
      const callbackHz = 1000 / this.gaps[Math.floor(this.gaps.length * 0.2)];
      const nextHz = this.target === 45 ? Math.min(60, callbackHz) : callbackHz;
      const canRecover = meanCost * nextHz / 1000 < 0.45;
      this.overloadedWindows = utilization > 0.65 ? this.overloadedWindows + 1 : 0;
      this.healthyWindows = canRecover ? this.healthyWindows + 1 : 0;

      if (this.overloadedWindows >= 2 && this.target !== 45) {
        this.target = this.target === 0 ? 60 : 45;
        this.overloadedWindows = this.healthyWindows = 0;
      } else if (this.healthyWindows >= 6 && this.target !== 0) {
        this.target = this.target === 45 ? 60 : 0;
        this.overloadedWindows = this.healthyWindows = 0;
      }
    }
    this.windowStart = now;
    this.gaps = [];
    this.draws = this.cost = 0;
  }

  /** Call after an actual draw, never for skipped frames. */
  recordRender(cpuMilliseconds: number): void {
    if (!this.measuring || !Number.isFinite(cpuMilliseconds) || cpuMilliseconds < 0) return;
    this.draws += 1;
    this.cost += cpuMilliseconds;
  }
}

/** Phase-preserving optional throttle; never draws a burst to catch up. */
export class RenderClock {
  private previous: number | null = null;
  private due: number | null = null;
  private rate: RenderFrameRate = 0;

  reset(): void {
    this.previous = this.due = null;
    this.rate = 0;
  }

  /** Seconds since the previous draw, or null if this callback should be skipped. */
  tick(now: number, fps: RenderFrameRate): number | null {
    if (this.previous !== null && (now < this.previous || now - this.previous > 250)) this.reset();
    const interval = fps ? 1000 / fps : 0;
    if (fps !== this.rate) {
      this.due = interval && this.previous !== null ? this.previous + interval : now;
      this.rate = fps;
    }
    if (interval) {
      const due = this.due ?? now;
      if (now < due - 0.5) return null;
      this.due = due + Math.max(1, Math.floor((now - due + 0.5) / interval) + 1) * interval;
    }
    const delta = this.previous === null ? 1 / 30 : Math.min(0.1, Math.max(0, now - this.previous) / 1000);
    this.previous = now;
    return delta;
  }
}

/** Preserve the existing 30Hz motion rates when draw cadence changes. */
export function motionRetention(retentionAt30Hz: number, delta: number): number {
  return Math.pow(retentionAt30Hz, delta * 30);
}

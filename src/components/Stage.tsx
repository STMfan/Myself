import { useEffect, useRef } from 'react';
import { getScrollReading } from '../lib/scroll';
import { pointer } from '../lib/pointer';
import { canvasScale, motionRetention, RenderBudget, RenderClock } from '../lib/renderQuality';

interface Star {
  x: number;
  y: number;
  depth: number;
  radius: number;
  phase: number;
  speed: number;
}

interface Mote {
  x: number;
  y: number;
  depth: number;
  size: number;
  phase: number;
}

interface Palette {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  star: string;
  glow: string;
  grid: string;
  core: string;
}

const PALETTES: Record<'dark' | 'light', Palette> = {
  dark: {
    skyTop: '#020308',
    skyMid: '#070c17',
    skyBottom: '#0b1120',
    star: '#e8eeff',
    glow: '#f2a24b',
    grid: 'rgba(183,198,232,0.15)',
    core: '#020308',
  },
  light: {
    skyTop: '#eef1f5',
    skyMid: '#f3f5f8',
    skyBottom: '#f7f8fa',
    star: '#2a3854',
    glow: '#c06a22',
    grid: 'rgba(56,72,100,0.15)',
    core: '#f4f5f7',
  },
};

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const touch = window.matchMedia('(hover: none), (pointer: coarse)');
    let calm = document.documentElement.dataset.motion === 'calm' || reducedMotion.matches;
    let compact = touch.matches || window.innerWidth < 768;
    const budget = new RenderBudget();
    const clock = new RenderClock();
    let paused = false;
    const resetTiming = () => {
      budget.reset();
      clock.reset();
      paused = false;
      if (canvas.dataset.renderFps !== 'native') canvas.dataset.renderFps = 'native';
    };
    const random = mulberry32(2718);
    const stars: Star[] = Array.from({ length: compact ? 70 : calm ? 80 : 118 }, () => ({
      x: random(),
      y: random(),
      depth: 0.18 + random() * 0.92,
      radius: 0.3 + random() * 1.5,
      phase: random() * Math.PI * 2,
      speed: 0.4 + random() * 1.5,
    }));
    const motes: Mote[] = Array.from({ length: compact ? 6 : calm ? 8 : 12 }, () => ({
      x: random(),
      y: random(),
      depth: 0.35 + random() * 0.85,
      size: 0.6 + random() * 1.8,
      phase: random() * Math.PI * 2,
    }));

    type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number };
    const meteors: Meteor[] = [];
    let nextMeteor = 6000;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let palette = PALETTES.dark;
    let frame = 0;
    let raf = 0;
    let dirty = true;
    let lastProgress = -1;

    const readPalette = () => {
      const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
      palette = PALETTES[theme];
      dirty = true;
      resetTiming();
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      compact = touch.matches || width < 768;
      dpr = canvasScale(width, height, 800_000);
      const pixelWidth = Math.max(1, Math.floor(width * dpr));
      const pixelHeight = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      dirty = true;
      resetTiming();
    };

    readPalette();
    resize();

    const observer = new MutationObserver(readPalette);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-motion'],
    });

    const onResize = () => resize();
    const onVisibility = () => {
      resetTiming();
      dirty = true;
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (document.hidden) return;
      calm = document.documentElement.dataset.motion === 'calm' || reducedMotion.matches;
      const { progress, velocity } = getScrollReading();
      // Keep the ambient field live while scrolling. It is already capped at
      // 30fps and the large sky/floor surfaces are static CSS.
      if (calm && !dirty && progress === lastProgress) {
        if (!paused) {
          resetTiming();
          paused = true;
        }
        return;
      }
      paused = false;
      budget.frame(now);
      const delta = clock.tick(now, 30);
      if (delta === null) return;
      const started = performance.now();
      const step = delta * 30;
      lastProgress = progress;
      dirty = false;
      const depthShift = Math.min(1, Math.abs(velocity) / 180);
      const pointerBlend = 1 - motionRetention(1 - 0.045, delta);
      pointer.x += (pointer.targetX - pointer.x) * pointerBlend;
      pointer.y += (pointer.targetY - pointer.y) * pointerBlend;

      // The sky, horizon and grid are static CSS layers now. The canvas only
      // clears and paints particles, so wide screens do not rebuild large
      // gradients every frame.
      context.clearRect(0, 0, width, height);

      const starFade = Math.max(0, 1 - progress * 1.3);
      for (const star of stars) {
        const parallax = progress * 300 * star.depth;
        const px = star.x * width + (pointer.x - 0.5) * -44 * star.depth;
        const py =
          ((star.y * height - parallax) % (height + 80) + height + 80) % (height + 80) - 40;
        const twinkle =
          0.3 + 0.7 * Math.abs(Math.sin(frame * 0.0011 * star.speed + star.phase));
        const alpha = twinkle * starFade * (0.26 + star.depth * 0.62);
        if (alpha <= 0.01) continue;
        context.globalAlpha = alpha;
        context.strokeStyle = palette.star;
        context.lineWidth = Math.max(0.4, star.radius * 0.7);
        const streak = 1 + depthShift * 10 * star.depth;
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(px, py + streak);
        context.stroke();
      }
      context.globalAlpha = 1;

      if (!compact && !calm) {
        if (meteors.length === 0 && now > nextMeteor) {
          meteors.push({
            x: width * (0.32 + random() * 0.62),
            y: height * (0.04 + random() * 0.3),
            vx: -width * (0.004 + random() * 0.003),
            vy: height * (0.0024 + random() * 0.002),
            life: 34 + random() * 26,
            max: 34 + random() * 26,
          });
          nextMeteor = now + 8000 + random() * 6000;
        }
        for (let i = meteors.length - 1; i >= 0; i -= 1) {
          const meteor = meteors[i];
          meteor.x += meteor.vx * step;
          meteor.y += meteor.vy * step;
          meteor.life -= step;
          if (meteor.life <= 0) {
            meteors.splice(i, 1);
            continue;
          }
          const tailX = meteor.x - meteor.vx * 34;
          const tailY = meteor.y - meteor.vy * 34;
          const trail = context.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
          trail.addColorStop(0, palette.star);
          trail.addColorStop(0.55, `${palette.glow}cc`);
          trail.addColorStop(1, `${palette.glow}00`);
          const alpha = meteor.life / meteor.max;
          context.globalAlpha = alpha * 0.22;
          context.strokeStyle = palette.glow;
          context.lineWidth = 5;
          context.beginPath();
          context.moveTo(meteor.x, meteor.y);
          context.lineTo(tailX, tailY);
          context.stroke();
          context.globalAlpha = alpha * 0.9;
          context.strokeStyle = trail;
          context.lineWidth = 1.8;
          context.beginPath();
          context.moveTo(meteor.x, meteor.y);
          context.lineTo(tailX, tailY);
          context.stroke();
        }
        context.globalAlpha = 1;
      }

      const moteAlpha = 0.13 + progress * 0.46;
      for (const mote of motes) {
        const px = mote.x * width + Math.sin(frame * 0.0004 + mote.phase) * 26;
        const py =
          ((mote.y * height - frame * 0.012 * mote.depth - progress * height * 0.32) %
            (height + 60) +
            height +
            60) %
            (height + 60) -
          30;
        context.globalAlpha = moteAlpha * (0.3 + mote.depth * 0.5);
        context.fillStyle = palette.glow;
        context.beginPath();
        context.arc(px, py, mote.size * (0.5 + mote.depth), 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      if (!calm) frame += step;
      budget.recordRender(performance.now() - started);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="stage" aria-hidden="true">
      <div className="stage__sky" />
      <div className="stage__starfield" />
      <svg
        className="stage__floor"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[0, 16, 38, 68, 108, 158, 218, 288, 356].map((y) => (
          <line key={`h-${y}`} x1="0" y1={y} x2="1440" y2={y} />
        ))}
        {Array.from({ length: 17 }, (_, index) => {
          const i = index - 8;
          return (
            <line
              key={`v-${i}`}
              x1={720 + i * 38}
              y1="0"
              x2={720 + i * 190}
              y2="360"
            />
          );
        })}
      </svg>
      <canvas ref={canvasRef} className="stage__canvas" />
      <div className="stage__aurora" aria-hidden="true" />
      <div className="stage__orbits" aria-hidden="true">
        <span className="stage__orbit stage__orbit--a" />
        <span className="stage__orbit stage__orbit--b" />
      </div>
      <svg
        className="stage__flow"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          className="stage__flow-path stage__flow-path--a"
          d="M-80 760C210 520 480 900 780 610S1240 420 1520 540"
        />
        <path
          className="stage__flow-path stage__flow-path--b"
          d="M-60 210C260 420 540 60 860 280S1300 520 1520 300"
        />
      </svg>
    </div>
  );
}

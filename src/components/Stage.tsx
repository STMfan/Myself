import { useEffect, useRef } from 'react';
import { getScrollReading } from '../lib/scroll';
import { pointer } from '../lib/pointer';

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

    const calm = document.documentElement.dataset.motion === 'calm';
    const compact =
      window.matchMedia('(hover: none)').matches || window.innerWidth < 768;
    const random = mulberry32(2718);
    const stars: Star[] = Array.from({ length: compact ? 120 : calm ? 160 : 260 }, () => ({
      x: random(),
      y: random(),
      depth: 0.18 + random() * 0.92,
      radius: 0.3 + random() * 1.5,
      phase: random() * Math.PI * 2,
      speed: 0.4 + random() * 1.5,
    }));
    const motes: Mote[] = Array.from({ length: compact ? 18 : calm ? 24 : 46 }, () => ({
      x: random(),
      y: random(),
      depth: 0.35 + random() * 0.85,
      size: 0.6 + random() * 1.8,
      phase: random() * Math.PI * 2,
    }));

    type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number };
    const meteors: Meteor[] = [];
    let nextMeteor = 2400;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let palette = PALETTES.dark;
    let frame = 0;
    let raf = 0;
    let lastPaint = 0;
    const minFrame = 1000 / 30;

    const readPalette = () => {
      const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
      palette = PALETTES[theme];
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    readPalette();
    resize();

    const observer = new MutationObserver(readPalette);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (compact && now - lastPaint < minFrame) return;
      lastPaint = now;

      const { progress, velocity } = getScrollReading();
      const depthShift = Math.min(1, Math.abs(velocity) / 180);
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;

      const sky = context.createLinearGradient(0, 0, width * 0.2, height);
      sky.addColorStop(0, palette.skyTop);
      sky.addColorStop(0.56, palette.skyMid);
      sky.addColorStop(1, palette.skyBottom);
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);

      const warm = context.createRadialGradient(
        width * 0.2,
        height * 0.34 + height * 0.16 * progress,
        0,
        width * 0.2,
        height * 0.34 + height * 0.16 * progress,
        Math.max(width, height) * 0.72,
      );
      const glowAlpha = document.documentElement.dataset.theme === 'light' ? '06' : '1e';
      warm.addColorStop(0, `${palette.glow}${glowAlpha}`);
      warm.addColorStop(0.45, 'transparent');
      context.fillStyle = warm;
      context.fillRect(0, 0, width, height);

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
        if (now > nextMeteor) {
          meteors.push({
            x: width * (0.32 + random() * 0.62),
            y: height * (0.04 + random() * 0.3),
            vx: -width * (0.004 + random() * 0.003),
            vy: height * (0.0024 + random() * 0.002),
            life: 34 + random() * 26,
            max: 34 + random() * 26,
          });
          nextMeteor = now + 3000 + random() * 4200;
        }
        for (let i = meteors.length - 1; i >= 0; i -= 1) {
          const meteor = meteors[i];
          meteor.x += meteor.vx;
          meteor.y += meteor.vy;
          meteor.life -= 1;
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

      const horizon = height * (0.92 - progress * 0.16);
      const haze = context.createLinearGradient(
        0,
        horizon - height * 0.24,
        0,
        horizon + height * 0.08,
      );
      haze.addColorStop(0, 'transparent');
      haze.addColorStop(0.72, `${palette.glow}12`);
      haze.addColorStop(1, `${palette.glow}00`);
      context.fillStyle = haze;
      context.fillRect(0, horizon - height * 0.24, width, height * 0.34);

      context.strokeStyle = palette.grid;
      context.lineWidth = 0.7;
      context.globalAlpha = 0.35 + progress * 0.5;
      for (let i = 0; i < 9; i += 1) {
        const t = i / 8;
        const y = horizon + Math.pow(t, 1.8) * (height - horizon) * 1.2;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      const vanish = width * (0.5 + (pointer.x - 0.5) * 0.1);
      for (let i = -7; i <= 7; i += 1) {
        context.beginPath();
        context.moveTo(vanish + i * width * 0.02, horizon);
        context.lineTo(vanish + i * width * 0.16, height);
        context.stroke();
      }
      context.globalAlpha = 1;

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

      frame += 1;
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="stage" aria-hidden="true">
      <canvas ref={canvasRef} className="stage__canvas" />
      <div className="stage__atmosphere" />
      <div className="stage__atmosphere stage__atmosphere--warm" />
      <div className="stage__aurora" aria-hidden="true" />
      <div className="stage__orbits" aria-hidden="true">
        <span className="stage__orbit stage__orbit--a" />
        <span className="stage__orbit stage__orbit--b" />
        <span className="stage__orbit stage__orbit--c" />
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
        <path
          className="stage__flow-path stage__flow-path--c"
          d="M120 960C320 640 700 760 900 470S1240 180 1480 120"
        />
      </svg>
    </div>
  );
}

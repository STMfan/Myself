import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let tickerAttached = false;
let removeListeners: (() => void) | null = null;

export interface ScrollReading {
  progress: number;
  velocity: number;
  y: number;
}

const reading: ScrollReading = { progress: 0, velocity: 0, y: 0 };

export function isCalm(): boolean {
  if (typeof document === 'undefined') return true;
  return document.documentElement.dataset.motion === 'calm';
}

export function getScrollReading(): ScrollReading {
  return reading;
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function initSmoothScroll(): () => void {
  if (typeof window === 'undefined') return () => {};

  if (isCalm()) {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      reading.y = window.scrollY;
      reading.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      reading.velocity = 0;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }

  lenis = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
  });

  const onLenisScroll = (instance: Lenis) => {
    reading.y = instance.scroll;
    reading.progress = instance.progress ?? 0;
    reading.velocity = instance.velocity ?? 0;
    ScrollTrigger.update();
  };

  lenis.on('scroll', onLenisScroll);

  const tick = (time: number) => {
    lenis?.raf(time * 1000);
  };

  if (!tickerAttached) {
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    tickerAttached = true;
  }

  removeListeners = () => {
    gsap.ticker.remove(tick);
    tickerAttached = false;
  };

  return () => {
    removeListeners?.();
    removeListeners = null;
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToId(id: string, offset = 0): void {
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY + offset;
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.5, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  } else {
    window.scrollTo({ top, behavior: isCalm() ? 'auto' : 'smooth' });
  }
}

export function scrollToTop(): void {
  if (lenis) lenis.scrollTo(0, { duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: isCalm() ? 'auto' : 'smooth' });
}

export { gsap, ScrollTrigger };

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function isCalm(): boolean {
  if (typeof document === 'undefined') return true;
  return document.documentElement.dataset.motion === 'calm';
}

export interface ScrollReading {
  progress: number;
  velocity: number;
  y: number;
}

const reading: ScrollReading = { progress: 0, velocity: 0, y: 0 };
let tracker: ScrollTrigger | null = null;

export function startScrollTracking(): void {
  if (typeof window === 'undefined' || tracker) return;
  tracker = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      reading.progress = self.progress;
      reading.velocity = self.getVelocity();
      reading.y = self.scroll();
    },
  });
}

export function stopScrollTracking(): void {
  tracker?.kill();
  tracker = null;
}

export function getScrollReading(): ScrollReading {
  return reading;
}

export function navHeight(): number {
  if (typeof window === 'undefined') return 72;
  const value = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : window.innerWidth <= 720 ? 64 : 72;
}

export function scrollToId(id: string, extra = 12): void {
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - navHeight() - extra;
  window.scrollTo({ top: Math.max(0, top), behavior: isCalm() ? 'auto' : 'smooth' });
}

export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: isCalm() ? 'auto' : 'smooth' });
}

export { gsap, ScrollTrigger };

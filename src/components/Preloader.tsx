import { useEffect, useRef, useState } from 'react';
import { useCopy } from '../lib/preferences';
import { Sigil } from './Type';

const DURATION = 1750;

export function Preloader({ onDone }: { onDone: () => void }) {
  const { ui } = useCopy();
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    const calm =
      document.documentElement.dataset.motion === 'calm' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (calm) {
      document.documentElement.dataset.booted = 'true';
      onDone();
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const raw = Math.min(1, elapsed / DURATION);
      const eased = 1 - Math.pow(1 - raw, 2.4);
      setProgress(Math.round(eased * 100));
      if (raw < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setLeaving(true);
        document.documentElement.dataset.booted = 'true';
        window.setTimeout(() => {
          if (!done.current) {
            done.current = true;
            onDone();
          }
        }, 980);
      }
    };
    raf.current = requestAnimationFrame(tick);

    const skip = () => {
      if (done.current) return;
      cancelAnimationFrame(raf.current);
      setProgress(100);
      setLeaving(true);
      document.documentElement.dataset.booted = 'true';
      window.setTimeout(() => {
        if (!done.current) {
          done.current = true;
          onDone();
        }
      }, 420);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') skip();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', skip, { once: true });

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', skip);
    };
  }, [onDone]);

  return (
    <div className="preloader" data-leaving={leaving} aria-hidden={leaving}>
      <div className="preloader__panel preloader__panel--top" />
      <div className="preloader__panel preloader__panel--bottom" />
      <div className="preloader__content">
        <div className="preloader__mark">
          <Sigil className="preloader__sigil" />
        </div>
        <div className="preloader__readout">
          <span className="mono preloader__line">{ui.preloaderLine}</span>
          <span className="mono preloader__note">{ui.preloaderNote}</span>
        </div>
        <div className="preloader__meter" role="presentation">
          <span className="preloader__meter-fill" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <span className="preloader__count display">{String(progress).padStart(3, '0')}</span>
      </div>
    </div>
  );
}

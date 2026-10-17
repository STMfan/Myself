import { useEffect, useRef, useState } from 'react';
import { useCopy } from '../lib/preferences';
import { Logo } from './Type';

const DURATION = 1500;

export function Preloader({ onDone }: { onDone: () => void }) {
  const { ui } = useCopy();
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const raf = useRef(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const calm =
      document.documentElement.dataset.motion === 'calm' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (calm) {
      document.documentElement.dataset.booted = 'true';
      onDone();
      return;
    }

    const paint = (value: number) => {
      if (countRef.current) {
        countRef.current.textContent = String(value).padStart(3, '0');
      }
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${value / 100})`;
      }
    };

    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / DURATION);
      paint(Math.round((1 - Math.pow(1 - raw, 2.4)) * 100));
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
        }, 950);
      }
    };
    raf.current = requestAnimationFrame(tick);

    const skip = () => {
      if (done.current) return;
      cancelAnimationFrame(raf.current);
      paint(100);
      setLeaving(true);
      document.documentElement.dataset.booted = 'true';
      window.setTimeout(() => {
        if (!done.current) {
          done.current = true;
          onDone();
        }
      }, 320);
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
          <Logo className="preloader__logo" />
        </div>
        <div className="preloader__readout">
          <span className="mono preloader__line">{ui.preloaderLine}</span>
          <span className="mono preloader__note">{ui.preloaderNote}</span>
        </div>
        <div className="preloader__meter" role="presentation">
          <span className="preloader__meter-fill" ref={fillRef} />
        </div>
        <span className="preloader__count display" ref={countRef}>
          000
        </span>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { getScrollReading } from '../lib/scroll';

const APOGEE = 384_400;

export function Altitude() {
  const valueRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef(-1);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const { progress } = getScrollReading();
      const altitude = Math.max(0, APOGEE * Math.pow(1 - Math.min(1, progress), 2.4));
      const rounded = Math.round(altitude / 10) * 10;
      if (valueRef.current && rounded !== lastRef.current) {
        lastRef.current = rounded;
        valueRef.current.textContent = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${Math.max(0.015, progress)})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="altitude" aria-hidden="true">
      <span className="altitude__label mono">ALTITUDE</span>
      <span className="altitude__value mono" ref={valueRef}>
        384 400
      </span>
      <span className="altitude__unit mono">KM</span>
      <span className="altitude__track">
        <span className="altitude__fill" ref={fillRef} />
      </span>
    </div>
  );
}

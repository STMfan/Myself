import { useEffect, useRef, useState } from 'react';
import { useCopy } from '../lib/preferences';
import { Logo } from './Type';

/**
 * A short, non-blocking reveal. It hides the first font/asset swap, has no
 * numeric counter, and a CSS failsafe hides it after 3.4s even if the client
 * bundle never mounts. The underlay is always the prerendered page.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const copy = useCopy();
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    let alive = true;
    let timer = 0;

    const finish = () => {
      if (!alive || done.current) return;
      done.current = true;
      setLeaving(true);
      timer = window.setTimeout(onDone, 430);
    };

    const minimum = new Promise((resolve) => window.setTimeout(resolve, 620));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const maximum = new Promise((resolve) => window.setTimeout(resolve, 1800));

    Promise.race([Promise.all([minimum, fonts]), maximum]).then(finish).catch(finish);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div className={`preloader${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <div className="preloader__inner">
        <Logo className="preloader__logo" size={180} />
        <span className="preloader__line mono">{copy.ui.preloaderLine}</span>
        <span className="preloader__note mono">{copy.ui.preloaderNote}</span>
        <span className="preloader__meter">
          <span className="preloader__meter-fill" />
        </span>
      </div>
    </div>
  );
}

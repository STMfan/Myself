import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { usePreferences } from '../lib/preferences';
import { formatClock, moonPhase, utcOffset } from '../lib/moon';

type CanvasProps = {
  locale: 'zh' | 'en';
  onReady: (ready: boolean) => void;
};

function MoonReadout() {
  const { locale } = usePreferences();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { illumination, name } = moonPhase(now, locale);

  return (
    <dl className="moon__readout">
      <div>
        <dt className="mono">{locale === 'zh' ? '月相' : 'PHASE'}</dt>
        <dd>{name}</dd>
      </div>
      <div>
        <dt className="mono">{locale === 'zh' ? '照明' : 'LIT'}</dt>
        <dd>{Math.round(illumination * 100)}%</dd>
      </div>
      <div>
        <dt className="mono">{locale === 'zh' ? '此刻' : 'NOW'}</dt>
        <dd className="mono">
          {formatClock(now, locale)} <span>{utcOffset(now)}</span>
        </dd>
      </div>
    </dl>
  );
}

export function MoonPanel({ showReadout = false }: { showReadout?: boolean }) {
  const { locale } = usePreferences();
  const [ready, setReady] = useState(false);
  const [Canvas, setCanvas] = useState<ComponentType<CanvasProps> | null>(null);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      import('./MoonCanvas')
        .then((module) => {
          if (active) setCanvas(() => module.MoonCanvas);
        })
        .catch(() => {
          if (active) setReady(false);
        });
    }, 350);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const onReady = useCallback((value: boolean) => setReady(value), []);

  return (
    <div className="moon">
      <div className="moon__stage">
        <span className="moon__rings" aria-hidden="true">
          <span className="moon__ring moon__ring--ticks" />
          <span className="moon__ring moon__ring--outer" />
          <span className="moon__ring moon__ring--orbit">
            <span className="moon__satellite" />
          </span>
          <span className="moon__axis moon__axis--x" />
          <span className="moon__axis moon__axis--y" />
        </span>
        <span className="moon__fallback" data-ready={ready} aria-hidden="true" />
        {Canvas ? <Canvas locale={locale} onReady={onReady} /> : null}
        <span className="moon__badge mono" aria-hidden="true">
          {locale === 'zh' ? '拖动旋转' : 'DRAG TO ROTATE'}
        </span>
      </div>

      {showReadout ? <MoonReadout /> : null}
    </div>
  );
}

export { MoonReadout };

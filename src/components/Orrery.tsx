import { useEffect, useMemo, useState } from 'react';
import { usePreferences } from '../lib/preferences';

const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const DAY = 86_400_000;

const PHASES_ZH = [
  '新月',
  '娥眉月',
  '上弦月',
  '盈凸月',
  '满月',
  '亏凸月',
  '下弦月',
  '残月',
];

const PHASES_EN = [
  'New moon',
  'Waxing crescent',
  'First quarter',
  'Waxing gibbous',
  'Full moon',
  'Waning gibbous',
  'Last quarter',
  'Waning crescent',
];

function moonPhase(date: Date) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / DAY;
  const phase = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH / SYNODIC_MONTH;
  const illumination = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  const index = Math.round(phase * 8) % 8;
  return { phase, illumination, index };
}

export function Orrery() {
  const { locale } = usePreferences();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { illumination, index } = useMemo(() => moonPhase(now), [now]);
  const time = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
  const offsetMinutes = -now.getTimezoneOffset();
  const offset = `UTC${offsetMinutes >= 0 ? '+' : '-'}${String(
    Math.floor(Math.abs(offsetMinutes) / 60),
  ).padStart(2, '0')}`;
  const phaseName = locale === 'zh' ? PHASES_ZH[index] : PHASES_EN[index];
  const shadeOpacity = 0.2 + (1 - illumination) * 0.5;

  return (
    <div className="orrery" data-camera>
      <div className="orrery__dial">
      <div className="orrery__frame" aria-hidden="true">
        <span className="orrery__ring orrery__ring--ticks" />
        <span className="orrery__ring orrery__ring--outer" />
        <span className="orrery__ring orrery__ring--orbit">
          <span className="orrery__satellite" />
        </span>
        <span className="orrery__axis orrery__axis--x" />
        <span className="orrery__axis orrery__axis--y" />
      </div>

      <div className="orrery__disc">
        <img
          className="orrery__moon"
          src="/assets/art/moon-macro.webp"
          alt=""
          width={720}
          height={720}
          loading="eager"
          decoding="async"
        />
        <span
          className="orrery__shade"
          style={{ opacity: shadeOpacity }}
        />
        <span className="orrery__grid-x" aria-hidden="true" />
        <span className="orrery__grid-y" aria-hidden="true" />
        <span className="orrery__reticle" aria-hidden="true" />
        <span className="orrery__limb" />
      </div>
      </div>

      <div className="orrery__readout">
        <div className="orrery__cell">
          <span className="mono">{locale === 'zh' ? '月相' : 'PHASE'}</span>
          <strong className="orrery__value">{phaseName}</strong>
        </div>
        <div className="orrery__cell">
          <span className="mono">{locale === 'zh' ? '照明' : 'LIT'}</span>
          <strong className="orrery__value">{Math.round(illumination * 100)}%</strong>
        </div>
        <div className="orrery__cell">
          <span className="mono">{locale === 'zh' ? '此刻' : 'NOW'}</span>
          <strong className="orrery__value orrery__value--mono">
            {time} <span className="orrery__zone">{offset}</span>
          </strong>
        </div>
      </div>
    </div>
  );
}

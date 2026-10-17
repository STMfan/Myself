const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const DAY = 86_400_000;

const PHASES_ZH = ['新月', '娥眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月'];
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

export function moonPhase(date: Date, locale: 'zh' | 'en') {
  const days = (date.getTime() - KNOWN_NEW_MOON) / DAY;
  const normalized = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const phase = normalized / SYNODIC_MONTH;
  const illumination = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  const index = Math.round(phase * 8) % 8;
  return {
    phase,
    illumination,
    name: locale === 'zh' ? PHASES_ZH[index] : PHASES_EN[index],
  };
}

export function formatClock(date: Date, locale: 'zh' | 'en'): string {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export function utcOffset(date: Date): string {
  const minutes = -date.getTimezoneOffset();
  const hours = Math.floor(Math.abs(minutes) / 60);
  const rest = Math.abs(minutes) % 60;
  return `UTC${minutes >= 0 ? '+' : '-'}${String(hours).padStart(2, '0')}${
    rest ? `:${String(rest).padStart(2, '0')}` : ''
  }`;
}

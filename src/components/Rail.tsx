import { useEffect, useRef, useState } from 'react';
import { NAV_ITEMS } from '../content/site';
import { usePreferences } from '../lib/preferences';
import { getScrollReading, scrollToId } from '../lib/scroll';

const SECTIONS = ['hero', ...NAV_ITEMS.map((item) => item.id)];

export function Rail() {
  const { locale } = usePreferences();
  const [active, setActive] = useState('hero');
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nodes = SECTIONS.map((id) => document.getElementById(id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-42% 0px -52% 0px', threshold: [0, 0.01, 0.5] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const { progress } = getScrollReading();
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${Math.max(0.02, progress)})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <nav className="rail" aria-label={locale === 'zh' ? '章节导航' : 'Sections'}>
      <span className="rail__spine" aria-hidden="true">
        <span className="rail__fill" ref={fillRef} />
      </span>
      <ul className="rail__list">
        {SECTIONS.map((id) => {
          const item = NAV_ITEMS.find((entry) => entry.id === id);
          const label = item ? item.label[locale] : 'STMfan';
          return (
            <li key={id}>
              <button
                className="rail__tick"
                data-active={active === id}
                onClick={() => scrollToId(id, -8)}
                aria-label={label}
                aria-current={active === id ? 'true' : undefined}
              >
                <span className="rail__dot" aria-hidden="true" />
                <span className="rail__label mono">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

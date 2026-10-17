import { useLayoutEffect, useRef, useState } from 'react';
import {
  DeviceMobile,
  HardDrives,
  Sparkle,
  TerminalWindow,
  type Icon,
} from '@phosphor-icons/react';
import { useCopy, usePreferences } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

const ICONS: Record<string, Icon> = {
  backend: TerminalWindow,
  ops: HardDrives,
  fullstack: Sparkle,
  mobile: DeviceMobile,
};

export function Workshop() {
  const copy = useCopy();
  const { locale } = usePreferences();
  const [active, setActive] = useState(copy.workshop.items[0].id);
  const root = useRef<HTMLElement>(null);
  const activeIndex = Math.max(
    0,
    copy.workshop.items.findIndex((item) => item.id === active),
  );
  const current = copy.workshop.items[activeIndex];
  const ActiveIcon = ICONS[current.id] ?? TerminalWindow;

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;

    const context = gsap.context(() => {
      gsap.from(scope.querySelectorAll('.workshop__row'), {
        y: 32,
        opacity: 0,
        duration: 0.95,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 64%' },
      });
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <section className="workshop act" id="workshop" ref={root} aria-labelledby="workshop-title">
      <div className="shell">
        <header className="workshop__head section-head">
          <h2 className="workshop__title section-title display" id="workshop-title" data-reveal>
            {copy.workshop.title}
          </h2>
          <p className="lede workshop__lede" data-reveal>
            {copy.workshop.lede}
          </p>
        </header>

        <div className="workshop__body">
          <aside className="workshop__visual" aria-hidden="true">
            <div className="workshop__visual-glow" />
            <div className="workshop__rings">
              <span className="workshop__ring workshop__ring--a" />
              <span className="workshop__ring workshop__ring--b" />
              <span className="workshop__ring workshop__ring--c" />
            </div>
            <div className="workshop__glyph" key={current.id}>
              <ActiveIcon weight="thin" size={112} />
            </div>
            <span className="workshop__glyph-key display" key={`${current.id}-key`}>
              {current.key[locale]}
            </span>
          </aside>

          <ol className="workshop__list">
            {copy.workshop.items.map((item) => {
              const Glyph = ICONS[item.id] ?? TerminalWindow;
              const isActive = active === item.id;
              return (
                <li className="workshop__row" key={item.id} data-active={isActive}>
                  <button
                    className="workshop__trigger"
                    onClick={() => setActive(item.id)}
                    onMouseEnter={() => setActive(item.id)}
                    onFocus={() => setActive(item.id)}
                    aria-expanded={isActive}
                    aria-controls={`workshop-${item.id}`}
                    data-cursor="link"
                  >
                    <span className="workshop__row-glyph">
                      <Glyph weight="light" size={20} />
                    </span>
                    <span className="workshop__row-main">
                      <span className="workshop__key display">{item.key[locale]}</span>
                      <span className="workshop__sub mono">{item.sub[locale]}</span>
                    </span>
                    <span className="workshop__row-body" id={`workshop-${item.id}`}>
                      <span className="workshop__row-clip">
                        <span className="workshop__row-text">{item.body}</span>
                        <span className="workshop__row-tags mono">{item.tags}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

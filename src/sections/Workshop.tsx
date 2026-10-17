import { useLayoutEffect, useRef, useState } from 'react';
import {
  DeviceMobile,
  HardDrives,
  Sparkle,
  TerminalWindow,
  type Icon,
} from '@phosphor-icons/react';
import { useCopy } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

const ICONS: Record<string, Icon> = {
  backend: TerminalWindow,
  ops: HardDrives,
  vibe: Sparkle,
  dart: DeviceMobile,
};

export function Workshop() {
  const copy = useCopy();
  const [active, setActive] = useState(copy.workshop.items[0].id);
  const root = useRef<HTMLElement>(null);
  const activeIndex = Math.max(
    0,
    copy.workshop.items.findIndex((item) => item.id === active),
  );
  const ActiveIcon = ICONS[copy.workshop.items[activeIndex].id] ?? TerminalWindow;

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;

    const context = gsap.context(() => {
      gsap.from(scope.querySelectorAll('.workshop__row'), {
        y: 40,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: scope,
          start: 'top 68%',
        },
      });

      gsap.from(scope.querySelector('.workshop__head > *'), {
        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: scope,
          start: 'top 78%',
        },
      });
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <section className="workshop act" id="workshop" ref={root} aria-labelledby="workshop-title">
      <div className="shell">
        <header className="workshop__head">
          <h2 className="workshop__title display" id="workshop-title">
            {copy.workshop.title}
          </h2>
          <p className="lede workshop__lede">{copy.workshop.lede}</p>
        </header>

        <div className="workshop__body">
          <aside className="workshop__visual" aria-hidden="true">
            <div className="workshop__rings">
              <span className="workshop__ring workshop__ring--a" />
              <span className="workshop__ring workshop__ring--b" />
              <span className="workshop__ring workshop__ring--c" />
            </div>
            <div className="workshop__glyph" key={active}>
              <ActiveIcon weight="thin" size={116} />
            </div>
            <span className="workshop__visual-label mono">
              {String(activeIndex + 1).padStart(2, '0')} / {String(copy.workshop.items.length).padStart(2, '0')}
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
                    aria-controls={`workshop-panel-${item.id}`}
                    data-cursor="link"
                  >
                    <span className="workshop__row-glyph">
                      <Glyph weight="light" size={20} />
                    </span>
                    <span className="workshop__row-main">
                      <span className="workshop__kicker mono">{item.kicker}</span>
                      <span className="workshop__name display">{item.title}</span>
                    </span>
                    <span className="workshop__row-body" id={`workshop-panel-${item.id}`}>
                      <span className="workshop__row-clip">
                        <span className="workshop__row-text">{item.body}</span>
                        <span className="workshop__detail mono">{item.detail}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="workshop__stack mono">{copy.workshop.stack}</p>
      </div>
    </section>
  );
}

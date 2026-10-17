import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { games } from '../content/site';
import { useCopy, usePreferences } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

export function Games() {
  const copy = useCopy();
  const { locale } = usePreferences();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = root.current;
    const element = track.current;
    if (!section || !element || isCalm()) return;

    const media = gsap.matchMedia();
    media.add('(min-width: 900px)', () => {
      const distance = () =>
        Math.max(0, element.scrollWidth - window.innerWidth + 24);

      const tween = gsap.to(element, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => media.revert();
  }, [locale]);

  return (
    <section className="games act" id="games" ref={root} aria-labelledby="games-title">
      <div className="games__sticky">
        <div className="games__track" ref={track}>
          <header className="games__intro">
            <h2 className="games__title display" id="games-title">
              {copy.games.title}
            </h2>
            <p className="lede">{copy.games.lede}</p>
            <span className="games__hint mono" aria-hidden="true">
              {locale === 'zh' ? '横向 · 五款' : 'SIDEWAYS · FIVE'}
            </span>
          </header>

          {games.map((game, index) => (
            <article className="game" key={game.id}>
              <div className="game__top mono">
                <span className="game__year">{game.year}</span>
                <span className="game__tag">{game.tag[locale]}</span>
              </div>

              <div className="game__main">
                <span className="game__index mono" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="game__name display">{game.name[locale]}</h3>
                <p className="game__latin">{game.latin[locale]}</p>
              </div>

              <div className="game__foot">
                <div className="game__handle">
                  <span className="mono">{copy.games.handleLabel}</span>
                  <strong className={game.id === 'minecraft' ? 'game__handle-id' : ''}>
                    {game.handle[locale]}
                  </strong>
                  {game.id === 'minecraft' && (
                    <span className="mono game__underscore">
                      {locale === 'zh' ? '两个下划线' : 'two underscores'}
                    </span>
                  )}
                </div>
                <a
                  className="game__link"
                  href={game.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${copy.games.openLabel} ${game.name[locale]}`}
                  data-cursor="link"
                >
                  <ArrowUpRight weight="light" size={20} />
                </a>
              </div>
            </article>
          ))}

          <div className="games__outro" aria-hidden="true">
            <span className="mono">STMfan · {copy.games.label}</span>
            <span className="games__outro-mark display">∞</span>
          </div>
        </div>
      </div>
    </section>
  );
}

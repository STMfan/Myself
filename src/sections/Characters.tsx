import { useLayoutEffect, useRef, useState } from 'react';
import { characters } from '../content/site';
import { useCopy, usePreferences } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

const POSITIONS = [
  { x: 12, y: 26 },
  { x: 30, y: 68 },
  { x: 53, y: 18 },
  { x: 74, y: 60 },
  { x: 52, y: 88 },
];

const PATH = POSITIONS.map((point) => `${point.x},${point.y}`).join(' ');

export function Characters() {
  const copy = useCopy();
  const { locale } = usePreferences();
  const [active, setActive] = useState(characters[0].id);
  const root = useRef<HTMLElement>(null);
  const current = characters.find((entry) => entry.id === active) ?? characters[0];

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;

    const context = gsap.context(() => {
      gsap.from('.characters__node', {
        opacity: 0,
        y: 26,
        scale: 0.92,
        duration: 1.2,
        stagger: 0.09,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 66%' },
      });

      const path = scope.querySelector('.characters__path');
      if (path) {
        const length = (path as SVGPathElement).getTotalLength?.() ?? 400;
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: 2.2,
            ease: 'power2.inOut',
            scrollTrigger: { trigger: scope, start: 'top 62%' },
          },
        );
      }

      gsap.to('.characters__ghost', {
        yPercent: -8,
        rotate: -3,
        ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
      });
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <section
      className="characters act"
      id="characters"
      ref={root}
      aria-labelledby="characters-title"
    >
      <div className="shell">
        <header className="characters__head">
          <h2 className="characters__title display" id="characters-title">
            {copy.characters.title}
          </h2>
          <p className="lede">{copy.characters.lede}</p>
        </header>

        <div className="characters__map">
          <span className="characters__ghost" aria-hidden="true">
            <img src={current.sigil} alt="" width={720} height={720} loading="lazy" />
          </span>

          <svg
            className="characters__lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline points={PATH} className="characters__path" />
            {POSITIONS.map((point) => (
              <circle
                key={`${point.x}-${point.y}`}
                cx={point.x}
                cy={point.y}
                r="0.42"
                className="characters__star"
              />
            ))}
          </svg>

          {characters.map((character, index) => {
            const isActive = active === character.id;
            const position = POSITIONS[index];
            return (
              <button
                key={character.id}
                className="characters__node"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                data-active={isActive}
                data-tone={character.tone}
                onMouseEnter={() => setActive(character.id)}
                onFocus={() => setActive(character.id)}
                onClick={() => setActive(character.id)}
                aria-pressed={isActive}
                data-cursor="link"
              >
                <span className="characters__sigil">
                  <img
                    src={character.sigil}
                    alt={`${character[locale]} ${copy.characters.sigilAlt}`}
                    width={320}
                    height={320}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="characters__sigil-ring" aria-hidden="true" />
                </span>
                <span className="characters__name display">
                  {locale === 'zh' ? character.zh : character.en}
                </span>
                <span className="characters__alt mono">
                  {locale === 'zh' ? character.en : character.zh}
                </span>
              </button>
            );
          })}

          <div className="characters__readout" aria-live="polite">
            <span className="characters__readout-index mono">
              {String(characters.findIndex((entry) => entry.id === active) + 1).padStart(2, '0')}{' '}
              / {String(characters.length).padStart(2, '0')}
            </span>
            <strong className="characters__readout-name display">
              {locale === 'zh' ? current.zh : current.en}
            </strong>
            <span className="characters__readout-origin mono">{current.origin[locale]}</span>
            <span className="characters__hint mono">{copy.characters.hint}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

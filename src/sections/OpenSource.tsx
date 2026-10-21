import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { OPEN_SOURCE_PROJECTS } from '../content/site';
import { useCopy } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

export function OpenSource() {
  const copy = useCopy();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;
    const context = gsap.context(() => {
      scope.querySelectorAll<HTMLElement>('.case').forEach((card) => {
        gsap.from(card, {
          y: 36,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 68%' },
        });
        gsap.to(card.querySelector('.case__art'), {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        });
      });
      gsap.from(scope.querySelectorAll('.slot'), {
        y: 22,
        opacity: 0,
        duration: 0.85,
        stagger: 0.09,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope.querySelector('.slots'), start: 'top 58%' },
      });
    }, scope);
    return () => context.revert();
  }, []);

  return (
    <section
      className="opensource act"
      id="opensource"
      ref={root}
      aria-labelledby="opensource-title"
    >
      <div className="shell">
        <header className="opensource__head section-head">
          <h2 className="section-title display" id="opensource-title" data-reveal>
            {copy.opensource.title}
          </h2>
          <p className="lede section-lede" data-reveal>
            {copy.opensource.lede}
          </p>
        </header>

        {copy.opensource.cases.map((item) => {
          const project = OPEN_SOURCE_PROJECTS[item.id];
          return (
            <article className="case" key={item.id}>
              <a
                className="case__media"
                href={project.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={item.link}
                data-cursor="link"
              >
                <span className="case__art">
                  <img
                    src={project.image}
                    alt={project.imageAlt}
                    width={project.imageSize}
                    height={project.imageSize}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              </a>

              <div className="case__body">
                <span className="case__label">{copy.opensource.caseLabel}</span>
                <h3 className="case__title display">{item.title}</h3>
                <p className="case__text">{item.body}</p>
                <a
                  className="link case__link"
                  href={project.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="link"
                >
                  {item.link}
                  <ArrowUpRight weight="light" size={15} />
                </a>
              </div>
            </article>
          );
        })}

        <div className="slots">
          <h3 className="slots__title">{copy.opensource.slotsTitle}</h3>
          <div className="slots__grid">
            {copy.opensource.slots.map((slot, index) => (
              <article className="slot" key={index}>
                <span className="slot__rule" aria-hidden="true" />
                <strong className="slot__title display">{slot.title}</strong>
                <span className="slot__body">{slot.body}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

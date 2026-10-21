import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

export function OpenSource() {
  const copy = useCopy();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;
    const context = gsap.context(() => {
      gsap.from(scope.querySelector('.case'), {
        y: 36,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 68%' },
      });
      gsap.from(scope.querySelectorAll('.slot'), {
        y: 22,
        opacity: 0,
        duration: 0.85,
        stagger: 0.09,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 58%' },
      });
      gsap.to(scope.querySelector('.case__media img'), {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
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

        <article className="case">
          <a
            className="case__media"
            href={CONTACT.maibotDocs}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={copy.opensource.caseLink}
            data-cursor="link"
          >
            <img
              src="/assets/maibot.webp"
              alt="MaiBot"
              width={800}
              height={800}
              loading="lazy"
              decoding="async"
            />
          </a>

          <div className="case__body">
            <span className="case__label">{copy.opensource.caseLabel}</span>
            <h3 className="case__title display">{copy.opensource.caseTitle}</h3>
            <p className="case__text">{copy.opensource.caseBody}</p>
            <a
              className="link case__link"
              href={CONTACT.maibotDocs}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="link"
            >
              {copy.opensource.caseLink}
              <ArrowUpRight weight="light" size={15} />
            </a>
          </div>
        </article>

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

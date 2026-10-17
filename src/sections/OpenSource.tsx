import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, Plus } from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy, usePreferences } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

export function OpenSource() {
  const copy = useCopy();
  const { locale } = usePreferences();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;
    const context = gsap.context(() => {
      gsap.from(scope.querySelector('.case'), {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 68%' },
      });
      gsap.from(scope.querySelectorAll('.slot'), {
        y: 28,
        opacity: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 58%' },
      });
      gsap.to(scope.querySelector('.case__media img'), {
        yPercent: -8,
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

        <div className="opensource__grid">
          <article className="case">
            <a
              className="case__media"
              href={CONTACT.maibotDocs}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={copy.opensource.caseLink}
              data-cursor="link"
            >
              <span className="case__orbit" aria-hidden="true" />
              <img
                src="/assets/maibot.webp"
                alt="MaiBot"
                width={800}
                height={800}
                loading="lazy"
                decoding="async"
              />
              <span className="case__glow" aria-hidden="true" />
            </a>

            <div className="case__body">
              <span className="mono case__label">{copy.opensource.caseLabel}</span>
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

            <div className="case__meta" aria-hidden="true">
              {copy.opensource.caseTags.map((tag) => (
                <span className="pill mono case__tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </article>

          <div className="slots">
            <div className="slots__head">
              <h3 className="slots__title display">{copy.opensource.slotsTitle}</h3>
              <span className="mono slots__hint">
                {locale === 'zh' ? '预留 / RESERVED' : 'RESERVED / 预留'}
              </span>
            </div>
            <div className="slots__grid">
              {copy.opensource.slots.map((slot, index) => (
                <article className="slot" key={index}>
                  <span className="slot__index mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="slot__plus" aria-hidden="true">
                    <Plus weight="light" size={18} />
                  </span>
                  <strong className="slot__title display">{slot.title}</strong>
                  <span className="slot__body">{slot.body}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

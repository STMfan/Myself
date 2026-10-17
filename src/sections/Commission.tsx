import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

export function Commission() {
  const copy = useCopy();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;
    const context = gsap.context(() => {
      gsap.from(scope.querySelector('.paid'), {
        y: 44,
        opacity: 0,
        duration: 1.15,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 66%' },
      });
      gsap.from(scope.querySelector('.free'), {
        y: 44,
        opacity: 0,
        duration: 1.15,
        delay: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 66%' },
      });
    }, scope);
    return () => context.revert();
  }, []);

  return (
    <section
      className="commission act"
      id="commission"
      ref={root}
      aria-labelledby="commission-title"
    >
      <div className="shell">
        <header className="commission__head section-head">
          <h2 className="section-title display" id="commission-title" data-reveal>
            {copy.commission.title}
          </h2>
          <p className="lede section-lede" data-reveal>
            {copy.commission.lede}
          </p>
        </header>

        <div className="commission__grid">
          <article className="paid">
            <span className="paid__sweep" aria-hidden="true" />
            <div className="paid__head">
              <span className="pill pill--accent mono">{copy.commission.paidLabel}</span>
              <span className="paid__status mono">
                <span className="paid__status-dot" aria-hidden="true" />
                {copy.commission.availability}
              </span>
            </div>

            <h3 className="paid__title display">{copy.commission.paidTitle}</h3>

            <ol className="paid__list">
              {copy.commission.items.map((item, index) => (
                <li className="paid__item" key={item.id}>
                  <span className="paid__index mono" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="paid__item-main">
                    <h4 className="paid__item-title display">{item.title}</h4>
                    <p className="paid__item-body">{item.body}</p>
                  </div>
                  <span className="paid__price mono">{item.pricing}</span>
                </li>
              ))}
            </ol>

            <div className="paid__foot">
              <p className="mono paid__note">{copy.commission.paidNote}</p>
              <a className="btn btn--solid btn--big" href={`mailto:${CONTACT.email}`} data-cursor="link">
                {copy.commission.cta}
                <ArrowUpRight className="btn__arrow" weight="light" size={17} />
              </a>
            </div>
          </article>

          <aside className="free">
            <span className="pill mono">{copy.commission.freeLabel}</span>
            <h3 className="free__title display">{copy.commission.freeTitle}</h3>
            <p className="free__body">{copy.commission.freeBody}</p>
            <ul className="free__list">
              {copy.commission.freeItems.map((item) => (
                <li key={item}>
                  <span className="free__bullet" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              className="link free__link"
              href={CONTACT.github}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="link"
            >
              {copy.commission.freeLink}
              <ArrowUpRight weight="light" size={15} />
            </a>
            <span className="free__mark display" aria-hidden="true">
              0
            </span>
          </aside>
        </div>
      </div>
    </section>
  );
}

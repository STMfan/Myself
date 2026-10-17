import { useLayoutEffect, useRef } from 'react';
import { useCopy } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

export function Notes() {
  const copy = useCopy();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;
    const context = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>('.notes__line');
      gsap.set(lines, { opacity: 0.18, y: 16 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: scope,
            start: 'top 62%',
            end: 'bottom 72%',
            scrub: 0.6,
          },
        })
        .to(lines[0], { opacity: 1, y: 0, duration: 0.3 }, 0)
        .to(lines[1], { opacity: 1, y: 0, duration: 0.3 }, 0.32)
        .to(lines[2], { opacity: 1, y: 0, duration: 0.3 }, 0.64);

      gsap.to(scope.querySelector('.notes__backdrop img'), {
        yPercent: 10,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });

      gsap.from(scope.querySelector('.notes__lead'), {
        y: 26,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 70%' },
      });
    }, scope);
    return () => context.revert();
  }, []);

  return (
    <section className="notes act" id="notes" ref={root} aria-labelledby="notes-title">
      <div className="notes__backdrop" aria-hidden="true">
        <img
          src="/assets/art/horizon.webp"
          alt=""
          width={1920}
          height={823}
          loading="lazy"
          decoding="async"
        />
      </div>
      <span className="notes__scrim" aria-hidden="true" />

      <div className="shell notes__inner">
        <h2 className="notes__lead display" id="notes-title">
          {copy.notes.lead}
        </h2>

        <div className="notes__lines">
          {copy.notes.lines.map((line, index) => (
            <p className="notes__line" key={index}>
              <span className="notes__line-index mono" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="notes__line-text">{line}</span>
            </p>
          ))}
        </div>

        <p className="notes__aside display">{copy.notes.aside}</p>
      </div>
    </section>
  );
}

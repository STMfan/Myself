import { useLayoutEffect, useRef } from 'react';
import { useCopy } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

export function Manifesto() {
  const copy = useCopy();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;

    const context = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>('.manifesto__line');
      const lead = scope.querySelector('.manifesto__lead');
      const echo = scope.querySelector('.manifesto__echo');
      const backdrop = scope.querySelector('.manifesto__backdrop img');

      gsap.set(lines, { opacity: 0.12, y: 18 });
      gsap.set(echo, { opacity: 0 });
      gsap.set(backdrop, { scale: 1.16, yPercent: 6 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
        },
      });

      timeline
        .to(lead, { yPercent: -12, ease: 'none' }, 0)
        .to(backdrop, { scale: 1.02, yPercent: -4, ease: 'none' }, 0)
        .to(lines[0], { opacity: 1, y: 0, duration: 0.12, ease: 'none' }, 0.1)
        .to(lines[1], { opacity: 1, y: 0, duration: 0.12, ease: 'none' }, 0.3)
        .to(lines[2], { opacity: 1, y: 0, duration: 0.12, ease: 'none' }, 0.5)
        .to(echo, { opacity: 1, duration: 0.14, ease: 'none' }, 0.72)
        .to(echo, { opacity: 0.32, duration: 0.1, ease: 'none' }, 0.92);
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <section className="manifesto act" id="manifesto" ref={root} aria-labelledby="manifesto-title">
      <div className="manifesto__track">
        <div className="manifesto__stage">
          <div className="manifesto__backdrop" aria-hidden="true">
            <img
              src="/assets/art/horizon.webp"
              alt=""
              width={1916}
              height={821}
              loading="lazy"
              decoding="async"
            />
            <span className="manifesto__scrim" />
          </div>

          <div className="shell manifesto__inner">
            <p className="manifesto__label mono">{copy.manifesto.label}</p>

            <h2 className="manifesto__lead display" id="manifesto-title">
              {copy.manifesto.lead}
            </h2>

            <div className="manifesto__lines">
              {copy.manifesto.lines.map((line, index) => (
                <p className="manifesto__line" key={index}>
                  <span className="manifesto__line-index mono" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="manifesto__line-text">{line}</span>
                </p>
              ))}
            </div>

            <p className="manifesto__echo display" aria-hidden="true">
              {copy.manifesto.aside}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

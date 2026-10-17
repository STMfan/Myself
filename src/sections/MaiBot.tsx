import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

export function MaiBot() {
  const copy = useCopy();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;

    const context = gsap.context(() => {
      gsap.from(scope.querySelector('.maibot__media'), {
        scale: 0.86,
        opacity: 0,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 74%' },
      });
      gsap.to(scope.querySelector('.maibot__image'), {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
      gsap.from(scope.querySelectorAll('.maibot__copy > *'), {
        y: 30,
        opacity: 0,
        duration: 1.1,
        stagger: 0.09,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 70%' },
      });
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <section className="maibot act" id="maibot" ref={root} aria-labelledby="maibot-title">
      <div className="shell maibot__grid">
        <div className="maibot__media">
          <div className="maibot__orb">
            <img
              className="maibot__image"
              src="/assets/maibot.webp"
              alt="MaiBot"
              width={640}
              height={640}
              loading="lazy"
              decoding="async"
            />
          </div>
          <span className="maibot__orbit" aria-hidden="true" />
          <span className="mono maibot__caption">MaiBot · Mai-with-u</span>
        </div>

        <div className="maibot__copy">
          <h2 className="maibot__title display" id="maibot-title">
            {copy.maibot.title}
          </h2>
          <p className="maibot__eyebrow mono">{copy.maibot.label}</p>
          <p className="maibot__body">{copy.maibot.body}</p>
          <a
            className="link maibot__link"
            href={CONTACT.maibotDocs}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="link"
          >
            {copy.maibot.link}
            <ArrowUpRight weight="light" size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

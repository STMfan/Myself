import { useLayoutEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight } from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy } from '../lib/preferences';
import { gsap, isCalm, scrollToId } from '../lib/scroll';
import { Chars } from '../components/Type';
import { MoonPanel } from '../components/MoonPanel';

export function Hero({ booted }: { booted: boolean }) {
  const copy = useCopy();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;

    const context = gsap.context(() => {
      const chars = scope.querySelectorAll('.hero__slogan .split-char');
      const fade = scope.querySelectorAll('[data-hero-fade]');
      const panel = scope.querySelector('[data-hero-moon]');

      gsap.set(chars, { yPercent: 120, opacity: 0, rotate: 3 });
      gsap.set(fade, { y: 24, opacity: 0 });
      gsap.set(panel, { opacity: 0, scale: 0.92, y: 20 });

      if (!booted) return;

      const timeline = gsap.timeline({ defaults: { ease: 'expo.out' } });
      timeline
        .to(chars, {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1.3,
          stagger: { each: 0.04 },
        })
        .to(fade, { y: 0, opacity: 1, duration: 1, stagger: 0.07 }, '-=1.1')
        .to(panel, { opacity: 1, scale: 1, y: 0, duration: 1.5 }, '-=1.15');

      gsap.to(scope.querySelector('.hero__copy'), {
        yPercent: -8,
        opacity: 0.35,
        ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom top', scrub: 0.5 },
      });
      gsap.to(panel, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
    }, scope);

    return () => context.revert();
  }, [booted]);

  return (
    <section className="hero act" id="hero" ref={root} aria-labelledby="hero-title">
      <div className="shell hero__inner">
        <div className="hero__grid">
          <div className="hero__copy">
            <p className="hero__kicker mono" data-hero-fade>
              <span className="hero__pulse" aria-hidden="true" />
              {copy.hero.kicker}
            </p>

            <h1 className="hero__slogan display" id="hero-title">
              <span className="split-line hero__slogan-line">
                <Chars text={copy.hero.slogan[0]} />
              </span>
              <span className="split-line hero__slogan-line hero__slogan-line--outline">
                <Chars text={copy.hero.slogan[1]} />
              </span>
            </h1>

            <p className="hero__latin mono" data-hero-fade>
              {copy.hero.latin}
            </p>

            <p className="hero__intro" data-hero-fade>
              {copy.hero.intro}
            </p>

            <div className="hero__actions" data-hero-fade>
              <span className="hero__halo" aria-hidden="true" />
              <a className="btn btn--solid btn--hero" href={`mailto:${CONTACT.email}`} data-cursor="link">
                {copy.hero.primary}
                <ArrowUpRight className="btn__arrow" weight="light" size={18} />
              </a>
              <button
                className="hero__secondary"
                onClick={() => scrollToId('workshop')}
                data-cursor="link"
              >
                {copy.hero.secondary}
                <ArrowDown weight="light" size={15} />
              </button>
            </div>

            <p className="hero__available mono" data-hero-fade>
              <span className="hero__available-dot" aria-hidden="true" />
              {copy.hero.available}
            </p>
          </div>

          <div className="hero__moon" data-hero-moon>
            <MoonPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

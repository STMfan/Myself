import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, GithubLogo } from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy, usePreferences } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';
import { Chars } from '../components/Type';
import { Orrery } from '../components/Orrery';

export function Hero({ booted }: { booted: boolean }) {
  const { locale } = usePreferences();
  const copy = useCopy();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;
    if (isCalm()) {
      gsap.set(scope.querySelectorAll('[data-hero]'), { clearProps: 'all' });
      return;
    }

    const context = gsap.context(() => {
      const chars = scope.querySelectorAll('.hero__slogan .split-char');
      const fade = scope.querySelectorAll('[data-hero-fade]');
      const instrument = scope.querySelector('[data-hero-instrument]');
      const outline = scope.querySelector('.hero__slogan-line--outline');

      gsap.set(chars, { yPercent: 118, opacity: 0, rotate: 4 });
      gsap.set(fade, { y: 26, opacity: 0 });
      gsap.set(instrument, { opacity: 0, scale: 0.94, y: 18 });

      if (!booted) return;

      const timeline = gsap.timeline({ defaults: { ease: 'expo.out' } });
      timeline
        .to(chars, {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1.35,
          stagger: { each: 0.045, from: 'start' },
        })
        .to(
          outline,
          { opacity: 1, duration: 1.2, ease: 'power2.out' },
          '-=1.05',
        )
        .to(
          fade,
          { y: 0, opacity: 1, duration: 1.1, stagger: 0.08 },
          '-=0.85',
        )
        .to(
          instrument,
          { opacity: 1, scale: 1, y: 0, duration: 1.6, ease: 'expo.out' },
          '-=1.2',
        );

      gsap.to(scope.querySelector('.hero__copy'), {
        yPercent: -14,
        opacity: 0.24,
        ease: 'none',
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      gsap.to(instrument, {
        yPercent: -26,
        ease: 'none',
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
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
              <span className="hero__kicker-mark" aria-hidden="true" />
              {copy.hero.kicker}
            </p>

            <h1 className="hero__slogan display" id="hero-title" data-hero>
              <span className="split-line hero__slogan-line">
                <Chars text={copy.hero.slogan[0]} />
              </span>
              <span className="split-line hero__slogan-line hero__slogan-line--outline">
                <Chars text={copy.hero.slogan[1]} />
              </span>
            </h1>

            <p className="hero__latin mono" data-hero-fade>
              {copy.hero.latin[0]} {copy.hero.latin[1]}
            </p>

            <p className="hero__intro" data-hero-fade>
              {copy.hero.intro}
            </p>

            <div className="hero__actions" data-hero-fade>
              <a className="btn btn--solid" href={`mailto:${CONTACT.email}`} data-cursor="link">
                {copy.hero.primary}
                <ArrowUpRight className="btn__arrow" weight="light" size={16} />
              </a>
              <a
                className="btn hero__secondary"
                href={CONTACT.github}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="link"
              >
                <GithubLogo weight="light" size={17} />
                {copy.hero.secondary}
              </a>
            </div>
          </div>

          <div className="hero__instrument" data-hero-instrument>
            <Orrery />
          </div>
        </div>

        <div className="hero__foot" data-hero-fade>
          <span className="mono hero__coords">{copy.hero.coordinates}</span>
          <span className="hero__status mono">
            <span className="hero__status-dot" aria-hidden="true" />
            {copy.hero.status}
          </span>
          <span className="mono hero__lang-note">
            {locale === 'zh' ? 'SUBLUNARY · ONE TAKE' : '月下 · 一镜到底'}
          </span>
        </div>
      </div>
    </section>
  );
}

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

    let detach: (() => void) | null = null;

    const context = gsap.context(() => {
      const chars = scope.querySelectorAll('.hero__slogan .split-char');
      const fade = scope.querySelectorAll('[data-hero-fade]');
      const moon = scope.querySelector('.hero__moon');
      const cta = scope.querySelector<HTMLElement>('.btn--hero');

      gsap.set(chars, { yPercent: 118, opacity: 0, rotate: 3 });
      gsap.set(fade, { y: 22, opacity: 0 });
      gsap.set(moon, { opacity: 0, scale: 0.94 });

      if (!booted) return;

      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .to(chars, {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1.25,
          stagger: { each: 0.035 },
        })
        .to(fade, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06 }, '-=1.05')
        .to(moon, { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, '-=1.4');

      gsap.to(scope.querySelector('.hero__copy'), {
        yPercent: -6,
        opacity: 0.4,
        ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom top', scrub: 0.5 },
      });
      gsap.to(moon, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom top', scrub: 0.7 },
      });
      gsap.to(scope.querySelector('.hero__ghost'), {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });

      if (cta && window.matchMedia('(hover: hover)').matches) {
        const xTo = gsap.quickTo(cta, 'x', { duration: 0.45, ease: 'power3' });
        const yTo = gsap.quickTo(cta, 'y', { duration: 0.45, ease: 'power3' });
        const move = (event: PointerEvent) => {
          const rect = cta.getBoundingClientRect();
          xTo((event.clientX - rect.left - rect.width / 2) * 0.12);
          yTo((event.clientY - rect.top - rect.height / 2) * 0.18);
        };
        const reset = () => {
          xTo(0);
          yTo(0);
        };
        cta.addEventListener('pointermove', move);
        cta.addEventListener('pointerleave', reset);
        cta.addEventListener('blur', reset);
        detach = () => {
          cta.removeEventListener('pointermove', move);
          cta.removeEventListener('pointerleave', reset);
          cta.removeEventListener('blur', reset);
        };
      }
    }, scope);

    return () => {
      detach?.();
      context.revert();
    };
  }, [booted]);

  return (
    <section className="hero act" id="hero" ref={root} aria-labelledby="hero-title">
      <div className="hero__backdrop" aria-hidden="true">
        <div className="hero__moon">
          <MoonPanel />
        </div>
        <span className="hero__meteor" />
        <span className="hero__meteor hero__meteor--b" />
        <span className="hero__ghost display">SUBLUNARY</span>
      </div>

      <div className="shell hero__inner">
        <div className="hero__copy">
          <p className="hero__kicker mono" data-hero-fade>
            <span className="hero__pulse" aria-hidden="true" />
            {copy.hero.kicker}
          </p>

          <h1 className="hero__slogan display" id="hero-title">
            <span className="split-line hero__slogan-line">
              <Chars text={copy.hero.slogan[0]} />
            </span>
            <span className="split-line hero__slogan-line hero__slogan-line--accent">
              <Chars text={copy.hero.slogan[1]} />
            </span>
          </h1>

          <span className="hero__slogan-rule" aria-hidden="true" />

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
            <span className="hero__available mono">
              <span className="hero__available-dot" aria-hidden="true" />
              {copy.hero.available}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

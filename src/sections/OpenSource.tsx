import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy } from '../lib/preferences';
import { gsap, isCalm } from '../lib/scroll';

const PROJECTS = [
  {
    id: 'synaxis',
    href: CONTACT.synaxis,
    image: CONTACT.synaxisImage,
    alt: 'Synaxis',
  },
  {
    id: 'maibot',
    href: CONTACT.maibotDocs,
    image: CONTACT.maibotImage,
    alt: 'MaiBot',
  },
];

export function OpenSource() {
  const copy = useCopy();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || isCalm()) return;
    const context = gsap.context(() => {
      gsap.from(scope.querySelectorAll('.oss__card'), {
        y: 26,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: scope, start: 'top 68%' },
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

        <div className="oss">
          {copy.opensource.cases.map((item, index) => {
            const project = PROJECTS[index];
            return (
              <article className="oss__card" key={project.id}>
                <a
                  className="oss__media"
                  href={project.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.link}
                  data-cursor="link"
                >
                  <img
                    src={project.image}
                    alt={project.alt}
                    width={600}
                    height={750}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
                <div className="oss__body">
                  <span className="oss__label">{item.label}</span>
                  <h3 className="oss__title display">{item.title}</h3>
                  <p className="oss__text">{item.body}</p>
                  <a
                    className="link oss__link"
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
        </div>

        <div className="oss__more">
          <span>{copy.opensource.more}</span>
          <a
            className="link"
            href={CONTACT.github}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="link"
          >
            github.com/STMfan
            <ArrowUpRight weight="light" size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

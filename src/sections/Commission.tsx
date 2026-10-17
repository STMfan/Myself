import { ArrowUpRight } from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy } from '../lib/preferences';

export function Commission() {
  const copy = useCopy();

  return (
    <section
      className="commission act"
      id="commission"
      aria-labelledby="commission-title"
    >
      <div className="shell commission__grid">
        <div className="commission__intro">
          <p className="commission__status mono" data-reveal>
            <span className="commission__pulse" aria-hidden="true" />
            {copy.commission.availability}
          </p>

          <h2 className="commission__title display" id="commission-title" data-reveal>
            {copy.commission.title}
          </h2>

          <p className="lede commission__lede" data-reveal>
            {copy.commission.lede}
          </p>

          <a
            className="btn btn--solid commission__cta"
            href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(
              copy.commission.cta,
            )}`}
            data-reveal
            data-cursor="link"
          >
            {copy.commission.cta}
            <ArrowUpRight className="btn__arrow" weight="light" size={16} />
          </a>
        </div>

        <div className="commission__list">
          {copy.commission.items.map((item, index) => (
            <article className="commission__item" key={item.id} data-reveal>
              <span className="commission__index mono" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="commission__item-body">
                <h3 className="commission__item-title display">{item.title}</h3>
                <p className="commission__item-text">{item.body}</p>
              </div>
              <span className="commission__item-mark" aria-hidden="true">
                <ArrowUpRight weight="light" size={18} />
              </span>
            </article>
          ))}
        </div>

        <aside className="commission__note" data-reveal>
          <h3 className="commission__note-title display">{copy.commission.noteTitle}</h3>
          <p className="commission__note-text">{copy.commission.note}</p>
          <a
            className="link link--quiet commission__note-link"
            href={CONTACT.maibotDocs}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="link"
          >
            docs.mai-mai.org
            <ArrowUpRight weight="light" size={14} />
          </a>
        </aside>
      </div>
    </section>
  );
}

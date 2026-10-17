import { ArrowUp, ArrowUpRight } from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy, usePreferences } from '../lib/preferences';
import { scrollToTop } from '../lib/scroll';
import { Sigil } from '../components/Type';

export function Footer() {
  const copy = useCopy();
  const { locale } = usePreferences();

  return (
    <footer className="footer act">
      <div className="shell footer__inner">
        <div className="footer__brand">
          <Sigil className="footer__sigil" />
          <span className="footer__name display">STMfan</span>
          <span className="mono footer__line">{copy.footer.line}</span>
        </div>

        <p className="footer__slogan display" aria-hidden="true">
          {locale === 'zh' ? '探月下，尘世万象' : 'To Decipher the Sublunary Sphere.'}
        </p>

        <div className="footer__meta">
          <span className="mono">{copy.footer.rights}</span>
          <span className="mono footer__credits">{copy.footer.credits}</span>
          <a
            className="footer__link mono"
            href={`${CONTACT.github}/Myself`}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="link"
          >
            {copy.ui.source}
            <ArrowUpRight weight="light" size={12} />
          </a>
          <a
            className="footer__link mono"
            href={`${CONTACT.github}/Myself/blob/v2/LICENSE`}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="link"
          >
            {copy.ui.license}
          </a>
          <button className="footer__top mono" onClick={scrollToTop} data-cursor="link">
            {copy.ui.backTop}
            <ArrowUp weight="light" size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
}

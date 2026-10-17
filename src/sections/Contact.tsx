import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  EnvelopeSimple,
  GithubLogo,
  MusicNotes,
} from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy } from '../lib/preferences';
import { announce, copyText } from '../lib/toast';

function CopyField({
  label,
  value,
  href,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  value: string;
  href: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const ok = await copyText(value);
    if (ok) {
      setCopied(true);
      announce(copiedLabel);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="contact__row" data-reveal>
      <span className="contact__row-label mono">{label}</span>
      <a
        className="contact__row-value display"
        href={href}
        data-cursor="link"
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      >
        {value}
      </a>
      <button
        className="icon-btn contact__copy"
        onClick={onCopy}
        aria-label={`${copyLabel} ${label}`}
        title={copyLabel}
        data-cursor="link"
      >
        {copied ? <Check weight="light" size={16} /> : <Copy weight="light" size={16} />}
      </button>
    </div>
  );
}

export function Contact() {
  const copy = useCopy();

  return (
    <section className="contact act" id="contact" aria-labelledby="contact-title">
      <div className="shell">
        <header className="contact__head">
          <h2 className="contact__title display" id="contact-title" data-reveal>
            {copy.contact.title}
          </h2>
          <p className="lede contact__lede" data-reveal>
            {copy.contact.lede}
          </p>
        </header>

        <div className="contact__fields">
          <CopyField
            label={copy.contact.emailLabel}
            value={CONTACT.email}
            href={`mailto:${CONTACT.email}`}
            copyLabel={copy.ui.copy}
            copiedLabel={copy.ui.copied}
          />
          <CopyField
            label={copy.contact.qqLabel}
            value={CONTACT.qq}
            href={`mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${CONTACT.qq}`}
            copyLabel={copy.ui.copy}
            copiedLabel={copy.ui.copied}
          />
        </div>

        <div className="contact__lower">
          <div className="contact__social" data-reveal>
            <span className="contact__social-label mono">{copy.contact.socialLabel}</span>
            <a
              className="contact__social-link"
              href={CONTACT.github}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="link"
            >
              <GithubLogo weight="light" size={18} />
              <span>GitHub</span>
              <ArrowUpRight weight="light" size={15} />
            </a>
            <a
              className="contact__social-link"
              href={CONTACT.bilibili}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="link"
            >
              <MusicNotes weight="light" size={18} />
              <span>Bilibili</span>
              <ArrowUpRight weight="light" size={15} />
            </a>
            <a
              className="contact__social-link"
              href={`mailto:${CONTACT.email}`}
              data-cursor="link"
            >
              <EnvelopeSimple weight="light" size={18} />
              <span>Email</span>
              <ArrowUpRight weight="light" size={15} />
            </a>
          </div>

          <a
            className="contact__playlist"
            href={CONTACT.playlist}
            target="_blank"
            rel="noreferrer noopener"
            data-reveal
            data-cursor="link"
          >
            <span className="contact__cover">
              <img
                src="/assets/playlist-cover.webp"
                alt={copy.contact.playlistTitle}
                width={672}
                height={378}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="contact__playlist-copy">
              <span className="mono">{copy.contact.playlistTitle}</span>
              <strong className="display">{copy.contact.playlistNote}</strong>
              <span className="contact__playlist-link mono">
                {copy.games.openLabel}
                <ArrowUpRight weight="light" size={14} />
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

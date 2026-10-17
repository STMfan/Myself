import { useState } from 'react';
import {
  ArrowUpRight,
  ChatCircleDots,
  Check,
  Copy,
  EnvelopeSimple,
  GithubLogo,
  VideoCamera,
} from '@phosphor-icons/react';
import { CONTACT } from '../content/site';
import { useCopy } from '../lib/preferences';
import { announce, copyText } from '../lib/toast';

export function Contact() {
  const copy = useCopy();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (value: string) => {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(value);
    announce(copy.ui.copied);
    window.setTimeout(() => setCopied(null), 1700);
  };

  const channels = [
    {
      id: 'email',
      icon: <EnvelopeSimple weight="light" size={20} />,
      label: copy.contact.emailLabel,
      value: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
      copy: true,
    },
    {
      id: 'qq',
      icon: <ChatCircleDots weight="light" size={20} />,
      label: copy.contact.qqLabel,
      value: CONTACT.qq,
      copy: true,
    },
    {
      id: 'github',
      icon: <GithubLogo weight="light" size={20} />,
      label: copy.contact.githubLabel,
      value: '@STMfan',
      href: CONTACT.github,
    },
    {
      id: 'bilibili',
      icon: <VideoCamera weight="light" size={20} />,
      label: copy.contact.bilibiliLabel,
      value: '@STMfan',
      href: CONTACT.bilibili,
    },
  ];

  return (
    <section className="contact act" id="contact" aria-labelledby="contact-title">
      <div className="shell">
        <header className="contact__head section-head">
          <h2 className="section-title contact__title display" id="contact-title" data-reveal>
            {copy.contact.title}
          </h2>
          <p className="lede section-lede" data-reveal>
            {copy.contact.lede}
          </p>
        </header>

        <div className="channels">
          {channels.map((channel) => (
            <div className="channel" key={channel.id} data-reveal>
              <span className="channel__icon">{channel.icon}</span>
              <span className="channel__body">
                <span className="channel__label mono">{channel.label}</span>
                {channel.href ? (
                  <a
                    className="channel__value"
                    href={channel.href}
                    {...(channel.href.startsWith('http')
                      ? { target: '_blank', rel: 'noreferrer noopener' }
                      : {})}
                    data-cursor="link"
                  >
                    {channel.value}
                    <ArrowUpRight weight="light" size={14} />
                  </a>
                ) : (
                  <span className="channel__value">{channel.value}</span>
                )}
              </span>
              {channel.copy && (
                <button
                  className="icon-btn channel__copy"
                  onClick={() => handleCopy(channel.value)}
                  aria-label={`${copy.ui.copy} ${channel.label}`}
                  title={copy.ui.copy}
                  data-cursor="link"
                >
                  {copied === channel.value ? (
                    <Check weight="light" size={16} />
                  ) : (
                    <Copy weight="light" size={16} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="contact__cta">
          <span className="contact__cta-halo" aria-hidden="true" />
          <div className="contact__cta-copy">
            <p className="contact__cta-title display">{copy.contact.ctaLine}</p>
          </div>
          <a className="btn btn--solid btn--big" href={`mailto:${CONTACT.email}`} data-cursor="link">
            {copy.contact.cta}
            <ArrowUpRight className="btn__arrow" weight="light" size={17} />
          </a>
          <span className="contact__cta-note mono">{copy.contact.ctaNote}</span>
        </div>
      </div>
    </section>
  );
}

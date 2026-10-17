import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, MusicNotes } from '@phosphor-icons/react';
import { CONTACT, characters, games } from '../content/site';
import { useCopy, usePreferences } from '../lib/preferences';
import { announce, copyText } from '../lib/toast';
import { isCalm } from '../lib/scroll';

export function Extras() {
  const copy = useCopy();
  const { locale } = usePreferences();
  const [castIndex, setCastIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const section = useRef<HTMLElement>(null);

  const activeCast = characters[castIndex];
  const calm = useMemo(() => isCalm(), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      characters.forEach((character) => {
        const image = new Image();
        image.src = character.art;
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !visible || calm) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setCastIndex((index) => (index + 1) % characters.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [paused, visible, calm]);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    if (isCalm() || !window.matchMedia('(hover: hover)').matches) return;
    const cards = Array.from(node.querySelectorAll<HTMLElement>('[data-tilt]'));
    const cleanups = cards.map((card) => {
      const move = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--rx', `${(0.5 - y) * 3.4}deg`);
        card.style.setProperty('--ry', `${(x - 0.5) * 4.4}deg`);
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
      };
      const leave = () => {
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
      };
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
      return () => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  const handleCopy = async (value: string) => {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(value);
    announce(copy.ui.copied);
    window.setTimeout(() => setCopied(null), 1700);
  };

  return (
    <section className="extras act" id="extras" ref={section} aria-labelledby="extras-title">
      <div className="shell">
        <header className="extras__head section-head">
          <h2 className="section-title display" id="extras-title" data-reveal>
            {copy.extras.title}
          </h2>
          <p className="lede section-lede" data-reveal>
            {copy.extras.lede}
          </p>
        </header>

        <div className="shelf">
          <article className="shelf__card shelf__card--games" data-tilt>
            <header className="shelf__head">
              <h3 className="shelf__title">{copy.extras.gamesLabel}</h3>
              <span className="shelf__rule" aria-hidden="true" />
            </header>
            <ul className="game-list">
              {games.map((game) => (
                <li className="game-row" key={game.id}>
                  <a
                    className="game-row__logo"
                    href={game.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={game.name[locale]}
                    data-cursor="link"
                  >
                    <img
                      src={game.logo}
                      alt=""
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                  <div className="game-row__body">
                    <a
                      className="game-row__name"
                      href={game.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="link"
                    >
                      {game.name[locale]}
                    </a>
                    <span className="game-row__latin mono">{game.genre[locale]}</span>
                  </div>
                  {game.account ? (
                    <div className="game-row__account">
                      <span className="mono">
                        {game.account.label[locale]} {game.account.value}
                      </span>
                      <button
                        className="icon-btn icon-btn--sm"
                        onClick={() => handleCopy(game.account!.value)}
                        aria-label={`${copy.extras.copyAccount}: ${game.account.value}`}
                        data-cursor="link"
                      >
                        {copied === game.account.value ? (
                          <Check weight="light" size={15} />
                        ) : (
                          <Copy weight="light" size={15} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <a
                      className="game-row__go"
                      href={game.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={game.name[locale]}
                      data-cursor="link"
                    >
                      <ArrowUpRight weight="light" size={17} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </article>

          <article
            className="shelf__card shelf__card--cast"
            data-tilt
            data-paused={paused || !visible || calm}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <header className="shelf__head">
              <h3 className="shelf__title">{copy.extras.castLabel}</h3>
              <span className="shelf__rule" aria-hidden="true" />
            </header>

            <div className={`cast-stage ${activeCast.framed ? 'is-framed' : ''}`}>
              <img
                key={activeCast.id}
                className="cast-stage__art"
                src={activeCast.art}
                alt={locale === 'zh' ? activeCast.zh : activeCast.en}
                width={700}
                height={1000}
                loading="lazy"
                decoding="async"
              />
              <div className="cast-stage__meta">
                <span className="cast-stage__origin mono">{activeCast.origin[locale]}</span>
                <strong className="cast-stage__name">
                  {locale === 'zh' ? activeCast.zh : activeCast.en}
                </strong>
                <span className="cast-stage__alt mono">
                  {locale === 'zh' ? activeCast.en : activeCast.zh}
                </span>
              </div>
            </div>

            <div className="cast-rail" role="tablist" aria-label={copy.extras.castLabel}>
              {characters.map((character, index) => (
                <button
                  key={character.id}
                  className="cast-dot"
                  role="tab"
                  aria-selected={index === castIndex}
                  data-active={index === castIndex}
                  onClick={() => {
                    setCastIndex(index);
                    setPaused(true);
                  }}
                  aria-label={locale === 'zh' ? character.zh : character.en}
                  data-cursor="link"
                >
                  <img src={character.face} alt="" width={64} height={64} loading="lazy" />
                </button>
              ))}
              <span className="cast-rail__line" aria-hidden="true">
                <span key={castIndex} className="cast-rail__fill" />
              </span>
            </div>
          </article>

          <article className="shelf__card shelf__card--playlist" data-tilt>
            <span className="playlist__word display" aria-hidden="true">
              BILIBILI
            </span>
            <header className="shelf__head">
              <h3 className="shelf__title">{copy.extras.playlistLabel}</h3>
              <span className="shelf__rule" aria-hidden="true" />
            </header>
            <a
              className="playlist"
              href={CONTACT.playlist}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="link"
            >
              <span className="playlist__cover">
                <img
                  src={CONTACT.playlistCover}
                  alt={copy.extras.playlistTitle}
                  width={480}
                  height={270}
                  loading="lazy"
                  decoding="async"
                />
                <span className="playlist__icon" aria-hidden="true">
                  <MusicNotes weight="light" size={18} />
                </span>
              </span>
              <span className="playlist__body">
                <span className="playlist__title">{copy.extras.playlistTitle}</span>
                <span className="playlist__note">{copy.extras.playlistNote}</span>
                <span className="playlist__link mono">
                  {copy.extras.playlistLink}
                  <ArrowUpRight weight="light" size={14} />
                </span>
              </span>
              <span className="playlist__go" aria-hidden="true">
                <ArrowUpRight weight="light" size={20} />
              </span>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

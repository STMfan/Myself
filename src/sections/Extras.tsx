import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  MusicNotes,
} from '@phosphor-icons/react';
import { CONTACT, characters, games } from '../content/site';
import { useCopy, usePreferences } from '../lib/preferences';
import { announce, copyText } from '../lib/toast';
import { isCalm } from '../lib/scroll';

type Tab = 'games' | 'characters' | 'playlist';

const TABS: Tab[] = ['games', 'characters', 'playlist'];

export function Extras() {
  const copy = useCopy();
  const { locale } = usePreferences();
  const [tab, setTab] = useState<Tab>('games');
  const [gameIndex, setGameIndex] = useState(0);
  const [castIndex, setCastIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const section = useRef<HTMLElement>(null);

  const activeGame = games[gameIndex];
  const activeCast = characters[castIndex];
  const calm = useMemo(() => isCalm(), []);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (tab === 'playlist' || paused || !visible || calm) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      if (tab === 'games') setGameIndex((index) => (index + 1) % games.length);
      if (tab === 'characters') setCastIndex((index) => (index + 1) % characters.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [tab, paused, visible, calm]);

  const selectTab = (next: Tab) => {
    setTab(next);
    setPaused(false);
  };

  const step = (direction: 1 | -1) => {
    if (tab === 'games') setGameIndex((index) => (index + direction + games.length) % games.length);
    else if (tab === 'characters')
      setCastIndex((index) => (index + direction + characters.length) % characters.length);
  };

  const onTabKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TABS.indexOf(tab);
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    selectTab(next);
    document.getElementById(`album-tab-${next}`)?.focus();
  };

  const handleCopy = async (value: string) => {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(value);
    announce(copy.ui.copied);
    window.setTimeout(() => setCopied(null), 1700);
  };

  const tabLabel = copy.extras.tabs;

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

        <div
          className="album"
          data-paused={paused || !visible || calm}
          data-kind={tab}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="album__bar">
            <div
              className="album__tabs"
              role="tablist"
              aria-label={copy.extras.title}
              onKeyDown={onTabKey}
            >
              {TABS.map((entry) => (
                <button
                  key={entry}
                  id={`album-tab-${entry}`}
                  role="tab"
                  aria-selected={tab === entry}
                  aria-controls="album-panel"
                  tabIndex={tab === entry ? 0 : -1}
                  className="album__tab"
                  data-active={tab === entry}
                  onClick={() => selectTab(entry)}
                  data-cursor="link"
                >
                  <span>{tabLabel[entry]}</span>
                </button>
              ))}
            </div>
            <div className="album__arrows">
              <button
                className="icon-btn"
                onClick={() => step(-1)}
                aria-label={locale === 'zh' ? '上一个' : 'Previous'}
                data-cursor="link"
              >
                <ArrowLeft weight="light" size={16} />
              </button>
              <button
                className="icon-btn"
                onClick={() => step(1)}
                aria-label={locale === 'zh' ? '下一个' : 'Next'}
                data-cursor="link"
              >
                <ArrowRight weight="light" size={16} />
              </button>
            </div>
            <span
              className="album__timer"
              key={`${tab}-${gameIndex}-${castIndex}-${paused}-${visible}`}
              aria-hidden="true"
            />
          </div>

          <div
            className="album__stage"
            id="album-panel"
            role="tabpanel"
            aria-labelledby={`album-tab-${tab}`}
          >
            <span className="album__arc" aria-hidden="true" />
            <span className="album__arc album__arc--b" aria-hidden="true" />

            {tab === 'games' && (
              <article className="album__panel game-card" key={`game-${activeGame.id}`}>
                <div className="game-card__media">
                  <span className="game-card__halo" aria-hidden="true" />
                  <img
                    src={activeGame.logo}
                    alt={activeGame.name[locale]}
                    width={256}
                    height={256}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="game-card__body">
                  <span className="mono game-card__genre">{activeGame.genre[locale]}</span>
                  <h3 className="game-card__title display">{activeGame.name[locale]}</h3>
                  <p className="game-card__latin mono">{activeGame.latin[locale]}</p>

                  {activeGame.account && (
                    <div className="game-card__account">
                      <span className="mono">{activeGame.account.label[locale]}</span>
                      <strong>{activeGame.account.value}</strong>
                      <button
                        className="icon-btn game-card__copy"
                        onClick={() => handleCopy(activeGame.account!.value)}
                        aria-label={`${copy.extras.copyAccount} ${activeGame.account.label[locale]}`}
                        title={copy.ui.copy}
                        data-cursor="link"
                      >
                        {copied === activeGame.account.value ? (
                          <Check weight="light" size={16} />
                        ) : (
                          <Copy weight="light" size={16} />
                        )}
                      </button>
                    </div>
                  )}

                  <a
                    className="link game-card__link"
                    href={activeGame.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="link"
                  >
                    {locale === 'zh' ? '前往游戏官网' : 'Open game site'}
                    <ArrowUpRight weight="light" size={15} />
                  </a>
                </div>
              </article>
            )}

            {tab === 'characters' && (
              <article className="album__panel cast-card" key={`cast-${activeCast.id}`}>
                <div className={`cast-card__art ${activeCast.framed ? 'is-framed' : ''}`}>
                  <img
                    src={activeCast.art}
                    alt={locale === 'zh' ? activeCast.zh : activeCast.en}
                    width={700}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="cast-card__floor" aria-hidden="true" />
                </div>
                <div className="cast-card__body">
                  <span className="cast-card__origin">{activeCast.origin[locale]}</span>
                  <h3 className="cast-card__title display">
                    {locale === 'zh' ? activeCast.zh : activeCast.en}
                  </h3>
                  <p className="cast-card__alt mono">
                    {locale === 'zh' ? activeCast.en : activeCast.zh}
                  </p>
                </div>
              </article>
            )}

            {tab === 'playlist' && (
              <article className="album__panel playlist-card">
                <a
                  className="playlist-card__cover"
                  href={CONTACT.playlist}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={copy.extras.playlistLink}
                  data-cursor="link"
                >
                  <img
                    src={CONTACT.playlistCover}
                    alt={copy.extras.playlistTitle}
                    width={672}
                    height={378}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="playlist-card__play" aria-hidden="true">
                    <MusicNotes weight="light" size={22} />
                  </span>
                </a>
                <div className="playlist-card__body">
                  <span className="mono">{copy.extras.playlistLabel}</span>
                  <h3 className="playlist-card__title display">{copy.extras.playlistTitle}</h3>
                  <p className="playlist-card__note">{copy.extras.playlistNote}</p>
                  <a
                    className="link"
                    href={CONTACT.playlist}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="link"
                  >
                    {copy.extras.playlistLink}
                    <ArrowUpRight weight="light" size={15} />
                  </a>
                </div>
              </article>
            )}
          </div>

          <div className="album__thumbs" role="presentation">
            {tab === 'games' &&
              games.map((game, index) => (
                <button
                  key={game.id}
                  className="thumb"
                  data-active={index === gameIndex}
                  onClick={() => {
                    setGameIndex(index);
                    setPaused(true);
                  }}
                  aria-label={game.name[locale]}
                  data-cursor="link"
                >
                  <span className="thumb__img">
                    <img src={game.logo} alt="" width={64} height={64} loading="lazy" />
                  </span>
                  <span className="thumb__label mono">{game.name[locale]}</span>
                </button>
              ))}
            {tab === 'characters' &&
              characters.map((character, index) => (
                <button
                  key={character.id}
                  className="thumb"
                  data-active={index === castIndex}
                  onClick={() => {
                    setCastIndex(index);
                    setPaused(true);
                  }}
                  aria-label={locale === 'zh' ? character.zh : character.en}
                  data-cursor="link"
                >
                  <span className="thumb__img thumb__img--cast">
                    <img src={character.face} alt="" width={64} height={64} loading="lazy" />
                  </span>
                  <span className="thumb__label mono">
                    {locale === 'zh' ? character.zh : character.en}
                  </span>
                </button>
              ))}
            {tab === 'playlist' && (
              <span className="mono album__thumbs-note">{copy.extras.playlistNote}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

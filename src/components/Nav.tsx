import { useCallback, useEffect, useRef, useState } from 'react';
import { List, Moon, Sun, X } from '@phosphor-icons/react';
import { CONTACT, NAV_ITEMS } from '../content/site';
import { usePreferences } from '../lib/preferences';
import { ScrollTrigger, scrollToId, scrollToTop } from '../lib/scroll';
import { Logo } from './Type';

export function Nav() {
  const { copy, locale, theme, toggleLocale, toggleTheme } = usePreferences();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('workshop');
  const [menuOpen, setMenuOpen] = useState(false);
  const themeButton = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${self.progress})`;
        }
        const next = self.scroll() > 56;
        setScrolled((current) => (current === next ? current : next));
      },
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    const nodes = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-40% 0px -52% 0px', threshold: [0, 0.05] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.dataset.menu = 'open';
    } else {
      document.documentElement.style.overflow = '';
      delete document.documentElement.dataset.menu;
    }
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const go = useCallback((id: string) => {
    setMenuOpen(false);
    window.setTimeout(() => scrollToId(id), 80);
  }, []);

  const onTheme = () => {
    const rect = themeButton.current?.getBoundingClientRect();
    toggleTheme(
      rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined,
    );
  };

  return (
    <>
      <a className="skip-link" href="#main">
        {copy.ui.skip}
      </a>

      <header className="nav" data-scrolled={scrolled}>
        <div className="nav__inner">
          <button className="nav__brand" onClick={scrollToTop} aria-label="STMfan">
            <Logo className="nav__logo" />
            <span className="nav__name display">STMfan</span>
            <span className="nav__role mono">{copy.hero.status}</span>
          </button>

          <nav className="nav__links" aria-label={locale === 'zh' ? '主导航' : 'Primary'}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className="nav__link"
                data-active={active === item.id}
                onClick={() => go(item.id)}
                data-cursor="link"
              >
                <span>{item.label[locale]}</span>
                <span className="nav__link-dot" aria-hidden="true" />
              </button>
            ))}
          </nav>

          <div className="nav__controls">
            <button
              className="nav__lang"
              onClick={toggleLocale}
              aria-label={copy.ui.langLabel}
              title={copy.ui.langLabel}
              data-cursor="link"
            >
              <span data-on={locale === 'zh'}>中</span>
              <span className="nav__lang-sep" aria-hidden="true" />
              <span data-on={locale === 'en'}>EN</span>
            </button>

            <button
              ref={themeButton}
              className="icon-btn nav__theme"
              onClick={onTheme}
              aria-label={theme === 'dark' ? copy.ui.themeToLight : copy.ui.themeToDark}
              title={theme === 'dark' ? copy.ui.themeToLight : copy.ui.themeToDark}
              data-cursor="link"
            >
              <span className="nav__theme-swap" data-theme={theme}>
                <Sun weight="light" size={17} />
                <Moon weight="light" size={17} />
              </span>
            </button>

            <a className="btn btn--solid nav__cta" href={`mailto:${CONTACT.email}`} data-cursor="link">
              <span>{copy.hero.primary}</span>
            </a>

            <button
              className="nav__burger icon-btn"
              aria-label={menuOpen ? copy.ui.menuClose : copy.ui.menuOpen}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              data-cursor="link"
            >
              {menuOpen ? <X weight="light" size={18} /> : <List weight="light" size={18} />}
            </button>
          </div>
        </div>
        <span className="nav__progress" aria-hidden="true">
          <span className="nav__progress-fill" ref={progressRef} />
        </span>
      </header>

      <div className="menu" data-open={menuOpen} aria-hidden={!menuOpen}>
        <div className="menu__inner">
          <p className="mono menu__label">
            STMfan · {copy.hero.status}
          </p>
          <nav className="menu__nav" aria-label={locale === 'zh' ? '移动导航' : 'Mobile'}>
            {NAV_ITEMS.map((item, index) => (
              <button
                key={item.id}
                className="menu__item display"
                data-active={active === item.id}
                onClick={() => go(item.id)}
                style={{ transitionDelay: menuOpen ? `${90 + index * 40}ms` : '0ms' }}
                tabIndex={menuOpen ? 0 : -1}
              >
                <span>{item.label[locale]}</span>
                <span className="menu__item-index mono">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </button>
            ))}
          </nav>
          <div className="menu__foot">
            <a className="btn btn--solid" href={`mailto:${CONTACT.email}`} tabIndex={menuOpen ? 0 : -1}>
              {copy.hero.primary}
            </a>
            <button
              className="menu__lang mono"
              onClick={toggleLocale}
              tabIndex={menuOpen ? 0 : -1}
            >
              {locale === 'zh' ? 'Switch to English' : '切换到中文'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

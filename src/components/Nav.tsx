import { useCallback, useEffect, useRef, useState } from 'react';
import { List, Moon, Sun, X } from '@phosphor-icons/react';
import { CONTACT, NAV_ITEMS } from '../content/site';
import { usePreferences } from '../lib/preferences';
import { getLenis, ScrollTrigger, scrollToId, scrollToTop } from '../lib/scroll';
import { Sigil } from './Type';

export function Nav({ booted }: { booted: boolean }) {
  const { copy, locale, theme, toggleLocale, toggleTheme } = usePreferences();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const themeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 80,
      end: 'max',
      onToggle: (self) => setScrolled(self.isActive),
      onUpdate: (self) => setScrolled(self.scroll() > 80),
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (menuOpen) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
      document.documentElement.dataset.menu = 'open';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
      delete document.documentElement.dataset.menu;
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
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
    window.setTimeout(() => scrollToId(id, -8), 120);
  }, []);

  const onTheme = () => {
    const rect = themeButton.current?.getBoundingClientRect();
    toggleTheme(
      rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : undefined,
    );
  };

  return (
    <>
      <a className="skip-link" href="#main">
        {copy.ui.skip}
      </a>
      <header className="nav" data-scrolled={scrolled} data-booted={booted}>
        <div className="nav__inner">
          <button className="nav__brand" onClick={() => scrollToTop()} aria-label="STMfan">
            <Sigil className="nav__sigil" />
            <span className="nav__name display">STMfan</span>
            <span className="nav__role mono">{copy.hero.status}</span>
          </button>

          <nav className="nav__links" aria-label={locale === 'zh' ? '主导航' : 'Primary'}>
            {NAV_ITEMS.slice(0, 6).map((item) => (
              <button
                key={item.id}
                className="nav__link"
                onClick={() => go(item.id)}
                data-cursor="link"
              >
                <span>{item.label[locale]}</span>
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

            <a
              className="btn btn--solid nav__cta"
              href={`mailto:${CONTACT.email}`}
              data-cursor="link"
            >
              {copy.hero.primary}
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
      </header>

      <div className="menu" data-open={menuOpen} aria-hidden={!menuOpen}>
        <div className="menu__inner">
          <p className="mono menu__label">STMfan · {copy.hero.status}</p>
          <nav className="menu__nav" aria-label={locale === 'zh' ? '移动导航' : 'Mobile'}>
            {[...NAV_ITEMS].map((item, index) => (
              <button
                key={item.id}
                className="menu__item display"
                onClick={() => go(item.id)}
                style={{ transitionDelay: menuOpen ? `${120 + index * 45}ms` : '0ms' }}
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

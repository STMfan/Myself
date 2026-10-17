import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { site, type Copy, type Locale } from '../content/site';

export type Theme = 'dark' | 'light';

interface Preferences {
  locale: Locale;
  theme: Theme;
  copy: Copy;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

const STORAGE_KEY = 'stmfan.sublunary';

const PreferencesContext = createContext<Preferences | null>(null);

function readStored(): Partial<{ theme: Theme; lang: Locale }> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeStored(patch: Partial<{ theme: Theme; lang: Locale }>) {
  if (typeof window === 'undefined') return;
  try {
    const current = readStored();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...current, ...patch }),
    );
  } catch {
    /* storage may be unavailable in private mode */
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'dark';
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  });
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof document === 'undefined') return 'zh';
    return document.documentElement.dataset.lang === 'en' ? 'en' : 'zh';
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#04060b' : '#eef1f5');
  }, [theme]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.lang = locale;
    root.lang = locale === 'en' ? 'en' : 'zh-CN';
    document.title = site[locale].meta.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', site[locale].meta.description);
  }, [locale]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const stored = readStored();
      if (stored.theme === 'dark' || stored.theme === 'light') setTheme(stored.theme);
      if (stored.lang === 'zh' || stored.lang === 'en') setLocaleState(stored.lang);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeStored({ lang: next });
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => {
      const next = current === 'zh' ? 'en' : 'zh';
      writeStored({ lang: next });
      return next;
    });
  }, []);

  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) => {
      const next: Theme = theme === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;
      const calm =
        root.dataset.motion === 'calm' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const canTransition =
        !calm &&
        typeof document.startViewTransition === 'function' &&
        !window.matchMedia('(prefers-reduced-transparency: reduce)').matches;

      if (!canTransition) {
        root.dataset.theme = next;
        setTheme(next);
        writeStored({ theme: next });
        return;
      }

      const x = origin?.x ?? window.innerWidth - 64;
      const y = origin?.y ?? 48;
      root.style.setProperty('--toggle-x', `${x}px`);
      root.style.setProperty('--toggle-y', `${y}px`);
      root.dataset.switching = 'theme';

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          root.dataset.theme = next;
          setTheme(next);
        });
      });
      transition.finished.finally(() => {
        delete root.dataset.switching;
        writeStored({ theme: next });
      });
    },
    [theme],
  );

  const value = useMemo<Preferences>(
    () => ({
      locale,
      theme,
      copy: site[locale],
      setLocale,
      toggleLocale,
      toggleTheme,
    }),
    [locale, theme, setLocale, toggleLocale, toggleTheme],
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences(): Preferences {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('usePreferences must be used inside PreferencesProvider');
  return value;
}

export function useCopy(): Copy {
  return usePreferences().copy;
}

export function pick(text: Record<Locale, string>, locale: Locale): string {
  return text[locale];
}

import { useEffect } from 'react';
import { ScrollTrigger } from '../lib/scroll';
import { usePreferences } from '../lib/preferences';

/**
 * Copy length changes with the locale, so section heights and pin ranges
 * have to be measured again after the swap settles.
 */
export function ScrollRefresh() {
  const { locale } = usePreferences();

  useEffect(() => {
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 260);
    return () => window.clearTimeout(timer);
  }, [locale]);

  return null;
}

import { useEffect } from 'react';
import { PreferencesProvider } from './lib/preferences';
import { gsap, ScrollTrigger, startScrollTracking, stopScrollTracking } from './lib/scroll';
import { Stage } from './components/Stage';
import { Nav } from './components/Nav';
import { Cursor } from './components/Cursor';
import { Toast } from './components/Toast';
import { ScrollRefresh } from './components/ScrollRefresh';
import { Hero } from './sections/Hero';
import { Workshop } from './sections/Workshop';
import { OpenSource } from './sections/OpenSource';
import { Commission } from './sections/Commission';
import { Extras } from './sections/Extras';
import { Notes } from './sections/Notes';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';

export function App() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    startScrollTracking();

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          y: 30,
          opacity: 0,
          duration: 0.95,
          ease: 'expo.out',
          scrollTrigger: { trigger: element, start: 'top 92%' },
        });
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    const timer = window.setTimeout(refresh, 700);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('orientationchange', onResize);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('orientationchange', onResize);
      context.revert();
      stopScrollTracking();
    };
  }, []);

  return (
    <PreferencesProvider>
      <Stage />
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <Cursor />
      <Nav />
      <ScrollRefresh />
      <main id="main">
        <Hero />
        <Workshop />
        <OpenSource />
        <Commission />
        <Extras />
        <Notes />
        <Contact />
      </main>
      <Footer />
      <Toast />
    </PreferencesProvider>
  );
}

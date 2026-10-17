import { useEffect, useState } from 'react';
import { PreferencesProvider } from './lib/preferences';
import { gsap, ScrollTrigger, startScrollTracking, stopScrollTracking } from './lib/scroll';
import { Stage } from './components/Stage';
import { Preloader } from './components/Preloader';
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
  const [booted, setBooted] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    startScrollTracking();

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          y: 34,
          opacity: 0,
          duration: 1.05,
          ease: 'expo.out',
          scrollTrigger: { trigger: element, start: 'top 90%' },
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
      {showPreloader && (
        <Preloader
          onDone={() => {
            setBooted(true);
            window.setTimeout(() => setShowPreloader(false), 320);
          }}
        />
      )}
      <Cursor />
      <Nav booted={booted} />
      <ScrollRefresh />
      <main id="main">
        <Hero booted={booted} />
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

import { useEffect, useState } from 'react';
import { PreferencesProvider } from './lib/preferences';
import { gsap, initSmoothScroll, ScrollTrigger } from './lib/scroll';
import { Stage } from './components/Stage';
import { Preloader } from './components/Preloader';
import { Nav } from './components/Nav';
import { Rail } from './components/Rail';
import { Cursor } from './components/Cursor';
import { Toast } from './components/Toast';
import { Altitude } from './components/Altitude';
import { ScrollRefresh } from './components/ScrollRefresh';
import { Hero } from './sections/Hero';
import { Manifesto } from './sections/Manifesto';
import { Workshop } from './sections/Workshop';
import { Commission } from './sections/Commission';
import { MaiBot } from './sections/MaiBot';
import { Games } from './sections/Games';
import { Characters } from './sections/Characters';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';

export function App() {
  const [booted, setBooted] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const cleanupScroll = initSmoothScroll();
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          y: 46,
          opacity: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: element, start: 'top 88%' },
        });
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    const timer = window.setTimeout(refresh, 900);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('orientationchange', onResize);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('orientationchange', onResize);
      context.revert();
      cleanupScroll();
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
      <Rail />
      <Altitude />
      <ScrollRefresh />
      <main id="main">
        <Hero booted={booted} />
        <Manifesto />
        <Workshop />
        <Commission />
        <MaiBot />
        <Games />
        <Characters />
        <Contact />
      </main>
      <Footer />
      <Toast />
    </PreferencesProvider>
  );
}

import { useEffect, useRef } from 'react';

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    if (document.documentElement.dataset.motion === 'calm') return;
    const node = dotRef.current;
    const aura = auraRef.current;
    if (!node || !aura) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ax = x;
    let ay = y;
    let tx = x;
    let ty = y;
    let raf = 0;
    let visible = false;

    const move = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      if (!visible) {
        visible = true;
        node.dataset.visible = 'true';
      }
      const target = event.target as HTMLElement | null;
      const hot = Boolean(
        target?.closest('a, button, [data-cursor="link"], input, [role="button"]'),
      );
      node.dataset.hot = String(hot);
    };
    const leave = () => {
      visible = false;
      node.dataset.visible = 'false';
    };

    const render = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      ax += (tx - ax) * 0.055;
      ay += (ty - ay) * 0.055;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      aura.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
      raf = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <>
      <div className="cursor-aura" ref={auraRef} aria-hidden="true" />
      <div className="cursor" ref={dotRef} aria-hidden="true" />
    </>
  );
}

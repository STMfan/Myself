import { useEffect, useRef } from 'react';

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    const node = dotRef.current;
    if (!node) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
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
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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

  return <div className="cursor" ref={dotRef} aria-hidden="true" />;
}

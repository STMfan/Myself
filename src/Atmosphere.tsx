import { useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';
import { useAppReducedMotion } from './MotionPreferences';

// One canvas for the entire journey: curves and travelling light share coordinates.
// Continuous values live in refs, not React state. No wheel/scroll interception.
export default function Atmosphere({ theme }: { theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const pointer = useRef({x: .5, y: .4});
  const reduced = useAppReducedMotion();
  const { scrollYProgress } = useScroll();
  useEffect(() => scrollYProgress.on('change', p => { progress.current = p; }), [scrollYProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', {alpha:true});
    if (!canvas || !ctx) return;
    let frame = 0, last = 0, width = 0, height = 0;
    const fine = matchMedia('(pointer:fine)').matches;
    const rgb = theme === 'light' ? '56,87,108' : '232,246,255';
    function move(e: PointerEvent) {
      if (e.pointerType === 'mouse') pointer.current = {x:e.clientX / canvas!.clientWidth, y:e.clientY / canvas!.clientHeight};
    }
    function draw(now: number) {
      if (document.hidden) { frame = 0; return; }
      const small = canvas!.clientWidth < 768;
      if (!reduced && now - last < (small ? 32 : 16)) { frame = requestAnimationFrame(draw); return; }
      last = now;
      if (width !== canvas!.clientWidth || height !== canvas!.clientHeight) {
        width = canvas!.clientWidth; height = canvas!.clientHeight;
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        canvas!.width = Math.round(width * dpr); canvas!.height = Math.round(height * dpr);
        ctx!.setTransform(dpr,0,0,dpr,0,0);
      }
      ctx!.clearRect(0,0,width,height);
      const time = reduced ? 0 : now / 1000;
      const drift = (fine ? pointer.current.x - .5 : 0) * 40;
      const count = small ? 4 : 7;
      for (let i=0;i<count;i++) {
        const phase = i * 1.31;
        const x = width * (.08 + i / count * .92);
        const bend = width * (small ? .28 : .18);
        const sway = Math.sin(time * .18 + phase) * bend * .33;
        const a = x + drift;
        const b = x + bend * Math.sin(phase + progress.current * Math.PI * 2) + sway;
        const c = x - bend * Math.cos(phase + progress.current * 4) - sway;
        const d = x + Math.sin(phase) * bend * .65;
        ctx!.beginPath(); ctx!.moveTo(a,-160);
        ctx!.bezierCurveTo(b,height * .27,c,height * .73,d,height + 160);
        ctx!.strokeStyle = `rgba(${rgb},${reduced ? .065 : (i % 2 ? .11 : .19)})`;
        ctx!.lineWidth = i % 3 ? .65 : 1.05; ctx!.stroke();
        if (reduced) continue;
        const t = ((time * (.045 + i * .003) + i * .173 + progress.current * .26) % 1);
        const bezier = (u:number) => ({
          x:(1-u)**3*a+3*(1-u)**2*u*b+3*(1-u)*u*u*c+u**3*d,
          y:(1-u)**3*(-160)+3*(1-u)**2*u*(height*.27)+3*(1-u)*u*u*(height*.73)+u**3*(height+160),
        });
        const head = bezier(t);
        const tail = bezier(Math.max(0,t-.085));
        const gradient = ctx!.createLinearGradient(tail.x,tail.y,head.x,head.y);
        gradient.addColorStop(0,`rgba(${rgb},0)`); gradient.addColorStop(1,`rgba(${rgb},.85)`);
        ctx!.beginPath();
        for(let j=0;j<=14;j++){ const p=bezier(Math.max(0,t-.085)+(.085*j/14)); if(j===0)ctx!.moveTo(p.x,p.y);else ctx!.lineTo(p.x,p.y); }
        ctx!.strokeStyle=gradient; ctx!.lineWidth=1.35; ctx!.stroke();
        ctx!.beginPath(); ctx!.arc(head.x,head.y,1.65,0,Math.PI*2); ctx!.fillStyle=`rgba(${rgb},.9)`; ctx!.fill();
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    }
    function resume() { if(!document.hidden && !frame) frame = requestAnimationFrame(draw); }
    if (fine && !reduced) window.addEventListener('pointermove',move,{passive:true});
    document.addEventListener('visibilitychange',resume);
    frame = requestAnimationFrame(draw);
    const observer = new ResizeObserver(() => { if(reduced) draw(0); }); observer.observe(canvas);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('pointermove',move); document.removeEventListener('visibilitychange',resume); };
  }, [theme,reduced]);
  return <div className="atmosphere" aria-hidden="true"><div className="atmosphere-haze" /><canvas ref={canvasRef} className="flow-canvas" /></div>;
}

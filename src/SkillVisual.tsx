import { useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useAppReducedMotion } from './MotionPreferences';
import { Code, HardDrives, Lightning, Sparkle } from '@phosphor-icons/react';
import type { Language } from './content';

// These are explanatory illustrations, not a live server dashboard or claimed metrics.
export default function SkillVisual({ field, lang }: { field: string; lang: Language }) {
  const reduced = useAppReducedMotion();
  const visualRef = useRef<HTMLDivElement>(null);
  const visible = useInView(visualRef);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const rx = useSpring(x, { stiffness: 130, damping: 22 });
  const ry = useSpring(y, { stiffness: 130, damping: 22 });
  const t = (zh: string, en: string) => lang === 'zh' ? zh : en;
  return <motion.div ref={visualRef} data-active={visible} className={`skill-visual visual-${field}`} aria-hidden="true" style={{ rotateX: rx, rotateY: ry }} onPointerMove={e => {
    if (reduced || e.pointerType !== 'mouse') return;
    const bounds = e.currentTarget.getBoundingClientRect();
    x.set((e.clientY - bounds.top - bounds.height / 2) * -0.035);
    y.set((e.clientX - bounds.left - bounds.width / 2) * 0.035);
  }} onPointerLeave={() => { x.set(0); y.set(0); }}>
    <div className="visual-grid" /><div className="visual-coordinate">{field === 'backend' ? '01 / ARCHITECTURE' : field === 'ops' ? '02 / INFRASTRUCTURE' : field === 'vibe' ? '03 / CREATION' : '04 / EXPLORATION'}</div>
    <svg className="visual-wires" viewBox="0 0 500 330" fill="none">
      <path className="wire-base" d="M20 80 H90 Q112 80 112 102 V155 Q112 175 135 175 H365 Q388 175 388 152 V100 Q388 80 410 80 H480 M20 265 H90 Q112 265 112 243 V198 Q112 175 135 175 M365 175 Q388 175 388 198 V244 Q388 265 410 265 H480" />
      <path className="wire-signal" d="M20 80 H90 Q112 80 112 102 V155 Q112 175 135 175 H365 Q388 175 388 152 V100 Q388 80 410 80 H480" pathLength="100" />
      <path className="wire-signal signal-return" d="M480 265 H410 Q388 265 388 244 V198 Q388 175 365 175 H135 Q112 175 112 198 V243 Q112 265 90 265 H20" pathLength="100" />
    </svg>
    {field === 'backend' && <>
      <div className="api-node node-request"><span>GET</span><Code size={22} />/ request</div>
      <div className="api-core"><div className="core-orbit" /><Lightning size={47} weight="fill" /><strong>FastAPI</strong><span>Python</span></div>
      <div className="api-node node-response"><span>{'{ }'}</span>{t('响应', 'Response')}<i /></div>
      <div className="visual-label label-bottom">{t('类型验证 · 业务逻辑 · 服务接口', 'Validation · Logic · Service APIs')}</div>
    </>}
    {field === 'ops' && <>
      <div className="server-orbit" /><div className="server-rack">{[0, 1, 2].map(i => <div className="server-unit" key={i}><HardDrives size={28} weight="light" /><div className="server-slots"><span /><span /><span /><span /><span /></div><i style={{ animationDelay: `${i * .7}s` }} /></div>)}<div className="server-scan" /></div>
      <span className="server-label server-label-top">Debian / Linux</span><span className="server-label server-label-bottom">{t('部署 · 维护 · 长期陪伴', 'Deploy · Maintain · Keep alive')}</span>
    </>}
    {field === 'vibe' && <>
      <div className="build-window"><div className="window-chrome"><span /><span /><span /><Code size={15} /></div><div className="build-canvas"><div className="canvas-sidebar"><i /><i /><i /></div><div className="canvas-main"><span className="canvas-title" /><div className="canvas-content"><i /><i /><i /></div><span className="canvas-line" /><span className="canvas-line short" /></div></div></div>
      <div className="prompt-chip"><Sparkle size={21} weight="fill" /><span>Prompt → Possibility</span><i /></div>
      <div className="visual-label label-bottom">{t('意图 · 实现 · 验证', 'Intent · Build · Verify')}</div>
    </>}
    {field === 'flutter' && <>
      <div className="phone-orbit" /><div className="app-phone"><div className="phone-camera" /><div className="phone-screen"><span className="phone-title" /><div className="phone-tile"><Sparkle size={38} weight="light" /></div><div className="phone-cells"><i /><i /><i /><i /></div><div className="phone-home" /></div></div>
      <span className="flutter-label">Dart<br />Flutter</span><div className="visual-label label-bottom">{t('曾经探索，跨屏幕的表达。', 'An exploration across screens.')}</div>
    </>}
  </motion.div>;
}

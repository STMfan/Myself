import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Pause, Play, Planet } from '@phosphor-icons/react';
import { characters, type Language } from './content';

export default function CharacterShowcase({ lang }: { lang: Language }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pageActive, setPageActive] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const inputType = useRef('keyboard');
  const visible = useInView(root, { amount: 0.25 });
  const reduced = useReducedMotion();
  const open = !dismissed && (hovered || focused || pinned);
  const playing = visible && pageActive && !reduced && !hovered && !focused && !pinned && !paused;
  const character = characters[index];
  const t = (zh: string, en: string) => lang === 'zh' ? zh : en;

  useEffect(() => {
    function visibility() { setPageActive(!document.hidden); }
    visibility(); document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % characters.length), 2800);
    return () => clearInterval(timer);
  }, [playing, index]);

  useEffect(() => {
    function outside(event: PointerEvent) {
      if (root.current && !root.current.contains(event.target as Node)) {
        setPinned(false); setFocused(false); setDismissed(true);
      }
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  function keys(event: KeyboardEvent<HTMLButtonElement>, current: number) {
    let next = current;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % characters.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current + characters.length - 1) % characters.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = characters.length - 1;
    else return;
    event.preventDefault(); setIndex(next); document.getElementById(`character-${next}`)?.focus();
  }

  return <motion.div id="characters" ref={root} className="character-section" data-character={character.id} data-playing={playing} data-chooser={open}
    initial={reduced ? false : { opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.7 }}
    onPointerEnter={e => { if (e.pointerType === 'mouse') { setHovered(true); setDismissed(false); } }}
    onPointerDownCapture={e => { inputType.current = e.pointerType; setFocused(false); }}
    onPointerLeave={e => { if (e.pointerType === 'mouse') { setHovered(false); setPinned(false); if (inputType.current === 'mouse') setFocused(false); } }}
    onFocusCapture={e => { setFocused(inputType.current === 'keyboard' || e.target.matches(':focus-visible')); if (!e.currentTarget.contains(e.relatedTarget as Node)) setDismissed(false); }}
    onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setFocused(false); setPinned(false); } }}
    onKeyDownCapture={() => { inputType.current = 'keyboard'; setFocused(true); }}
    onKeyDown={e => { if (e.key === 'Escape') { setDismissed(true); setPinned(false); } }}>
    <div className="character-top"><span className="eyebrow">{t('喜爱角色', 'FAVORITE CHARACTERS')}</span><div className="character-controls">
      {!reduced && <button className="character-play" onClick={() => setPaused(s => !s)} aria-label={paused ? t('播放角色轮播', 'Play character carousel') : t('暂停角色轮播', 'Pause character carousel')} aria-pressed={paused}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
      <button className="character-picker" aria-label={t('选择角色', 'Choose character')} aria-expanded={open} aria-controls="character-choices" onClick={() => { setPinned(inputType.current !== 'mouse'); setDismissed(false); }}><Planet size={23} weight="light" /></button>
    </div></div>
    <div className="character-art" aria-label={character.name[lang]}>
      <AnimatePresence initial={false}><motion.div className={`character-portrait portrait-${character.id}`} key={character.id} initial={reduced ? false : { opacity: 0, y: 55 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -55 }} transition={{ duration: reduced ? 0 : 0.48, ease: [0.2, 0.8, 0.2, 1] }}>
        {character.art && <img src={character.art} alt={character.name[lang]} loading="lazy" />}
      </motion.div></AnimatePresence>
      <AnimatePresence mode="wait" initial={false}><motion.div className="character-name" key={character.id} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.18 }}><span>{character.roman}</span><h3>{character.name[lang]}</h3></motion.div></AnimatePresence>
    </div>
    <div className="character-sequence" aria-hidden="true">{characters.map((item, i) => <span key={item.id} className={i === index ? 'current' : ''} />)}</div>
    <div id="character-choices" className="character-choices" data-open={open} aria-hidden={!open} inert={!open}><div className="character-tabs" role="group" aria-label={t('选择喜爱角色', 'Choose a favorite character')}>{characters.map((item, i) => <button key={item.id} id={`character-${i}`} aria-pressed={index === i} onClick={() => { setIndex(i); setPinned(false); }} onKeyDown={e => keys(e, i)}>{item.name[lang]}</button>)}</div></div>
  </motion.div>;
}

import { useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from 'react';
import { AnimatePresence, MotionConfig, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, BookOpen, Check, Code, Copy, DeviceMobile, EnvelopeSimple, GameController, GithubLogo, HardDrives, Headphones, Moon, Phone, Planet, Plus, Sparkle, Sun } from '@phosphor-icons/react';
import { articles, characters, games, profile, projects, skills, type Language, type Work } from './content';
import SkillVisual from './SkillVisual';

type Theme = 'dark' | 'light';
type Palette = 'lunar' | 'arctic' | 'ember' | 'iris';
const chapters = ['home', 'craft', 'work', 'afterhours', 'contact'];
const spring = { type: 'spring' as const, stiffness: 260, damping: 28 };

function readPreferences() {
  let saved: Record<string, unknown> = {};
  try { saved = JSON.parse(localStorage.getItem('stmfan-preferences') || '{}') || {}; } catch { /* Storage is optional. */ }
  const params = new URLSearchParams(location.search);
  const palette = params.get('palette') || saved.palette;
  const theme = params.get('theme') || saved.theme;
  return {
    theme: (theme === 'light' ? 'light' : 'dark') as Theme,
    language: (saved.language === 'en' ? 'en' : 'zh') as Language,
    palette: (['lunar', 'arctic', 'ember', 'iris'].includes(String(palette)) ? palette : 'arctic') as Palette,
  };
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}>{children}</motion.div>;
}

function MagneticLink({ children, href, className = '', external = false }: { children: ReactNode; href: string; className?: string; external?: boolean }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 20 });
  const sy = useSpring(y, { stiffness: 250, damping: 20 });
  return <motion.a href={href} className={className} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} style={{ x: sx, y: sy }} onPointerMove={e => {
    if (reduced || e.pointerType !== 'mouse') return;
    const b = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - b.left - b.width / 2) * 0.1); y.set((e.clientY - b.top - b.height / 2) * 0.15);
  }} onPointerLeave={() => { x.set(0); y.set(0); }}>{children}</motion.a>;
}

function App() {
  const [preferences, setPreferences] = useState(readPreferences);
  const { theme, language: lang, palette } = preferences;
  const t = (zh: string, en: string) => lang === 'zh' ? zh : en;
  const reduced = useReducedMotion();
  const [chapter, setChapter] = useState('home');
  const [skillIndex, setSkillIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroVisible = useInView(heroRef);
  const moonY = useTransform(heroProgress, [0, 1], [0, 170]);
  const moonRotate = useTransform(heroProgress, [0, 1], [-10, 38]);
  const moonScale = useTransform(heroProgress, [0, 1], [1, 1.18]);
  const guideY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const activeSkill = skills[skillIndex];
  const activeCharacter = characters[characterIndex];

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme; root.dataset.palette = palette; root.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('STMfan | 探月下，尘世万象。', 'STMfan | To Decipher the Sublunary Sphere.');
    const description = t('STMfan，个人开发者与在校学生。Python / FastAPI 后端、Debian 服务器运维与全栈 Vibe Coding。探月下，尘世万象。', 'STMfan, independent developer and student. Python / FastAPI backends, Debian server operations, and full-stack Vibe Coding.');
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());
    try { localStorage.setItem('stmfan-preferences', JSON.stringify(preferences)); } catch { /* Still works without persistence. */ }
  }, [preferences, theme, palette, lang]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setChapter(entry.target.id);
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    chapters.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value); setCopied(value); setCopyError(false);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 2200);
    } catch { setCopyError(true); }
  }

  function tabKeys(event: KeyboardEvent<HTMLButtonElement>, index: number, count: number, update: (n: number) => void, prefix: string) {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % count;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + count - 1) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault(); update(next); document.getElementById(`${prefix}-${next}`)?.focus();
  }

  const labels = [t('起点', 'Hello'), t('技艺', 'Craft'), t('作品', 'Work'), t('生活', 'Life'), t('联系', 'Contact')];
  const navIcons = [Planet, Code, BookOpen, GameController, EnvelopeSimple];
  const skillIcons = [Code, HardDrives, Sparkle, DeviceMobile];

  function workCard(item: Work, kind: 'project' | 'article', index: number) {
    const content = <><div className="work-card-top">{kind === 'project' ? <Code size={25} weight="light" /> : <BookOpen size={25} weight="light" />}{item.url ? <ArrowUpRight size={22} /> : <Plus size={20} />}</div><div className="work-card-content"><span className="eyebrow">{kind === 'project' ? t('开源项目', 'OPEN SOURCE') : t('文章', 'WRITING')}</span><h3>{item.title?.[lang] || t('留给下一个想法。', 'Room for the next idea.')}</h3><p>{item.description?.[lang] || t('待补充', 'Coming later')}</p>{item.tags && <div className="tech-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}</div></>;
    return <Reveal key={item.id} delay={index * 0.08}>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="work-card">{content}</a> : <article className={`work-card placeholder ${kind}`}>{content}</article>}</Reveal>;
  }

  return <MotionConfig reducedMotion="user">
    <a href="#main" className="skip-link">{t('跳到正文', 'Skip to content')}</a>
    <motion.div className="reading-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
    <div className="journey-guide" aria-hidden="true"><motion.span className="journey-fill" style={{ scaleY: scrollYProgress }} /><motion.div className="journey-cursor" style={{ y: guideY }}><i /></motion.div>{chapters.map((id, i) => <span className="journey-tick" key={id} style={{ top: `${i * 25}%` }} />)}</div>
    <header id="top" className="site-header page-width">
      <a className="brand header-identity" href="#top" aria-label="STMfan"><img className="brand-avatar" src="/assets/avatar.png" alt={t('STMfan 的 GitHub 头像', 'STMfan’s GitHub avatar')} width="48" height="48" /><div><strong>STMfan <span className="identity-gender">{t('男', 'He / Him')}</span></strong><p>{t('个人开发者 / 在校学生 / 暂无职业', 'Indie developer / Student / No occupation')}</p></div></a>
      <div className="header-controls">
        <button className="language-switch" aria-label={t('Switch to English', '切换为中文')} onClick={() => setPreferences(s => ({ ...s, language: lang === 'zh' ? 'en' : 'zh' }))}><span className={lang === 'zh' ? 'chosen' : ''}>中</span><span className="slash">/</span><span className={lang === 'en' ? 'chosen' : ''}>EN</span></button>
        <button className="icon-button theme-switch" aria-label={theme === 'dark' ? t('切换亮色', 'Switch to light mode') : t('切换暗色', 'Switch to dark mode')} onClick={() => setPreferences(s => ({ ...s, theme: theme === 'dark' ? 'light' : 'dark' }))}>{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
      </div>
    </header>
    <nav className="social-capsule" aria-label={t('随时联系', 'Stay connected')}><a href={`mailto:${profile.email}`} aria-label={t('邮件联系 STMfan', 'Email STMfan')}><EnvelopeSimple size={23} /></a><a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GithubLogo size={23} /></a><a href={profile.bilibili} target="_blank" rel="noopener noreferrer" aria-label="Bilibili"><span className="bilibili-mark" aria-hidden="true" /></a></nav>

    <main id="main">
      <section id="home" className="hero page-width" ref={heroRef} data-active={heroVisible}>
        <div className="hero-copy">
          <Reveal><a className="availability" href="#contact"><span />{t('正在接取小型委托', 'Open for small commissions')}<ArrowUpRight size={15} /></a></Reveal>
          <Reveal delay={0.1}><h1 className={lang === 'en' ? 'english-headline' : ''}>{lang === 'zh' ? <><span>探月下，</span><span className="accent-text">尘世万象。</span></> : <>To Decipher the <span className="accent-text">Sublunary Sphere.</span></>}</h1></Reveal>
          <Reveal delay={0.2}><p className="slogan-secondary">{t('To Decipher the Sublunary Sphere.', '探月下，尘世万象。')}</p><p className="hero-intro">{t('我是 STMfan。', 'I’m STMfan.')}<br />{t('在校学生，个人开发者。以好奇心为坐标。', 'Student. Independent developer. Guided by curiosity.')}</p></Reveal>
          <Reveal className="hero-actions" delay={0.3}><MagneticLink href="#work" className="button primary">{t('我的作品', 'My work')}<ArrowDown size={18} /></MagneticLink><MagneticLink href="#contact" className="button contact-button">{t('联系我', 'Contact me')}<Phone size={20} /></MagneticLink></Reveal>
        </div>
        <motion.div className="hero-scene" style={reduced ? {} : { y: moonY, rotate: moonRotate, scale: moonScale }} aria-hidden="true"><div className="lunar-orbits"><div className="orbital-ring ring-one" /><div className="orbital-ring ring-two" /><div className="orbit-point" /><div className="orbit-point point-two" /></div><div className="lunar-drift"><img className="moon-image" src="/assets/moon.webp" alt="" width="960" height="960" fetchPriority="high" /></div><svg className="moon-vector" viewBox="0 0 520 520" fill="none"><path d="M28 440 C155 455 174 35 435 60 C490 70 510 165 444 182" className="wire-base" /><path d="M28 440 C155 455 174 35 435 60 C490 70 510 165 444 182" className="wire-signal" pathLength="100" /></svg><span className="moon-caption">SUBLUNARY SPHERE</span></motion.div>
      </section>

      <section id="craft" className="craft section page-width">
        <Reveal className="section-heading"><span className="eyebrow">{t('技艺', 'CRAFT')}</span><h2>{t('构建，且让它长明。', 'Build it. Keep it alive.')}</h2><p>{t('从后端的秩序，到服务器的日常。', 'From the order of a backend to the everyday life of a server.')}</p></Reveal>
        <Reveal className="craft-console">
          <div className="skill-tabs" role="tablist" aria-label={t('技术领域', 'Technical fields')}>
            {skills.map((skill, i) => { const Icon = skillIcons[i]; return <button id={`skill-${i}`} key={skill.id} role="tab" aria-selected={skillIndex === i} aria-controls="skill-panel" tabIndex={skillIndex === i ? 0 : -1} onClick={() => setSkillIndex(i)} onKeyDown={e => tabKeys(e, i, skills.length, setSkillIndex, 'skill')}><Icon className="skill-tab-icon" size={24} weight="light" /><span className="skill-tab-name">{skill.name}</span><span className="skill-tab-tag">{skill.tag[lang]}</span>{skillIndex === i && <motion.span layoutId="active-skill" className="active-skill" transition={spring} />}</button>; })}
          </div>
          <div id="skill-panel" role="tabpanel" aria-labelledby={`skill-${skillIndex}`} tabIndex={0} className="skill-panel">
            <AnimatePresence mode="wait" initial={false}><motion.div key={activeSkill.id} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <div className="skill-story"><span className="eyebrow">{activeSkill.tag[lang]}</span><h3>{activeSkill.title[lang]}</h3><p>{activeSkill.description[lang]}</p><div className="tech-tags">{activeSkill.tools.map(tool => <span key={tool}>{tool}</span>)}</div></div>
              <SkillVisual field={activeSkill.id} lang={lang} />
            </motion.div></AnimatePresence>
          </div>
        </Reveal>
        <Reveal className="collaboration-pair"><a href="#contact" className="collaboration-item"><span className="collaboration-label"><Phone size={21} />{t('付费委托', 'PAID COMMISSIONS')}</span><h3>{t('让你的想法，落地。', 'Bring your idea to life.')}</h3><p>{t('小型后端开发 / 长期服务器运维 / 全栈 Vibe Coding', 'Small backends / Ongoing server operations / Full-stack Vibe Coding')}</p><span className="inline-link">{t('联系我', 'Contact me')}<ArrowUpRight size={18} /></span></a><a href={profile.github} target="_blank" rel="noopener noreferrer" className="collaboration-item"><span className="collaboration-label"><Code size={22} />{t('开源协作', 'OPEN-SOURCE COLLABORATION')}</span><h3>{t('为兴趣，添一束光。', 'A little light for curiosity.')}</h3><p>{t('为感兴趣的开源项目，无偿提供帮助。', 'Free help for open-source projects that spark my interest.')}</p><span className="inline-link">{t('在 GitHub 相遇', 'Meet on GitHub')}<ArrowUpRight size={18} /></span></a></Reveal>
      </section>

      <section id="work" className="work section page-width">
        <Reveal className="section-heading"><span className="eyebrow">{t('留痕', 'WORK & WORDS')}</span><h2>{t('把好奇，留在世界。', 'Leave curiosity in the world.')}</h2></Reveal>
        <div className="work-grid">{projects.map((p, i) => workCard(p, 'project', i))}</div>
        <Reveal><a className="contribution" href="https://docs.mai-mai.org/" target="_blank" rel="noopener noreferrer"><div className="contribution-mark"><img src="/assets/maibot.webp" alt="MaiBot" width="100" height="100" loading="lazy" /></div><div><span className="eyebrow">{t('开源贡献', 'OPEN-SOURCE CONTRIBUTION')}</span><h3>{t('MaiBot 文档与社区', 'MaiBot documentation & community')}</h3><p>{t('曾为文档及社区做出贡献。', 'Contributed to its documentation and community.')}</p></div><ArrowUpRight size={28} /></a></Reveal>
        <div className="article-heading"><h3>{t('写下的片段', 'Fragments in writing')}</h3><BookOpen size={20} /></div>
        <div className="article-grid">{articles.map((a, i) => workCard(a, 'article', i))}</div>
      </section>

      <section id="afterhours" className="afterhours section page-width">
        <Reveal className="section-heading"><span className="eyebrow">{t('屏幕之外', 'AFTER HOURS')}</span><h2>{t('也栖居于，别的世界。', 'At home in other worlds, too.')}</h2><p>{t('在节奏、旷野与方块之间。', 'Between rhythms, open worlds, and blocks.')}</p></Reveal>
        <Reveal><div className="game-shelf">{games.map(game => <article className={`game game-${game.id}`} key={game.id}><a href={game.url} target="_blank" rel="noopener noreferrer"><div className="game-cover"><img src={game.image} alt={game.name[lang]} width="240" height="240" loading="lazy" /></div><div className="game-label"><h3>{game.name[lang]}</h3><ArrowUpRight size={17} /></div><p>{game.genre[lang]}</p></a>{game.account && <button className="game-account" onClick={() => void copy(game.account!.value)} aria-label={t('复制', 'Copy') + ` ${game.name[lang]} ${game.account.label} ${game.account.value}`}><span>{game.account.label}: <strong>{game.account.value}</strong></span>{copied === game.account.value ? <Check size={14} /> : <Copy size={14} />}</button>}</article>)}</div></Reveal>
        <div className="life-grid">
          <Reveal className="character-section"><div className="character-top"><span className="eyebrow">{t('喜爱角色', 'FAVORITE CHARACTERS')}</span><Planet size={22} weight="light" /></div><div className="character-art" role="tabpanel" id="character-panel" aria-labelledby={`character-${characterIndex}`}><AnimatePresence mode="wait" initial={false}><motion.div className="character-portrait" key={activeCharacter.id} initial={reduced ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }}>{activeCharacter.art ? <img src={activeCharacter.art} alt={activeCharacter.name[lang]} loading="lazy" /> : <div className="portrait-reserved"><div className="portrait-arch" /><span className="portrait-letter" aria-hidden="true">{activeCharacter.roman[0]}</span><span className="portrait-placeholder">{t('立绘待补', 'Artwork to come')}</span></div>}<div className="character-name"><span>{activeCharacter.roman}</span><h3>{activeCharacter.name[lang]}</h3></div></motion.div></AnimatePresence></div><div className="character-tabs" role="tablist" aria-label={t('喜爱角色', 'Favorite characters')}>{characters.map((character, i) => <button key={character.id} id={`character-${i}`} role="tab" tabIndex={i === characterIndex ? 0 : -1} aria-controls="character-panel" aria-selected={i === characterIndex} onClick={() => setCharacterIndex(i)} onKeyDown={e => tabKeys(e, i, characters.length, setCharacterIndex, 'character')}>{character.name[lang]}</button>)}</div></Reveal>
          <Reveal className="music-section" delay={0.1}><div className="music-top"><span className="eyebrow">{t('耳边的世界', 'ON REPEAT')}</span><Headphones size={23} weight="light" /></div><div className="record" aria-hidden="true"><div className="record-grooves" /><img src="/assets/playlist-cover.webp" alt="" width="160" height="160" loading="lazy" /><span className="record-hole" /></div><div className="music-copy"><h3>{t('给万象，一段配乐。', 'A soundtrack for the sphere.')}</h3><p>{t('我的 Bilibili 歌单', 'My Bilibili playlist')}</p><a className="inline-link" href={profile.playlist} target="_blank" rel="noopener noreferrer">{t('打开歌单', 'Open playlist')}<ArrowUpRight size={19} /></a></div></Reveal>
        </div>
      </section>

      <section id="contact" className="contact section page-width">
        <Reveal><span className="eyebrow">{t('相遇', 'GET IN TOUCH')}</span><h2>{t('下一次探索，', 'The next discovery,')}<br /><span className="accent-text">{t('从一句你好开始。', 'starts with hello.')}</span></h2><p className="contact-intro">{t('一个等待落地的想法，或是开源同路人。', 'An idea waiting to take shape, or a fellow open-source explorer.')}</p></Reveal>
        <Reveal className="contact-links"><MagneticLink href={`mailto:${profile.email}`} className="email-link"><span>{profile.email}</span><ArrowUpRight size={38} weight="light" /></MagneticLink><div className="social-links"><a href={profile.github} target="_blank" rel="noopener noreferrer"><GithubLogo size={21} />GitHub<ArrowUpRight size={15} /></a><a href={profile.bilibili} target="_blank" rel="noopener noreferrer"><span className="bilibili-mark" aria-hidden="true" />Bilibili<ArrowUpRight size={15} /></a><button onClick={() => void copy(profile.qq)} aria-label={t('复制 QQ 3626599388', 'Copy QQ 3626599388')}><span>QQ</span><span className="qq-number">{profile.qq}</span>{copied === profile.qq ? <Check size={17} /> : <Copy size={17} />}</button></div></Reveal>
      </section>
    </main>
    <footer className="site-footer page-width"><a className="brand" href="#top">STMfan<ArrowUpRight size={17} /></a><span>To Decipher the Sublunary Sphere.</span><a href="/themes.html">{t('配色提案', 'Color studies')}</a></footer>
    <div className={`copy-feedback ${copied || copyError ? 'visible' : ''}`} role="status" aria-live="polite">{copied ? t('已复制', 'Copied') : copyError ? t('复制不可用，请选取号码。', 'Copy unavailable. Select the number.') : ''}</div>
    <nav className="navigation-island" aria-label={t('章节导航', 'Chapter navigation')}>{chapters.map((id, i) => { const Icon = navIcons[i]; return <a key={id} href={id === 'home' ? '#top' : `#${id}`} aria-label={labels[i]} aria-current={chapter === id ? 'location' : undefined} onClick={() => setChapter(id)}>{chapter === id && <motion.span className="nav-active" layoutId="nav-active" transition={spring} />}<Icon size={20} weight={chapter === id ? 'fill' : 'regular'} /><span>{labels[i]}</span></a>; })}</nav>
  </MotionConfig>;
}

export default App;

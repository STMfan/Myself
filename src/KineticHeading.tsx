import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAppReducedMotion } from './MotionPreferences';

type Line = {text:string; accent?:boolean};
export default function KineticHeading({as='h2',lines,className=''}:{as?:'h1'|'h2';lines:Line[];className?:string}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [ready,setReady] = useState(false);
  const visible = useInView(ref,{amount:.3});
  const reduced = useAppReducedMotion();
  useEffect(()=>setReady(true),[]);
  const Tag = as;
  return <Tag ref={ref} className={`kinetic-heading ${className}`} aria-label={lines.map(l=>l.text).join(' ')}>
    {lines.map((line,lineIndex)=><motion.span className={`kinetic-line ${line.accent?'accent-text':''}`} key={line.text} aria-hidden="true" initial={false} animate={!ready||reduced||visible?'shown':'hidden'} variants={{shown:{transition:{staggerChildren:.035,delayChildren:lineIndex*.1}},hidden:{transition:{staggerChildren:.012}}}}>
      {(line.text.match(/[A-Za-z]/)?line.text.split(/(\s+)/):Array.from(line.text)).map((word,i)=><motion.span className="kinetic-glyph" key={i} initial={false} variants={{hidden:{opacity:0,y:48,rotateX:70,filter:'blur(8px)'},shown:{opacity:1,y:0,rotateX:0,filter:'blur(0px)',transition:{duration:reduced?0:.75,ease:[.16,1,.3,1]}}}}>{word}</motion.span>)}
    </motion.span>)}
  </Tag>;
}

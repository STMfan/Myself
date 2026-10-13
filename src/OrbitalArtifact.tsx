import { useRef } from 'react';
import { motion,useScroll,useTransform,useInView } from 'framer-motion';
import { useAppReducedMotion } from './MotionPreferences';

export default function OrbitalArtifact({kind}:{kind:'armillary'|'lunar-shard'}) {
  const ref=useRef<HTMLDivElement>(null);
  const reduced=useAppReducedMotion();
  const visible=useInView(ref,{margin:'100px'});
  const {scrollYProgress}=useScroll({target:ref,offset:['start end','end start']});
  const y=useTransform(scrollYProgress,[0,1],[85,-85]);
  const rotate=useTransform(scrollYProgress,[0,1],[-24,32]);
  return <motion.div ref={ref} className={`orbital-artifact artifact-${kind}`} data-active={visible} style={reduced?{}:{y,rotate}} aria-hidden="true"><div className="artifact-drift"><img src={`/assets/decor/${kind}.webp`} alt="" loading="lazy" width="768" height="768" /></div></motion.div>;
}

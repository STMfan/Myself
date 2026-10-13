import { createContext, useContext, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export const CalmMotionContext = createContext(false);
export function useAppReducedMotion() {
  const system = useReducedMotion();
  const [ready,setReady] = useState(false);
  const calm = useContext(CalmMotionContext);
  useEffect(()=>setReady(true),[]);
  // Media preferences become known after hydration; server/client markup agrees.
  return Boolean(calm || (ready && system));
}

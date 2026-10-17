import { useEffect, useState } from 'react';
import { subscribeToast } from '../lib/toast';

export function Toast() {
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timer = 0;
    const unsubscribe = subscribeToast((next) => {
      setMessage(next);
      setOpen(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setOpen(false), 1900);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="toast" data-open={open} role="status" aria-live="polite">
      {message}
    </div>
  );
}

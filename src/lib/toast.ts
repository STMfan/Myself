type ToastListener = (message: string) => void;

let listener: ToastListener | null = null;
let timer: number | undefined;

export function announce(message: string): void {
  listener?.(message);
  if (typeof window !== 'undefined') {
    window.clearTimeout(timer);
  }
}

export function subscribeToast(fn: ToastListener | null): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

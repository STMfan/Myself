import { useEffect, useState, type CSSProperties } from 'react';
import { GITHUB_AVATAR_FALLBACK, getGithubAvatar } from '../lib/github';

export function Avatar({
  className,
  size = 240,
  alt = 'STMfan',
}: {
  className?: string;
  size?: number;
  alt?: string;
}) {
  const [src, setSrc] = useState(GITHUB_AVATAR_FALLBACK);

  useEffect(() => {
    let active = true;
    getGithubAvatar().then((url) => {
      if (!active || url === GITHUB_AVATAR_FALLBACK) return;
      const preload = new Image();
      preload.onload = () => {
        if (active) setSrc(url);
      };
      preload.onerror = () => {};
      preload.src = url;
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={size}
      height={size}
      decoding="async"
      loading="eager"
      referrerPolicy="no-referrer"
      onError={() => setSrc(GITHUB_AVATAR_FALLBACK)}
    />
  );
}

export function Logo({
  className,
  size = 240,
  style,
}: {
  className?: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <span className={`logo ${className ?? ''}`} style={style}>
      <Avatar className="logo__img" size={size} />
      <span className="logo__ring" aria-hidden="true" />
      <span className="logo__orbit" aria-hidden="true">
        <span className="logo__satellite" />
      </span>
    </span>
  );
}

export function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((char, index) => (
        <span className="split-char" aria-hidden="true" key={`${char}-${index}`}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

export function Lines({
  lines,
  className,
  lineClassName,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
}) {
  return (
    <span className={className}>
      {lines.map((line, index) => (
        <span className={`split-line ${lineClassName ?? ''}`} key={index}>
          <span className="split-line__inner">{line}</span>
        </span>
      ))}
    </span>
  );
}

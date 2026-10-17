import type { CSSProperties } from 'react';

export function Logo({
  className,
  src = '/assets/logo.png',
  alt = 'STMfan',
  style,
}: {
  className?: string;
  src?: string;
  alt?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`logo ${className ?? ''}`} style={style}>
      <img src={src} alt={alt} width={64} height={64} decoding="async" />
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

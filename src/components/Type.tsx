import type { CSSProperties } from 'react';

export function Sigil({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <circle cx="16" cy="16" r="14.6" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
      <circle cx="16" cy="16" r="10.4" stroke="currentColor" strokeWidth="0.7" opacity="0.28" />
      <path
        d="M20.1 7.9a8.9 8.9 0 1 0 0 16.2 7.15 7.15 0 1 1 0-16.2Z"
        fill="currentColor"
        opacity="0.92"
      />
      <circle cx="24.6" cy="10.6" r="1.35" fill="currentColor" />
      <path d="M16 1.6v3.2M16 27.2v3.2M1.6 16h3.2M27.2 16h3.2" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
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

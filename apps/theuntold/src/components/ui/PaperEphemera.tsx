import type { CSSProperties, ReactNode } from 'react';

interface TapeProps {
  /** Position is provided in card-relative coordinates. */
  className?: string;
  rotate?: number;
  style?: CSSProperties;
}

/** Decorative washi-tape strip — purely visual. */
export function Tape({ className, rotate = -8, style }: TapeProps) {
  return (
    <span
      aria-hidden
      className={`tape ${className ?? ''}`}
      style={{ ...style, transform: `${style?.transform ?? ''} rotate(${rotate}deg)` }}
    />
  );
}

interface StampProps {
  children: ReactNode;
  rotate?: number;
  className?: string;
  style?: CSSProperties;
}

/** Postal stamp / rubber stamp visual — pair with a small caption. */
export function Stamp({ children, rotate = -6, className, style }: StampProps) {
  return (
    <span
      className={`stamp ${className ?? ''}`}
      style={{ ...style, transform: `${style?.transform ?? ''} rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

interface PostmarkProps {
  city?: string;
  dateLabel?: string;
}

/** Round postmark with a city + date — the diary stamp ephemera. */
export function Postmark({ city = 'TheUntold', dateLabel }: PostmarkProps) {
  return (
    <svg
      width="92"
      height="92"
      viewBox="0 0 92 92"
      className="opacity-80"
      aria-hidden
    >
      <circle cx="46" cy="46" r="44" fill="none" stroke="var(--primary-dark)" strokeWidth="1.5" strokeDasharray="2 3" />
      <circle cx="46" cy="46" r="36" fill="none" stroke="var(--primary-dark)" strokeWidth="1" />
      <text
        x="46"
        y="38"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="9"
        letterSpacing="3"
        fill="var(--primary-dark)"
      >
        {city.toUpperCase()}
      </text>
      <line x1="14" y1="46" x2="78" y2="46" stroke="var(--primary-dark)" strokeWidth="1" />
      {dateLabel && (
        <text
          x="46"
          y="60"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="9"
          letterSpacing="3"
          fill="var(--primary-dark)"
        >
          {dateLabel.toUpperCase()}
        </text>
      )}
    </svg>
  );
}

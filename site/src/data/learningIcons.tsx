/**
 * Inline SVG icon set for Learning cards, ported from the retired static
 * board. Each path set is drawn in currentColor so it follows the card's
 * icon-chip color like the original did.
 */
import type { ReactNode } from 'react';

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const PATHS: Record<string, ReactNode> = {
  shield: <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" {...STROKE} />,
  web: (
    <>
      <circle cx="12" cy="12" r="9" {...STROKE} />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" {...STROKE} />
    </>
  ),
  bug: (
    <>
      <rect x="8" y="8" width="8" height="10" rx="4" {...STROKE} />
      <path d="M12 4v4M8 10L5 8M16 10l3-2M8 14H4M16 14h4M8 18l-3 2M16 18l3 2" {...STROKE} />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" {...STROKE} />
      <path d="M8 20h8M12 16v4M7 11l3-3 2 2 4-4" {...STROKE} />
    </>
  ),
  scan: (
    <>
      <circle cx="11" cy="11" r="6" {...STROKE} />
      <path d="M20 20l-4-4M11 8v6M8 11h6" {...STROKE} />
    </>
  ),
  book: (
    <>
      <path d="M6 3h11v18H7a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2z" {...STROKE} />
      <path d="M9 8h6M9 11h6" {...STROKE} />
    </>
  ),
  paper: (
    <>
      <path d="M7 3h7l4 4v14H7z" {...STROKE} />
      <path d="M14 3v4h4M10 12h5M10 15h5" {...STROKE} />
    </>
  ),
  ref: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" {...STROKE} />
      <path d="M9 8h6M9 12h6M9 16h3" {...STROKE} />
    </>
  ),
  snow: <path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" {...STROKE} />,
  net: (
    <>
      <circle cx="12" cy="12" r="2.5" {...STROKE} />
      <circle cx="5" cy="6" r="2" {...STROKE} />
      <circle cx="19" cy="6" r="2" {...STROKE} />
      <circle cx="12" cy="20" r="2" {...STROKE} />
      <path d="M10 11L6 7M14 11l4-4M12 14v4" {...STROKE} />
    </>
  ),
  chain: (
    <>
      <path d="M9.5 12a3 3 0 0 1 3-3h2a3 3 0 0 1 0 6" {...STROKE} />
      <path d="M14.5 12a3 3 0 0 1-3 3h-2a3 3 0 0 1 0-6" {...STROKE} />
    </>
  ),
  hash: <path d="M5 9h14M5 15h14M9 4l-2 16M17 4l-2 16" {...STROKE} />,
  crack: (
    <>
      <rect x="5" y="10" width="14" height="9" rx="2" {...STROKE} />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 13l-1.5 3" {...STROKE} />
    </>
  ),
  dice: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" {...STROKE} />
      <circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  cookie: (
    <>
      <circle cx="12" cy="12" r="8.5" {...STROKE} />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="13" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  replay: (
    <>
      <path d="M4 9a8 8 0 0 1 14-3l2 2" {...STROKE} />
      <path d="M20 15a8 8 0 0 1-14 3l-2-2" {...STROKE} />
      <path d="M20 4v4h-4M4 20v-4h4" {...STROKE} />
    </>
  ),
  db: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" {...STROKE} />
      <path d="M5 6v12c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3 3 7 3s7-1.3 7-3" {...STROKE} />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" {...STROKE} />
      <rect x="10.5" y="10.5" width="3" height="3" {...STROKE} />
      <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3" {...STROKE} />
    </>
  ),
};

export function LearningIcon({ name }: { name: string }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {path}
    </svg>
  );
}

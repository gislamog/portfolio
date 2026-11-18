import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { RailConfig, RailItem } from '../data/rails';
import './SideRail.css';

export interface SideRailItem extends RailItem {
  /** Small trailing figure, e.g. the board's "3/7" done count. */
  count?: string;
}
export interface RailLegendItem { label: string; color: string }

export interface SideRailProps extends Partial<Omit<RailConfig, 'items'>> {
  items: SideRailItem[];
  legend?: RailLegendItem[];
  /** Controlled mode: the caller tracks the current section and handles clicks. */
  active?: string;
  onSelect?: (id: string) => void;
  /** The scrolling viewport the sections live in (uncontrolled mode). */
  scrollRoot?: HTMLElement | null;
}

/**
 * Left section panel modelled on the Learning board's rail: page title with a
 * yellow rule, one link per section, and the section in view highlighted.
 * Layout renders exactly one, for every tab including Learning, so it never
 * remounts; only its text changes. A scrolling strip on narrow screens.
 */
export function SideRail({ title, items, related, legend, active, onSelect, scrollRoot }: SideRailProps) {
  const controlled = onSelect !== undefined;
  const [seen, setSeen] = useState<string>();

  useEffect(() => {
    if (controlled || !('IntersectionObserver' in window)) return;
    // The section crossing the middle of the viewport is the current one.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(e.target.id)),
      { root: scrollRoot ?? null, rootMargin: '-45% 0px -50% 0px' },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items, controlled, scrollRoot]);

  // Derived, so a page switch highlights the new page's first link in the same
  // frame instead of flashing an empty selection.
  const current = controlled
    ? active
    : seen && items.some((i) => i.id === seen) ? seen : items[0]?.id;

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) return onSelect(id);
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setSeen(id);
    history.replaceState(history.state, '', `#${id}`);
  };

  return (
    <aside className="side-rail" aria-label={title ? `${title} sections` : 'Sections'}>
      <div className="side-rail-title">{title}</div>
      <nav className="side-rail-nav">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            onClick={go(it.id)}
            className={it.id === current ? 'side-rail-link on' : 'side-rail-link'}
            aria-current={it.id === current ? 'location' : undefined}
          >
            <span className="side-rail-label">{it.label}</span>
            {it.count && <span className="side-rail-count">{it.count}</span>}
          </a>
        ))}
        {related && related.length > 0 && (
          <>
            <span className="side-rail-sep" aria-hidden="true" />
            <div className="side-rail-related-group">
              {related.map((r) => (
                <Link key={r.to} to={r.to} className="side-rail-pill">
                  <span className="side-rail-pill-label">{r.label.replace(/\s*→$/, '')}</span>
                  <svg
                    className="side-rail-pill-arrow"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>
      {legend && legend.length > 0 && (
        <div className="side-rail-legend" aria-hidden="true">
          {legend.map((l) => (
            <span key={l.label}>
              <i className="side-rail-swatch" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </aside>
  );
}

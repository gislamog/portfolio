import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ArticleReader.css';

/**
 * Full-screen article popup, shared by every "open to read more" card on the
 * Learning page. Portaled to document.body for the same reason as
 * ProjectVisual's Lightbox: ancestor .nb-sheets set `isolation: isolate` for
 * their paper-texture backgrounds, which traps a `position: fixed`
 * descendant's stacking order below later siblings like the header.
 * Closes on backdrop click, the close button, or Escape.
 */
export function ArticleReader({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="article-reader-scrim" onClick={onClose}>
      <div
        className="article-reader-panel"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="article-reader-close" onClick={onClose} aria-label="Close article">
          &times;
        </button>
        <div className="article-reader-wrap">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

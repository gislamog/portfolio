import { useState, type ReactNode } from 'react';
import './ExpandableEmbed.css';

interface ExpandableEmbedProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ExpandableEmbed({ title, description, children }: ExpandableEmbedProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`expandable-embed ${open ? 'open' : ''}`}>
      <button type="button" className="expandable-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="expandable-icon">{open ? '▾' : '▸'}</span>
        <span className="expandable-title">{title}</span>
      </button>
      {description && <p className="expandable-desc">{description}</p>}
      {open && <div className="expandable-content">{children}</div>}
    </div>
  );
}

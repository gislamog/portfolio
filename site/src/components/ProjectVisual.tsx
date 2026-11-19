import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { IconType } from 'react-icons';
import {
  FiActivity,
  FiBarChart2,
  FiCpu,
  FiEdit3,
  FiFileText,
  FiGitBranch,
  FiGitMerge,
  FiGrid,
  FiHeart,
  FiKey,
  FiLayers,
  FiMusic,
  FiShield,
  FiType,
} from 'react-icons/fi';
import type { Project } from '../data/projects';
import './ProjectVisual.css';

const ICONS: Record<string, IconType> = {
  'academic-quintiles': FiLayers,
  'analytics-viz': FiBarChart2,
  'piano-pogo': FiMusic,
  capstone: FiHeart,
  'git-worktrees': FiGitBranch,
  'mcs-collision': FiCpu,
  'mcs-kmeans': FiGrid,
  'mcs-crypto': FiKey,
  'density-classification': FiBarChart2,
  'property-management': FiFileText,
  'mcs-mnist': FiEdit3,
  'mcs-matching': FiGitMerge,
  'mcs-lexer': FiType,
  'mcs-sdn': FiShield,
  'ants-sphere': FiActivity,
};

const SLIDE_INTERVAL_MS = 3500;

export function projectIcon(id: string): IconType {
  return ICONS[id] ?? FiGrid;
}

/** Cross-fades through screenshots; holds on the first one when reduced motion is requested. */
function Slideshow({ images, onOpen }: { images: string[]; onOpen: (index: number) => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % images.length), SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [images.length]);

  return (
    <>
      {images.map((src, i) => (
        <button
          key={src}
          type="button"
          className={`project-visual-slide-btn${i === index ? ' is-active' : ''}`}
          onClick={(e) => {
            // The whole card is a Link/anchor (to the project or a live
            // site); without this the click would both open the lightbox
            // and navigate away.
            e.preventDefault();
            e.stopPropagation();
            onOpen(index);
          }}
          aria-label="View screenshot full size"
        >
          <img
            src={src}
            alt=""
            className="project-visual-img"
            loading={i === 0 ? undefined : 'lazy'}
          />
        </button>
      ))}
      <div className="project-visual-dots" aria-hidden>
        {images.map((src, i) => (
          <span key={src} className={i === index ? 'is-active' : undefined} />
        ))}
      </div>
    </>
  );
}

/** Full-screen preview so a screenshot's text is readable on a phone, where
    the card itself shrinks it well past legibility. Closes on backdrop click,
    the close button, or Escape. Portaled to the document body: several
    ancestors (each .nb-sheet) set `isolation: isolate` for the paper-texture
    backgrounds, which traps a `position: fixed` descendant's stacking order
    below later siblings like the header no matter its z-index. */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="project-lightbox" onClick={onClose}>
      <button type="button" className="project-lightbox-close" onClick={onClose} aria-label="Close">
        &times;
      </button>
      <img src={src} alt="" className="project-lightbox-img" onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body,
  );
}

export function ProjectVisual({
  project,
  Icon,
}: {
  project: Project;
  Icon: IconType;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const images = project.images?.length ? project.images : project.image ? [project.image] : null;

  return (
    <div
      className={`project-visual tone-${project.tone}${images ? ' project-visual--fit has-image' : ''}`}
    >
      {project.images?.length ? (
        <Slideshow images={project.images} onOpen={setOpenIndex} />
      ) : project.image ? (
        <button
          type="button"
          className="project-visual-slide-btn is-active"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenIndex(0); }}
          aria-label="View screenshot full size"
        >
          <img src={project.image} alt="" className="project-visual-img" />
        </button>
      ) : (
        <Icon className="project-visual-icon" aria-hidden />
      )}
      {images && openIndex !== null && (
        <Lightbox src={images[openIndex]} onClose={() => setOpenIndex(null)} />
      )}
    </div>
  );
}

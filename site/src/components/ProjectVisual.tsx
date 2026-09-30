import { useEffect, useState } from 'react';
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
function Slideshow({ images }: { images: string[] }) {
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
        <img
          key={src}
          src={src}
          alt=""
          className={`project-visual-img project-visual-slide${i === index ? ' is-active' : ''}`}
          loading={i === 0 ? undefined : 'lazy'}
        />
      ))}
      <div className="project-visual-dots" aria-hidden>
        {images.map((src, i) => (
          <span key={src} className={i === index ? 'is-active' : undefined} />
        ))}
      </div>
    </>
  );
}

export function ProjectVisual({
  project,
  Icon,
}: {
  project: Project;
  Icon: IconType;
}) {
  return (
    <div
      className={`project-visual tone-${project.tone}${project.images?.length ? ' project-visual--fit' : ''}${
        project.images?.length || project.image ? ' has-image' : ''
      }`}
    >
      {project.images?.length ? (
        <Slideshow images={project.images} />
      ) : project.image ? (
        <img src={project.image} alt="" className="project-visual-img" />
      ) : (
        <Icon className="project-visual-icon" aria-hidden />
      )}
    </div>
  );
}

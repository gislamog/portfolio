import type { IconType } from 'react-icons';
import {
  FiActivity,
  FiBarChart2,
  FiCpu,
  FiGrid,
  FiHeart,
} from 'react-icons/fi';
import type { Project } from '../data/projects';
import './ProjectVisual.css';

const ICONS: Record<string, IconType> = {
  'analytics-viz': FiBarChart2,
  capstone: FiHeart,
  'mcs-collision': FiCpu,
  'mcs-kmeans': FiGrid,
  'ants-sphere': FiActivity,
};

export function projectIcon(id: string): IconType {
  return ICONS[id] ?? FiGrid;
}

export function ProjectVisual({
  project,
  Icon,
}: {
  project: Project;
  Icon: IconType;
}) {
  return (
    <div className={`project-visual tone-${project.tone}`}>
      {project.image ? (
        <img src={project.image} alt="" className="project-visual-img" />
      ) : (
        <Icon className="project-visual-icon" aria-hidden />
      )}
    </div>
  );
}

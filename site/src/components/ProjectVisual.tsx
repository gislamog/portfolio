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
  FiShield,
  FiType,
} from 'react-icons/fi';
import type { Project } from '../data/projects';
import './ProjectVisual.css';

const ICONS: Record<string, IconType> = {
  'academic-quintiles': FiLayers,
  'analytics-viz': FiBarChart2,
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

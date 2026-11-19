import { experience } from './experience';
import { projects, type Project } from './projects';
import { demos } from '../pages/DemosPage';
import { SECTIONS as LEARNING_SECTIONS } from './learningBoard';

/**
 * The left section panel for every page, keyed by route. Layout renders it once
 * so it stays put while you switch pages; only its links change. Each item's id
 * must match an element id on that page.
 */
export interface RailItem { id: string; label: string }
export interface RailConfig {
  title: string;
  items: RailItem[];
  /** Other pages worth reaching from here, listed under a divider. */
  related?: { to: string; label: string }[];
}

export const jobId = (job: { company: string; title: string }) =>
  'job-' + `${job.company}-${job.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const hasMedia = (p: Project) => Boolean(p.images?.length || p.image);

export const MORE_PROJECTS_ID = 'more-projects';

const rails: Record<string, RailConfig> = {
  '/about': {
    title: 'About',
    items: [
      { id: 'intro', label: 'Introduction' },
      { id: 'featured', label: 'Featured projects' },
      { id: 'skills', label: 'Technical focus' },
      { id: 'explore', label: 'On this site' },
    ],
  },
  '/experience': {
    title: 'Work',
    items: experience.map((j) => ({ id: jobId(j), label: j.company })),
  },
  '/education': {
    title: 'Education',
    items: [
      { id: 'masters', label: "Master's Degree" },
      { id: 'bachelors', label: "Bachelor's Degree" },
    ],
    // Both pieces of content now live on Learning; these just point there.
    related: [
      { to: '/learning#mcs-portfolio', label: 'MCS Portfolio →' },
      { to: '/learning#big-data-cert', label: 'Big Data Certificate →' },
    ],
  },
  '/projects': {
    title: 'Projects',
    items: [
      ...projects.filter(hasMedia).map((p) => ({ id: p.id, label: p.title })),
      ...(projects.some((p) => !hasMedia(p)) ? [{ id: MORE_PROJECTS_ID, label: 'More projects' }] : []),
    ],
  },
  '/demos': {
    title: 'Demos',
    items: demos.map(({ id, title }) => ({ id, label: title })),
  },
  '/learning': {
    title: 'Continued Learning',
    items: LEARNING_SECTIONS.map(({ id, title }) => ({ id, label: title })),
  },
  '/contact': {
    title: 'Contact',
    items: [{ id: 'contact-page', label: 'Get in touch' }],
  },
};

export function railFor(pathname: string): RailConfig | undefined {
  return rails[pathname.replace(/\/$/, '') || '/'];
}

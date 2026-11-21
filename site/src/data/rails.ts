
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
};

export function railFor(pathname: string): RailConfig | undefined {
  return rails[pathname.replace(/\/$/, '') || '/'];
}

export interface NavItem {
  to: string;
  label: string;
  /**
   * Always rendered inline, immediately right of the parent, as a smaller
   * sub-tab. Kept visible even when the parent section is not active so the
   * report is discoverable without first opening Education.
   */
  children?: { to: string; label: string }[];
  /** Called out in the nav: yellow with a star. */
  featured?: boolean;
}

export const links: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/experience', label: 'Work' },
  // MCS Portfolio and Big Data live under Education (linked from that page);
  // the tab stays lit on those sub-routes.
  { to: '/education', label: 'Education', children: [] },
  { to: '/projects', label: 'Projects' },
  { to: '/demos', label: 'Demos' },
  { to: '/learning', label: 'Learning', featured: true },
  { to: '/contact', label: 'Contact' },
];

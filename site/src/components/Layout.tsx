import { Link, NavLink, useLocation } from 'react-router-dom';
import { profile } from '../data/profile';
import { ThemeToggle } from './ThemeProvider';
import { SocialLinks } from './SocialLinks';
import './Layout.css';
import './SocialLinks.css';

interface NavItem {
  to: string;
  label: string;
  /** Rendered as a sub-tab bar under the header while this section is active. */
  children?: { to: string; label: string }[];
}

const links: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/experience', label: 'Work' },
  {
    to: '/education',
    label: 'Education',
    children: [
      { to: '/education', label: 'Overview' },
      { to: '/education/mcs-portfolio', label: 'MCS Portfolio Report' },
    ],
  },
  { to: '/projects', label: 'Projects' },
  { to: '/demos', label: 'Demos' },
  // Hidden until the reading list is recruiter-ready (placeholders / study notes).
  // { to: '/learning', label: 'Learning' },
  { to: '/contact', label: 'Contact' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  // A parent stays selected across its sub-routes, so /education/mcs-portfolio
  // keeps the Education tab lit and reveals that section's sub-tab bar.
  const activeParent = links.find(
    (l) => l.children && (pathname === l.to || pathname.startsWith(`${l.to}/`)),
  );

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-mark">GI</span>
            <span className="logo-text">{profile.name}</span>
          </Link>
          <ThemeToggle />
          <nav className="nav">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  isActive || activeParent?.to === l.to ? 'nav-link active' : 'nav-link'
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {activeParent && (
        <div className="subnav-bar">
          <nav className="container subnav" aria-label={`${activeParent.label} sections`}>
            {activeParent.children!.map((c) => (
              <NavLink
                key={c.to}
                to={c.to}
                end
                className={({ isActive }) => (isActive ? 'subnav-link active' : 'subnav-link')}
              >
                {c.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <p>© {new Date().getFullYear()} {profile.name}</p>
          <SocialLinks size="sm" />
        </div>
      </footer>
    </>
  );
}

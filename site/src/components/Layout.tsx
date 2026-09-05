import { Link, NavLink, useLocation } from 'react-router-dom';
import { profile } from '../data/profile';
import { ThemeToggle } from './ThemeProvider';
import { SocialLinks } from './SocialLinks';
import './Layout.css';
import './SocialLinks.css';

interface NavItem {
  to: string;
  label: string;
  /**
   * Always rendered inline, immediately right of the parent, as a smaller
   * sub-tab. Kept visible even when the parent section is not active so the
   * report is discoverable without first opening Education.
   */
  children?: { to: string; label: string }[];
}

const links: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/experience', label: 'Work' },
  {
    to: '/education',
    label: 'Education',
    children: [
      { to: '/education/mcs-portfolio', label: 'MCS Portfolio' },
      { to: '/education/big-data', label: 'Big Data' },
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
      <header className={pathname === '/' ? 'site-header is-home' : 'site-header'}>
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-mark">GI</span>
            <span className="logo-text">{profile.name}</span>
          </Link>
          <ThemeToggle />
          <nav className="nav">
            {links.map((l) => (
              <span key={l.to} className="nav-item">
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    isActive || activeParent?.to === l.to ? 'nav-link active' : 'nav-link'
                  }
                >
                  {l.label}
                </NavLink>
                {l.children?.map((c) => (
                  <NavLink
                    key={c.to}
                    to={c.to}
                    end
                    className={({ isActive }) =>
                      isActive ? 'nav-sublink active' : 'nav-sublink'
                    }
                  >
                    {c.label}
                  </NavLink>
                ))}
              </span>
            ))}
          </nav>
        </div>
      </header>
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

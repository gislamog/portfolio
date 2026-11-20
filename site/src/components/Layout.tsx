import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { profile } from '../data/profile';
import { ThemeToggle } from './ThemeProvider';
import { links } from '../data/nav';
import { railFor } from '../data/rails';
import { SideRail, type SideRailProps } from './SideRail';
import { ScrollToTop } from './ScrollToTop';
import { AvatarButton } from './AvatarButton';
import { CityScene } from '../pages/CityScene';
import { CityNav } from '../pages/CityNav';
import { PortfolioFooter } from '../pages/PortfolioHome';
import './Layout.css';

/**
 * The app shell: header, rail and stage are the same elements on every tab,
 * so switching tabs only swaps the stage's content. The document never
 * scrolls; each page scrolls inside one viewport beside the rail.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  // A parent stays selected across its sub-routes, so a sub-route of a tab
  // with children keeps that tab lit and reveals its sub-tab bar.
  const activeParent = links.find(
    (l) => l.children && (pathname === l.to || pathname.startsWith(`${l.to}/`)),
  );

  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // A route change always means a nav link (or the logo) was just followed,
  // so close the mobile menu rather than leaving it open over the new page.
  useEffect(() => setMenuOpen(false), [pathname]);

  const railConfig = railFor(pathname);
  const rail: SideRailProps | undefined = railConfig && { ...railConfig, scrollRoot: viewport };

  const navItems = links.filter((l) => l.to !== '/contact').map((l) => (
    <span key={l.to} className="nav-item">
      <NavLink
        to={l.to}
        end={l.to === '/'}
        className={({ isActive }) =>
          (isActive || activeParent?.to === l.to ? 'nav-link active' : 'nav-link') +
          (l.featured ? ' nav-featured' : '')
        }
      >
        {l.featured && (
          <svg className="nav-star" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
          </svg>
        )}
        {l.label}
      </NavLink>
      {l.children?.map((c) => (
        <NavLink
          key={c.to}
          to={c.to}
          end
          className={({ isActive }) => (isActive ? 'nav-sublink active' : 'nav-sublink')}
        >
          {c.label}
        </NavLink>
      ))}
    </span>
  ));

  const isHome = pathname === '/';

  if (isHome) {
    return (
      <div className="portfolio-home">
        <CityScene />
        <CityNav />
        <main>{children}</main>
        <PortfolioFooter />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <ScrollToTop target={viewport} />
      <header className="site-header">
        <div className="header-inner">
          <div className="header-side header-left">
            {/* The avatar opens its picture; the name links home. */}
            <AvatarButton />
            <Link to="/" className="logo">
              <span className="logo-text">{profile.name}</span>
            </Link>
          </div>
          <nav className="nav">{navItems}</nav>
          <div className="header-side header-right">
            <ThemeToggle />
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? 'contact-pill active' : 'contact-pill')}
            >
              Contact
            </NavLink>
            <button
              type="button"
              className={menuOpen ? 'menu-toggle menu-toggle-open' : 'menu-toggle'}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" className="mobile-nav">
            {navItems}
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Contact
            </NavLink>
          </nav>
        )}
      </header>
      <div className="app-body">
        {rail && <SideRail {...rail} />}
        <div className="app-stage">
          <div ref={setViewport} className="app-viewport">
            <main>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}

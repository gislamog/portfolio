import { Link, NavLink } from 'react-router-dom';
import { profile } from '../data/profile';
import { ThemeToggle } from './ThemeProvider';
import { SocialLinks } from './SocialLinks';
import './Layout.css';
import './SocialLinks.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/experience', label: 'Work' },
  { to: '/education', label: 'Education' },
  { to: '/projects', label: 'Projects' },
  { to: '/demos', label: 'Demos' },
  { to: '/learning', label: 'Learning' },
  { to: '/contact', label: 'Contact' },
];

export function Layout({ children }: { children: React.ReactNode }) {
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
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                {l.label}
              </NavLink>
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

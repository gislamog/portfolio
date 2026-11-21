import { useEffect, useId, useRef, useState } from 'react';
import { FiBookOpen, FiBriefcase, FiChevronRight, FiCompass, FiHome, FiLayers, FiMail, FiMenu } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { startCityNavGlow } from './renderCityNavGlow';

const exploreRoutes = ['/explore', '/about', '/learning', '/demos'];

const links = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/experience', label: 'Work', icon: FiBriefcase },
  { to: '/education', label: 'Education', icon: FiBookOpen },
  { to: '/projects', label: 'Projects', icon: FiLayers },
  { to: '/explore', label: 'Explore', icon: FiCompass },
];

export function CityNav({ animatedGlow = true }: { animatedGlow?: boolean }) {
  const { pathname } = useLocation();
  const route = pathname.replace(/\/$/, '').toLowerCase() || '/';
  const activeTab = (exploreRoutes.includes(route) || route.startsWith('/explore/')) ? '/explore' : route.startsWith('/projects/') ? '/projects' : route;
  const glow = useRef<HTMLCanvasElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const canvas = glow.current;
    if (!animatedGlow || !canvas) return;
    const desktop = window.matchMedia('(width > 760px)');
    let stop: (() => void) | undefined;

    function update() {
      stop?.();
      stop = undefined;
      if (!desktop.matches) return;
      setMenuOpen(false);
      try {
        stop = startCityNavGlow(canvas!);
      } catch (error) {
        console.warn('City navigation glow unavailable', error);
      }
    }

    desktop.addEventListener('change', update);
    update();
    return () => {
      desktop.removeEventListener('change', update);
      stop?.();
    };
  }, [animatedGlow]);

  return (
    <nav
      className="city-nav"
      aria-label="Portfolio"
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !menuOpen) return;
        setMenuOpen(false);
        menuButton.current?.focus();
      }}
    >
      {animatedGlow && <canvas ref={glow} className="city-nav-glow" aria-hidden="true" />}
      <Link className="city-nav-brand" to="/" aria-label="Gulsum, home" onClick={() => setMenuOpen(false)}>
        <img src={`${import.meta.env.BASE_URL}avatar-cat.jpg`} alt="" width={32} height={32} />
        Gulsum
      </Link>
      <button
        ref={menuButton}
        className="city-nav-menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <FiMenu aria-hidden="true" focusable="false" />
        Menu
      </button>
      <div id={menuId} className="city-nav-menu" data-open={menuOpen}>
        <div className="city-nav-links">
          {links.map(({ icon: Icon, ...link }) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={link.to === activeTab ? 'page' : undefined}
              onClick={(event) => {
                setMenuOpen(false);
                if (event.currentTarget.getAttribute('aria-current') === 'page' && menuOpen) menuButton.current?.focus();
              }}
            >
              <Icon className="city-nav-menu-icon" aria-hidden="true" focusable="false" />
              <span className="city-nav-label">
                {link.label}
                {link.to === '/explore' && <span className="city-nav-star" aria-hidden="true">✦</span>}
              </span>
              <FiChevronRight className="city-nav-menu-chevron" aria-hidden="true" focusable="false" />
            </Link>
          ))}
        </div>
        <Link className="city-nav-contact" to="/contact" aria-current={route === '/contact' ? 'page' : undefined} onClick={() => setMenuOpen(false)}>
          <FiMail className="city-nav-menu-icon" aria-hidden="true" focusable="false" />
          Contact
        </Link>
      </div>
    </nav>
  );
}

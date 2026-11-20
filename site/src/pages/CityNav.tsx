import { useEffect, useId, useRef, useState } from 'react';
import { FiBookOpen, FiBriefcase, FiCompass, FiHome, FiLayers, FiMail, FiMenu } from 'react-icons/fi';
import { Link, NavLink } from 'react-router-dom';
import { startCityNavGlow } from './renderCityNavGlow';

const links = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/experience', label: 'Work', icon: FiBriefcase },
  { to: '/education', label: 'Education', icon: FiBookOpen },
  { to: '/projects', label: 'Projects', icon: FiLayers },
  { to: '/explore', label: 'Explore', icon: FiCompass },
];

export function CityNav() {
  const glow = useRef<HTMLCanvasElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const canvas = glow.current;
    if (!canvas) return;
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
  }, []);

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
      <canvas ref={glow} className="city-nav-glow" aria-hidden="true" />
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
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={() => {
                setMenuOpen(false);
                if (link.to === '/' && menuOpen) menuButton.current?.focus();
              }}
            >
              <Icon className="city-nav-menu-icon" aria-hidden="true" focusable="false" />
              <span className="city-nav-label">
                {link.label}
                {link.to === '/explore' && <span className="city-nav-star" aria-hidden="true">✦</span>}
              </span>
            </NavLink>
          ))}
        </div>
        <Link className="city-nav-contact" to="/contact">
          <FiMail className="city-nav-menu-icon" aria-hidden="true" focusable="false" />
          Contact
        </Link>
      </div>
    </nav>
  );
}

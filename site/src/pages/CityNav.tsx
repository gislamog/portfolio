import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { startCityNavGlow } from './renderCityNavGlow';

const links = [
  { to: '/', label: 'Home' },
  { to: '/experience', label: 'Work' },
  { to: '/education', label: 'Education' },
  { to: '/projects', label: 'Projects' },
  { to: '/explore', label: 'Explore' },
];

export function CityNav() {
  const glow = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = glow.current;
    if (!canvas) return;
    try {
      return startCityNavGlow(canvas);
    } catch (error) {
      console.warn('City navigation glow unavailable', error);
    }
  }, []);

  return (
    <nav className="city-nav" aria-label="Portfolio">
      <canvas ref={glow} className="city-nav-glow" aria-hidden="true" />
      <Link className="city-nav-brand" to="/" aria-label="Gulsum, home">
        <img src={`${import.meta.env.BASE_URL}avatar-cat.jpg`} alt="" width={32} height={32} />
        Gulsum
      </Link>
      <div className="city-nav-links">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end>
            <span className="city-nav-label">
              {link.label}
              {link.to === '/explore' && <span className="city-nav-star" aria-hidden="true">✦</span>}
            </span>
          </NavLink>
        ))}
      </div>
      <Link className="city-nav-contact" to="/contact">Contact</Link>
    </nav>
  );
}

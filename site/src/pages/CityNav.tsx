import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { links } from '../data/nav';
import { startCityNavGlow } from './renderCityNavGlow';

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
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end>
          <span className="city-nav-label">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

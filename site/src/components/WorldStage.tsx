import type { ReactNode } from 'react';
import { WorldFlock } from './WorldFlock';

export function WorldStage({ children }: { children: ReactNode }) {
  return (
    <div className="sky-stage">
      <img
        className="world-sky world-sky-day"
        src={`${import.meta.env.BASE_URL}images/world-sky.jpg`}
        alt=""
      />
      <img
        className="world-sky world-sky-dusk"
        src={`${import.meta.env.BASE_URL}images/world-sky-dusk.jpg`}
        alt=""
      />
      <div className="sky-hero-fx" aria-hidden>
        <div className="world-stars" />
        <div className="world-aurora" />
        <div className="world-glow" />
        <div className="world-fireflies">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="world-firefly" />
          ))}
        </div>
      </div>
      <WorldFlock />
      {children}
    </div>
  );
}

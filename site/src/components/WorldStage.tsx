import type { ReactNode } from 'react';
import { WorldFlock } from './WorldFlock';

export function WorldStage({ children }: { children: ReactNode }) {
  return (
    <section className="world" aria-label="Title scene">
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
      <div className="world-stars" aria-hidden />
      <div className="world-aurora" aria-hidden />
      <div className="world-glow" aria-hidden />
      <div className="world-fireflies" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="world-firefly" />
        ))}
      </div>
      <WorldFlock />
      {children}
      <div className="world-fade" aria-hidden />
    </section>
  );
}

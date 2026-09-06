import type { ReactNode } from 'react';
import { WorldFlock } from './WorldFlock';
import { useTheme } from './ThemeProvider';

export function WorldStage({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const isDusk = theme === 'c';

  return (
    <div className="sky-stage">
      {/* Only the active sky is mounted — rendering both made every visit
          download a full-size JPEG that CSS then hid. */}
      <img
        className={`world-sky ${isDusk ? 'world-sky-dusk' : 'world-sky-day'}`}
        src={`${import.meta.env.BASE_URL}images/${isDusk ? 'world-sky-dusk.jpg' : 'world-sky.jpg'}`}
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      {isDusk && (
        <div className="sky-hero-fx" aria-hidden>
          <div className="world-stars" />
          <div className="world-aurora" />
          <div className="world-fireflies">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="world-firefly" />
            ))}
          </div>
        </div>
      )}
      <WorldFlock />
      {children}
    </div>
  );
}

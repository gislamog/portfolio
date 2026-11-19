import { useEffect, useRef } from 'react';
import { RainControls } from './RainControls';
import { rainDefaults } from './rainSettings';

const city = `${import.meta.env.BASE_URL}images/city/city-front-on`;

export function CityScene() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const settings = useRef({ ...rainDefaults });

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let generation = 0;
    let stop: (() => void) | undefined;

    function update() {
      const current = ++generation;
      stop?.();
      stop = undefined;
      if (motion.matches) return;
      const active = () => current === generation;
      void import('./renderRain').then(async ({ startRain }) => {
        if (!active()) return;
        const cleanup = await startRain(surface!, active, settings.current);
        if (active()) stop = cleanup;
        else cleanup?.();
      }).catch((error: unknown) => {
        if (active()) console.warn('City rain unavailable', error);
      });
    }

    motion.addEventListener('change', update);
    update();
    return () => {
      generation++;
      stop?.();
      motion.removeEventListener('change', update);
    };
  }, []);

  return (
    <>
    <div className="city-scene">
      <picture>
        <source media="(max-width: 700px)" srcSet={`${city}-mobile.webp`} />
        <img id="fallback" src={`${city}.webp`}
          alt="Illuminated ramen shops lining a rain-slicked Japanese street at night" />
      </picture>
      <canvas ref={canvas} className="city-rain" aria-hidden="true" />
    </div>
    {import.meta.env.DEV && <RainControls settings={settings.current} />}
    </>
  );
}

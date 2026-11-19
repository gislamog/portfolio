import { useEffect, useRef } from 'react';
import { RainControls } from './RainControls';
import { rainDefaults } from './rainSettings';
import { startGlass } from './renderGlass';

const city = `${import.meta.env.BASE_URL}images/city/city-front-on`;

export function CityScene() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const fog = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const surface = glass.current;
    const background = image.current;
    const mist = fog.current;
    if (!surface || !background || !mist) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop: (() => void) | undefined;

    function update() {
      stop?.();
      stop = undefined;
      if (motion.matches) return;
      try {
        stop = startGlass(surface!, background!, mist!);
      } catch (error) {
        console.warn('Rain on glass unavailable', error);
      }
    }

    motion.addEventListener('change', update);
    update();
    return () => {
      motion.removeEventListener('change', update);
      stop?.();
    };
  }, []);

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
        <div className="city-view">
          <div className="city-street">
            <picture>
              <source media="(max-width: 700px)" srcSet={`${city}-mobile.webp`} />
              <img ref={image} id="fallback" src={`${city}.webp`}
                alt="Illuminated ramen shops lining a rain-slicked Japanese street at night" />
            </picture>
            <canvas ref={canvas} className="city-rain" aria-hidden="true" />
          </div>
          <div ref={fog} className="city-fog" aria-hidden="true" />
          <canvas ref={glass} className="city-glass" aria-hidden="true" />
        </div>
      </div>
      {import.meta.env.DEV && <RainControls settings={settings.current} />}
    </>
  );
}

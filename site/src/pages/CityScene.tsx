import { useEffect, useRef } from 'react';
import { rainDefaults } from './rainSettings';
import { startGlass } from './renderGlass';

const city = `${import.meta.env.BASE_URL}images/city/city-front-on`;
const darkCity = `${import.meta.env.BASE_URL}images/city/city-front-off`;

export function CityScene() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const fog = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const lightsOff = useRef<HTMLImageElement>(null);
  const street = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = glass.current;
    const background = image.current;
    const mist = fog.current;
    const dark = lightsOff.current;
    if (!surface || !background || !mist || !dark) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop: (() => void) | undefined;

    function update() {
      stop?.();
      stop = undefined;
      if (motion.matches) return;
      try {
        stop = startGlass(surface!, background!, dark!, mist!);
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


  useEffect(() => {
    const surface = canvas.current;
    const cityStreet = street.current;
    const dark = lightsOff.current;
    if (!surface || !cityStreet || !dark) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let generation = 0;
    let stop: (() => void) | undefined;

    const setLightsOff = (off: boolean) => {
      cityStreet.toggleAttribute('data-lights-off', off && dark.complete && dark.naturalWidth > 0);
    };

    function update() {
      const current = ++generation;
      stop?.();
      stop = undefined;
      if (motion.matches) return;
      const active = () => current === generation;
      void import('./renderRain').then(async ({ startRain }) => {
        if (!active()) return;
        const cleanup = await startRain(surface!, active, rainDefaults, setLightsOff);
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
    <div className="city-scene">
      <div className="city-view">
        <div ref={street} className="city-street">
          <picture>
            <source media="(max-width: 700px)" srcSet={`${city}-mobile.webp`} />
            <img ref={image} id="fallback" src={`${city}.webp`}
              alt="Illuminated ramen shops lining a rain-slicked Japanese street at night" />
          </picture>
          <picture aria-hidden="true">
            <source media="(max-width: 700px)" srcSet={`${darkCity}-mobile.webp`} />
            <img ref={lightsOff} src={`${darkCity}.webp`} className="city-lights-off"
              alt="" decoding="async" />
          </picture>
          <canvas ref={canvas} className="city-rain" aria-hidden="true" />
        </div>
        <div ref={fog} className="city-fog" aria-hidden="true" />
        <div className="city-hero-fog" aria-hidden="true" />
        <canvas ref={glass} className="city-glass" aria-hidden="true" />
      </div>
    </div>
  );
}

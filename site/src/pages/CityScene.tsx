import { useEffect, useId, useRef } from 'react';
import { rainDefaults } from './rainSettings';
import { startGlass } from './renderGlass';

const city = `${import.meta.env.BASE_URL}images/city/city-front-on`;

function shouldLimitWeather() {
  return window.matchMedia('(pointer: coarse)').matches || navigator.hardwareConcurrency <= 4;
}

export function CityScene() {
  const wipeId = useId();
  const canvas = useRef<HTMLCanvasElement>(null);
  const glass = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const wipe = useRef<SVGMaskElement>(null);

  useEffect(() => {
    const surface = glass.current;
    const background = image.current;
    const mask = wipe.current;
    if (!surface || !background || !mask) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop: (() => void) | undefined;

    function update() {
      stop?.();
      stop = undefined;
      if (motion.matches) return;
      try {
        stop = startGlass(surface!, background!, mask!, shouldLimitWeather() ? 1 : 1.5);
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
        const limited = shouldLimitWeather();
        const settings = limited ? { ...rainDefaults, density: 680 } : rainDefaults;
        const cleanup = await startRain(surface!, active, settings, limited ? 1 : 1.5);
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
        <svg className="city-wipe-definitions" width="0" height="0" aria-hidden="true">
          <defs>
            <path id={`${wipeId}-brush`} d="M-51 -3C-56 -21 -39 -29 -32 -40C-22 -56 -8 -46 7 -50
              C26 -55 28 -38 43 -30C55 -23 46 -12 53 1C60 14 43 24 38 34
              C30 48 18 45 7 51C-7 60 -19 44 -33 42C-49 39 -41 25 -49 16C-57 8 -47 4 -51 -3Z" />
            <filter id={`${wipeId}-feather`} x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency="0.032 0.047"
                numOctaves="3" seed="17" result="texture" />
              <feDisplacementMap in="SourceGraphic" in2="texture" scale="34"
                xChannelSelector="R" yChannelSelector="G" result="contour" />
              <feGaussianBlur in="contour" stdDeviation="5.5" result="softEdge" />
              <feGaussianBlur in="contour" stdDeviation="1.8" result="clearCenter" />
              <feMerge>
                <feMergeNode in="softEdge" />
                <feMergeNode in="clearCenter" />
              </feMerge>
            </filter>
            <mask ref={wipe} id={wipeId} x="0" y="0" width="100%" height="100%"
              maskContentUnits="userSpaceOnUse">
              <rect fill="white" />
              <g fill="black" filter={`url(#${wipeId}-feather)`} />
            </mask>
          </defs>
        </svg>
        <div className="city-street">
          <picture>
            <source media="(max-width: 700px)" srcSet={`${city}-mobile.webp`} />
            <img ref={image} id="fallback" src={`${city}.webp`} fetchPriority="high"
              alt="Illuminated ramen shops lining a rain-slicked Japanese street at night" />
          </picture>
          <canvas ref={canvas} className="city-rain" aria-hidden="true" />
        </div>
        <div className="city-fog" aria-hidden="true" />
        <div className="city-hero-fog" aria-hidden="true" />
        <canvas ref={glass} className="city-glass" aria-hidden="true" />
      </div>
    </div>
  );
}

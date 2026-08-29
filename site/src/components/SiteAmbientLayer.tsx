import { useEffect, useState } from 'react';
import './SiteAmbientLayer.css';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Site-wide ambient field: soft orbs and grid that drift toward the cursor.
 * Disabled when the user prefers reduced motion.
 */
export function SiteAmbientLayer() {
  const [pointer, setPointer] = useState({ x: 50, y: 38 });
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const onMove = (e: MouseEvent) => {
      setPointer({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduceMotion]);

  return (
    <div
      className="site-ambient"
      aria-hidden="true"
      style={
        reduceMotion
          ? undefined
          : ({
              '--ambient-x': `${pointer.x}%`,
              '--ambient-y': `${pointer.y}%`,
            } as React.CSSProperties)
      }
    >
      <div className="site-ambient-orb site-ambient-orb--emerald" />
      <div className="site-ambient-orb site-ambient-orb--violet" />
      <div className="site-ambient-orb site-ambient-orb--amber" />
      <div className="site-ambient-grid" />
      <div className="site-ambient-noise" />
    </div>
  );
}

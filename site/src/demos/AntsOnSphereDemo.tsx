import { useEffect, useRef } from 'react';
import './Demos.css';

interface Ant {
  theta: number;
  phi: number;
  vTheta: number;
  vPhi: number;
}

function project(theta: number, phi: number, cx: number, cy: number, r: number) {
  const x3 = r * Math.sin(phi) * Math.cos(theta);
  const y3 = r * Math.sin(phi) * Math.sin(theta);
  const z3 = r * Math.cos(phi);
  const scale = 200 / (200 + z3);
  return { x: cx + x3 * scale, y: cy + y3 * scale, z: z3 };
}

export function AntsOnSphereDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ants = useRef<Ant[]>(
    Array.from({ length: 40 }, () => ({
      theta: Math.random() * Math.PI * 2,
      phi: Math.acos(2 * Math.random() - 1),
      vTheta: (Math.random() - 0.5) * 0.02,
      vPhi: (Math.random() - 0.5) * 0.01,
    }))
  );
  const trails = useRef<{ x: number; y: number; age: number }[]>([]);

  useEffect(() => {
    let frame: number;
    const loop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const w = 400;
      const h = 400;
      ctx.fillStyle = 'rgba(18, 20, 28, 0.25)';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(110, 231, 200, 0.15)';
      ctx.beginPath();
      ctx.arc(200, 200, 90, 0, Math.PI * 2);
      ctx.stroke();

      ants.current.forEach((ant, i) => {
        ant.theta += ant.vTheta + Math.sin(Date.now() * 0.001 + i) * 0.003;
        ant.phi = Math.max(0.2, Math.min(Math.PI - 0.2, ant.phi + ant.vPhi));
        const p = project(ant.theta, ant.phi, 200, 200, 90);
        trails.current.push({ x: p.x, y: p.y, age: 0 });
        ctx.fillStyle = `rgba(110, 231, 200, ${0.4 + p.z / 200})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      trails.current = trails.current
        .map((t) => ({ ...t, age: t.age + 1 }))
        .filter((t) => t.age < 60);
      trails.current.forEach((t) => {
        ctx.fillStyle = `rgba(139, 156, 246, ${1 - t.age / 60})`;
        ctx.fillRect(t.x, t.y, 1, 1);
      });

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="demo-wrap">
      <canvas ref={canvasRef} width={400} height={400} className="demo-canvas" />
      <p className="demo-note">
        Conceptual visualization inspired by the original Java &quot;Ants on a Sphere&quot; project and CSE 568 biocomputing themes (swarm behavior, trail following). Placeholder demo. Full Java version can be linked later.
      </p>
    </div>
  );
}

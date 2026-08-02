import { useEffect, useRef, useState } from 'react';
import './Demos.css';

interface RobotState {
  x: number;
  y: number;
  angle: number;
  sensors: number[];
  collision: boolean;
}

function simulateSensors(state: RobotState, obstacles: { x: number; y: number; r: number }[]): number[] {
  const angles = [-66, -33, 0, 33, 66];
  return angles.map((deg) => {
    const rad = ((state.angle + deg) * Math.PI) / 180;
    let dist = 120;
    for (let d = 0; d < 120; d += 2) {
      const px = state.x + Math.cos(rad) * d;
      const py = state.y + Math.sin(rad) * d;
      if (px < 10 || px > 390 || py < 10 || py > 290) { dist = d; break; }
      for (const o of obstacles) {
        const dx = px - o.x;
        const dy = py - o.y;
        if (Math.sqrt(dx * dx + dy * dy) < o.r) { dist = d; break; }
      }
      if (dist < 120) break;
    }
    return dist;
  });
}

function predictCollision(sensors: number[], steer: number): boolean {
  const min = Math.min(...sensors);
  const avg = sensors.reduce((a, b) => a + b, 0) / sensors.length;
  const front = sensors[2];
  return min < 18 || (front < 30 && Math.abs(steer) > 0.3) || avg < 25;
}

export function RobotMLDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [stats, setStats] = useState({ total: 0, predicted: 0, actual: 0, tp: 0, fp: 0 });

  const obstacles = useRef([
    { x: 120, y: 150, r: 35 },
    { x: 280, y: 100, r: 28 },
    { x: 200, y: 220, r: 40 },
    { x: 340, y: 200, r: 25 },
  ]);

  const robot = useRef<RobotState>({ x: 200, y: 250, angle: -90, sensors: [], collision: false });
  const steer = useRef(0);

  useEffect(() => {
    if (!running) return;
    let frame: number;
    const loop = () => {
      const r = robot.current;
      r.angle += steer.current * 2;
      const rad = (r.angle * Math.PI) / 180;
      r.x += Math.cos(rad) * 1.5;
      r.y += Math.sin(rad) * 1.5;

      if (r.x < 15 || r.x > 385) steer.current = (Math.random() - 0.5) * 2;
      if (r.y < 15 || r.y > 285) steer.current = (Math.random() - 0.5) * 2;
      if (Math.random() < 0.02) steer.current = (Math.random() - 0.5) * 2;

      r.sensors = simulateSensors(r, obstacles.current);
      const predicted = predictCollision(r.sensors, steer.current);
      r.collision = r.sensors.some((s) => s < 8);

      setStats((prev) => ({
        total: prev.total + 1,
        predicted: prev.predicted + (predicted ? 1 : 0),
        actual: prev.actual + (r.collision ? 1 : 0),
        tp: prev.tp + (predicted && r.collision ? 1 : 0),
        fp: prev.fp + (predicted && !r.collision ? 1 : 0),
      }));

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#12141c';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#2a3040';
        obstacles.current.forEach((o) => {
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
          ctx.fill();
        });

        const colors = ['#f87171', '#fb923c', '#facc15', '#fb923c', '#f87171'];
        r.sensors.forEach((d, i) => {
          const deg = r.angle + [-66, -33, 0, 33, 66][i];
          const rad = (deg * Math.PI) / 180;
          ctx.strokeStyle = colors[i];
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x + Math.cos(rad) * d, r.y + Math.sin(rad) * d);
          ctx.stroke();
          ctx.globalAlpha = 1;
        });

        ctx.fillStyle = predicted ? '#f87171' : '#6ee7c8';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 8, 0, Math.PI * 2);
        ctx.fill();
        const headRad = (r.angle * Math.PI) / 180;
        ctx.strokeStyle = '#eef0f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + Math.cos(headRad) * 14, r.y + Math.sin(headRad) * 14);
        ctx.stroke();
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  return (
    <div className="demo-wrap">
      <canvas ref={canvasRef} width={400} height={300} className="demo-canvas" />
      <div className="demo-controls">
        <button type="button" className="btn btn-primary" onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Run'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => {
          robot.current = { x: 200, y: 250, angle: -90, sensors: [], collision: false };
          setStats({ total: 0, predicted: 0, actual: 0, tp: 0, fp: 0 });
        }}>Reset</button>
      </div>
      <div className="demo-legend">
        <span><i className="dot green" /> Safe prediction</span>
        <span><i className="dot red" /> Collision predicted</span>
        <span>Sensors: {stats.total > 0 ? robot.current.sensors.map((s) => s.toFixed(0)).join(', ') : 'n/a'}</span>
      </div>
      <p className="demo-note">
        Simplified browser demo mimicking the CSE 571 project: 5 distance sensors + steering → collision prediction.
        The full PyTorch model achieved 1 FP and 5 missed collisions in 1,000 test cases.
      </p>
    </div>
  );
}

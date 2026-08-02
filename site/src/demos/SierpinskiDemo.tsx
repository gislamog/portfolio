import { useCallback, useEffect, useRef, useState } from 'react';
import './Demos.css';

export function SierpinskiDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const currentRef = useRef<{ x: number; y: number } | null>(null);
  const animRef = useRef<number>();

  const size = 400;
  const vertices = [
    { x: size / 2, y: 20 },
    { x: 20, y: size - 20 },
    { x: size - 20, y: size - 20 },
  ];

  const reset = useCallback(() => {
    cancelAnimationFrame(animRef.current!);
    currentRef.current = { x: Math.random() * size, y: Math.random() * size };
    setPoints([]);
    setRunning(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#12141c';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#6ee7c8';
      vertices.forEach((v) => {
        ctx.beginPath();
        ctx.arc(v.x, v.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, []);

  useEffect(() => { reset(); }, [reset]);

  useEffect(() => {
    if (!running) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !currentRef.current) return;

    const step = () => {
      const curr = currentRef.current!;
      const target = vertices[Math.floor(Math.random() * 3)];
      const next = { x: (curr.x + target.x) / 2, y: (curr.y + target.y) / 2 };
      currentRef.current = next;
      setPoints((prev) => [...prev.slice(-5000), next]);
      ctx.fillStyle = '#eef0f6';
      ctx.beginPath();
      ctx.arc(next.x, next.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current!);
  }, [running]);

  return (
    <div className="demo-wrap">
      <canvas ref={canvasRef} width={size} height={size} className="demo-canvas" />
      <div className="demo-controls">
        <button type="button" className="btn btn-primary" onClick={() => setRunning(true)}>Start</button>
        <button type="button" className="btn btn-ghost" onClick={() => setRunning(false)}>Pause</button>
        <button type="button" className="btn btn-ghost" onClick={reset}>Reset</button>
        <span className="demo-stat">{points.length.toLocaleString()} points</span>
      </div>
    </div>
  );
}

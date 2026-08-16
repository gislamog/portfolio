import { useCallback, useEffect, useRef, useState } from 'react';
import './Demos.css';

const SIZE = 420;
const VERTICES = [
  { x: SIZE / 2, y: 24 },
  { x: 28, y: SIZE - 28 },
  { x: SIZE - 28, y: SIZE - 28 },
];
const WALK_MS = 420;

type Pt = { x: number; y: number };

export function SierpinskiDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRef = useRef<Pt | null>(null);
  const pointsRef = useRef<Pt[]>([]);
  const animRef = useRef<number>();
  const walkTimerRef = useRef<number>();
  const countRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [walkthrough, setWalkthrough] = useState(false);
  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(3000);
  const [pointSize, setPointSize] = useState(1.6);
  const limitRef = useRef(limit);
  const sizeRef = useRef(pointSize);
  const walkRef = useRef(walkthrough);
  limitRef.current = limit;
  sizeRef.current = pointSize;
  walkRef.current = walkthrough;

  const drawVertices = useCallback((ctx: CanvasRenderingContext2D, highlight = -1) => {
    VERTICES.forEach((v, i) => {
      ctx.fillStyle = i === highlight ? '#ffb020' : '#5eead4';
      ctx.beginPath();
      ctx.arc(v.x, v.y, i === highlight ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const redrawPoints = useCallback((ctx: CanvasRenderingContext2D, highlight = -1, overlay?: { from: Pt; vertex: Pt; mid: Pt }) => {
    ctx.fillStyle = '#12141c';
    ctx.fillRect(0, 0, SIZE, SIZE);
    pointsRef.current.forEach((p) => {
      ctx.fillStyle = '#eef0f6';
      ctx.beginPath();
      ctx.arc(p.x, p.y, sizeRef.current, 0, Math.PI * 2);
      ctx.fill();
    });
    drawVertices(ctx, highlight);
    if (overlay) {
      ctx.strokeStyle = '#93a8f8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(overlay.from.x, overlay.from.y);
      ctx.lineTo(overlay.vertex.x, overlay.vertex.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#eef0f6';
      ctx.beginPath();
      ctx.arc(overlay.from.x, overlay.from.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(overlay.mid.x, overlay.mid.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(overlay.mid.x, overlay.mid.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [drawVertices]);

  const stopTimers = useCallback(() => {
    cancelAnimationFrame(animRef.current!);
    window.clearTimeout(walkTimerRef.current);
  }, []);

  const reset = useCallback(() => {
    stopTimers();
    currentRef.current = null;
    pointsRef.current = [];
    countRef.current = 0;
    setCount(0);
    setStarted(false);
    setRunning(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#12141c';
      ctx.fillRect(0, 0, SIZE, SIZE);
      drawVertices(ctx);
    }
  }, [drawVertices, stopTimers]);

  useEffect(() => { reset(); }, [reset]);

  const plotPoint = (ctx: CanvasRenderingContext2D, p: Pt) => {
    ctx.fillStyle = '#eef0f6';
    ctx.beginPath();
    ctx.arc(p.x, p.y, sizeRef.current, 0, Math.PI * 2);
    ctx.fill();
  };

  const takeStep = useCallback((showGuide: boolean) => {
    const ctx = canvasRef.current?.getContext('2d');
    const curr = currentRef.current;
    if (!ctx || !curr) return false;
    if (countRef.current >= limitRef.current) {
      setRunning(false);
      return false;
    }
    const vertexIndex = Math.floor(Math.random() * 3);
    const vertex = VERTICES[vertexIndex];
    const mid = { x: (curr.x + vertex.x) / 2, y: (curr.y + vertex.y) / 2 };
    pointsRef.current.push(mid);
    if (showGuide) {
      redrawPoints(ctx, vertexIndex, { from: curr, vertex, mid });
    } else {
      plotPoint(ctx, mid);
    }

    currentRef.current = mid;
    countRef.current += 1;
    setCount(countRef.current);
    return countRef.current < limitRef.current;
  }, [redrawPoints]);

  // Fast fill mode
  useEffect(() => {
    if (!running || walkRef.current) return;
    const step = () => {
      const more = takeStep(false);
      if (more) animRef.current = requestAnimationFrame(step);
      else setRunning(false);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current!);
  }, [running, takeStep]);

  // Walkthrough auto-continue (slower, with guide overlays)
  useEffect(() => {
    if (!running || !walkthrough) return;
    const tick = () => {
      const more = takeStep(true);
      if (more) walkTimerRef.current = window.setTimeout(tick, WALK_MS);
      else setRunning(false);
    };
    walkTimerRef.current = window.setTimeout(tick, WALK_MS);
    return () => window.clearTimeout(walkTimerRef.current);
  }, [running, walkthrough, takeStep]);

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!currentRef.current) {
      currentRef.current = { x, y };
      setStarted(true);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      setRunning(true);
    }
  };

  return (
    <div className="demo-wrap">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="demo-canvas sierpinski-canvas"
        onClick={onCanvasClick}
      />
      <div className="demo-controls demo-fields">
        <label>
          Point limit
          <input
            type="number"
            min={50}
            max={20000}
            step={50}
            value={limit}
            onChange={(e) => setLimit(Math.max(50, Math.min(20000, Number(e.target.value) || 50)))}
          />
        </label>
        <label>
          Point size
          <input
            type="number"
            min={0.5}
            max={6}
            step={0.1}
            value={pointSize}
            onChange={(e) => setPointSize(Math.max(0.5, Math.min(6, Number(e.target.value) || 0.5)))}
          />
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={walkthrough}
            onChange={(e) => {
              setWalkthrough(e.target.checked);
              setRunning(false);
            }}
          />
          Walkthrough
        </label>
        {started && (
          <button type="button" className="btn btn-ghost" onClick={() => setRunning((v) => !v)}>
            {running ? 'Pause' : 'Keep going'}
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={reset}>Reset</button>
        <span className="demo-stat">{count.toLocaleString()} / {limit.toLocaleString()} points</span>
      </div>
      <p className="demo-note">
        {started
          ? walkthrough
            ? 'Walkthrough runs automatically: gold vertex, dashed line to that corner, pink midpoint marker. Pause or Keep going anytime.'
            : 'Click was the first point. Points keep landing at midpoints until the limit.'
          : 'Click the canvas to place the first point. Walkthrough slows each step so you can see the construction.'}
      </p>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Demos.css';
import {
  INIT_MODES,
  centroidTrails,
  elbowCurve,
  generateBlobs,
  initCentroids,
  mulberry32,
  recordFrames,
  sseCurve,
  type Frame,
  type InitMode,
  type Point,
} from './kmeans';

const SIZE = 360;
const PAD = 12;
const COLORS = ['#5eead4', '#93a8f8', '#f472b6', '#fbbf24', '#fb7185', '#34d399', '#c084fc', '#38bdf8'];
const UNASSIGNED = '#5b6172';
/** Milliseconds per beat. An assign beat is a recolor; an update beat is a glide. */
const BEAT_MS = 620;

function toCanvas(p: Point): Point {
  return { x: (p.x / 100) * (SIZE - PAD * 2) + PAD, y: (p.y / 100) * (SIZE - PAD * 2) + PAD };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Ease-in-out so the update glide reads as a deliberate move, not a teleport. */
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  frame: Frame,
  trails: Point[][],
  trailUpTo: number,
  t: number,
) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = '#12141c';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Faint polyline of where each centroid has already been.
  trails.forEach((trail, i) => {
    const upTo = trail.slice(0, Math.max(1, trailUpTo));
    if (upTo.length < 2) return;
    ctx.strokeStyle = COLORS[i % COLORS.length];
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    upTo.forEach((p, j) => {
      const c = toCanvas(p);
      if (j === 0) ctx.moveTo(c.x, c.y);
      else ctx.lineTo(c.x, c.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  });

  // Points. On an assign beat the new colors fade in over the previous frame's grey.
  const assignFade = frame.phase === 'assign' ? ease(t) : 1;
  points.forEach((p, i) => {
    const c = toCanvas(p);
    const label = frame.labels[i];
    const color = label < 0 ? UNASSIGNED : COLORS[label % COLORS.length];
    ctx.globalAlpha = label < 0 ? 1 : frame.phase === 'assign' ? 0.35 + 0.65 * assignFade : 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 3.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  // Centroids. On an update beat they glide from prevCenters to centers.
  frame.centers.forEach((center, i) => {
    const from = frame.prevCenters[i] ?? center;
    const glide = frame.phase === 'update' ? ease(t) : 1;
    const pos = { x: lerp(from.x, center.x, glide), y: lerp(from.y, center.y, glide) };
    const c = toCanvas(pos);
    ctx.strokeStyle = '#eef0f6';
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Cross-hair marks the centroid as a computed mean, not just a bigger dot.
    ctx.strokeStyle = '#12141c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(c.x - 3.5, c.y);
    ctx.lineTo(c.x + 3.5, c.y);
    ctx.moveTo(c.x, c.y - 3.5);
    ctx.lineTo(c.x, c.y + 3.5);
    ctx.stroke();
  });
}

type PaneProps = {
  mode: InitMode;
  points: Point[];
  frames: Frame[];
  step: number;
  t: number;
};

function Pane({ mode, points, frames, step, t }: PaneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meta = INIT_MODES.find((m) => m.id === mode);
  const frame = frames[Math.min(step, frames.length - 1)];
  const trails = useMemo(() => centroidTrails(frames), [frames]);
  // Each update frame appends one trail vertex; init contributes the first.
  const trailUpTo = 1 + frames.slice(0, Math.min(step, frames.length - 1) + 1).filter((f) => f.phase === 'update').length;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && frame) drawScene(ctx, points, frame, trails, trailUpTo, t);
  }, [points, frame, trails, trailUpTo, t]);

  const done = step >= frames.length - 1;
  const label =
    frame?.phase === 'init'
      ? 'Initialization'
      : frame?.phase === 'assign'
        ? `Assign - iteration ${frame.iteration}`
        : `Update - iteration ${frame.iteration}`;

  return (
    <div className="km-pane">
      <p className="km-pane-title">{meta?.label ?? mode}</p>
      <canvas ref={canvasRef} className="demo-canvas km-canvas" width={SIZE} height={SIZE} />
      <p className="km-pane-meta">
        <span className={`km-phase km-phase-${frame?.phase ?? 'init'}`}>{label}</span>
        <span>
          SSE {frame?.sse === null || frame?.sse === undefined ? '--' : frame.sse.toFixed(1)}
        </span>
      </p>
      <p className="km-pane-sub">
        {done
          ? `Converged in ${frames.filter((f) => f.phase === 'update').length} iterations`
          : `${frames.filter((f) => f.phase === 'update').length} iterations to converge`}
      </p>
    </div>
  );
}

/** Sparkline of SSE against iteration for one run. Monotonically decreasing. */
function SseCurve({ series, colors }: { series: { label: string; points: { iteration: number; sse: number }[] }[]; colors: string[] }) {
  const W = 240;
  const H = 96;
  const all = series.flatMap((s) => s.points);
  if (!all.length) return null;
  const maxIter = Math.max(...all.map((p) => p.iteration), 1);
  const maxSse = Math.max(...all.map((p) => p.sse));
  const minSse = Math.min(...all.map((p) => p.sse), 0);
  const px = (i: number) => (maxIter <= 1 ? 6 : 6 + ((i - 1) / (maxIter - 1)) * (W - 12));
  const py = (s: number) => H - 8 - ((s - minSse) / Math.max(1e-9, maxSse - minSse)) * (H - 18);

  return (
    <svg className="km-sse-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="SSE by iteration">
      <line x1={6} y1={H - 8} x2={W - 6} y2={H - 8} stroke="currentColor" strokeOpacity={0.25} />
      {series.map((s, si) => (
        <g key={s.label}>
          <polyline
            fill="none"
            stroke={colors[si]}
            strokeWidth={1.8}
            points={s.points.map((p) => `${px(p.iteration)},${py(p.sse)}`).join(' ')}
          />
          {s.points.map((p) => (
            <circle key={p.iteration} cx={px(p.iteration)} cy={py(p.sse)} r={2.1} fill={colors[si]} />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function KMeansDemo() {
  const [dataSeed, setDataSeed] = useState(7);
  const [initSeed, setInitSeed] = useState(11);
  const [k, setK] = useState(5);
  const [leftMode, setLeftMode] = useState<InitMode>('random');
  const [rightMode, setRightMode] = useState<InitMode>('maxavg');
  const [step, setStep] = useState(0);
  const [t, setT] = useState(1);
  const [playing, setPlaying] = useState(false);

  const points = useMemo(() => generateBlobs(dataSeed, 5, 32), [dataSeed]);

  // Both panes get identical data and the same init RNG stream, so any difference on
  // screen comes from the initialization strategy alone.
  const leftFrames = useMemo(
    () => recordFrames(points, initCentroids(leftMode, points, k, mulberry32(initSeed))),
    [points, k, leftMode, initSeed],
  );
  const rightFrames = useMemo(
    () => recordFrames(points, initCentroids(rightMode, points, k, mulberry32(initSeed))),
    [points, k, rightMode, initSeed],
  );

  const maxStep = Math.max(leftFrames.length, rightFrames.length) - 1;

  const elbow = useMemo(
    () =>
      elbowCurve(points, (kk) => initCentroids(rightMode, points, kk, mulberry32(initSeed)), 2, 8),
    [points, rightMode, initSeed],
  );
  const maxLoss = Math.max(...elbow.map((e) => e.loss), 1);

  const reset = useCallback(() => {
    setStep(0);
    setT(1);
    setPlaying(false);
  }, []);

  const randomize = useCallback(() => {
    setDataSeed(Math.floor(Math.random() * 1e9));
    setInitSeed(Math.floor(Math.random() * 1e9));
    reset();
  }, [reset]);

  const reseed = useCallback(() => {
    setInitSeed(Math.floor(Math.random() * 1e9));
    reset();
  }, [reset]);

  // Drives one beat at a time; each beat animates t from 0 to 1 then advances the step.
  useEffect(() => {
    if (!playing) return;
    if (step >= maxStep) {
      setPlaying(false);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / BEAT_MS);
      setT(progress);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setStep((s) => Math.min(maxStep, s + 1));
        setT(1);
      }
    };
    setT(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, step, maxStep]);

  const stepOnce = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.min(maxStep, s + 1));
    setT(1);
  }, [maxStep]);

  const atEnd = step >= maxStep;
  const leftCurve = useMemo(() => sseCurve(leftFrames), [leftFrames]);
  const rightCurve = useMemo(() => sseCurve(rightFrames), [rightFrames]);

  // Compared at convergence, not at the current step, so the verdict is stable.
  const leftFinal = leftCurve[leftCurve.length - 1];
  const rightFinal = rightCurve[rightCurve.length - 1];
  const verdict = useMemo(() => {
    if (!leftFinal || !rightFinal) return null;
    const gap = leftFinal.sse - rightFinal.sse;
    const better = Math.abs(gap) < 1 ? 'tie' : gap > 0 ? 'right' : 'left';
    const iterGap = leftFinal.iteration - rightFinal.iteration;
    return { better, gap: Math.abs(gap), iterGap };
  }, [leftFinal, rightFinal]);

  return (
    <div className="demo-wrap km-wrap">
      <div className="km-stage">
        <Pane mode={leftMode} points={points} frames={leftFrames} step={step} t={t} />
        <Pane mode={rightMode} points={points} frames={rightFrames} step={step} t={t} />
      </div>

      <div className="csv-panel km-panel">
        <p className="csv-title">K-Means vs K-Means++</p>
        <p className="csv-sub">Same points, same K, same step index &mdash; only the seeding differs.</p>

        <div className="demo-controls">
          <button type="button" className="btn btn-primary" onClick={() => setPlaying((p) => !p)} disabled={atEnd && !playing}>
            {playing ? 'Pause' : atEnd ? 'Finished' : step === 0 ? 'Play' : 'Resume'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={stepOnce} disabled={atEnd}>Step</button>
          <button type="button" className="btn btn-ghost" onClick={reset}>Restart</button>
        </div>

        <div className="demo-controls">
          <button type="button" className="btn btn-ghost" onClick={randomize}>Randomize dataset</button>
          <button type="button" className="btn btn-ghost" onClick={reseed}>New centroid seeds</button>
        </div>

        <div className="demo-fields km-fields">
          <label>
            K = {k}
            <input type="range" min={2} max={8} value={k} onChange={(e) => { setK(Number(e.target.value)); reset(); }} />
          </label>
        </div>

        <label className="km-select">
          Left pane
          <select value={leftMode} onChange={(e) => { setLeftMode(e.target.value as InitMode); reset(); }}>
            {INIT_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <label className="km-select">
          Right pane
          <select value={rightMode} onChange={(e) => { setRightMode(e.target.value as InitMode); reset(); }}>
            {INIT_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>

        <p className="demo-note km-metric-note">
          <strong>SSE</strong> (sum of squared errors) adds up the squared distance from every point to
          its own centroid &mdash; lower means tighter clusters. <strong>Iterations</strong> counts the
          assign-then-update rounds until the centroids stop moving.
        </p>

        <p className="demo-note">SSE by iteration (this run)</p>
        <SseCurve
          series={[
            { label: leftMode, points: leftCurve },
            { label: rightMode, points: rightCurve },
          ]}
          colors={['#fb7185', '#5eead4']}
        />
        <p className="km-legend">
          <span><i className="km-swatch" style={{ background: '#fb7185' }} /> left</span>
          <span><i className="km-swatch" style={{ background: '#5eead4' }} /> right</span>
        </p>

        {verdict && (
          <p className="km-verdict">
            {verdict.better === 'tie'
              ? 'Both panes reach the same optimum here'
              : `${verdict.better === 'left' ? 'Left' : 'Right'} pane converges to a lower SSE by ${verdict.gap.toFixed(0)}`}
            {verdict.iterGap !== 0 &&
              ` · ${verdict.iterGap > 0 ? 'right' : 'left'} took ${Math.abs(verdict.iterGap)} fewer iteration${Math.abs(verdict.iterGap) === 1 ? '' : 's'}`}
            .
            <span className="km-verdict-caveat">
              One run only &mdash; a single unlucky seeding can land in a worse local optimum.
              Hit Randomize a few times: averaged over many datasets both ++ variants beat
              random init, and canonical ++ converges fastest.
            </span>
          </p>
        )}

        <p className="demo-note">Elbow (final SSE by K, right pane)</p>
        <div className="elbow-bars">
          {elbow.map((row) => (
            <div key={row.k} className="elbow-col">
              <div
                className={`elbow-bar${row.k === k ? ' is-active' : ''}`}
                style={{ height: `${Math.max(8, (row.loss / maxLoss) * 88)}px` }}
              />
              <span>K={row.k}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

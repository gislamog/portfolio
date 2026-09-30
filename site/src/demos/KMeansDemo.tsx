import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiCheck, FiPlay } from 'react-icons/fi';
import './Demos.css';
import { useTheme } from '../components/ThemeProvider';
import { KMEANS_SAMPLES } from './kmeansSamples';
import {
  lloydTrace,
  maxAvgSeedTrace,
  mulberry32,
  randomSeedIndices,
  type LloydStep,
  type Point,
} from './kmeans';

const POINTS: Point[] = KMEANS_SAMPLES.map(([x, y]) => ({ x, y }));
/** Convergence tolerance from the assignment: np.allclose(old, new, atol=1e-4). */
const TOL = 1e-4;
const K_MIN = 2;
const K_MAX = 10;

/** Up to ten clusters. Clusters are spatially separate and each carries a centroid marker, so hue is never the only cue. */
const CLUSTER_COLORS = {
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#2fa52f', '#9085e9', '#e66767', '#38bdf8', '#b08968'],
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948', '#0e8fb5', '#8a5a2b'],
};

type Algo = 'kmeans' | 'kmeanspp';

const ALGOS: { id: Algo; title: string; sub: string }[] = [
  { id: 'kmeans', title: 'K-Means', sub: 'K random data points as the initial centroids' },
  {
    id: 'kmeanspp',
    title: 'K-Means++',
    sub: 'First centroid random; each next one is the point with the largest average distance to those already chosen',
  },
];

/** Milliseconds per beat. */
const BEAT_MS = { drop: 380, scan: 1500, pick: 800, assign: 380, update: 560 } as const;

/**
 * One animated step. Seeding beats place centroids; each Lloyd iteration plays as
 * two beats, assign (points recolor) then update (centroids glide to the means).
 */
type Beat =
  | { kind: 'drop'; slot: number; index: number }
  | { kind: 'scan'; slot: number; index: number; avgDist: number[] }
  | { kind: 'pick'; slot: number; index: number }
  | { kind: 'assign'; step: LloydStep; prevLabels: number[] | null }
  | { kind: 'update'; step: LloydStep };

type Plan = {
  beats: Beat[];
  seeds: number[];
  steps: LloydStep[];
  /** Lloyd iterations finished before each beat starts; index beats.length means the whole run. */
  stepsDone: number[];
};

function buildPlan(algo: Algo, k: number, seed: number): Plan {
  const rand = mulberry32(seed);
  const beats: Beat[] = [];
  let seeds: number[];
  if (algo === 'kmeans') {
    seeds = randomSeedIndices(POINTS.length, k, rand);
    seeds.forEach((index, slot) => beats.push({ kind: 'drop', slot, index }));
  } else {
    const trace = maxAvgSeedTrace(POINTS, k, rand);
    seeds = trace.map((s) => s.index);
    trace.forEach((s, slot) => {
      if (!s.avgDist) {
        beats.push({ kind: 'drop', slot, index: s.index });
      } else {
        beats.push({ kind: 'scan', slot, index: s.index, avgDist: s.avgDist });
        beats.push({ kind: 'pick', slot, index: s.index });
      }
    });
  }

  const steps = lloydTrace(POINTS, seeds.map((i) => POINTS[i]), TOL);
  let prevLabels: number[] | null = null;
  steps.forEach((step) => {
    beats.push({ kind: 'assign', step, prevLabels });
    beats.push({ kind: 'update', step });
    prevLabels = step.labels;
  });

  const stepsDone: number[] = [];
  let done = 0;
  beats.forEach((b) => {
    stepsDone.push(done);
    if (b.kind === 'update') done++;
  });
  stepsDone.push(done);
  return { beats, seeds, steps, stepsDone };
}

// --- Canvas ---------------------------------------------------------------

const SIZE = 440;
const PAD = 20;

const BOUNDS = (() => {
  const xs = POINTS.map((p) => p.x);
  const ys = POINTS.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX;
  const spanY = Math.max(...ys) - minY;
  // One scale for both axes so distances on screen match the distances being computed.
  const span = Math.max(spanX, spanY);
  return { x0: minX - (span - spanX) / 2, y0: minY - (span - spanY) / 2, span };
})();

function toPx(p: Point): Point {
  const s = (SIZE - PAD * 2) / BOUNDS.span;
  return { x: PAD + (p.x - BOUNDS.x0) * s, y: SIZE - PAD - (p.y - BOUNDS.y0) * s };
}

function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function clamp01(t: number) {
  return Math.min(1, Math.max(0, t));
}

type Ink = { surface: string; text: string; muted: string; accent: string; accent2: string; border: string };

function readInk(el: Element): Ink {
  const s = getComputedStyle(el);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    surface: v('--bg-elevated'),
    text: v('--text'),
    muted: v('--text-muted'),
    accent: v('--accent'),
    accent2: v('--accent-2'),
    border: v('--border'),
  };
}

function dot(ctx: CanvasRenderingContext2D, p: Point, r: number, fill: string, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function ring(ctx: CanvasRenderingContext2D, p: Point, r: number, stroke: string, width: number, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function centroid(ctx: CanvasRenderingContext2D, pos: Point, color: string, ink: Ink, scale = 1) {
  const c = toPx(pos);
  const r = 7.5 * scale;
  if (r <= 0.2) return;
  dot(ctx, c, r, color);
  ring(ctx, c, r, ink.text, 2);
  ctx.strokeStyle = ink.surface;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(c.x - r * 0.5, c.y);
  ctx.lineTo(c.x + r * 0.5, c.y);
  ctx.moveTo(c.x, c.y - r * 0.5);
  ctx.lineTo(c.x, c.y + r * 0.5);
  ctx.stroke();
}

/** Expanding rings that mark the point a centroid is about to land on. */
function pulse(ctx: CanvasRenderingContext2D, pos: Point, t: number, color: string) {
  const c = toPx(pos);
  for (let i = 0; i < 2; i++) {
    const u = clamp01(t * 1.4 - i * 0.3);
    if (u <= 0 || u >= 1) continue;
    ring(ctx, c, 6 + u * 22, color, 2, 1 - u);
  }
}

/** Scaled so the farthest candidate in a scan reads biggest. */
function heatRadius(avg: number, max: number) {
  return 2.2 + 3.4 * (avg / max) ** 2;
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  plan: Plan | null,
  beatIdx: number,
  t: number,
  ink: Ink,
  colors: string[],
) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = ink.surface;
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (!plan) {
    POINTS.forEach((p) => dot(ctx, toPx(p), 2.8, ink.muted, 0.7));
    return;
  }

  const { beats, seeds, steps } = plan;
  const beat = beats[beatIdx];
  const last = steps[steps.length - 1];
  const colorOf = (label: number) => colors[label % colors.length];

  // Points
  if (!beat || beat.kind === 'update') {
    const labels = beat ? beat.step.labels : last.labels;
    POINTS.forEach((p, i) => dot(ctx, toPx(p), 3, colorOf(labels[i])));
  } else if (beat.kind === 'assign') {
    const mix = ease(t);
    POINTS.forEach((p, i) => {
      const c = toPx(p);
      const prev = beat.prevLabels;
      if (prev) dot(ctx, c, 3, colorOf(prev[i]));
      else dot(ctx, c, 2.8, ink.muted, 0.7);
      if (!prev || prev[i] !== beat.step.labels[i]) dot(ctx, c, 3, colorOf(beat.step.labels[i]), mix);
    });
  } else if (beat.kind === 'scan' || beat.kind === 'pick') {
    const avg = beat.kind === 'scan' ? beat.avgDist : (beats[beatIdx - 1] as Extract<Beat, { kind: 'scan' }>).avgDist;
    const max = Math.max(...avg);
    const placed = new Set(seeds.slice(0, beat.slot));
    const cursor = beat.kind === 'scan' ? Math.floor(clamp01(t / 0.9) * POINTS.length) : POINTS.length;
    let best = -1;
    POINTS.forEach((p, i) => {
      const c = toPx(p);
      if (i >= cursor || placed.has(i)) {
        dot(ctx, c, 2.8, ink.muted, 0.55);
        return;
      }
      dot(ctx, c, heatRadius(avg[i], max), ink.accent, 0.25 + 0.6 * (avg[i] / max));
      if (best < 0 || avg[i] > avg[best]) best = i;
    });

    if (beat.kind === 'scan' && cursor < POINTS.length) {
      // Distance lines from the points being evaluated right now to every placed centroid.
      const centers = seeds.slice(0, beat.slot).map((i) => toPx(POINTS[i]));
      for (let j = Math.max(0, cursor - 4); j < cursor; j++) {
        if (placed.has(j)) continue;
        const c = toPx(POINTS[j]);
        const fade = 0.25 + 0.15 * (j - cursor + 5);
        ctx.globalAlpha = fade;
        ctx.strokeStyle = ink.text;
        ctx.lineWidth = 1;
        ctx.beginPath();
        centers.forEach((cc) => {
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(cc.x, cc.y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
        dot(ctx, c, 4, ink.text, fade);
      }
    }
    if (best >= 0 && beat.kind === 'scan') ring(ctx, toPx(POINTS[best]), 9, ink.accent2, 2);
  } else {
    POINTS.forEach((p) => dot(ctx, toPx(p), 2.8, ink.muted, 0.7));
  }

  // Centroids
  if (!beat) {
    last.to.forEach((c, i) => centroid(ctx, c, colorOf(i), ink));
  } else if (beat.kind === 'assign') {
    beat.step.from.forEach((c, i) => centroid(ctx, c, colorOf(i), ink));
  } else if (beat.kind === 'update') {
    const g = ease(t);
    beat.step.from.forEach((c, i) => {
      const to = beat.step.to[i];
      centroid(ctx, { x: c.x + (to.x - c.x) * g, y: c.y + (to.y - c.y) * g }, colorOf(i), ink);
    });
  } else {
    seeds.slice(0, beat.slot).forEach((idx, i) => centroid(ctx, POINTS[idx], colorOf(i), ink));
    const target = POINTS[beat.index];
    if (beat.kind === 'drop') {
      pulse(ctx, target, t, colorOf(beat.slot));
      centroid(ctx, target, colorOf(beat.slot), ink, ease(clamp01((t - 0.35) / 0.5)));
    } else if (beat.kind === 'pick') {
      // Pulse the winner first, then land the centroid on it.
      pulse(ctx, target, clamp01(t / 0.7), ink.accent2);
      ring(ctx, toPx(target), 9, ink.accent2, 2, 1 - clamp01((t - 0.6) / 0.3));
      centroid(ctx, target, colorOf(beat.slot), ink, ease(clamp01((t - 0.55) / 0.4)));
    }
  }
}

// --- Loss chart -------------------------------------------------------------

type LossPoint = { runId: number; k: number; loss: number };
type Run = { id: number; k: number; seed: number };

const CW = 440;
const CH = 148;
const M = { top: 12, right: 14, bottom: 38, left: 70 };

function niceStep(max: number, count: number) {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
}

/** Losses closer than this count as the same optimum. */
const TIE = 0.005;

type Verdict = 'better' | 'worse' | 'tie' | null;

function LossChart({
  history,
  rivalHistory,
  rivalTitle,
  pending,
  yMax,
  title,
}: {
  history: LossPoint[];
  rivalHistory: LossPoint[];
  rivalTitle: string;
  pending: Run | null;
  yMax: number;
  title: string;
}) {
  const [hover, setHover] = useState<LossPoint | null>(null);
  const step = niceStep(yMax, 3);
  const top = Math.ceil(yMax / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const px = (k: number) => M.left + ((k - K_MIN + 0.5) / (K_MAX - K_MIN + 1)) * (CW - M.left - M.right);
  const py = (v: number) => CH - M.bottom - (v / top) * (CH - M.top - M.bottom);

  // The newest run for each K is active; a run in progress already supersedes the older points.
  const latestForK = new Map<number, number>();
  history.forEach((p) => latestForK.set(p.k, Math.max(latestForK.get(p.k) ?? 0, p.runId)));
  if (pending) latestForK.set(pending.k, Math.max(latestForK.get(pending.k) ?? 0, pending.id));
  const isActive = (p: LossPoint) => latestForK.get(p.k) === p.runId;
  const active = history.filter(isActive).sort((a, b) => a.k - b.k);
  const stale = history.filter((p) => !isActive(p));
  const newestId = Math.max(0, ...history.map((p) => p.runId));

  // Loss only ranks runs at the same K, so each point is judged against the other
  // algorithm's result from the same run (same K, same moment).
  const rivalOf = (p: LossPoint) => rivalHistory.find((r) => r.runId === p.runId);
  const verdict = (p: LossPoint): Verdict => {
    const r = rivalOf(p);
    if (!r) return null;
    const diff = p.loss - r.loss;
    return Math.abs(diff) < TIE ? 'tie' : diff < 0 ? 'better' : 'worse';
  };

  return (
    <div className="kmx-chart" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={`${title} loss by K`}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={M.left} x2={CW - M.right} y1={py(v)} y2={py(v)} className={v === 0 ? 'kmx-axis' : 'kmx-gridline'} />
            <text x={M.left - 8} y={py(v)} className="kmx-tick" textAnchor="end" dominantBaseline="middle">
              {v.toLocaleString()}
            </text>
          </g>
        ))}
        {Array.from({ length: K_MAX - K_MIN + 1 }, (_, i) => K_MIN + i).map((k) => (
          <g key={k}>
            {pending?.k === k && (
              <rect
                x={px(k) - 12}
                width={24}
                y={M.top}
                height={CH - M.top - M.bottom}
                rx={6}
                className="kmx-running-col"
              />
            )}
            <text x={px(k)} y={CH - M.bottom + 16} className="kmx-tick" textAnchor="middle">
              {k}
            </text>
          </g>
        ))}
        <text x={(M.left + CW - M.right) / 2} y={CH - 5} className="kmx-axis-title" textAnchor="middle">
          Number of clusters K
        </text>
        <text
          transform={`translate(12, ${(M.top + CH - M.bottom) / 2}) rotate(-90)`}
          className="kmx-axis-title"
          textAnchor="middle"
        >
          Loss (SSE)
        </text>

        {stale.map((p) => (
          <circle key={p.runId} cx={px(p.k)} cy={py(p.loss)} r={4} className="kmx-stale" />
        ))}
        {active.length > 1 && (
          <polyline className="kmx-line" points={active.map((p) => `${px(p.k)},${py(p.loss)}`).join(' ')} />
        )}
        {active.map((p) => (
          <g key={p.runId}>
            {p.runId === newestId && <circle cx={px(p.k)} cy={py(p.loss)} r={10} className="kmx-newest" />}
            <circle cx={px(p.k)} cy={py(p.loss)} r={5} className={`kmx-active${verdictClass(verdict(p))}`} />
          </g>
        ))}
        {history.map((p) => (
          <circle
            key={`hit-${p.runId}`}
            cx={px(p.k)}
            cy={py(p.loss)}
            r={12}
            className="kmx-hit"
            onMouseEnter={() => setHover(p)}
          />
        ))}
      </svg>
      {!history.length && <p className="kmx-empty">Each converged run plots its final loss here.</p>}
      {hover && (
        <div
          className="kmx-tooltip"
          style={{ left: `${(px(hover.k) / CW) * 100}%`, top: `${(py(hover.loss) / CH) * 100}%` }}
        >
          <strong>K = {hover.k}</strong>
          <span>Loss {hover.loss.toFixed(2)}</span>
          {(() => {
            const r = rivalOf(hover);
            const v = verdict(hover);
            if (!r || !v) return null;
            const gap = Math.abs(hover.loss - r.loss).toFixed(2);
            return (
              <span className={`kmx-tooltip-verdict${verdictClass(v)}`}>
                {v === 'tie'
                  ? `Same as ${rivalTitle}`
                  : `${v === 'better' ? 'Lower' : 'Higher'} than ${rivalTitle} by ${gap}`}
              </span>
            );
          })()}
          <span className="kmx-tooltip-sub">{isActive(hover) ? 'Latest run' : 'Earlier run (superseded)'}</span>
        </div>
      )}
    </div>
  );
}

function verdictClass(v: Verdict) {
  return v === 'better' ? ' is-better' : v === 'worse' ? ' is-worse' : '';
}

// --- Row ------------------------------------------------------------------

function formatShift(v: number) {
  return v === 0 ? '0' : v.toExponential(2);
}

/** Position on a log scale from 1 (far) to the tolerance (converged). */
function shiftProgress(v: number) {
  if (v <= TOL) return 1;
  return clamp01(-Math.log10(v) / -Math.log10(TOL));
}

function AlgoColumn({
  algo,
  run,
  colors,
  history,
  rivalHistory,
  rivalTitle,
  yMax,
  onConverged,
}: {
  algo: (typeof ALGOS)[number];
  run: Run | null;
  colors: string[];
  history: LossPoint[];
  rivalHistory: LossPoint[];
  rivalTitle: string;
  yMax: number;
  onConverged: (algo: Algo, point: LossPoint) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Both rows share the run seed but draw from separate streams.
  const plan = useMemo(
    () => (run ? buildPlan(algo.id, run.k, run.seed + (algo.id === 'kmeans' ? 0 : 7919)) : null),
    [algo.id, run],
  );
  // Keyed to its plan so a new run never renders with the previous run's beat index.
  const [progress, setProgress] = useState<{ plan: Plan | null; beatIdx: number }>({ plan: null, beatIdx: 0 });
  const beatIdx = progress.plan === plan ? progress.beatIdx : 0;
  const frameRef = useRef({ beatIdx: 0, t: 0 });
  const colorsRef = useRef(colors);
  colorsRef.current = colors;
  const onConvergedRef = useRef(onConverged);
  onConvergedRef.current = onConverged;

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== SIZE * dpr) {
      canvas.width = SIZE * dpr;
      canvas.height = SIZE * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { beatIdx: i, t } = frameRef.current;
    drawScene(ctx, plan, i, t, readInk(canvas), colorsRef.current);
  }, [plan]);

  useEffect(() => {
    frameRef.current = { beatIdx: 0, t: 0 };
    setProgress({ plan, beatIdx: 0 });
    if (!plan || !run) {
      paint();
      return;
    }
    let raf = 0;
    let i = 0;
    let start = performance.now();
    const frame = (now: number) => {
      while (i < plan.beats.length && now - start >= BEAT_MS[plan.beats[i].kind]) {
        start += BEAT_MS[plan.beats[i].kind];
        i++;
      }
      const beat = plan.beats[i];
      if (i !== frameRef.current.beatIdx) setProgress({ plan, beatIdx: i });
      frameRef.current = { beatIdx: i, t: beat ? (now - start) / BEAT_MS[beat.kind] : 1 };
      paint();
      if (beat) {
        raf = requestAnimationFrame(frame);
      } else {
        onConvergedRef.current(algo.id, { runId: run.id, k: run.k, loss: plan.steps[plan.steps.length - 1].sse });
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [plan, run, paint, algo.id]);

  // Theme switches repaint whatever frame is showing.
  useEffect(() => {
    paint();
  }, [colors, paint]);

  const beat = plan?.beats[beatIdx];
  const converged = !!plan && beatIdx >= plan.beats.length;
  const done = plan ? plan.stepsDone[beatIdx] : 0;
  const shift = plan && done > 0 ? plan.steps[done - 1].shift : null;
  const k = run?.k ?? 0;

  let phase = 'Waiting for a K value';
  if (plan && beat) {
    if (beat.kind === 'drop') phase = `Seeding centroid ${beat.slot + 1} of ${k}${algo.id === 'kmeans' ? ' (random)' : ' (random first pick)'}`;
    else if (beat.kind === 'scan') phase = `Centroid ${beat.slot + 1} of ${k}: average distance to ${beat.slot} centroid${beat.slot === 1 ? '' : 's'}`;
    else if (beat.kind === 'pick') phase = `Centroid ${beat.slot + 1} of ${k}: farthest point`;
    else phase = `Iteration ${beat.step.iteration} · ${beat.kind}`;
  } else if (converged && plan) {
    phase = `Converged in ${plan.steps.length} iteration${plan.steps.length === 1 ? '' : 's'}`;
  }

  return (
    <section className="kmx-col" aria-label={algo.title}>
      <div className="kmx-col-head">
        <h3>{algo.title}</h3>
        <span className="kmx-col-sub">{algo.sub}</span>
      </div>

      <p className="kmx-panel-label">
        Clusters{run ? ` · K = ${run.k}` : ''}
        <span className="kmx-phase">{phase}</span>
      </p>
      <canvas ref={canvasRef} className="demo-canvas kmx-canvas" width={SIZE} height={SIZE} />

      <div className={`kmx-shift${converged ? ' is-converged' : ''}`} role="status" aria-live="polite">
        <span className="kmx-shift-label">Max centroid shift</span>
        <span className="kmx-shift-value">{shift === null ? '—' : formatShift(shift)}</span>
        <span className="kmx-shift-tol">
          {converged ? (
            <>
              <FiCheck aria-hidden /> Stabilized at ≤ 1e-4
            </>
          ) : (
            'Stops at ≤ 1e-4'
          )}
        </span>
        <span className="kmx-shift-meter" aria-hidden>
          <span style={{ width: `${(shift === null ? 0 : shiftProgress(shift)) * 100}%` }} />
        </span>
      </div>

      <p className="kmx-panel-label kmx-loss-label">
        <span>Loss function · lower is better at the same K</span>
        <span className="kmx-legend">
          <span><i className="kmx-swatch kmx-swatch-better" /> Lower than {rivalTitle}</span>
          <span><i className="kmx-swatch kmx-swatch-worse" /> Higher</span>
          <span><i className="kmx-swatch kmx-swatch-stale" /> Earlier run</span>
        </span>
      </p>
      <LossChart
        history={history}
        rivalHistory={rivalHistory}
        rivalTitle={rivalTitle}
        pending={converged ? null : run}
        yMax={yMax}
        title={algo.title}
      />
    </section>
  );
}

// --- Demo -----------------------------------------------------------------

export function KMeansDemo() {
  const { theme } = useTheme();
  const colors = theme === 'c' ? CLUSTER_COLORS.light : CLUSTER_COLORS.dark;
  const [kText, setKText] = useState('4');
  const [run, setRun] = useState<Run | null>(null);
  const [history, setHistory] = useState<Record<Algo, LossPoint[]>>({ kmeans: [], kmeanspp: [] });
  const nextId = useRef(1);

  const k = Number(kText);
  const valid = Number.isInteger(k) && k >= K_MIN && k <= K_MAX;

  const start = () => {
    if (!valid) return;
    setRun({ id: nextId.current++, k, seed: Math.floor(Math.random() * 2 ** 31) });
  };

  const onConverged = useCallback((algo: Algo, point: LossPoint) => {
    setHistory((h) => (h[algo].some((p) => p.runId === point.runId) ? h : { ...h, [algo]: [...h[algo], point] }));
  }, []);

  // One y-scale for both loss charts so the two rows compare directly.
  const all = [...history.kmeans, ...history.kmeanspp];
  const yMax = all.length ? Math.max(...all.map((p) => p.loss)) * 1.08 : 2000;

  return (
    <div className="demo-wrap kmx">
      <div className="kmx-controls">
        <label className="kmx-k">
          K (2–10)
          <input
            type="number"
            min={K_MIN}
            max={K_MAX}
            step={1}
            value={kText}
            onChange={(e) => setKText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') start();
            }}
            aria-invalid={!valid}
          />
        </label>
        <button type="button" className="btn btn-primary" onClick={start} disabled={!valid}>
          <FiPlay aria-hidden /> Run
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setHistory({ kmeans: [], kmeanspp: [] })}
          disabled={!all.length}
        >
          Clear loss plots
        </button>
        {!valid && <span className="kmx-invalid">Enter a whole number from 2 to 10.</span>}
      </div>

      <div className="kmx-cols">
        {ALGOS.map((algo) => (
          <AlgoColumn
            key={algo.id}
            algo={algo}
            run={run}
            colors={colors}
            history={history[algo.id]}
            rivalHistory={history[algo.id === 'kmeans' ? 'kmeanspp' : 'kmeans']}
            rivalTitle={algo.id === 'kmeans' ? 'K-Means++' : 'K-Means'}
            yMax={yMax}
            onConverged={onConverged}
          />
        ))}
      </div>

      <p className="demo-note kmx-note">
        Data: the 300 two-dimensional samples from the course assignment. <strong>Loss</strong> is the sum of
        squared distances from every point to its centroid. A run stops when no centroid coordinate moves more
        than 10<sup>-4</sup> in an iteration, the <code>np.allclose(atol=1e-4)</code> test from the original
        Python.
      </p>
    </div>
  );
}

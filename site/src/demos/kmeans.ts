export type Point = { x: number; y: number };

export function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function euclid2(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function generateBlobs(seed: number, clusters = 5, perCluster = 36): Point[] {
  const rand = mulberry32(seed);
  const points: Point[] = [];
  for (let c = 0; c < clusters; c++) {
    const cx = 14 + rand() * 72;
    const cy = 14 + rand() * 72;
    for (let i = 0; i < perCluster; i++) {
      const u = Math.max(1e-6, rand());
      const v = rand();
      const r = Math.sqrt(-2 * Math.log(u)) * 4.1;
      const theta = 2 * Math.PI * v;
      points.push({ x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) });
    }
  }
  return points;
}

export function assignLabels(points: Point[], centers: Point[]): number[] {
  return points.map((p) => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < centers.length; i++) {
      const d = euclid2(p, centers[i]);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  });
}

export function updateMeans(points: Point[], labels: number[], k: number, fallback: Point[]): Point[] {
  const sums = Array.from({ length: k }, () => ({ x: 0, y: 0, n: 0 }));
  points.forEach((p, i) => {
    const bucket = sums[labels[i]];
    bucket.x += p.x;
    bucket.y += p.y;
    bucket.n += 1;
  });
  return sums.map((s, i) => (s.n ? { x: s.x / s.n, y: s.y / s.n } : { ...fallback[i] }));
}

export function sseLoss(points: Point[], labels: number[], centers: Point[]) {
  return points.reduce((acc, p, i) => acc + euclid2(p, centers[labels[i]]), 0);
}

export function runKMeans(points: Point[], initCenters: Point[], maxIter = 40, tol = 1e-4) {
  let centers = initCenters.map((c) => ({ ...c }));
  let labels = assignLabels(points, centers);
  let iterations = 0;
  for (; iterations < maxIter; iterations++) {
    const next = updateMeans(points, labels, centers.length, centers);
    const moved = next.some((c, i) => Math.hypot(c.x - centers[i].x, c.y - centers[i].y) > tol);
    centers = next;
    labels = assignLabels(points, centers);
    if (!moved) break;
  }
  return {
    centers,
    labels,
    loss: sseLoss(points, labels, centers),
    iterations: iterations + 1,
  };
}

export type InitMode = 'random' | 'maxavg' | 'canonical';

export const INIT_MODES: { id: InitMode; label: string; short: string }[] = [
  { id: 'random', label: 'Random init', short: 'Random' },
  { id: 'maxavg', label: 'K-Means++ (max-avg)', short: 'Max-avg ++' },
  { id: 'canonical', label: 'K-Means++ (canonical)', short: 'Canonical ++' },
];

export function randomInit(points: Point[], k: number, rand: () => number): Point[] {
  const used = new Set<number>();
  const centers: Point[] = [];
  while (centers.length < k && used.size < points.length) {
    const i = Math.floor(rand() * points.length);
    if (!used.has(i)) {
      used.add(i);
      centers.push({ ...points[i] });
    }
  }
  return centers;
}

/**
 * Course K-Means++ variant (MCS Portfolio Project #1): the first centroid is a random
 * data point, and every later centroid is the data point that MAXIMIZES the average
 * distance to all already-chosen centroids. Deterministic after the first pick.
 */
export function kmeansPlusPlusMaxAvg(points: Point[], k: number, rand: () => number): Point[] {
  const first = Math.floor(rand() * points.length);
  const chosen = new Set<number>([first]);
  const centers: Point[] = [{ ...points[first] }];
  while (centers.length < k && chosen.size < points.length) {
    let bestI = -1;
    let bestAvg = -1;
    for (let i = 0; i < points.length; i++) {
      if (chosen.has(i)) continue;
      const p = points[i];
      const avg = centers.reduce((s, c) => s + Math.sqrt(euclid2(p, c)), 0) / centers.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestI = i;
      }
    }
    if (bestI < 0) break;
    chosen.add(bestI);
    centers.push({ ...points[bestI] });
  }
  return centers;
}

/**
 * Canonical K-Means++ (Arthur and Vassilvitskii, 2007): the first centroid is a random
 * data point, and each later centroid is sampled with probability proportional to
 * D(x)^2 - the squared distance to the NEAREST already-chosen centroid. Randomized, so
 * far points are favoured without always landing on the single most extreme outlier.
 */
export function kmeansPlusPlusCanonical(points: Point[], k: number, rand: () => number): Point[] {
  const first = Math.floor(rand() * points.length);
  const centers: Point[] = [{ ...points[first] }];
  const d2 = points.map((p) => euclid2(p, centers[0]));
  while (centers.length < k) {
    const total = d2.reduce((a, b) => a + b, 0);
    let pick = points.length - 1;
    if (total <= 0) {
      pick = Math.floor(rand() * points.length);
    } else {
      let target = rand() * total;
      for (let i = 0; i < points.length; i++) {
        target -= d2[i];
        if (target <= 0) {
          pick = i;
          break;
        }
      }
    }
    centers.push({ ...points[pick] });
    for (let i = 0; i < points.length; i++) {
      const d = euclid2(points[i], points[pick]);
      if (d < d2[i]) d2[i] = d;
    }
  }
  return centers;
}

export function initCentroids(mode: InitMode, points: Point[], k: number, rand: () => number): Point[] {
  if (mode === 'random') return randomInit(points, k, rand);
  if (mode === 'canonical') return kmeansPlusPlusCanonical(points, k, rand);
  return kmeansPlusPlusMaxAvg(points, k, rand);
}

/**
 * One rendered beat of the algorithm. `assign` recolors points against the current
 * centroids; `update` glides the centroids to their cluster means. Splitting the two
 * is what makes the loop legible instead of one blended jump.
 */
export type Frame = {
  phase: 'init' | 'assign' | 'update';
  iteration: number;
  centers: Point[];
  labels: number[];
  /** Centroid positions before this frame's move - the "from" end of the glide. */
  prevCenters: Point[];
  /** SSE against the centroids shown in this frame. Null on init (no assignment yet). */
  sse: number | null;
};

/**
 * Records the full run as an ordered list of frames, starting with the initialization
 * frame (centroids placed, points still uncolored) so the seeding strategy is visible
 * before any optimization hides it.
 */
export function recordFrames(points: Point[], initCenters: Point[], maxIter = 40, tol = 1e-4): Frame[] {
  const k = initCenters.length;
  let centers = initCenters.map((c) => ({ ...c }));
  const frames: Frame[] = [
    {
      phase: 'init',
      iteration: 0,
      centers: centers.map((c) => ({ ...c })),
      labels: points.map(() => -1),
      prevCenters: centers.map((c) => ({ ...c })),
      sse: null,
    },
  ];

  let labels: number[];
  for (let iter = 1; iter <= maxIter; iter++) {
    labels = assignLabels(points, centers);
    frames.push({
      phase: 'assign',
      iteration: iter,
      centers: centers.map((c) => ({ ...c })),
      labels: [...labels],
      prevCenters: centers.map((c) => ({ ...c })),
      sse: sseLoss(points, labels, centers),
    });

    const next = updateMeans(points, labels, k, centers);
    const moved = next.some((c, i) => Math.hypot(c.x - centers[i].x, c.y - centers[i].y) > tol);
    frames.push({
      phase: 'update',
      iteration: iter,
      centers: next.map((c) => ({ ...c })),
      labels: [...labels],
      prevCenters: centers.map((c) => ({ ...c })),
      sse: sseLoss(points, labels, next),
    });
    centers = next;
    if (!moved) break;
  }
  return frames;
}

/** Per-iteration SSE, measured after each update - the monotonically decreasing curve. */
export function sseCurve(frames: Frame[]): { iteration: number; sse: number }[] {
  return frames
    .filter((f) => f.phase === 'update' && f.sse !== null)
    .map((f) => ({ iteration: f.iteration, sse: f.sse as number }));
}

/** Centroid trails: one polyline per centroid across every frame in the run. */
export function centroidTrails(frames: Frame[]): Point[][] {
  const k = frames[0]?.centers.length ?? 0;
  const trails: Point[][] = Array.from({ length: k }, () => []);
  frames.forEach((f) => {
    f.centers.forEach((c, i) => {
      const trail = trails[i];
      const last = trail[trail.length - 1];
      if (!last || last.x !== c.x || last.y !== c.y) trail.push({ ...c });
    });
  });
  return trails;
}

export function elbowCurve(
  points: Point[],
  initForK: (k: number) => Point[],
  kMin = 2,
  kMax = 8,
) {
  const losses: { k: number; loss: number }[] = [];
  for (let k = kMin; k <= kMax; k++) {
    losses.push({ k, loss: runKMeans(points, initForK(k)).loss });
  }
  return losses;
}

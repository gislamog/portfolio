import { describe, expect, it } from 'vitest';
import {
  assignLabels,
  centroidTrails,
  elbowCurve,
  generateBlobs,
  initCentroids,
  kmeansPlusPlusCanonical,
  kmeansPlusPlusMaxAvg,
  mulberry32,
  randomInit,
  recordFrames,
  runKMeans,
  sseCurve,
  sseLoss,
} from './kmeans';

describe('kmeans', () => {
  it('assigns each point to the nearest centroid', () => {
    const labels = assignLabels(
      [{ x: 0, y: 0 }, { x: 10, y: 0 }],
      [{ x: 1, y: 0 }, { x: 9, y: 0 }],
    );
    expect(labels).toEqual([0, 1]);
  });

  it('reduces SSE on well-separated blobs', () => {
    const points = generateBlobs(7, 3, 20);
    const rand = mulberry32(3);
    const init = randomInit(points, 3, rand);
    const before = sseLoss(points, assignLabels(points, init), init);
    const result = runKMeans(points, init);
    expect(result.loss).toBeLessThanOrEqual(before);
    expect(result.centers).toHaveLength(3);
  });

  it('places later ++ centroids away from the first', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0.2, y: 0 },
      { x: 20, y: 0 },
      { x: 20.2, y: 0 },
    ];
    const centers = kmeansPlusPlusMaxAvg(points, 2, () => 0);
    expect(centers).toHaveLength(2);
    const spread = Math.hypot(centers[0].x - centers[1].x, centers[0].y - centers[1].y);
    expect(spread).toBeGreaterThan(10);
  });

  it('never repeats a centroid in the max-avg variant', () => {
    const points = generateBlobs(5, 3, 10);
    const centers = kmeansPlusPlusMaxAvg(points, 6, mulberry32(1));
    const keys = new Set(centers.map((c) => `${c.x},${c.y}`));
    expect(keys.size).toBe(centers.length);
    expect(centers).toHaveLength(6);
  });

  it('canonical ++ returns k centroids drawn from the data', () => {
    const points = generateBlobs(9, 4, 15);
    const centers = kmeansPlusPlusCanonical(points, 4, mulberry32(12));
    expect(centers).toHaveLength(4);
    centers.forEach((c) => {
      expect(points.some((p) => p.x === c.x && p.y === c.y)).toBe(true);
    });
  });

  it('canonical ++ favours far points over near duplicates', () => {
    // One tight cluster at the origin plus a lone far point. With the first centroid
    // pinned to index 0, D^2 sampling must land on the far point.
    const points = [
      { x: 0, y: 0 },
      { x: 0.01, y: 0 },
      { x: 0.02, y: 0 },
      { x: 50, y: 50 },
    ];
    // First call picks index 0; the second drives the cumulative D^2 draw to the far point.
    const draws = [0, 0.999999];
    let i = 0;
    const centers = kmeansPlusPlusCanonical(points, 2, () => draws[i++] ?? 0);
    expect(centers[0]).toEqual({ x: 0, y: 0 });
    expect(centers[1]).toEqual({ x: 50, y: 50 });
  });

  it('records an init frame followed by assign/update pairs', () => {
    const points = generateBlobs(2, 3, 12);
    const frames = recordFrames(points, initCentroids('maxavg', points, 3, mulberry32(4)));
    expect(frames[0].phase).toBe('init');
    expect(frames[0].sse).toBeNull();
    expect(frames[0].labels.every((l) => l === -1)).toBe(true);
    const phases = frames.slice(1).map((f) => f.phase);
    phases.forEach((phase, i) => {
      expect(phase).toBe(i % 2 === 0 ? 'assign' : 'update');
    });
  });

  it('produces a monotonically decreasing SSE curve', () => {
    const points = generateBlobs(21, 4, 20);
    const frames = recordFrames(points, initCentroids('random', points, 4, mulberry32(8)));
    const curve = sseCurve(frames);
    expect(curve.length).toBeGreaterThan(0);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].sse).toBeLessThanOrEqual(curve[i - 1].sse + 1e-9);
    }
  });

  it('builds one trail per centroid starting at its init position', () => {
    const points = generateBlobs(3, 3, 14);
    const init = initCentroids('canonical', points, 3, mulberry32(6));
    const frames = recordFrames(points, init);
    const trails = centroidTrails(frames);
    expect(trails).toHaveLength(3);
    trails.forEach((trail, i) => {
      expect(trail[0]).toEqual(init[i]);
      expect(trail.length).toBeGreaterThan(0);
    });
  });

  it('dispatches every init mode to k centroids', () => {
    const points = generateBlobs(4, 4, 16);
    (['random', 'maxavg', 'canonical'] as const).forEach((mode) => {
      expect(initCentroids(mode, points, 5, mulberry32(2))).toHaveLength(5);
    });
  });

  it('returns an elbow series for each k', () => {
    const points = generateBlobs(1, 4, 12);
    const rand = mulberry32(2);
    const curve = elbowCurve(points, (k) => randomInit(points, k, rand), 2, 5);
    expect(curve.map((row) => row.k)).toEqual([2, 3, 4, 5]);
  });
});

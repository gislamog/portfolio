import { describe, expect, it } from 'vitest';
import { randomWalkDelta, recentRows } from './demoUtils';

describe('recentRows', () => {
  it('returns newest rows first and reports truncation', () => {
    expect(recentRows([1, 2, 3, 4], 2)).toEqual({
      rows: [4, 3],
      truncated: true,
    });
  });

  it('does not report truncation when all rows fit', () => {
    expect(recentRows([1, 2], 12)).toEqual({
      rows: [2, 1],
      truncated: false,
    });
  });

  it('returns an empty non-truncated view for no samples', () => {
    expect(recentRows([], 12)).toEqual({ rows: [], truncated: false });
  });
});

describe('randomWalkDelta', () => {
  it('scales the random step by step size and speed', () => {
    expect(randomWalkDelta(0.5, 0.03, 2)).toBeCloseTo(0.03);
  });

  it('allows a paused speed of zero', () => {
    expect(randomWalkDelta(0.75, 0.03, 0)).toBe(0);
  });

  it('preserves the current default magnitude at step 0.03 and speed 1', () => {
    expect(randomWalkDelta(1, 0.03, 1)).toBeCloseTo(0.03);
  });
});

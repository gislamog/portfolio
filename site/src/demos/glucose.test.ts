import { describe, expect, it } from 'vitest';
import { meanGlucose, syntheticCgm, timeInRange } from './glucose';

describe('syntheticCgm', () => {
  it('emits 5-minute samples including meal markers', () => {
    const series = syntheticCgm(24, 2);
    expect(series[0].minute).toBe(0);
    expect(series.some((p) => p.meal)).toBe(true);
    expect(series[series.length - 1]?.minute).toBe(24 * 60);
  });

  it('stays mostly in range for the default generator', () => {
    const series = syntheticCgm();
    expect(timeInRange(series)).toBeGreaterThan(0.7);
    expect(meanGlucose(series)).toBeGreaterThan(90);
    expect(meanGlucose(series)).toBeLessThan(160);
  });
});

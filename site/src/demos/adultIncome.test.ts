import { describe, expect, it } from 'vitest';
import { filterAdultRows, generateAdultRows, groupByEducation, incomeShare } from './adultIncome';

describe('adultIncome', () => {
  it('builds a deterministic synthetic table', () => {
    expect(generateAdultRows(3, 10)).toEqual(generateAdultRows(3, 10));
    expect(generateAdultRows(3, 10)).toHaveLength(10);
  });

  it('filters by education and hours', () => {
    const rows = generateAdultRows(4, 80);
    const filtered = filterAdultRows(rows, 'Masters', 'all', 40);
    expect(filtered.every((r) => r.education === 'Masters' && r.hours >= 40)).toBe(true);
  });

  it('groups income share by education', () => {
    const grouped = groupByEducation(generateAdultRows(5, 200));
    expect(grouped).toHaveLength(5);
    expect(incomeShare(generateAdultRows(5, 200))).toBeGreaterThan(0);
    expect(grouped.every((g) => g.share >= 0 && g.share <= 1)).toBe(true);
  });
});

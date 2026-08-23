import { describe, expect, it } from 'vitest';
import { galeShapley, hospitalExample } from './stableMatching';

describe('galeShapley', () => {
  it('matches everyone in the hospital example', () => {
    const { engaged } = galeShapley(
      hospitalExample.proposers,
      hospitalExample.receivers,
      hospitalExample.proposerPrefs,
      hospitalExample.receiverPrefs,
    );
    expect(Object.keys(engaged)).toHaveLength(3);
    expect(new Set(Object.values(engaged)).size).toBe(3);
  });

  it('records propose and accept/reject steps', () => {
    const { steps } = galeShapley(
      hospitalExample.proposers,
      hospitalExample.receivers,
      hospitalExample.proposerPrefs,
      hospitalExample.receiverPrefs,
    );
    expect(steps.some((s) => s.action === 'propose')).toBe(true);
    expect(steps[steps.length - 1]?.engaged).toBeTruthy();
  });
});

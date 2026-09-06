import { describe, expect, it } from 'vitest';
import { HOME_SECTIONS } from './homeStructure';

describe('HOME_SECTIONS', () => {
  it('lists homepage sections in scroll order', () => {
    expect([...HOME_SECTIONS]).toEqual([
      'island',
      'credentials',
      'intro',
      'technical-focus',
      'featured',
    ]);
  });

  it('does not include explore or tech-chips', () => {
    expect(HOME_SECTIONS).not.toContain('explore');
    expect(HOME_SECTIONS).not.toContain('tech-chips');
  });
});

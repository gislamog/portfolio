import { describe, expect, it } from 'vitest';
import { classifyDigit, DIGIT_PROTOS, downsample28to8 } from './mnistLite';

describe('mnistLite', () => {
  it('recognizes each prototype as itself', () => {
    DIGIT_PROTOS.forEach((proto, digit) => {
      expect(classifyDigit(proto).digit).toBe(digit);
    });
  });

  it('downsamples a 28x28 ink blob', () => {
    const pixels = new Array(28 * 28).fill(0);
    for (let y = 4; y < 24; y++) {
      for (let x = 10; x < 14; x++) pixels[y * 28 + x] = 1;
    }
    const small = downsample28to8(pixels);
    expect(small).toHaveLength(64);
    expect(small.some((v) => v > 0)).toBe(true);
  });
});

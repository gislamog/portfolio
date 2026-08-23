import { describe, expect, it } from 'vitest';
import {
  bigintToText,
  egcd,
  findBirthdayCollision,
  fnv1a,
  hideInRgb,
  makeRsaKeys,
  revealFromRgb,
  rsaDecrypt,
  rsaEncrypt,
  textToBigint,
  truncatedHex,
} from './cryptoMath';

describe('cryptoMath', () => {
  it('finds an extended-euclidean inverse for RSA', () => {
    const { gcd, x } = egcd(7n, 40n);
    expect(gcd).toBe(1n);
    expect(((7n * x) % 40n + 40n) % 40n).toBe(1n);
  });

  it('round-trips a small RSA message', () => {
    const { n, e, d } = makeRsaKeys(61n, 53n, 17n);
    const m = 42n;
    expect(rsaDecrypt(rsaEncrypt(m, e, n), d, n)).toBe(m);
  });

  it('encodes short text as an integer and back', () => {
    expect(bigintToText(textToBigint('Hi'))).toBe('Hi');
  });

  it('truncates hashes to a stable hex width', () => {
    expect(truncatedHex(fnv1a('abc'), 4)).toHaveLength(4);
  });

  it('finds a collision on a short truncated hash', () => {
    let s = 1;
    const rand = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    const hit = findBirthdayCollision(3, 's', rand, 20000);
    expect(hit).not.toBeNull();
    expect(hit!.a).not.toBe(hit!.b);
    expect(truncatedHex(fnv1a(hit!.a + 's'), 3)).toBe(hit!.hash);
    expect(truncatedHex(fnv1a(hit!.b + 's'), 3)).toBe(hit!.hash);
  });

  it('hides and reveals a message in red LSBs', () => {
    const pixels = new Uint8ClampedArray(64 * 64 * 4).fill(200);
    const encoded = hideInRgb(pixels, 'ok');
    expect(revealFromRgb(encoded)).toBe('ok');
  });
});

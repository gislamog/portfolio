const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

/** 32-bit FNV-1a, used as a toy hash so collisions are visible in the browser. */
export function fnv1a(text: string): number {
  let hash = FNV_OFFSET;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

export function truncatedHex(hash: number, hexChars: number) {
  const width = Math.max(1, Math.min(8, hexChars));
  const mask = width >= 8 ? 0xffffffff : (1 << (width * 4)) - 1;
  return (hash & mask).toString(16).padStart(width, '0');
}

export function randomAlnum(length: number, rand: () => number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(rand() * chars.length)];
  return out;
}

export function findBirthdayCollision(hexChars: number, salt: string, rand: () => number, maxTries = 80000) {
  const seen = new Map<string, string>();
  for (let i = 0; i < maxTries; i++) {
    const plain = randomAlnum(8, rand);
    const key = truncatedHex(fnv1a(plain + salt), hexChars);
    const prior = seen.get(key);
    if (prior && prior !== plain) return { a: prior, b: plain, hash: key, tries: i + 1 };
    seen.set(key, plain);
  }
  return null;
}

export function egcd(a: bigint, b: bigint): { x: bigint; y: bigint; gcd: bigint } {
  if (b === 0n) return { x: 1n, y: 0n, gcd: a };
  const inner = egcd(b, a % b);
  return { x: inner.y, y: inner.x - (a / b) * inner.y, gcd: inner.gcd };
}

export function modInverse(a: bigint, m: bigint) {
  const { x, gcd } = egcd(((a % m) + m) % m, m);
  if (gcd !== 1n) throw new Error('no inverse');
  return ((x % m) + m) % m;
}

export function modPow(base: bigint, exp: bigint, mod: bigint) {
  let result = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1n;
  }
  return result;
}

export function makeRsaKeys(p: bigint, q: bigint, e = 65537n) {
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const d = modInverse(e, phi);
  return { n, e, d, phi };
}

export function rsaEncrypt(message: bigint, e: bigint, n: bigint) {
  return modPow(message, e, n);
}

export function rsaDecrypt(cipher: bigint, d: bigint, n: bigint) {
  return modPow(cipher, d, n);
}

export function textToBigint(text: string) {
  let n = 0n;
  for (const ch of text) n = (n << 8n) + BigInt(ch.charCodeAt(0));
  return n;
}

export function bigintToText(n: bigint) {
  if (n === 0n) return '';
  const bytes: number[] = [];
  let x = n;
  while (x > 0n) {
    bytes.push(Number(x & 255n));
    x >>= 8n;
  }
  return String.fromCharCode(...bytes.reverse());
}

export function hideInRgb(pixels: Uint8ClampedArray, message: string) {
  const payload = `${message}\0`;
  const next = new Uint8ClampedArray(pixels);
  for (let i = 0; i < payload.length; i++) {
    const code = payload.charCodeAt(i);
    for (let bit = 0; bit < 8; bit++) {
      const pix = (i * 8 + bit) * 4;
      if (pix + 3 >= next.length) throw new Error('message too long for image');
      next[pix] = (next[pix] & 0xfe) | ((code >> bit) & 1);
    }
  }
  return next;
}

export function revealFromRgb(pixels: Uint8ClampedArray, maxChars = 80) {
  let out = '';
  for (let i = 0; i < maxChars; i++) {
    let code = 0;
    for (let bit = 0; bit < 8; bit++) {
      const pix = (i * 8 + bit) * 4;
      if (pix >= pixels.length) return out;
      code |= (pixels[pix] & 1) << bit;
    }
    if (code === 0) break;
    out += String.fromCharCode(code);
  }
  return out;
}

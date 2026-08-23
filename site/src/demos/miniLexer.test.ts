import { describe, expect, it } from 'vitest';
import { tokenize } from './miniLexer';

describe('miniLexer', () => {
  it('classifies keywords, ids, and numbers', () => {
    const kinds = tokenize('if x == 10 then print y;').map((t) => `${t.kind}:${t.lexeme}`);
    expect(kinds).toContain('KEYWORD:if');
    expect(kinds).toContain('ID:x');
    expect(kinds).toContain('OP:==');
    expect(kinds).toContain('NUM:10');
    expect(kinds[kinds.length - 1]).toBe('EOF:');
  });

  it('reads real numbers and tracks line numbers', () => {
    const tokens = tokenize('a\n1.5');
    const real = tokens.find((t) => t.kind === 'REAL');
    expect(real?.lexeme).toBe('1.5');
    expect(real?.line).toBe(2);
  });

  it('marks unknown characters as errors', () => {
    expect(tokenize('@').some((t) => t.kind === 'ERROR' && t.lexeme === '@')).toBe(true);
  });
});

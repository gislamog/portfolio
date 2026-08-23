export type TokenKind =
  | 'KEYWORD'
  | 'ID'
  | 'NUM'
  | 'REAL'
  | 'OP'
  | 'PUNCT'
  | 'ERROR'
  | 'EOF';

export type MiniToken = {
  kind: TokenKind;
  lexeme: string;
  line: number;
};

const KEYWORDS = new Set(['if', 'while', 'do', 'then', 'print']);

export function tokenize(source: string): MiniToken[] {
  const tokens: MiniToken[] = [];
  let i = 0;
  let line = 1;
  const peek = () => source[i] ?? '';
  const take = () => source[i++];

  while (i < source.length) {
    const ch = peek();
    if (ch === '\n') {
      take();
      line += 1;
      continue;
    }
    if (/\s/.test(ch)) {
      take();
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let lex = '';
      while (/[A-Za-z0-9_]/.test(peek())) lex += take();
      tokens.push({ kind: KEYWORDS.has(lex) ? 'KEYWORD' : 'ID', lexeme: lex, line });
      continue;
    }
    if (/\d/.test(ch)) {
      let lex = '';
      while (/\d/.test(peek())) lex += take();
      if (peek() === '.') {
        lex += take();
        while (/\d/.test(peek())) lex += take();
        tokens.push({ kind: 'REAL', lexeme: lex, line });
      } else {
        tokens.push({ kind: 'NUM', lexeme: lex, line });
      }
      continue;
    }
    const two = source.slice(i, i + 2);
    if (['==', '!=', '<=', '>='].includes(two)) {
      tokens.push({ kind: 'OP', lexeme: two, line });
      i += 2;
      continue;
    }
    if ('+-*/<>'.includes(ch)) {
      tokens.push({ kind: 'OP', lexeme: take(), line });
      continue;
    }
    if ('(){};,='.includes(ch)) {
      tokens.push({ kind: 'PUNCT', lexeme: take(), line });
      continue;
    }
    tokens.push({ kind: 'ERROR', lexeme: take(), line });
  }
  tokens.push({ kind: 'EOF', lexeme: '', line });
  return tokens;
}

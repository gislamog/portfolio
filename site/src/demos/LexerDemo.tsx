import { useMemo, useState } from 'react';
import './Demos.css';
import { tokenize } from './miniLexer';

const SAMPLE = `if count >= 10 then
  print total;
while x != 0 do
  x = x - 1.5;
`;

export function LexerDemo() {
  const [source, setSource] = useState(SAMPLE);
  const tokens = useMemo(() => tokenize(source), [source]);

  return (
    <div className="demo-wrap">
      <textarea className="lexer-input" value={source} onChange={(e) => setSource(e.target.value)} rows={7} />
      <div className="token-list">
        {tokens.filter((t) => t.kind !== 'EOF').map((t, i) => (
          <span key={`${t.kind}-${i}-${t.lexeme}`} className={`tok tok-${t.kind.toLowerCase()}`}>
            {t.kind} {t.lexeme}
          </span>
        ))}
      </div>
    </div>
  );
}

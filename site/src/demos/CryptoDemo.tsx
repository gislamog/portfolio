import { useMemo, useState } from 'react';
import './Demos.css';
import { mulberry32 } from './kmeans';
import {
  bigintToText,
  findBirthdayCollision,
  hideInRgb,
  makeRsaKeys,
  revealFromRgb,
  rsaDecrypt,
  rsaEncrypt,
  textToBigint,
} from './cryptoMath';

type Tab = 'rsa' | 'birthday' | 'stego';

function paintCover(message: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 96, 96);
  g.addColorStop(0, '#5eead4');
  g.addColorStop(1, '#93a8f8');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 96, 96);
  ctx.fillStyle = '#12141c';
  ctx.font = '12px monospace';
  ctx.fillText('BMP', 8, 20);
  const img = ctx.getImageData(0, 0, 96, 96);
  const hidden = hideInRgb(img.data, message);
  img.data.set(hidden);
  ctx.putImageData(img, 0, 0);
  return { url: canvas.toDataURL(), pixels: hidden };
}

export function CryptoDemo() {
  const [tab, setTab] = useState<Tab>('rsa');
  const keys = useMemo(() => makeRsaKeys(61n, 53n, 17n), []);
  const [plain, setPlain] = useState('42');
  const [cipher, setCipher] = useState('');
  const [recovered, setRecovered] = useState('');
  const [salt, setSalt] = useState('a7');
  const [bits, setBits] = useState(4);
  const [collision, setCollision] = useState<string>('');
  const [secret, setSecret] = useState('hello');
  const [stego, setStego] = useState<{ url: string; pixels: Uint8ClampedArray } | null>(null);
  const [revealed, setRevealed] = useState('');

  const runRsa = () => {
    const trimmed = plain.trim();
    const asInt = /^\d+$/.test(trimmed);
    const n = asInt ? BigInt(trimmed) : textToBigint(trimmed);
    if (n >= keys.n) {
      setCipher('Message must be smaller than n = 3233. Use a short integer (or a single character).');
      setRecovered('');
      return;
    }
    const c = rsaEncrypt(n, keys.e, keys.n);
    const m = rsaDecrypt(c, keys.d, keys.n);
    setCipher(c.toString());
    setRecovered(asInt ? m.toString() : bigintToText(m));
  };

  const runBirthday = () => {
    const rand = mulberry32(Date.now() % 100000);
    const hit = findBirthdayCollision(bits, salt, rand);
    setCollision(hit
      ? `Collision after ${hit.tries} tries: "${hit.a}" and "${hit.b}" both hash to ${hit.hash}`
      : 'No collision in the trial budget. Increase tries by shortening the hash width.');
  };

  return (
    <div className="demo-wrap">
      <div className="demo-controls">
        <button type="button" className={`btn ${tab === 'rsa' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('rsa')}>RSA</button>
        <button type="button" className={`btn ${tab === 'birthday' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('birthday')}>Birthday hashes</button>
        <button type="button" className={`btn ${tab === 'stego' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('stego')}>LSB stego</button>
      </div>

      {tab === 'rsa' && (
        <div className="csv-panel" style={{ marginTop: '0.75rem' }}>
          <p className="csv-title">Small-prime RSA</p>
          <p className="csv-sub">p=61, q=53, e=17, n=3233. Course work used 200+ bit primes; the browser uses tiny primes so the arithmetic stays interactive.</p>
          <div className="demo-fields" style={{ marginTop: '0.6rem' }}>
            <label>
              Message
              <input value={plain} onChange={(e) => setPlain(e.target.value)} style={{ width: '12rem' }} />
            </label>
          </div>
          <div className="demo-controls">
            <button type="button" className="btn btn-primary" onClick={runRsa}>Encrypt / decrypt</button>
          </div>
          {cipher && <p className="demo-test-result">Cipher: {cipher}<br />Recovered: {recovered}</p>}
        </div>
      )}

      {tab === 'birthday' && (
        <div className="csv-panel" style={{ marginTop: '0.75rem' }}>
          <p className="csv-title">Truncated-hash collision</p>
          <p className="csv-sub">Same idea as the CSE 539 birthday lab, with a toy hash so a collision appears quickly.</p>
          <div className="demo-fields" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
            <label>
              Salt
              <input value={salt} onChange={(e) => setSalt(e.target.value)} />
            </label>
            <label>
              Hex chars
              <input type="number" min={3} max={6} value={bits} onChange={(e) => setBits(Number(e.target.value))} />
            </label>
          </div>
          <div className="demo-controls">
            <button type="button" className="btn btn-primary" onClick={runBirthday}>Find collision</button>
          </div>
          {collision && <p className="demo-test-result">{collision}</p>}
        </div>
      )}

      {tab === 'stego' && (
        <div className="csv-panel" style={{ marginTop: '0.75rem' }}>
          <p className="csv-title">Hide a message in red-channel LSBs</p>
          <div className="demo-fields" style={{ marginTop: '0.6rem' }}>
            <label>
              Secret
              <input value={secret} onChange={(e) => setSecret(e.target.value)} style={{ width: '12rem' }} />
            </label>
          </div>
          <div className="demo-controls">
            <button type="button" className="btn btn-primary" onClick={() => setStego(paintCover(secret))}>Embed</button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!stego}
              onClick={() => stego && setRevealed(revealFromRgb(stego.pixels))}
            >
              Reveal
            </button>
          </div>
          {stego && <img src={stego.url} alt="Cover image with hidden bits" className="stego-preview" />}
          {revealed && <p className="demo-test-result">Recovered: {revealed}</p>}
        </div>
      )}
    </div>
  );
}

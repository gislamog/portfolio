import { useEffect, useRef, useState } from 'react';
import './Demos.css';
import { classifyDigit, downsample28to8 } from './mnistLite';

const DRAW = 280;
const GRID = 28;

export function MnistDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [result, setResult] = useState('Draw a digit, then Predict.');

  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, DRAW, DRAW);
    setResult('Draw a digit, then Predict.');
  };

  useEffect(() => { clear(); }, []);

  const ink = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !drawing.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (DRAW / rect.width);
    const y = (ev.clientY - rect.top) * (DRAW / rect.height);
    ctx.fillStyle = '#eef0f6';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  };

  const predict = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { data } = ctx.getImageData(0, 0, DRAW, DRAW);
    const pixels = new Array(GRID * GRID).fill(0);
    const scale = DRAW / GRID;
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        let acc = 0;
        for (let yy = 0; yy < scale; yy++) {
          for (let xx = 0; xx < scale; xx++) {
            const i = ((Math.floor(y * scale) + yy) * DRAW + Math.floor(x * scale) + xx) * 4;
            acc += data[i];
          }
        }
        pixels[y * GRID + x] = acc / (scale * scale * 255);
      }
    }
    const guess = classifyDigit(downsample28to8(pixels));
    setResult(`Guess: ${guess.digit}  (cosine ${guess.confidence.toFixed(2)} vs 8×8 templates — same spirit as the CSE 575 MNIST lab)`);
  };

  return (
    <div className="demo-wrap">
      <canvas
        ref={canvasRef}
        className="demo-canvas mnist-canvas"
        width={DRAW}
        height={DRAW}
        onPointerDown={(e) => { drawing.current = true; (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId); ink(e); }}
        onPointerMove={ink}
        onPointerUp={() => { drawing.current = false; }}
      />
      <div className="demo-controls">
        <button type="button" className="btn btn-primary" onClick={predict}>Predict</button>
        <button type="button" className="btn btn-ghost" onClick={clear}>Clear</button>
        <span className="demo-stat">{result}</span>
      </div>
    </div>
  );
}

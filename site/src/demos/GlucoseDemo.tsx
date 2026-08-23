import { useMemo } from 'react';
import './Demos.css';
import { meanGlucose, syntheticCgm, timeInRange } from './glucose';

const W = 640;
const H = 220;

export function GlucoseDemo() {
  const series = useMemo(() => syntheticCgm(24, 11), []);
  const maxG = Math.max(...series.map((p) => p.glucose), 200);
  const path = series.map((p, i) => {
    const x = (i / (series.length - 1)) * (W - 24) + 12;
    const y = H - 16 - (p.glucose / maxG) * (H - 36);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="demo-wrap">
      <p className="csv-sub">Synthetic CGM (5-minute samples). Original course files contained patient traces and stay private.</p>
      <svg className="glucose-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Synthetic glucose time series">
        <rect x={12} y={H - 16 - (180 / maxG) * (H - 36)} width={W - 24} height={(110 / maxG) * (H - 36)} fill="rgba(94,234,212,0.12)" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
        {series.filter((p) => p.meal).map((p) => {
          const i = series.indexOf(p);
          const x = (i / (series.length - 1)) * (W - 24) + 12;
          return <circle key={p.minute} cx={x} cy={H - 16 - (p.glucose / maxG) * (H - 36)} r="4" fill="#f472b6" />;
        })}
      </svg>
      <p className="demo-stat">
        Mean {meanGlucose(series).toFixed(0)} mg/dL · time in range {(timeInRange(series) * 100).toFixed(0)}% · pink dots are meals
      </p>
    </div>
  );
}

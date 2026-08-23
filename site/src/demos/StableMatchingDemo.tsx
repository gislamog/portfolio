import { useMemo, useState } from 'react';
import './Demos.css';
import { galeShapley, hospitalExample } from './stableMatching';

export function StableMatchingDemo() {
  const run = useMemo(
    () => galeShapley(
      hospitalExample.proposers,
      hospitalExample.receivers,
      hospitalExample.proposerPrefs,
      hospitalExample.receiverPrefs,
    ),
    [],
  );
  const [step, setStep] = useState(0);
  const current = run.steps[Math.min(step, run.steps.length - 1)];

  return (
    <div className="demo-wrap">
      <p className="csv-sub">Residents propose to hospitals (Gale–Shapley). Step through the matching.</p>
      <div className="match-grid">
        {hospitalExample.proposers.map((r) => (
          <div key={r} className={`match-chip ${current.engaged[r] ? 'on' : ''}`}>
            {r} ? {current.engaged[r] ?? 'free'}
          </div>
        ))}
      </div>
      <p className="demo-test-result">{current.note}</p>
      <div className="demo-controls">
        <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>Reset</button>
        <button type="button" className="btn btn-primary" onClick={() => setStep((s) => Math.min(run.steps.length - 1, s + 1))}>Next step</button>
        <span className="demo-stat">{step + 1} / {run.steps.length}</span>
      </div>
    </div>
  );
}

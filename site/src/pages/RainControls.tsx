import { useState } from 'react';
import { rainDefaults, type RainSettings } from './rainSettings';

const sliders = [
  ['density', 'Fall density', 0, 360, 1],
  ['speed', 'Fall speed', 0.2, 2.5, 0.05],
  ['wind', 'Leftward slant', 0, 1.5, 0.01],
  ['length', 'Streak length', 0.25, 2, 0.05],
  ['thickness', 'Streak thickness', 0.25, 2, 0.05],
  ['opacity', 'Rain opacity', 0, 1, 0.05],
  ['splashFrequency', 'Splash frequency (%)', 0, 100, 1],
  ['splashSize', 'Splash size', 0, 2.5, 0.05],
  ['splashDuration', 'Splash duration', 0.2, 2, 0.05],
  ['lightIntensity', 'Cursor light brightness', 0, 3, 0.05],
  ['lightRadius', 'Cursor light radius', 0.1, 1.5, 0.05],
  ['lightning', 'Lightning per minute', 0, 8, 1],
] as const;

export function RainControls({ settings }: { settings: RainSettings }) {
  const [values, setValues] = useState(() => ({ ...settings }));

  function update(next: RainSettings) {
    Object.assign(settings, next);
    setValues(next);
  }

  return (
    <details className="rain-controls">
      <summary>Rain settings</summary>
      <div className="rain-controls-fields">
        {sliders.map(([key, label, min, max, step]) => (
          <label key={key}>
            <span>{label} <output>{values[key]}</output></span>
            <input type="range" aria-label={label} min={min} max={max} step={step} value={values[key]}
              onChange={(event) => update({ ...values, [key]: event.currentTarget.valueAsNumber })} />
          </label>
        ))}
        {([
          ['rainColor', 'Rain color'],
          ['splashColor', 'Splash color'],
          ['lightColor', 'Cursor light color'],
        ] as const).map(([key, label]) => (
          <label className="rain-color-control" key={key}>
            {label}
            <input type="color" value={values[key]}
              onChange={(event) => update({ ...values, [key]: event.currentTarget.value })} />
          </label>
        ))}
        <button type="button" onClick={() => update({ ...rainDefaults })}>Reset rain settings</button>
      </div>
    </details>
  );
}

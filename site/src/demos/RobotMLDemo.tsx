import { useCallback, useEffect, useRef, useState } from 'react';
import './Demos.css';
import { recentRows } from './demoUtils';

const W = 520;
const H = 420;
const SENSOR_RANGE = 140;
const SENSOR_ANGLES = [66, 33, 0, -33, -66];
const ACTION_REPEAT = 28;
const ROBOT_LEN = 14;
const ROBOT_WID = 10;
const MIN_SAMPLES = 80;
const MIN_COLLISIONS = 12;
const MIN_TEST = 20;

type Sample = { sensors: number[]; action: number; collision: number };
type Wall = { ax: number; ay: number; bx: number; by: number };
type PredictFn = (sensors: number[], action: number) => number;

function wallsForArena(): Wall[] {
  const u = 72;
  const segs: [number, number, number, number][] = [
    [8, 8, W - 8, 8],
    [W - 8, 8, W - 8, H - 8],
    [W - 8, H - 8, 8, H - 8],
    [8, H - 8, 8, 8],
    [u, u, u, H - u],
    [u, H - u, 2 * u, H - u],
    [2 * u, H - u, 2 * u, u],
    [2 * u, u, u, u],
    [W - u, u, W - u, 2 * u],
    [W - u, 2 * u, W - 2 * u, 2 * u],
    [W - 2 * u, 2 * u, W - 2 * u, u],
    [W - 2 * u, u, W - u, u],
    [W - 2 * u, H, W, H - 2 * u],
  ];
  return segs.map(([ax, ay, bx, by]) => ({ ax, ay, bx, by }));
}

function distPointSeg(px: number, py: number, w: Wall) {
  const dx = w.bx - w.ax;
  const dy = w.by - w.ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - w.ax) * dx + (py - w.ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (w.ax + t * dx), py - (w.ay + t * dy));
}

function raycast(x: number, y: number, angleDeg: number, walls: Wall[]) {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  let best = SENSOR_RANGE;
  for (let d = 0; d < SENSOR_RANGE; d += 2) {
    const px = x + dx * d;
    const py = y + dy * d;
    if (px < 4 || px > W - 4 || py < 4 || py > H - 4) {
      best = d;
      break;
    }
    for (const wall of walls) {
      if (distPointSeg(px, py, wall) < 6) {
        best = d;
        break;
      }
    }
    if (best < SENSOR_RANGE) break;
  }
  return best;
}

function robotHitsWall(x: number, y: number, walls: Wall[]) {
  if (x < 18 || x > W - 18 || y < 18 || y > H - 18) return true;
  return walls.some((w) => distPointSeg(x, y, w) < 12);
}

function wanderAction(step: number) {
  const n = Math.sin(step * 0.11) + 0.45 * Math.sin(step * 0.031 + 1.7);
  return Math.max(-5, Math.min(5, Math.round(n * 3.2)));
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createNet() {
  const w1 = Array.from({ length: 24 }, () => Array.from({ length: 6 }, () => rand(-0.35, 0.35)));
  const b1 = Array.from({ length: 24 }, () => 0);
  const w2 = Array.from({ length: 12 }, () => Array.from({ length: 24 }, () => rand(-0.35, 0.35)));
  const b2 = Array.from({ length: 12 }, () => 0);
  const w3 = Array.from({ length: 12 }, () => rand(-0.35, 0.35));
  let b3 = -0.2;
  const relu = (v: number) => Math.max(0, v);
  const sig = (v: number) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, v))));

  function forward(input: number[]) {
    const h1 = w1.map((row, i) => relu(row.reduce((s, w, j) => s + w * input[j], 0) + b1[i]));
    const h2 = w2.map((row, i) => relu(row.reduce((s, w, j) => s + w * h1[j], 0) + b2[i]));
    const z = w3.reduce((s, w, j) => s + w * h2[j], 0) + b3;
    return { h1, h2, out: sig(z) };
  }

  function train(samples: Sample[], epochs: number) {
    const positives = samples.filter((s) => s.collision === 1);
    const negatives = samples.filter((s) => s.collision === 0);
    const lr = 0.035;
    for (let e = 0; e < epochs; e++) {
      // Oversample collisions so the model cannot ignore the rare class
      const batch = shuffle([
        ...positives,
        ...positives,
        ...negatives.slice(0, Math.max(positives.length * 2, 1)),
      ]);
      for (const s of batch) {
        const input = [...s.sensors.map((v) => v / SENSOR_RANGE), s.action / 5];
        const { h1, h2, out } = forward(input);
        const err = out - s.collision;
        const dOut = err * out * (1 - out);
        for (let j = 0; j < 12; j++) w3[j] -= lr * dOut * h2[j];
        b3 -= lr * dOut;
        const d2 = h2.map((h, i) => (h > 0 ? dOut * w3[i] : 0));
        for (let i = 0; i < 12; i++) {
          for (let j = 0; j < 24; j++) w2[i][j] -= lr * d2[i] * h1[j];
          b2[i] -= lr * d2[i];
        }
        const d1 = h1.map((_, i) => (h1[i] > 0 ? w2.reduce((s, row, k) => s + row[i] * d2[k], 0) : 0));
        for (let i = 0; i < 24; i++) {
          for (let j = 0; j < 6; j++) w1[i][j] -= lr * d1[i] * input[j];
          b1[i] -= lr * d1[i];
        }
      }
    }
  }

  function evaluate(samples: Sample[]) {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;
    for (const s of samples) {
      const input = [...s.sensors.map((v) => v / SENSOR_RANGE), s.action / 5];
      const pred = forward(input).out >= 0.5 ? 1 : 0;
      if (pred === 1 && s.collision === 1) tp += 1;
      else if (pred === 1 && s.collision === 0) fp += 1;
      else if (pred === 0 && s.collision === 1) fn += 1;
      else tn += 1;
    }
    const n = samples.length || 1;
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    return {
      tp, fp, fn, tn,
      accuracy: ((tp + tn) / n) * 100,
      precision: precision * 100,
      recall: recall * 100,
    };
  }

  function predict(sensors: number[], action: number) {
    return forward([...sensors.map((v) => v / SENSOR_RANGE), action / 5]).out;
  }

  return { train, evaluate, predict };
}

export function RobotMLDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const walls = useRef(wallsForArena());
  const robot = useRef({ x: W / 2, y: H / 2, angle: 0, sensors: Array(5).fill(SENSOR_RANGE) as number[] });
  const actionRef = useRef(0);
  const stepRef = useRef(0);
  const actionTick = useRef(0);
  const samplesRef = useRef<Sample[]>([]);
  const crashRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const predictRef = useRef<PredictFn | null>(null);
  const modeRef = useRef<'idle' | 'collect' | 'test'>('idle');
  const testStatsRef = useRef({ frames: 0, hits: 0, predictedHits: 0, correct: 0 });
  const [mode, setMode] = useState<'idle' | 'collect' | 'test'>('idle');
  const [collisions, setCollisions] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const [rows, setRows] = useState<Sample[]>([]);
  const [rowsTruncated, setRowsTruncated] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [livePred, setLivePred] = useState<number | null>(null);
  modeRef.current = mode;

  const resetPose = useCallback(() => {
    robot.current = {
      x: W / 2 + (Math.random() - 0.5) * 40,
      y: H / 2 + (Math.random() - 0.5) * 40,
      angle: Math.random() * 360,
      sensors: robot.current.sensors,
    };
    actionRef.current = 0;
    actionTick.current = 0;
  }, []);

  const refreshVisibleRows = useCallback(() => {
    const visible = recentRows(samplesRef.current, 12);
    setRows(visible.rows);
    setRowsTruncated(visible.truncated);
  }, []);

  const draw = useCallback((predicted?: number | null) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const r = robot.current;
    ctx.fillStyle = '#12141c';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    walls.current.forEach((w) => {
      ctx.beginPath();
      ctx.moveTo(w.ax, w.ay);
      ctx.lineTo(w.bx, w.by);
      ctx.stroke();
    });

    const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8'];
    SENSOR_ANGLES.forEach((deg, i) => {
      const a = r.angle + deg;
      const rad = (a * Math.PI) / 180;
      const d = r.sensors[i];
      ctx.strokeStyle = colors[i];
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x + Math.cos(rad) * d, r.y + Math.sin(rad) * d);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    const danger = predicted != null && predicted >= 0.5;
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate((r.angle * Math.PI) / 180);
    ctx.fillStyle = danger ? '#f87171' : '#eef1f8';
    ctx.fillRect(-ROBOT_LEN, -ROBOT_WID, ROBOT_LEN * 2, ROBOT_WID * 2);
    ctx.fillStyle = danger ? '#fecaca' : '#5eead4';
    ctx.fillRect(ROBOT_LEN - 4, -4, 8, 8);
    ctx.restore();

    if (predicted != null) {
      ctx.fillStyle = danger ? '#f87171' : '#5eead4';
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.fillText(`pred ${(predicted * 100).toFixed(0)}%`, r.x + 16, r.y - 12);
    }

    const crash = crashRef.current;
    if (crash && Date.now() - crash.t < 700) {
      const age = (Date.now() - crash.t) / 700;
      ctx.font = `${22 + age * 10}px sans-serif`;
      ctx.globalAlpha = 1 - age;
      ctx.fillText('💥', crash.x - 12, crash.y + 8);
      ctx.globalAlpha = 1;
    }
  }, []);

  useEffect(() => { draw(null); }, [draw]);

  useEffect(() => {
    if (mode === 'idle') return;
    let frame = 0;
    const loop = () => {
      const r = robot.current;
      if (actionTick.current === 0) actionRef.current = wanderAction(stepRef.current);
      actionTick.current += 1;

      r.angle += actionRef.current * 0.9;
      const rad = (r.angle * Math.PI) / 180;
      r.x += Math.cos(rad) * 2.2;
      r.y += Math.sin(rad) * 2.2;
      r.x = Math.max(20, Math.min(W - 20, r.x));
      r.y = Math.max(20, Math.min(H - 20, r.y));
      r.sensors = SENSOR_ANGLES.map((deg) => raycast(r.x, r.y, r.angle + deg, walls.current));

      let pred: number | null = null;
      if (modeRef.current === 'test' && predictRef.current) {
        pred = predictRef.current(r.sensors, actionRef.current);
        setLivePred(pred);
        testStatsRef.current.frames += 1;
      }

      const hit = robotHitsWall(r.x, r.y, walls.current);
      if (hit) {
        crashRef.current = { x: r.x, y: r.y, t: Date.now() };
        if (modeRef.current === 'collect') {
          const sample: Sample = { sensors: [...r.sensors], action: actionRef.current, collision: 1 };
          samplesRef.current = [...samplesRef.current, sample].slice(-800);
          refreshVisibleRows();
          setSampleCount(samplesRef.current.length);
          setCollisions((n) => n + 1);
        } else if (modeRef.current === 'test') {
          testStatsRef.current.hits += 1;
          if (pred != null && pred >= 0.5) {
            testStatsRef.current.predictedHits += 1;
            testStatsRef.current.correct += 1;
          }
        }
        resetPose();
        actionTick.current = 0;
        stepRef.current += 1;
      } else if (actionTick.current >= ACTION_REPEAT) {
        if (modeRef.current === 'collect') {
          const sample: Sample = { sensors: [...r.sensors], action: actionRef.current, collision: 0 };
          samplesRef.current = [...samplesRef.current, sample].slice(-800);
          refreshVisibleRows();
          setSampleCount(samplesRef.current.length);
        } else if (modeRef.current === 'test' && pred != null && pred < 0.5) {
          testStatsRef.current.correct += 1;
        }
        actionTick.current = 0;
        stepRef.current += 1;
      }

      draw(pred);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [mode, draw, refreshVisibleRows, resetPose]);

  const trainAndTest = () => {
    const data = samplesRef.current;
    const hits = data.filter((s) => s.collision === 1).length;
    if (data.length < MIN_SAMPLES) {
      setTestResult(`Need at least ${MIN_SAMPLES} samples (have ${data.length}). Keep collecting.`);
      return;
    }
    if (hits < MIN_COLLISIONS) {
      setTestResult(`Need at least ${MIN_COLLISIONS} collision samples so the model cannot cheat by always predicting safe (have ${hits}).`);
      return;
    }

    const shuffled = shuffle(data);
    const testSize = Math.max(MIN_TEST, Math.floor(data.length * 0.3));
    const test = shuffled.slice(0, testSize);
    const train = shuffled.slice(testSize);
    const net = createNet();
    net.train(train, 40);
    const stats = net.evaluate(test);
    predictRef.current = net.predict;
    testStatsRef.current = { frames: 0, hits: 0, predictedHits: 0, correct: 0 };
    setMode('test');
    setTestResult(
      `Trained on ${train.length}, held-out test ${test.length} (${hits} collision samples in pool). ` +
      `Accuracy ${stats.accuracy.toFixed(1)}% · Precision ${stats.precision.toFixed(1)}% · Recall ${stats.recall.toFixed(1)}%. ` +
      `FP ${stats.fp}, missed collisions ${stats.fn}. Now watching live predictions (robot turns red when the model expects a crash).`
    );
  };

  const stopLiveTest = () => {
    const s = testStatsRef.current;
    setMode('idle');
    setLivePred(null);
    if (s.frames > 0) {
      setTestResult((prev) =>
        `${prev ?? ''} Live run: ${s.hits} collisions, ${s.predictedHits} predicted ahead of impact across ${s.frames} frames.`
      );
    }
  };

  return (
    <div className="demo-wrap robot-lab">
      <div className="robot-lab-main">
        <canvas ref={canvasRef} width={W} height={H} className="demo-canvas robot-canvas" />
        <div className="demo-controls">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setMode((m) => (m === 'collect' ? 'idle' : 'collect'))}
          >
            {mode === 'collect' ? 'Pause collect' : 'Collect data'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={trainAndTest} disabled={mode === 'test'}>
            Test model
          </button>
          {mode === 'test' && (
            <button type="button" className="btn btn-ghost" onClick={stopLiveTest}>Stop live test</button>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setMode('idle');
              samplesRef.current = [];
              setRows([]);
              setRowsTruncated(false);
              setCollisions(0);
              setSampleCount(0);
              setTestResult(null);
              setLivePred(null);
              predictRef.current = null;
              crashRef.current = null;
              resetPose();
              draw(null);
            }}
          >
            Reset
          </button>
          <span className="demo-stat">{collisions} collisions</span>
          <span className="demo-stat">{sampleCount} samples</span>
          {livePred != null && (
            <span className="demo-stat">live {(livePred * 100).toFixed(0)}%</span>
          )}
        </div>
      </div>
      <div className="csv-panel">
        <p className="csv-title">Collected samples</p>
        <p className="csv-sub">s1–s5 sensors, action (−5…5), collision · need {MIN_SAMPLES}+ samples & {MIN_COLLISIONS}+ hits</p>
        <div className="csv-table-wrap">
          <table className="csv-table">
            <thead>
              <tr>
                {['s1', 's2', 's3', 's4', 's5', 'act', 'hit'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7}>Collect data to extract rows.</td></tr>
              ) : (
                <>
                  {rows.map((row, i) => (
                    <tr key={`${i}-${row.sensors.join('-')}-${row.action}`}>
                      {row.sensors.map((s, j) => <td key={j}>{s.toFixed(0)}</td>)}
                      <td>{row.action}</td>
                      <td className={row.collision ? 'hit' : ''}>{row.collision}</td>
                    </tr>
                  ))}
                  {rowsTruncated && (
                    <tr className="csv-ellipsis">
                      <td colSpan={7} aria-label="Earlier samples omitted">…</td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {testResult && <p className="demo-test-result">{testResult}</p>}
    </div>
  );
}

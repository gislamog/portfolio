import { useCallback, useEffect, useRef, useState } from 'react';
import { FiCrosshair } from 'react-icons/fi';
import './Demos.css';
import { recentRows } from './demoUtils';

const W = 520;
const H = 420;
const SENSOR_RANGE = 140;
const SENSOR_ANGLES = [66, 33, 0, -33, -66];
const ACTION_REPEAT = 28;
// Goal seeking re-decides far more often than data collection does. Committing to an
// action for 28 frames is fine for wandering, but too coarse to thread the gaps
// between obstacles, which is what stranded goals behind the closed boxes.
const SEEK_REPEAT = 16;
const ROBOT_LEN = 14;
const ROBOT_WID = 10;
const MIN_SAMPLES = 80;
const MIN_COLLISIONS = 12;
const MIN_TEST = 20;
const DANGER_THRESHOLD = 0.5;   // model says "collision" (matches the 0.5 decision boundary)
const WARN_THRESHOLD = 0.85;    // advisory bar for the "foreseen" credit and the save clear
const SAFE_THRESHOLD = 0.25;    // CSE 571 goal_seeking.py: an action is available if pred < .25
const ACTION_SPACE = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];  // np.arange(-5, 6)
const GOAL_RADIUS = 22;         // arrival test, scaled down from the course 50 for this smaller arena
const DRIVE_TURN = 2.6;
const DRIVE_SPEED = 2.2;
const SPAWN = { x: W / 2, y: H / 2, angle: 0 };

type Sample = { sensors: number[]; action: number; collision: number };
type Wall = { ax: number; ay: number; bx: number; by: number };
type PredictFn = (sensors: number[], action: number) => number;
type Mode = 'idle' | 'collect' | 'test' | 'drive';

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

// The arena has fully closed obstacle boxes. A point can sit in open space by every
// clearance measure and still be sealed inside one, so goals get a reachability test:
// flood fill on a coarse grid from the robot's spawn, blocked by wall crossings.
function buildReachable(walls: Wall[]) {
  const step = 12;
  const cols = Math.ceil(W / step);
  const rows = Math.ceil(H / step);
  const open = (cx: number, cy: number) => {
    const x = cx * step + step / 2;
    const y = cy * step + step / 2;
    if (x < 12 || x > W - 12 || y < 12 || y > H - 12) return false;
    return walls.every((w) => distPointSeg(x, y, w) > 9);
  };
  const seen = new Set<number>();
  const startX = Math.floor(W / 2 / step);
  const startY = Math.floor(H / 2 / step);
  const queue = [startY * cols + startX];
  seen.add(queue[0]);
  while (queue.length) {
    const id = queue.shift() as number;
    const cx = id % cols;
    const cy = Math.floor(id / cols);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const nid = ny * cols + nx;
      if (seen.has(nid) || !open(nx, ny)) continue;
      seen.add(nid);
      queue.push(nid);
    }
  }
  return (x: number, y: number) =>
    seen.has(Math.floor(y / step) * cols + Math.floor(x / step));
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

const COLUMNS = [
  { key: 's1', help: 'Distance reading from the leftmost sensor' },
  { key: 's2', help: 'Distance reading from the left sensor' },
  { key: 's3', help: 'Distance reading from the forward sensor' },
  { key: 's4', help: 'Distance reading from the right sensor' },
  { key: 's5', help: 'Distance reading from the rightmost sensor' },
  { key: 'act', help: 'Steering command in effect: -5 hard left to +5 hard right, 0 straight' },
  { key: 'hit', help: '1 if this sample ended in a collision, 0 if not' },
];

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
  const modeRef = useRef<Mode>('idle');
  const testStatsRef = useRef({ frames: 0, hits: 0, predictedHits: 0, correct: 0 });
  const goalRef = useRef({ x: W * 0.75, y: H * 0.3 });
  const seekStatsRef = useRef({ goals: 0, crashes: 0, vetoed: 0, turnarounds: 0 });
  const [seekStats, setSeekStats] = useState({ goals: 0, crashes: 0, vetoed: 0, turnarounds: 0 });
  const [mode, setMode] = useState<Mode>('idle');
  const [collisions, setCollisions] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const [rows, setRows] = useState<Sample[]>([]);
  const [rowsTruncated, setRowsTruncated] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [livePred, setLivePred] = useState<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const movingRef = useRef(false);
  const warnedRef = useRef(false);
  const driveStatsRef = useRef({ deaths: 0, foreseen: 0, saves: 0, best: 0 });
  const [driveStats, setDriveStats] = useState({ deaths: 0, foreseen: 0, saves: 0, best: 0 });
  modeRef.current = mode;

  // Spread goals across the whole arena instead of letting them pool in the big
  // open room: walk a shuffled grid of cells and place inside whichever comes next,
  // so tight corridors and corners get their turn too.
  const goalCellRef = useRef<number[]>([]);
  const reachableRef = useRef<((x: number, y: number) => boolean) | null>(null);
  const moveGoal = useCallback(() => {
    const cols = 4;
    const rows = 3;
    if (goalCellRef.current.length === 0) {
      goalCellRef.current = shuffle([...Array(cols * rows).keys()]);
    }
    const cellW = (W - 48) / cols;
    const cellH = (H - 48) / rows;
    if (!reachableRef.current) reachableRef.current = buildReachable(walls.current);
    const isReachable = reachableRef.current;

    // Try cells in order until one has a spot the robot can actually occupy
    for (let attempt = 0; attempt < cols * rows; attempt++) {
      const cell = goalCellRef.current.shift();
      if (cell === undefined) break;
      goalCellRef.current.push(cell);
      const cx0 = 24 + (cell % cols) * cellW;
      const cy0 = 24 + Math.floor(cell / cols) * cellH;

      let best: { x: number; y: number } | null = null;
      let bestClear = 0;
      for (let i = 0; i < 24; i++) {
        const cx = rand(cx0 + 10, cx0 + cellW - 10);
        const cy = rand(cy0 + 10, cy0 + cellH - 10);
        let clearance = Infinity;
        for (const deg of [0, 45, 90, 135, 180, 225, 270, 315]) {
          clearance = Math.min(clearance, raycast(cx, cy, deg, walls.current));
        }
        if (clearance > bestClear && isReachable(cx, cy)) {
          bestClear = clearance;
          best = { x: cx, y: cy };
        }
      }
      // GOAL_RADIUS is the arrival test, so the goal only needs room for the robot
      if (best && bestClear > 18) {
        goalRef.current = best;
        return;
      }
    }
    goalRef.current = { x: W / 2, y: H / 2 };
  }, []);

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

  const respawnDefault = useCallback(() => {
    robot.current = {
      x: SPAWN.x,
      y: SPAWN.y,
      angle: SPAWN.angle,
      sensors: SENSOR_ANGLES.map((deg) => raycast(SPAWN.x, SPAWN.y, SPAWN.angle + deg, walls.current)),
    };
    actionRef.current = 0;
    actionTick.current = 0;
  }, []);

  const refreshVisibleRows = useCallback(() => {
    const visible = recentRows(samplesRef.current, 9);
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

    if (modeRef.current === 'test') {
      const g = goalRef.current;
      ctx.save();
      ctx.strokeStyle = '#5eead4';
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(g.x, g.y, GOAL_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#5eead4';
      ctx.beginPath();
      ctx.arc(g.x, g.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const danger = predicted != null && predicted >= DANGER_THRESHOLD;
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate((r.angle * Math.PI) / 180);
    ctx.fillStyle = danger ? '#f87171' : '#eef1f8';
    ctx.fillRect(-ROBOT_LEN, -ROBOT_WID, ROBOT_LEN * 2, ROBOT_WID * 2);
    ctx.fillStyle = danger ? '#fecaca' : '#5eead4';
    ctx.fillRect(ROBOT_LEN - 4, -4, 8, 8);
    ctx.restore();

    if (predicted != null) {
      const pct = predicted * 100;
      const label = `pred ${pct.toFixed(0)}%`;
      ctx.font = '12px JetBrains Mono, monospace';
      const tw = ctx.measureText(label).width;
      const padX = 5;
      const padY = 3;
      const boxW = tw + padX * 2;
      const boxH = 16;

      // Prefer up-right of the robot, but flip/clamp so the label never leaves the arena
      let bx = r.x + 16;
      let by = r.y - 12 - boxH + padY;
      if (bx + boxW > W - 4) bx = r.x - 16 - boxW;
      bx = Math.max(4, Math.min(W - 4 - boxW, bx));
      by = Math.max(4, Math.min(H - 4 - boxH, by));

      ctx.fillStyle = 'rgba(6, 8, 14, 0.72)';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = danger ? 'rgba(248,113,113,0.55)' : 'rgba(94,234,212,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5, boxW - 1, boxH - 1);
      ctx.fillStyle = danger ? '#fca5a5' : '#5eead4';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, bx + padX, by + boxH / 2);
      ctx.textBaseline = 'alphabetic';

      if (modeRef.current === 'drive' || modeRef.current === 'test') {
        // Risk gauge so the score is readable wherever the player has driven
        const gw = 132;
        const gh = 10;
        const gx = W - gw - 14;
        const gy = 16;
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(gx - 8, gy - 12, gw + 16, gh + 34);
        ctx.fillStyle = '#9aa4b8';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText('collision risk', gx, gy - 2);
        ctx.fillStyle = '#2a2f3d';
        ctx.fillRect(gx, gy + 6, gw, gh);
        const hue = 160 - Math.min(1, predicted) * 160;
        ctx.fillStyle = `hsl(${hue}, 72%, 55%)`;
        ctx.fillRect(gx, gy + 6, gw * Math.min(1, predicted), gh);
        ctx.fillStyle = danger ? '#fca5a5' : '#5eead4';
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.fillText(`${pct.toFixed(1)}%`, gx, gy + 32);
      }
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
    if (mode !== 'drive') {
      keysRef.current.clear();
      return;
    }
    const TRACKED = new Set([
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space',
    ]);
    const down = (e: KeyboardEvent) => {
      if (!TRACKED.has(e.code)) return;
      e.preventDefault();
      keysRef.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => {
      if (!TRACKED.has(e.code)) return;
      e.preventDefault();
      keysRef.current.delete(e.code);
    };
    const blur = () => keysRef.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [mode]);

  useEffect(() => {
    if (mode === 'idle') return;
    let frame = 0;
    const loop = () => {
      const r = robot.current;
      const driving = modeRef.current === 'drive';

      if (driving) {
        const keys = keysRef.current;
        const left = keys.has('ArrowLeft') || keys.has('KeyA');
        const right = keys.has('ArrowRight') || keys.has('KeyD');
        const fwd = keys.has('ArrowUp') || keys.has('KeyW');
        const back = keys.has('ArrowDown') || keys.has('KeyS');
        const brake = keys.has('Space');

        // Steering maps to the same action units (-5..5) the model was trained on
        const turn = (right ? 1 : 0) - (left ? 1 : 0);
        actionRef.current = Math.max(-5, Math.min(5, Math.round(turn * 5)));
        r.angle += turn * DRIVE_TURN;

        // Player-controlled only: the robot holds still until a key is pressed
        const throttle = brake ? 0 : fwd ? 1 : back ? -0.6 : 0;
        const rad = (r.angle * Math.PI) / 180;
        r.x += Math.cos(rad) * DRIVE_SPEED * throttle;
        r.y += Math.sin(rad) * DRIVE_SPEED * throttle;
        movingRef.current = throttle !== 0 || turn !== 0;
      } else if (modeRef.current === 'test' && predictRef.current) {
        // Goal seeking, ported from CSE 571 goal_seeking.py: score every action in
        // the space, keep only those the model calls safe, then take the survivor
        // closest to what Seek wants. The model is a veto over steering, not a driver.
        const g = goalRef.current;
        const seekX = g.x - r.x;
        const seekY = g.y - r.y;

        if (Math.hypot(seekX, seekY) < GOAL_RADIUS) {
          const st = seekStatsRef.current;
          st.goals += 1;
          setSeekStats({ ...st });
          moveGoal();
        } else if (actionTick.current === 0) {
          const predict = predictRef.current;
          const available = ACTION_SPACE.filter(
            (a) => predict(r.sensors, a) < SAFE_THRESHOLD,
          );
          const st = seekStatsRef.current;
          st.vetoed += ACTION_SPACE.length - available.length;

          if (available.length === 0) {
            // Every heading looks dangerous: turn_robot_around()
            r.angle += 180;
            st.turnarounds += 1;
            setSeekStats({ ...st });
          } else {
            // Seek's desired turn, expressed in the same -5..5 action units
            let diff = ((Math.atan2(seekY, seekX) * 180) / Math.PI - r.angle) % 360;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            const desired = Math.max(-5, Math.min(5, Math.round(diff / 9)));
            let closest = available[0];
            for (const a of available) {
              if (Math.abs(desired - a) < Math.abs(desired - closest)) closest = a;
            }
            actionRef.current = closest;
          }
        }

        actionTick.current += 1;
        if (actionTick.current >= SEEK_REPEAT) actionTick.current = 0;
        r.angle += actionRef.current * 0.9;
        const rad = (r.angle * Math.PI) / 180;
        r.x += Math.cos(rad) * 2.2;
        r.y += Math.sin(rad) * 2.2;
      } else {
        if (actionTick.current === 0) actionRef.current = wanderAction(stepRef.current);
        actionTick.current += 1;
        r.angle += actionRef.current * 0.9;
        const rad = (r.angle * Math.PI) / 180;
        r.x += Math.cos(rad) * 2.2;
        r.y += Math.sin(rad) * 2.2;
      }

      // Clamp outside the border hit radius so border contact still registers as a crash
      r.x = Math.max(6, Math.min(W - 6, r.x));
      r.y = Math.max(6, Math.min(H - 6, r.y));
      r.sensors = SENSOR_ANGLES.map((deg) => raycast(r.x, r.y, r.angle + deg, walls.current));

      let pred: number | null = null;
      if ((modeRef.current === 'test' || driving) && predictRef.current) {
        pred = predictRef.current(r.sensors, actionRef.current);
        setLivePred(pred);
        if (driving) {
          const d = driveStatsRef.current;
          if (pred >= WARN_THRESHOLD) {
            warnedRef.current = true;
          } else if (warnedRef.current && pred < WARN_THRESHOLD) {
            // Warning was raised and the player steered clear without crashing
            warnedRef.current = false;
            d.saves += 1;
            setDriveStats({ ...d });
          }
        } else {
          testStatsRef.current.frames += 1;
        }
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
          const st = seekStatsRef.current;
          st.crashes += 1;
          setSeekStats({ ...st });
          if (pred != null && pred >= 0.5) {
            testStatsRef.current.predictedHits += 1;
            testStatsRef.current.correct += 1;
          }
        }

        if (driving) {
          const d = driveStatsRef.current;
          d.deaths += 1;
          // Did the model raise the alarm at any point in the approach to this crash?
          if (warnedRef.current) d.foreseen += 1;
          warnedRef.current = false;
          d.best = 0;
          setDriveStats({ ...d });
          respawnDefault();
          keysRef.current.clear();
        } else {
          resetPose();
          actionTick.current = 0;
          stepRef.current += 1;
        }
      } else if (driving) {
        const d = driveStatsRef.current;
        d.best += 1;
        if (d.best % 15 === 0) setDriveStats({ ...d });
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
  }, [mode, draw, refreshVisibleRows, resetPose, respawnDefault, moveGoal]);

  // Trains on the collected pool. Returns null (and sets a message) when the pool is too thin.
  const fitModel = () => {
    const data = samplesRef.current;
    const hits = data.filter((s) => s.collision === 1).length;
    // Training is never blocked. A thin pool still trains, it just trains badly,
    // which is the point: the user can watch quality improve as data grows.
    if (data.length === 0) {
      return { error: 'No samples yet. Click "Collect data" to generate some.' } as const;
    }
    const thin = data.length < MIN_SAMPLES || hits < MIN_COLLISIONS;
    const shuffled = shuffle(data);
    // Hold back 30%, and never let the MIN_TEST floor starve training: it only
    // raises the test set while at least half the pool still remains to train on.
    const split = Math.max(1, Math.floor(data.length * 0.3));
    const testSize = Math.min(Math.max(MIN_TEST, split), Math.floor(data.length / 2));
    const test = shuffled.slice(0, testSize);
    const trainSet = shuffled.slice(testSize);
    const net = createNet();
    net.train(trainSet, 40);
    predictRef.current = net.predict;
    return {
      error: null, stats: net.evaluate(test), trainSize: trainSet.length,
      testSize: test.length, hits, total: data.length, thin,
    } as const;
  };

  // Reachable only from the takeover overlay in test mode, so a trained model exists
  const startDrive = () => {
    if (!predictRef.current) return;
    driveStatsRef.current = { deaths: 0, foreseen: 0, saves: 0, best: 0 };
    setDriveStats({ deaths: 0, foreseen: 0, saves: 0, best: 0 });
    warnedRef.current = false;
    respawnDefault();
    setMode('drive');
  };

  const trainAndTest = () => {
    const fit = fitModel();
    if (fit.error) {
      setTestResult(fit.error);
      return;
    }
    const { stats, trainSize, testSize, hits, total, thin } = fit;
    testStatsRef.current = { frames: 0, hits: 0, predictedHits: 0, correct: 0 };
    seekStatsRef.current = { goals: 0, crashes: 0, vetoed: 0, turnarounds: 0 };
    setSeekStats({ goals: 0, crashes: 0, vetoed: 0, turnarounds: 0 });
    moveGoal();
    setMode('test');
    const quality = thin
      ? `Thin data (target ${MIN_SAMPLES}+ samples and ${MIN_COLLISIONS}+ collisions for this hand-driven demo; the original coursework trained on ~11,000). Expect an unreliable model. Collect more, then test again to watch these numbers improve.`
      : 'Data pool meets the target for this demo, so these numbers should be reasonably stable (the original coursework used a much larger ~11,000-sample dataset).';
    setTestResult(
      `All ${total} samples used: ${trainSize} to train, ${testSize} held back to score it ` +
      `(${Math.round((trainSize / total) * 100)}/${Math.round((testSize / total) * 100)} split, nothing discarded). ${hits} of the ${total} are collisions. ` +
      `Accuracy ${stats.accuracy.toFixed(1)}% · Precision ${stats.precision.toFixed(1)}% · Recall ${stats.recall.toFixed(1)}%. ` +
      `False alarms ${stats.fp}, missed collisions ${stats.fn}. ${quality}`
    );
  };

  const stopLiveTest = () => {
    const s = testStatsRef.current;
    const k = seekStatsRef.current;
    setMode('idle');
    setLivePred(null);
    if (s.frames > 0 || k.goals > 0 || k.crashes > 0) {
      setTestResult((prev) =>
        `${prev ?? ''} Goal seeking: ${k.goals} goals reached, ${k.crashes} crashes, ${k.turnarounds} turnarounds (no action scored under ${(SAFE_THRESHOLD * 100).toFixed(0)}% risk).`
      );
    }
  };

  return (
    <div className="demo-wrap robot-lab">
      <div className="robot-lab-main">
        <div className="robot-stage">
          <canvas ref={canvasRef} width={W} height={H} className="demo-canvas robot-canvas" />
          {mode === 'test' && (
            <button
              type="button"
              className="takeover-overlay"
              onClick={startDrive}
              title="Steer Yourself"
              aria-label="Steer Yourself"
            >
              <span className="takeover-badge">
                <FiCrosshair aria-hidden="true" />
              </span>
              <span className="takeover-label">Steer Yourself</span>
            </button>
          )}
        </div>
        <div className="demo-controls">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setMode((m) => (m === 'collect' ? 'idle' : 'collect'))}
          >
            {mode === 'collect' ? 'Pause collect' : 'Collect data'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={trainAndTest} disabled={mode === 'test' || mode === 'drive'}>
            Goal seeking
          </button>
          {mode === 'test' && (
            <button type="button" className="btn btn-ghost" onClick={stopLiveTest}>Stop</button>
          )}
          {mode === 'drive' && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                // Hand the arena back to the auto-wander policy under live prediction
                keysRef.current.clear();
                movingRef.current = false;
                warnedRef.current = false;
                resetPose();
                setMode('test');
              }}
            >
              Release control
            </button>
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
              driveStatsRef.current = { deaths: 0, foreseen: 0, saves: 0, best: 0 };
              setDriveStats({ deaths: 0, foreseen: 0, saves: 0, best: 0 });
              warnedRef.current = false;
              movingRef.current = false;
              keysRef.current.clear();
              resetPose();
              draw(null);
            }}
          >
            Reset
          </button>
          {livePred != null && (
            <span className="demo-stat">live {(livePred * 100).toFixed(0)}%</span>
          )}
          {mode === 'test' && (
            <>
              <span className="demo-stat">{seekStats.goals} goals</span>
              <span className="demo-stat">{seekStats.crashes} crashes</span>
              <span
                className="demo-stat"
                title={`Times every action scored at or above ${(SAFE_THRESHOLD * 100).toFixed(0)}% risk, so the robot turned around`}
              >
                {seekStats.turnarounds} turnarounds
              </span>
            </>
          )}
          {mode === 'drive' && (
            <>
              <span className="demo-stat">{driveStats.deaths} deaths</span>
              <span
                className="demo-stat"
                title={`Crashes where risk crossed ${(WARN_THRESHOLD * 100).toFixed(0)}% before impact`}
              >
                {driveStats.foreseen} foreseen
              </span>
              <span
                className="demo-stat"
                title={`Times risk crossed ${(WARN_THRESHOLD * 100).toFixed(0)}% and then fell back below it without a crash`}
              >
                {driveStats.saves} saves
              </span>
            </>
          )}
        </div>
      </div>
      {mode === 'drive' && (
        <p className="drive-hint">
          <span className="keycap">W</span><span className="keycap">A</span>
          <span className="keycap">S</span><span className="keycap">D</span>
          <span className="keycap">Space</span>
          The robot moves only while you hold a key. The trained model scores your collision risk live. Crash and you respawn at center.
        </p>
      )}
      {mode === 'drive' && (
        <p className="drive-note">
          <strong>Try reversing into a wall.</strong> The risk score stays low and the robot
          crashes anyway. Every training sample was collected driving forward, and the action
          feature only encodes steering, not direction of travel, so reverse is a state the
          model has never seen and cannot represent. Its confident "safe" reading is
          confabulation, not knowledge. This is what distribution shift looks like from
          the inside.
        </p>
      )}
      <div className="csv-panel">
        <p className="csv-title">Collected sensor data</p>
        <p className="csv-sub">
          <span className={sampleCount < MIN_SAMPLES || collisions < MIN_COLLISIONS ? 'pool-thin' : 'pool-ok'}>
            {sampleCount} samples, {collisions} hits
          </span>
          <span className="csv-target">
            (recommended: {MIN_SAMPLES}+ samples, {MIN_COLLISIONS}+ hits, for a demo you can hand-drive in a few minutes;
            the original coursework trained on ~11,000 samples)
          </span>
        </p>
        <div className="csv-table-wrap">
          <table className="csv-table">
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.key} title={c.help}>{c.key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td className="csv-empty" colSpan={7}>Collect data to extract rows.</td></tr>
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
        <ul className="csv-legend">
          <li><strong>s1–s5</strong> sensor distances, left to right (s3 straight ahead)</li>
          <li><strong>act</strong> steering input (−5 left … +5 right)</li>
          <li><strong>hit</strong> 1 if this sample crashed</li>
        </ul>
      </div>
      {testResult && <p className="demo-test-result">{testResult}</p>}
    </div>
  );
}

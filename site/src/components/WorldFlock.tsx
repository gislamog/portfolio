import { useEffect, useRef, useState } from 'react';

type Mode = 'roost' | 'follow' | 'flee';

/** Cylian.org Reynolds boids — slider values requested for this hero. */
const FLOCK_SIZE = 20;
const PERCEPTION_RADIUS = 100;
const SEPARATION_RADIUS = 56;
const MAX_SPEED = 1;
const MAX_FORCE = 0.1;
const SEPARATION_WEIGHT = 1.25;
const ALIGNMENT_WEIGHT = 0.9;
const COHESION_WEIGHT = 0.55;

/** Product overlay: attract to pointer (cylian predator is flee-only). */
const SEEK_WEIGHT = 1.35;
const FLEE_SPEED = 5.4;
/** Drawn height of each silhouette (side-view SVGs are portrait). */
const SPRITE_H = 34;
/** Idle roost cloud — wide enough that 48px sprites don't stack. */
const ROOST_RX = 220;
const ROOST_RY = 90;
const HOME_JITTER = 95;

class Vector2D {
  x: number;
  y: number;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  add(v: Vector2D) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  sub(v: Vector2D) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  mult(n: number) {
    this.x *= n;
    this.y *= n;
    return this;
  }
  div(n: number) {
    if (n !== 0) {
      this.x /= n;
      this.y /= n;
    }
    return this;
  }
  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalize() {
    const m = this.mag();
    if (m > 0) this.div(m);
    return this;
  }
  limit(max: number) {
    if (this.mag() > max) this.normalize().mult(max);
    return this;
  }
  setMag(n: number) {
    return this.normalize().mult(n);
  }
  dist(v: Vector2D) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  copy() {
    return new Vector2D(this.x, this.y);
  }
  static fromAngle(angle: number) {
    return new Vector2D(Math.cos(angle), Math.sin(angle));
  }
  static random(mag = 1) {
    return Vector2D.fromAngle(Math.random() * Math.PI * 2).mult(mag);
  }
  static sub(a: Vector2D, b: Vector2D) {
    return new Vector2D(a.x - b.x, a.y - b.y);
  }
}

type Bird = {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  phase: number;
  scale: number;
  /** Personal offset from the shared roost center — keeps a cloud, not a ring. */
  roostOff: Vector2D;
  flee: Vector2D;
};

function pointInRect(x: number, y: number, r: DOMRect) {
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function makeBirds(w: number, h: number): Bird[] {
  return Array.from({ length: FLOCK_SIZE }, (_, i) => {
    // Scatter in a cloud (not evenly around an ellipse — that reads as a ring).
    const ox = (Math.random() * 2 - 1) * ROOST_RX;
    const oy = (Math.random() * 2 - 1) * ROOST_RY;
    return {
      position: new Vector2D(w * 0.5 + ox, h * 0.3 + oy),
      velocity: Vector2D.random(MAX_SPEED * 0.55),
      acceleration: new Vector2D(),
      phase: Math.random() * Math.PI * 2,
      scale: 0.82 + (i % 5) * 0.05,
      roostOff: new Vector2D(
        (Math.random() * 2 - 1) * HOME_JITTER,
        (Math.random() * 2 - 1) * (HOME_JITTER * 0.55),
      ),
      flee: new Vector2D(),
    };
  });
}

function neighborsOf(bird: Bird, flock: Bird[], radius: number) {
  const neighbors: Bird[] = [];
  for (const other of flock) {
    if (other === bird) continue;
    if (bird.position.dist(other.position) < radius) neighbors.push(other);
  }
  return neighbors;
}

/** Steer away from crowding. Weighted by 1/distance. */
function separation(bird: Bird, neighbors: Bird[]) {
  const steering = new Vector2D();
  let count = 0;
  for (const other of neighbors) {
    const d = bird.position.dist(other.position);
    if (d < SEPARATION_RADIUS && d > 0) {
      const diff = Vector2D.sub(bird.position, other.position);
      diff.normalize();
      diff.div(d);
      steering.add(diff);
      count++;
    }
  }
  if (count > 0) {
    steering.div(count);
    steering.setMag(MAX_SPEED);
    steering.sub(bird.velocity);
    steering.limit(MAX_FORCE);
  }
  return steering;
}

/** Match average heading of neighbors. */
function alignment(bird: Bird, neighbors: Bird[]) {
  const steering = new Vector2D();
  if (neighbors.length === 0) return steering;
  for (const other of neighbors) steering.add(other.velocity);
  steering.div(neighbors.length);
  steering.setMag(MAX_SPEED);
  steering.sub(bird.velocity);
  steering.limit(MAX_FORCE);
  return steering;
}

/** Steer toward neighbors' center of mass. */
function cohesion(bird: Bird, neighbors: Bird[]) {
  const steering = new Vector2D();
  if (neighbors.length === 0) return steering;
  for (const other of neighbors) steering.add(other.position);
  steering.div(neighbors.length);
  steering.sub(bird.position);
  steering.setMag(MAX_SPEED);
  steering.sub(bird.velocity);
  steering.limit(MAX_FORCE);
  return steering;
}

function seek(bird: Bird, target: Vector2D, maxSpeed: number, maxForce: number) {
  const steering = Vector2D.sub(target, bird.position);
  if (steering.mag() === 0) return steering;
  steering.setMag(maxSpeed);
  steering.sub(bird.velocity);
  steering.limit(maxForce);
  return steering;
}

/** Cylian flee(): away from predator within 2× perception, 1.5× speed / 2× force. */
function fleePredator(bird: Bird, predatorPos: Vector2D) {
  const steering = new Vector2D();
  const d = bird.position.dist(predatorPos);
  if (d < PERCEPTION_RADIUS * 2) {
    const diff = Vector2D.sub(bird.position, predatorPos);
    diff.setMag(MAX_SPEED * 1.5);
    steering.add(diff);
    steering.sub(bird.velocity);
    steering.limit(MAX_FORCE * 2);
  }
  return steering;
}

function applyForce(bird: Bird, force: Vector2D) {
  bird.acceleration.add(force);
}

function loadBird(src: string) {
  const img = new Image();
  img.src = src;
  return img;
}

export function WorldFlock() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdsRef = useRef<Bird[]>([]);
  const mouse = useRef(new Vector2D());
  const lastClient = useRef({ x: 0, y: 0 });
  const mode = useRef<Mode>('roost');
  const scatterUntil = useRef(0);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const canvas = canvasRef.current;
    const stage = canvas?.closest('.sky-stage');
    const world = stage?.querySelector('.world') ?? canvas?.closest('.world');
    if (!canvas || !(world instanceof HTMLElement)) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const base = import.meta.env.BASE_URL;
    const flapImg = loadBird(`${base}images/bird-flap.svg`);
    const glideImg = loadBird(`${base}images/bird-glide.svg`);

    const size = () => {
      const r = world.getBoundingClientRect();
      return { w: r.width, h: r.height, r };
    };

    const resize = () => {
      const { w, h } = size();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let { w, h } = size();
    birdsRef.current = makeBirds(w, h);
    mouse.current = new Vector2D(w * 0.5, h * 0.3);
    resize();

    const assignFlee = () => {
      const { w: ww, h: hh } = size();
      birdsRef.current.forEach((b, i) => {
        const ang =
          Math.atan2(b.position.y - hh * 0.35, b.position.x - ww * 0.5) +
          (i - FLOCK_SIZE / 2) * 0.22;
        const dist = Math.max(ww, hh) * 0.95;
        b.flee.x = ww / 2 + Math.cos(ang) * dist;
        b.flee.y = hh / 2 + Math.sin(ang) * dist - hh * 0.3;
      });
    };

    const setInside = (over: boolean, localX: number, localY: number) => {
      if (over) {
        mode.current = 'follow';
        mouse.current.x = localX;
        mouse.current.y = localY;
        return;
      }
      if (mode.current === 'follow') {
        assignFlee();
        mode.current = 'flee';
      }
    };

    const syncFromClient = (cx: number, cy: number) => {
      lastClient.current = { x: cx, y: cy };
      const { r } = size();
      const over = pointInRect(cx, cy, r);
      setInside(over, cx - r.left, cy - r.top);
    };

    const onMove = (e: PointerEvent) => syncFromClient(e.clientX, e.clientY);
    const onScroll = () => {
      const { x, y } = lastClient.current;
      if (!x && !y && mode.current === 'roost') return;
      syncFromClient(x, y);
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest('a, button, input, textarea, select, label')) return;
      const { r } = size();
      if (!pointInRect(e.clientX, e.clientY, r)) return;
      scatterUntil.current = performance.now() + 900;
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((n) => n.id !== id));
      }, 800);
    };

    let raf = 0;
    const tick = (now: number) => {
      const { w: ww, h: hh } = size();
      if (Math.abs(ww - canvas.clientWidth) > 2 || Math.abs(hh - canvas.clientHeight) > 2) resize();

      const birds = birdsRef.current;
      const current = mode.current;
      const spooked = current === 'follow' && now < scatterUntil.current;
      const cruise = current === 'flee' ? FLEE_SPEED : MAX_SPEED;

      for (const b of birds) {
        const nearby = neighborsOf(b, birds, PERCEPTION_RADIUS);
        const sep = separation(b, nearby).mult(SEPARATION_WEIGHT);
        applyForce(b, sep);

        if (current !== 'flee') {
          applyForce(b, alignment(b, nearby).mult(ALIGNMENT_WEIGHT));
          applyForce(b, cohesion(b, nearby).mult(COHESION_WEIGHT));
        }

        if (current === 'follow' && !spooked) {
          applyForce(b, seek(b, mouse.current, MAX_SPEED, MAX_FORCE).mult(SEEK_WEIGHT));
        } else if (current === 'roost') {
          // One drifting flock center + per-bird offset → loose cloud, not a ring.
          const center = new Vector2D(
            ww * 0.5 + Math.cos(now / 4800) * 36,
            hh * 0.3 + Math.sin(now / 4100) * 18,
          );
          const home = new Vector2D(
            center.x + b.roostOff.x + Math.cos(now / 2600 + b.phase) * 18,
            center.y + b.roostOff.y + Math.sin(now / 2300 + b.phase) * 12,
          );
          applyForce(b, seek(b, home, MAX_SPEED * 0.7, MAX_FORCE * 0.4));
        } else {
          applyForce(b, seek(b, b.flee, FLEE_SPEED, MAX_FORCE * 1.8).mult(2.1));
        }

        if (spooked) {
          applyForce(b, fleePredator(b, mouse.current).mult(2));
        }

        if (current !== 'flee') {
          if (b.position.x < 36) b.acceleration.x += 0.12;
          if (b.position.x > ww - 36) b.acceleration.x -= 0.12;
          if (b.position.y < 48) b.acceleration.y += 0.12;
          if (b.position.y > hh * 0.7) b.acceleration.y -= 0.12;
        }

        b.velocity.add(b.acceleration);
        b.velocity.limit(cruise);
        b.position.add(b.velocity);
        b.acceleration.mult(0);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, ww, hh);

      const flapReady = flapImg.complete && flapImg.naturalWidth > 0;
      const glideReady = glideImg.complete && glideImg.naturalWidth > 0;
      if (!flapReady && !glideReady) {
        raf = requestAnimationFrame(tick);
        return;
      }

      for (const b of birds) {
        const spd = b.velocity.mag();
        const beat = Math.max(90, 160 - spd * 40);
        const flapping = Math.sin(now / beat + b.phase) > 0.15;
        const img = flapping && flapReady ? flapImg : glideReady ? glideImg : flapImg;
        if (!img.naturalWidth) continue;

        const aspect = img.naturalWidth / img.naturalHeight;
        const drawH = SPRITE_H * b.scale;
        const drawW = drawH * aspect;
        const bank = Math.max(-0.35, Math.min(0.35, Math.atan2(b.velocity.y, Math.abs(b.velocity.x) + 0.01) * 0.45));
        const faceLeft = b.velocity.x < 0;

        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(bank);
        ctx.scale(faceLeft ? -1 : 1, 1);
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    world.addEventListener('click', onClick);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      world.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <canvas className="world-flock" ref={canvasRef} aria-hidden />
      {ripples.map((r) => (
        <span key={r.id} className="world-ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </>
  );
}

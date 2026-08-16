import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './Demos.css';
import { randomWalkDelta } from './demoUtils';

const WIDTH = 940;
const HEIGHT = 660;
const RADIUS = 200;

type Ant = {
  u: number;
  v: number;
  mesh: THREE.Mesh;
};

function spherical(u: number, v: number, r: number) {
  // Same spherical mapping as the Processing sketch
  return new THREE.Vector3(
    r * Math.sin(u) * Math.cos(v),
    r * Math.sin(u) * Math.sin(v),
    r * Math.cos(u),
  );
}

function stepAnt(ant: Ant, stepSize: number, speed: number, boost = 1) {
  ant.u += randomWalkDelta(Math.random(), stepSize, speed) * boost;
  ant.v += randomWalkDelta(Math.random(), stepSize, speed) * boost;
  ant.mesh.position.copy(spherical(ant.u, ant.v, RADIUS + 2));
}

export function AntsOnSphereDemo() {
  const mountRef = useRef<HTMLDivElement>(null);
  const seedHeld = useRef(false);
  const [stepSize, setStepSize] = useState(0.03);
  const [speed, setSpeed] = useState(1);
  const stepSizeRef = useRef(stepSize);
  const speedRef = useRef(speed);
  stepSizeRef.current = stepSize;
  speedRef.current = speed;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 4000);
    camera.position.z = 620;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);
    mount.appendChild(renderer.domElement);
    renderer.domElement.className = 'demo-canvas ants-canvas';

    const loader = new THREE.TextureLoader();
    const base = import.meta.env.BASE_URL;

    const bgTexture = loader.load(`${base}images/ants/space.jpg`);
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    const bgGeo = new THREE.PlaneGeometry(2400, 1600);
    const bgMat = new THREE.MeshBasicMaterial({ map: bgTexture });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.position.z = -900;
    scene.add(bg);

    const moonGroup = new THREE.Group();
    scene.add(moonGroup);

    const moonTex = loader.load(`${base}images/ants/moon.jpg`);
    moonTex.colorSpace = THREE.SRGBColorSpace;
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 64, 64),
      new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.95, metalness: 0.05 }),
    );
    moonGroup.add(moon);

    const light = new THREE.DirectionalLight(0xffffff, 1.15);
    light.position.set(350, 220, 400);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const antMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ants: Ant[] = [];

    const spawnAnt = (u = Math.random() * Math.PI, v = Math.random() * Math.PI * 2) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(2.2, 10, 10), antMat);
      const ant = { u, v, mesh };
      stepAnt(ant, stepSizeRef.current, speedRef.current, 0);
      moonGroup.add(mesh);
      ants.push(ant);
      return ant;
    };

    // Match sketch: two walkers from the start
    spawnAnt(0, 0);
    spawnAnt(1.2, 2.1);

    const pointer = { x: WIDTH / 2, y: HEIGHT / 2 };
    const onMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const sx = WIDTH / rect.width;
      const sy = HEIGHT / rect.height;
      pointer.x = (e.clientX - rect.left) * sx;
      pointer.y = (e.clientY - rect.top) * sy;
    };
    renderer.domElement.addEventListener('pointermove', onMove);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);

      // Processing: rotateY(map(mouseX,0,width,-PI,PI)); rotateX(map(mouseY,0,width,-PI,PI));
      moonGroup.rotation.y = THREE.MathUtils.mapLinear(pointer.x, 0, WIDTH, -Math.PI, Math.PI);
      moonGroup.rotation.x = THREE.MathUtils.mapLinear(pointer.y, 0, WIDTH, -Math.PI, Math.PI);

      // Always step both primary ants; holding SEED gives ant #2 an extra step.
      if (ants[0]) stepAnt(ants[0], stepSizeRef.current, speedRef.current);
      if (ants[1]) {
        stepAnt(ants[1], stepSizeRef.current, speedRef.current);
        if (seedHeld.current) stepAnt(ants[1], stepSizeRef.current, speedRef.current);
      }
      // Any extra ants from SEED presses keep wandering.
      for (let i = 2; i < ants.length; i++) {
        stepAnt(ants[i], stepSizeRef.current, speedRef.current);
      }

      renderer.render(scene, camera);
    };
    animate();

    const onSeedDown = () => {
      seedHeld.current = true;
      if (ants.length < 24) spawnAnt();
    };
    const onSeedUp = () => { seedHeld.current = false; };
    const seedButton = mount.querySelector('.seed-button') as HTMLButtonElement | null;
    seedButton?.addEventListener('pointerdown', onSeedDown);
    window.addEventListener('pointerup', onSeedUp);

    return () => {
      cancelAnimationFrame(frame);
      renderer.domElement.removeEventListener('pointermove', onMove);
      seedButton?.removeEventListener('pointerdown', onSeedDown);
      window.removeEventListener('pointerup', onSeedUp);
      renderer.dispose();
      moon.geometry.dispose();
      (moon.material as THREE.Material).dispose();
      antMat.dispose();
      bgGeo.dispose();
      bgMat.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="demo-wrap ants-wrap">
      <div className="demo-controls demo-fields ants-controls">
        <label>
          Random step size
          <input
            type="number"
            min="0"
            max="0.12"
            step="0.005"
            value={stepSize}
            onChange={(event) => setStepSize(Number(event.target.value))}
          />
        </label>
        <label>
          Movement speed
          <input
            type="number"
            min="0"
            max="4"
            step="0.25"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="ants-stage" ref={mountRef}>
        <button type="button" className="seed-button" aria-label="Seed another walker">SEED</button>
      </div>
      <p className="demo-note">
        Move the mouse to turn the sphere. White points take random walks on the surface—once random is visible, real paths (ants, roots, a rhumb line) can be compared against it. Hold SEED to add a walker and give one walker an extra step.
      </p>
    </div>
  );
}

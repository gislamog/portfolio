import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './Demos.css';
import { randomWalkDelta } from './demoUtils';

const WIDTH = 680;
const HEIGHT = 480;
const RADIUS = 130;
const AUTO_ROTATE_SPEED = 0.06;
const DRAG_RESUME_DELAY = 1400;

type Ant = {
  u: number;
  v: number;
  mesh: THREE.Mesh;
};

function spherical(u: number, v: number, r: number) {
  return new THREE.Vector3(
    r * Math.sin(u) * Math.cos(v),
    r * Math.sin(u) * Math.sin(v),
    r * Math.cos(u),
  );
}

function stepAnt(ant: Ant, stepSize: number, speed: number, boost = 1) {
  ant.u += randomWalkDelta(Math.random(), stepSize, speed) * boost;
  ant.v += randomWalkDelta(Math.random(), stepSize, speed) * boost;
  ant.mesh.position.copy(spherical(ant.u, ant.v, RADIUS + 1.3));
}

// Fresnel-style rim glow, same idea as the atmosphere shell in the
// Aceternity Globe3D reference, tuned down for a moon (cooler, dimmer).
const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmosphereFragmentShader = `
  varying vec3 vNormal;
  uniform vec3 glowColor;
  uniform float intensity;
  void main() {
    float rim = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(glowColor, rim * intensity);
  }
`;

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
    camera.position.z = 400;

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
    const bgGeo = new THREE.PlaneGeometry(1600, 1067);
    const bgMat = new THREE.MeshBasicMaterial({ map: bgTexture });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.position.z = -600;
    scene.add(bg);

    const moonGroup = new THREE.Group();
    scene.add(moonGroup);

    const moonTex = loader.load(`${base}images/ants/moon.jpg`);
    moonTex.colorSpace = THREE.SRGBColorSpace;
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 64, 64),
      new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.95, metalness: 0.05, bumpMap: moonTex, bumpScale: 1.5 }),
    );
    moonGroup.add(moon);

    // Soft cool-grey atmosphere shell around the moon, ported from the
    // Globe3D reference's atmosphere glow but toned for an airless body.
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.06, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        uniforms: {
          glowColor: { value: new THREE.Color(0x9fb4d8) },
          intensity: { value: 0.5 },
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    );
    moonGroup.add(atmosphere);

    const light = new THREE.DirectionalLight(0xffffff, 1.15);
    light.position.set(350, 220, 400);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const antMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ants: Ant[] = [];

    const spawnAnt = (u = Math.random() * Math.PI, v = Math.random() * Math.PI * 2) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 10), antMat);
      const ant = { u, v, mesh };
      stepAnt(ant, stepSizeRef.current, speedRef.current, 0);
      moonGroup.add(mesh);
      ants.push(ant);
      return ant;
    };

    spawnAnt(0, 0);
    spawnAnt(1.2, 2.1);

    // Drag-to-orbit with inertia and auto-rotate resume, same interaction
    // model as OrbitControls-driven globes like the Globe3D reference,
    // implemented directly since this project has no @react-three/drei.
    let rotationX = 0;
    let rotationY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let dragging = false;
    let lastPointer = { x: 0, y: 0 };
    let lastMoveTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastPointer = { x: e.clientX, y: e.clientY };
      velocityX = 0;
      velocityY = 0;
      lastMoveTime = performance.now();
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPointer.x;
      const dy = e.clientY - lastPointer.y;
      lastPointer = { x: e.clientX, y: e.clientY };
      rotationY += dx * 0.006;
      rotationX = THREE.MathUtils.clamp(rotationX + dy * 0.006, -1.4, 1.4);
      velocityY = dx * 0.006;
      velocityX = dy * 0.006;
      lastMoveTime = performance.now();
    };
    const onPointerUp = () => { dragging = false; };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);

      if (!dragging) {
        // Inertia decay right after release, then settle into a slow
        // auto-rotate once idle for a beat.
        velocityX *= 0.94;
        velocityY *= 0.94;
        rotationY += velocityY;
        rotationX = THREE.MathUtils.clamp(rotationX + velocityX, -1.4, 1.4);

        if (performance.now() - lastMoveTime > DRAG_RESUME_DELAY) {
          rotationY += AUTO_ROTATE_SPEED * 0.016;
        }
      }

      moonGroup.rotation.y = rotationY;
      moonGroup.rotation.x = rotationX;

      if (ants[0]) stepAnt(ants[0], stepSizeRef.current, speedRef.current);
      if (ants[1]) {
        stepAnt(ants[1], stepSizeRef.current, speedRef.current);
        if (seedHeld.current) stepAnt(ants[1], stepSizeRef.current, speedRef.current);
      }
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
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      seedButton?.removeEventListener('pointerdown', onSeedDown);
      window.removeEventListener('pointerup', onSeedUp);
      renderer.dispose();
      moon.geometry.dispose();
      (moon.material as THREE.Material).dispose();
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
      antMat.dispose();
      bgGeo.dispose();
      bgMat.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="demo-wrap ants-wrap ants-lab">
      <p>
        Each ant moves using values from JavaScript&rsquo;s <code>Math.random()</code>. This is a pseudorandom number generator, or PRNG. It produces sequences that appear random, but it is not designed for cryptographic security. A predictable seed, such as the current time or a value from a small range, can allow an attacker to recreate the sequence and predict future values.
      </p>
      <p>
        Cryptography instead uses a cryptographically secure pseudorandom number generator, or CSPRNG. A secure generator should pass the next-bit test, meaning that observing earlier values should not help an attacker predict the next one. Operating systems collect entropy from difficult-to-predict physical and system activity, then use it to initialize secure generators. In PHP, <code>rand()</code> and <code>mt_rand()</code> are not appropriate for security, while <code>random_int()</code> and <code>random_bytes()</code> use a secure system source.
      </p>
      <div className="ants-lab-stage">
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
      </div>
      <p>
        This distinction matters because nearly every cryptographic system depends on unpredictable values. Encryption keys, nonces, initialization vectors, and password salts must not be guessable. Even a strong algorithm such as AES or RSA can fail if its keys are generated from weak randomness.
      </p>
      <p>
        Randomness also supports secure hashing. Salts prevent identical passwords from producing identical stored hashes, while collision-resistant hash functions help verify that data has not been altered. Older functions such as MD5 and SHA-1 are no longer considered collision-resistant, while modern systems use stronger hash functions and password-specific algorithms such as bcrypt.
      </p>
      <p className="demo-note">
        Drag to rotate the moon and release it to let it drift. Adjust the ants&rsquo; step size and movement speed, then press SEED to add another walker. The simulation makes a central security principle visible: appearing random is not the same as being unpredictable.
      </p>
    </div>
  );
}

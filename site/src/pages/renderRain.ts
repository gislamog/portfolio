import type { RainSettings } from './rainSettings';
import vertexShader from './rain.vertex.glsl?raw';
import fragmentShader from './rain.fragment.glsl?raw';

const MASK_URL = `${import.meta.env.BASE_URL}images/city/rain-splash-mask.png`;
const RAIN_COUNT = 1200;
const PARTICLE_COUNT = RAIN_COUNT + 480;
const layers = [
  { depth: 0.12, wind: 0.72, splash: 0.55 },
  { depth: 0.48, wind: 1, splash: 0.9 },
  { depth: 0.84, wind: 1.28, splash: 1.55 },
] as const;
// Interleave layers so changing density keeps their 50 / 33 / 17 split.
const layerOrder = [0, 1, 0, 2, 0, 1] as const;

function layerFor(index: number) {
  return layers[layerOrder[index % layerOrder.length]];
}

export async function startRain(canvas: HTMLCanvasElement, active: () => boolean, settings: RainSettings) {
  const mask = new Image();
  mask.src = MASK_URL;
  await mask.decode();
  if (!active()) return;

  const maskCanvas = document.createElement('canvas');
  const maskWidth = maskCanvas.width = mask.naturalWidth;
  const maskHeight = maskCanvas.height = mask.naturalHeight;
  const context = maskCanvas.getContext('2d');
  if (!context) return;
  context.drawImage(mask, 0, 0);
  const pixels = context.getImageData(0, 0, maskWidth, maskHeight).data;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
  if (!gl) return;
  const gpu = gl;
  const program = gpu.createProgram();
  if (!program) return;

  function attach(type: number, source: string) {
    const shader = gpu.createShader(type);
    if (!shader) throw new Error('Could not create rain shader');
    gpu.shaderSource(shader, source);
    gpu.compileShader(shader);
    if (!gpu.getShaderParameter(shader, gpu.COMPILE_STATUS)) {
      const error = gpu.getShaderInfoLog(shader);
      gpu.deleteShader(shader);
      throw new Error(error ?? 'Rain shader compilation failed');
    }
    gpu.attachShader(program!, shader);
    gpu.deleteShader(shader);
  }

  try {
    attach(gpu.VERTEX_SHADER, vertexShader);
    attach(gpu.FRAGMENT_SHADER, fragmentShader);
    gpu.linkProgram(program);
    if (!gpu.getProgramParameter(program, gpu.LINK_STATUS)) {
      throw new Error(gpu.getProgramInfoLog(program) ?? 'Rain shader linking failed');
    }
  } catch (error) {
    gpu.deleteProgram(program);
    throw error;
  }
  gpu.useProgram(program);
  gpu.enable(gpu.BLEND);
  gpu.blendFuncSeparate(gpu.SRC_ALPHA, gpu.ONE_MINUS_SRC_ALPHA, gpu.ONE, gpu.ONE_MINUS_SRC_ALPHA);

  const positions = new Float32Array(PARTICLE_COUNT * 2);
  const velocities = new Float32Array(PARTICLE_COUNT * 2);
  const lives = new Float32Array(PARTICLE_COUNT);
  const types = new Float32Array(PARTICLE_COUNT);
  const depths = new Float32Array(PARTICLE_COUNT);
  const landing = new Float32Array(RAIN_COUNT);
  types.fill(1, RAIN_COUNT);
  const attributes = [
    ['a_position', 2, positions], ['a_velocity', 2, velocities],
    ['a_life', 1, lives], ['a_type', 1, types], ['a_depth', 1, depths],
  ] as const;
  const buffers = attributes.map(([name, size, values]) => {
    const buffer = gpu.createBuffer();
    const location = gpu.getAttribLocation(program, name);
    gpu.bindBuffer(gpu.ARRAY_BUFFER, buffer);
    gpu.bufferData(gpu.ARRAY_BUFFER, values.byteLength, gpu.DYNAMIC_DRAW);
    gpu.enableVertexAttribArray(location);
    gpu.vertexAttribPointer(location, size, gpu.FLOAT, false, 0, 0);
    return { buffer, values };
  });

  const uniform = (name: string) => gpu.getUniformLocation(program, name);
  const rainColor = uniform('u_rainColor');
  const splashColor = uniform('u_splashColor');
  gpu.uniform1i(uniform('u_enableLighting'), 1);
  const lightColor = uniform('u_lightColor');
  const lightIntensity = uniform('u_lightIntensity');
  const lightRadius = uniform('u_lightRadius');
  const streakLength = uniform('u_streakLength');
  const streakThickness = uniform('u_streakThickness');
  const rainOpacity = uniform('u_rainOpacity');
  const splashSize = uniform('u_splashSize');
  const lightning = uniform('u_lightningIntensity');
  gpu.uniform3f(uniform('u_lightningColor'), 0.86, 0.92, 1);

  function color(location: WebGLUniformLocation | null, hex: string) {
    const value = Number.parseInt(hex.slice(1), 16);
    gpu.uniform3f(location, (value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
  }

  let frame = 0;
  let previous = 0;
  let visible = false;
  let lost = false;
  let aspect = 1;
  let coverX = 1;
  let coverY = 1;
  let nextSplash = RAIN_COUNT;
  let flashDelay = settings.lightning > 0 ? 60 / settings.lightning : 0;
  let flash = 0;

  function resetDrop(index: number, initial = false) {
    const offset = index * 2;
    const y = initial ? Math.random() * 2 - 1 : 1.05 + Math.random();
    const layer = layerFor(index);
    const wind = settings.wind * layer.wind;
    positions[offset] = Math.random() * (2 + 2 * wind / aspect) - 1;
    positions[offset + 1] = y;
    depths[index] = layer.depth + Math.random() * 0.13;
    velocities[offset + 1] = -0.012 - depths[index] * 0.022 - Math.random() * 0.005;
    velocities[offset] = velocities[offset + 1] * wind;
    landing[index] = Math.min(y - 0.02, 0.35 + Math.random() * 0.65);
  }

  function splash(x: number, y: number, depth: number, spread: number) {
    // The mask uses the same centered cover crop as the city picture.
    const column = Math.floor((0.5 + x * 0.5 * coverX) * maskWidth);
    const row = Math.floor((0.5 - y * 0.5 * coverY) * maskHeight);
    if (!settings.splashSize || Math.random() * 100 >= settings.splashFrequency) return false;
    if (Math.abs(x) >= 1 || Math.abs(y) >= 1 || pixels[(row * maskWidth + column) * 4] < 128) return false;

    const count = Math.ceil((3 + depth * 3) * settings.splashSize * spread);
    for (let index = 0; index < count; index++) {
      const offset = nextSplash * 2;
      const angle = Math.random() * Math.PI;
      const speed = (0.006 + Math.random() * 0.012) * (0.5 + depth * 0.5) * settings.splashSize * spread;
      positions[offset] = x;
      positions[offset + 1] = y;
      velocities[offset] = Math.cos(angle) * speed;
      velocities[offset + 1] = Math.sin(angle) * speed * 0.5;
      depths[nextSplash] = depth;
      lives[nextSplash] = 1;
      nextSplash = nextSplash === PARTICLE_COUNT - 1 ? RAIN_COUNT : nextSplash + 1;
    }
    return true;
  }

  function render(now: number) {
    frame = 0;
    if (!active() || !visible || document.hidden || lost) return;
    const step = previous ? Math.min((now - previous) * 0.06, 2) : 1;
    previous = now;
    for (let index = 0; index < PARTICLE_COUNT; index++) {
      const offset = index * 2;
      if (index < RAIN_COUNT && index >= settings.density) continue;
      if (index >= RAIN_COUNT) {
        lives[index] = Math.max(0, lives[index] - 0.045 * step / settings.splashDuration);
        if (!lives[index]) continue;
        velocities[offset + 1] -= 0.0015 * step;
      }
      const yBefore = positions[offset + 1];
      const falling = index < RAIN_COUNT;
      if (falling) velocities[offset] = velocities[offset + 1] * settings.wind * layerFor(index).wind;
      const motionStep = falling ? step * settings.speed : step;
      positions[offset] += velocities[offset] / aspect * motionStep;
      positions[offset + 1] += velocities[offset + 1] * motionStep;
      if (index >= RAIN_COUNT) continue;

      if (yBefore > landing[index] && positions[offset + 1] <= landing[index]) {
        const impactY = landing[index];
        const impactX = positions[offset] + (impactY - positions[offset + 1]) * settings.wind * layerFor(index).wind / aspect;
        if (splash(impactX, impactY, depths[index], layerFor(index).splash)) {
          resetDrop(index);
          continue;
        }
        // A miss can pass over another roof or the street farther down.
        landing[index] = impactY - (0.4 + Math.random() * 0.25);
      }
      if (positions[offset + 1] < -1.15 || positions[offset] < -1.25) resetDrop(index);
    }

    for (const { buffer, values } of buffers) {
      gpu.bindBuffer(gpu.ARRAY_BUFFER, buffer);
      gpu.bufferSubData(gpu.ARRAY_BUFFER, 0, values);
    }
    if (settings.lightning > 0) {
      flashDelay -= step / 60;
      if (flashDelay <= 0) {
        flash = 0.8;
        flashDelay = 60 / settings.lightning * (0.75 + Math.random() * 0.5);
      }
      flash = Math.max(0, flash - step * 0.055);
    } else {
      flash = 0;
      flashDelay = 0;
    }
    color(rainColor, settings.rainColor);
    color(splashColor, settings.splashColor);
    color(lightColor, settings.lightColor);
    gpu.uniform1f(lightIntensity, settings.lightIntensity);
    gpu.uniform1f(lightRadius, settings.lightRadius);
    gpu.uniform1f(streakLength, settings.length);
    gpu.uniform1f(streakThickness, settings.thickness);
    gpu.uniform1f(rainOpacity, settings.opacity);
    gpu.uniform1f(splashSize, settings.splashSize);
    gpu.uniform1f(lightning, flash);
    const flashAlpha = flash * 0.24;
    gpu.clearColor(flashAlpha * 0.86, flashAlpha * 0.92, flashAlpha, flashAlpha);
    gpu.clear(gpu.COLOR_BUFFER_BIT);
    gpu.drawArrays(gpu.POINTS, 0, settings.density);
    gpu.drawArrays(gpu.POINTS, RAIN_COUNT, PARTICLE_COUNT - RAIN_COUNT);
    frame = requestAnimationFrame(render);
  }

  function update() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!active() || !visible || document.hidden || lost || !width || !height) return;
    aspect = width / height;
    const ratio = aspect / (maskWidth / maskHeight);
    coverX = Math.min(1, ratio);
    coverY = Math.min(1, 1 / ratio);
    const dpr = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gpu.viewport(0, 0, canvas.width, canvas.height);
    frame = requestAnimationFrame(render);
  }

  function contextLost() {
    lost = true;
    update();
  }

  for (let index = 0; index < RAIN_COUNT; index++) resetDrop(index, true);
  const resize = new ResizeObserver(update);
  resize.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  });
  intersection.observe(canvas);
  document.addEventListener('visibilitychange', update);
  canvas.addEventListener('webglcontextlost', contextLost);
  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    intersection.disconnect();
    document.removeEventListener('visibilitychange', update);
    canvas.removeEventListener('webglcontextlost', contextLost);
    gpu.clear(gpu.COLOR_BUFFER_BIT);
    for (const { buffer } of buffers) gpu.deleteBuffer(buffer);
    gpu.deleteProgram(program);
  };
}

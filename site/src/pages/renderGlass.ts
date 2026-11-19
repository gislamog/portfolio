import fragmentShader from './glass.fragment.glsl?raw';

const vertexShader = `
attribute vec2 position;
varying vec2 viewUV;

void main() {
  viewUV = vec2(position.x, -position.y) * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Could not allocate glass shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  const message = gl.getShaderInfoLog(shader);
  gl.deleteShader(shader);
  throw new Error(message ?? 'Glass shader compilation failed');
}

const rippleCount = 6;

export function startGlass(canvas: HTMLCanvasElement, image: HTMLImageElement, fog: HTMLDivElement) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
  if (!gl) return;
  const gpu = gl;
  const program = gpu.createProgram();
  const triangle = gpu.createBuffer();
  const clear = gpu.createTexture();
  const dispose = () => {
    gpu.deleteProgram(program);
    gpu.deleteBuffer(triangle);
    gpu.deleteTexture(clear);
  };
  if (!program || !triangle || !clear) {
    dispose();
    return;
  }

  try {
    for (const [type, source] of [[gpu.VERTEX_SHADER, vertexShader], [gpu.FRAGMENT_SHADER, fragmentShader]] as const) {
      const shader = compile(gpu, type, source);
      gpu.attachShader(program, shader);
      gpu.deleteShader(shader);
    }
    gpu.linkProgram(program);
    if (!gpu.getProgramParameter(program, gpu.LINK_STATUS)) {
      throw new Error(gpu.getProgramInfoLog(program) ?? 'Glass shader linking failed');
    }
  } catch (error) {
    dispose();
    throw error;
  }

  gpu.useProgram(program);
  gpu.bindBuffer(gpu.ARRAY_BUFFER, triangle);
  gpu.bufferData(gpu.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gpu.STATIC_DRAW);
  const position = gpu.getAttribLocation(program, 'position');
  gpu.enableVertexAttribArray(position);
  gpu.vertexAttribPointer(position, 2, gpu.FLOAT, false, 0, 0);

  const uniform = (name: string) => gpu.getUniformLocation(program, name);
  const size = uniform('size');
  const cover = uniform('cover');
  const clock = uniform('clock');
  const gaze = uniform('gaze');
  const waves = uniform('waves[0]');
  const opening = uniform('opening');
  gpu.uniform1i(uniform('clearCity'), 0);

  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let textureAspect = 0;
  let visible = false;
  let lost = false;
  const scene = canvas.closest<HTMLElement>('.portfolio-home');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let targetX = 0;
  let targetY = 0;
  let gazeX = 0;
  let gazeY = 0;
  let width = 0;
  let height = 0;

  // Each wave stores a center in pane coordinates, a birth time, and its strength.
  const ripples = new Float32Array(rippleCount * 4);
  const waveUniforms = new Float32Array(ripples.length);
  let nextRipple = 0;
  let lastRippleX = 0;
  let lastRippleY = 0;
  let lastRippleAt = -Infinity;

  let portalX = 0;
  let portalY = 0;
  let portalRadius = 0;
  let portalOpen = false;
  let previousMask = '';

  function panePoint(event: MouseEvent) {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    return { x, y };
  }

  function emitRipple(x: number, y: number, strength: number) {
    ripples.set([x, y, elapsed, strength], nextRipple);
    nextRipple = (nextRipple + 4) % ripples.length;
  }

  function togglePortal(event: MouseEvent) {
    if (!visible || lost || event.button !== 0 || event.detail === 0 || event.defaultPrevented) return;
    const target = event.target;
    if (target instanceof Element && target.closest('a, button, input, select, textarea, label, summary, [role="button"], [contenteditable], .rain-controls')) return;
    if (window.getSelection()?.toString()) return;
    const point = panePoint(event);
    if (!point) return;
    const distance = Math.hypot((point.x - portalX) * width, (point.y - portalY) * height);
    if (portalOpen && distance <= portalRadius) {
      portalOpen = false;
    } else {
      portalX = point.x;
      portalY = point.y;
      portalOpen = true;
    }
    emitRipple(point.x, point.y, 1.15);
  }

  function dismissPortal(event: KeyboardEvent) {
    if (event.key === 'Escape') portalOpen = false;
  }

  function drawInteraction(ease: number) {
    for (let i = 0; i < ripples.length; i += 4) {
      waveUniforms[i] = ripples[i] * width;
      waveUniforms[i + 1] = ripples[i + 1] * height;
      waveUniforms[i + 2] = elapsed - ripples[i + 2];
      waveUniforms[i + 3] = ripples[i + 3];
    }
    gpu.uniform4fv(waves, waveUniforms);

    const radius = portalOpen ? Math.min(104, Math.max(58, Math.min(width, height) * 0.12)) : 0;
    portalRadius += (radius - portalRadius) * ease;
    if (Math.abs(radius - portalRadius) < 0.3) portalRadius = radius;
    const x = portalX * width;
    const y = portalY * height;
    const feather = Math.min(13, portalRadius * 0.45);
    gpu.uniform4f(opening, x, y, portalRadius, feather);

    // Match the shader's opening so both the glass and the street blur clear together.
    const mask = portalRadius
      ? `radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, transparent ${portalRadius.toFixed(1)}px, black ${(portalRadius + feather).toFixed(1)}px)`
      : '';
    if (mask !== previousMask) {
      fog.style.maskImage = mask;
      previousMask = mask;
    }
  }

  function resetGaze() {
    targetX = 0;
    targetY = 0;
  }

  function followPointer(event: PointerEvent) {
    if (!finePointer.matches || event.pointerType !== 'mouse') return;
    const point = panePoint(event);
    if (!point) return;
    targetX = point.x * 2 - 1;
    targetY = point.y * 2 - 1;
    const distance = Math.hypot((point.x - lastRippleX) * width, (point.y - lastRippleY) * height);
    if (elapsed - lastRippleAt < 0.062 || distance < 13) return;
    emitRipple(point.x, point.y, 0.73);
    lastRippleX = point.x;
    lastRippleY = point.y;
    lastRippleAt = elapsed;
  }

  function visibilityChanged() {
    if (document.hidden) resetGaze();
    update();
  }

  function uploadImage() {
    gpu.bindTexture(gpu.TEXTURE_2D, clear);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_MIN_FILTER, gpu.LINEAR);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_MAG_FILTER, gpu.LINEAR);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_WRAP_S, gpu.CLAMP_TO_EDGE);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_WRAP_T, gpu.CLAMP_TO_EDGE);
    gpu.texImage2D(gpu.TEXTURE_2D, 0, gpu.RGB, gpu.RGB, gpu.UNSIGNED_BYTE, image);
  }

  function render(now: number) {
    const step = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    elapsed += step;
    const ease = 1 - Math.exp(-step * 8);
    gazeX += (targetX - gazeX) * ease;
    gazeY += (targetY - gazeY) * ease;
    previous = now;
    gpu.uniform1f(clock, elapsed);
    gpu.uniform2f(gaze, gazeX, gazeY);
    drawInteraction(ease);
    gpu.drawArrays(gpu.TRIANGLES, 0, 3);
    if (!canvas.hasAttribute('data-ready')) canvas.setAttribute('data-ready', '');
    frame = requestAnimationFrame(render);
  }

  function update() {
    cancelAnimationFrame(frame);
    previous = 0;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!textureAspect || !width || !height || !visible || lost || document.hidden) return;
    const dpr = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gpu.viewport(0, 0, canvas.width, canvas.height);
    gpu.uniform2f(size, width, height);
    // Match the fallback image's centered object-fit: cover crop.
    const ratio = width / height / textureAspect;
    gpu.uniform2f(cover, Math.min(1, ratio), Math.min(1, 1 / ratio));
    frame = requestAnimationFrame(render);
  }

  function loadImage() {
    if (!image.complete || !image.naturalWidth || lost) return;
    textureAspect = image.naturalWidth / image.naturalHeight;
    uploadImage();
    update();
  }

  function contextLost() {
    lost = true;
    canvas.removeAttribute('data-ready');
    update();
  }

  const resize = new ResizeObserver(update);
  resize.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  });
  intersection.observe(canvas);
  image.addEventListener('load', loadImage);
  document.addEventListener('visibilitychange', visibilityChanged);
  scene?.addEventListener('pointermove', followPointer, { passive: true });
  scene?.addEventListener('pointerleave', resetGaze);
  scene?.addEventListener('click', togglePortal);
  document.addEventListener('keydown', dismissPortal);
  window.addEventListener('blur', resetGaze);
  finePointer.addEventListener('change', resetGaze);
  canvas.addEventListener('webglcontextlost', contextLost);
  loadImage();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    intersection.disconnect();
    image.removeEventListener('load', loadImage);
    document.removeEventListener('visibilitychange', visibilityChanged);
    scene?.removeEventListener('pointermove', followPointer);
    scene?.removeEventListener('pointerleave', resetGaze);
    scene?.removeEventListener('click', togglePortal);
    document.removeEventListener('keydown', dismissPortal);
    window.removeEventListener('blur', resetGaze);
    finePointer.removeEventListener('change', resetGaze);
    canvas.removeEventListener('webglcontextlost', contextLost);
    canvas.removeAttribute('data-ready');
    fog.style.removeProperty('mask-image');
    dispose();
  };
}

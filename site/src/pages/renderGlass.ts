import fragmentShader from './glass.fragment.glsl?raw';
import rippleShader from './cursorRipples.fragment.glsl?raw';
import { createCursorRipples } from './cursorRipples';

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

function link(gl: WebGLRenderingContext, source: string) {
  const program = gl.createProgram();
  if (!program) throw new Error('Could not allocate glass program');
  try {
    for (const [type, shaderSource] of [[gl.VERTEX_SHADER, vertexShader], [gl.FRAGMENT_SHADER, source]] as const) {
      const shader = compile(gl, type, shaderSource);
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.bindAttribLocation(program, 0, 'position');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'Glass shader linking failed');
    }
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  }
}

export function startGlass(canvas: HTMLCanvasElement, image: HTMLImageElement, fog: HTMLDivElement) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;
  const gpu = gl;
  const program = link(gpu, fragmentShader);
  const triangle = gpu.createBuffer();
  const clear = gpu.createTexture();
  let rippleProgram: WebGLProgram | undefined;
  let ripples: ReturnType<typeof createCursorRipples>;
  const dispose = () => {
    ripples?.dispose();
    if (rippleProgram) gpu.deleteProgram(rippleProgram);
    gpu.deleteProgram(program);
    gpu.deleteBuffer(triangle);
    gpu.deleteTexture(clear);
  };
  if (!triangle || !clear) {
    dispose();
    return;
  }

  gpu.bindBuffer(gpu.ARRAY_BUFFER, triangle);
  gpu.bufferData(gpu.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gpu.STATIC_DRAW);
  gpu.enableVertexAttribArray(0);
  gpu.vertexAttribPointer(0, 2, gpu.FLOAT, false, 0, 0);
  gpu.disable(gpu.DITHER);
  if (gpu.getShaderPrecisionFormat(gpu.FRAGMENT_SHADER, gpu.HIGH_FLOAT)?.precision) {
    try {
      rippleProgram = link(gpu, rippleShader);
      ripples = createCursorRipples(gpu, rippleProgram);
    } catch (error) {
      console.warn('Cursor ripples unavailable', error);
    }
  }
  gpu.useProgram(program);

  const uniform = (name: string) => gpu.getUniformLocation(program, name);
  const size = uniform('size');
  const cover = uniform('cover');
  const clock = uniform('clock');
  const gaze = uniform('gaze');
  const opening = uniform('opening');
  const rippleTexel = uniform('rippleTexel');
  gpu.uniform1i(uniform('clearCity'), 0);
  gpu.uniform1i(uniform('rippleField'), ripples ? 1 : 0);

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

  let portalX = 0;
  let portalY = 0;
  let portalRadius = 0;
  let heldPointer: number | undefined;
  let previousMask = '';

  function panePoint(event: MouseEvent) {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    return { x, y };
  }

  function pressPortal(event: PointerEvent) {
    if (!visible || lost || !event.isPrimary || event.button !== 0 || event.defaultPrevented) return;
    const target = event.target;
    if (target instanceof Element && target.closest('a, button, input, select, textarea, label, summary, [role="button"], [contenteditable], .rain-controls')) return;
    const point = panePoint(event);
    if (!point) return;
    heldPointer = event.pointerId;
    portalX = point.x;
    portalY = point.y;
  }

  function closePortal() {
    heldPointer = undefined;
    portalRadius = 0;
    fog.style.removeProperty('mask-image');
    previousMask = '';
  }

  function releasePortal(event: PointerEvent) {
    if (event.pointerId === heldPointer) closePortal();
  }

  function drawPortal(ease: number) {
    if (heldPointer !== undefined) {
      const radius = Math.min(104, Math.max(58, Math.min(width, height) * 0.12));
      portalRadius += (radius - portalRadius) * ease;
      if (Math.abs(radius - portalRadius) < 0.3) portalRadius = radius;
    }
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
    ripples?.endStroke();
  }

  function followPointer(event: PointerEvent) {
    const followsGlass = finePointer.matches && event.pointerType === 'mouse';
    if (!followsGlass && event.pointerId !== heldPointer) return;
    const point = panePoint(event);
    if (!point) return;
    if (event.pointerId === heldPointer) {
      portalX = point.x;
      portalY = point.y;
    }
    if (!followsGlass) return;
    ripples?.move(point);
    targetX = point.x * 2 - 1;
    targetY = point.y * 2 - 1;
  }

  function losePointer() {
    closePortal();
    resetGaze();
  }

  function visibilityChanged() {
    if (document.hidden) losePointer();
    update();
  }

  function uploadImage() {
    gpu.activeTexture(gpu.TEXTURE0);
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
    ripples?.advance(step, width, height);
    gpu.useProgram(program);
    gpu.viewport(0, 0, canvas.width, canvas.height);
    ripples?.bind(rippleTexel);
    gpu.uniform1f(clock, elapsed);
    gpu.uniform2f(gaze, gazeX, gazeY);
    drawPortal(ease);
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
    ripples?.resize(width, height);
    gpu.useProgram(program);
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
    losePointer();
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
  scene?.addEventListener('pointerleave', losePointer);
  scene?.addEventListener('pointerdown', pressPortal);
  window.addEventListener('pointerup', releasePortal, true);
  window.addEventListener('pointercancel', releasePortal, true);
  window.addEventListener('blur', losePointer);
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
    scene?.removeEventListener('pointerleave', losePointer);
    scene?.removeEventListener('pointerdown', pressPortal);
    window.removeEventListener('pointerup', releasePortal, true);
    window.removeEventListener('pointercancel', releasePortal, true);
    window.removeEventListener('blur', losePointer);
    finePointer.removeEventListener('change', resetGaze);
    canvas.removeEventListener('webglcontextlost', contextLost);
    canvas.removeAttribute('data-ready');
    fog.style.removeProperty('mask-image');
    dispose();
  };
}

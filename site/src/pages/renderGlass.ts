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

export function startGlass(canvas: HTMLCanvasElement, image: HTMLImageElement) {
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
  gpu.uniform1i(uniform('clearCity'), 0);

  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let textureAspect = 0;
  let visible = false;
  let lost = false;

  function uploadImage() {
    gpu.bindTexture(gpu.TEXTURE_2D, clear);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_MIN_FILTER, gpu.LINEAR);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_MAG_FILTER, gpu.LINEAR);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_WRAP_S, gpu.CLAMP_TO_EDGE);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_WRAP_T, gpu.CLAMP_TO_EDGE);
    gpu.texImage2D(gpu.TEXTURE_2D, 0, gpu.RGB, gpu.RGB, gpu.UNSIGNED_BYTE, image);
  }

  function render(now: number) {
    if (previous) elapsed += Math.min((now - previous) / 1000, 0.05);
    previous = now;
    gpu.uniform1f(clock, elapsed);
    gpu.drawArrays(gpu.TRIANGLES, 0, 3);
    if (!canvas.hasAttribute('data-ready')) canvas.setAttribute('data-ready', '');
    frame = requestAnimationFrame(render);
  }

  function update() {
    cancelAnimationFrame(frame);
    previous = 0;
    const { clientWidth: width, clientHeight: height } = canvas;
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
  document.addEventListener('visibilitychange', update);
  canvas.addEventListener('webglcontextlost', contextLost);
  loadImage();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    intersection.disconnect();
    image.removeEventListener('load', loadImage);
    document.removeEventListener('visibilitychange', update);
    canvas.removeEventListener('webglcontextlost', contextLost);
    canvas.removeAttribute('data-ready');
    dispose();
  };
}

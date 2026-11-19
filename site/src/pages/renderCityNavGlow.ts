import { Mesh, Program, Renderer, Texture, Triangle, Vec2 } from 'ogl';
import fragment from './cityNavGlow.fragment.glsl?raw';

const vertex = `
attribute vec2 position;
varying mediump vec2 viewUV;

void main() {
  viewUV = vec2(position.x, -position.y) * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export function startCityNavGlow(canvas: HTMLCanvasElement) {
  const nav = canvas.closest<HTMLElement>('.city-nav');
  const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
  const image = nav?.parentElement?.querySelector<HTMLImageElement>('.city-street img');
  if (!nav || !active || !image) return;

  const renderer = new Renderer({
    canvas, alpha: true, depth: false, premultipliedAlpha: true, autoClear: false,
  });
  const { gl } = renderer;
  const texture = new Texture(gl, { flipY: false, generateMipmaps: false });
  const uniforms = {
    city: { value: texture },
    size: { value: new Vec2() },
    imageOrigin: { value: new Vec2() },
    imageSpan: { value: new Vec2() },
    tab: { value: [0, 0, 0] },
    bottom: { value: 0 },
  };
  const program = new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false, cullFace: false });
  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });
  const color = new Uint8Array(4);
  canvas.style.removeProperty('width');
  canvas.style.removeProperty('height');

  let frame = 0;
  let lost = false;

  function draw() {
    if (lost || !image!.complete || !image!.naturalWidth) return;
    const { width, height, left, top } = canvas.getBoundingClientRect();
    const city = image!.getBoundingClientRect();
    if (!width || !height || !city.width || !city.height) return;
    const link = active!.getBoundingClientRect();
    const tabX = (link.left + link.right) / 2 - left;
    const tabY = Math.min(nav!.clientHeight - 3, link.bottom - top + 7);
    renderer.dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setSize(width, height);
    canvas.style.removeProperty('width');
    canvas.style.removeProperty('height');

    const scale = Math.max(city.width / image!.naturalWidth, city.height / image!.naturalHeight);
    const imageWidth = image!.naturalWidth * scale;
    const imageHeight = image!.naturalHeight * scale;
    const imageLeft = city.left + (city.width - imageWidth) / 2;
    const imageTop = city.top + (city.height - imageHeight) / 2;
    uniforms.size.value.set(width, height);
    uniforms.imageOrigin.value.set((left - imageLeft) / imageWidth, (top - imageTop) / imageHeight);
    uniforms.imageSpan.value.set(width / imageWidth, height / imageHeight);
    uniforms.tab.value = [tabX, tabY, Math.min(28, link.width * 0.48)];
    uniforms.bottom.value = nav!.clientHeight - 0.5;
    renderer.render({ scene: mesh, frustumCull: false });

    // Use the underline's sampled hue for the live text and its CSS glow.
    gl.readPixels(
      Math.floor(tabX * renderer.dpr),
      canvas.height - 1 - Math.floor(tabY * renderer.dpr),
      1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color,
    );
    if (color[3] > 100) {
      const rgb = Array.from(color.subarray(0, 3), (channel) => Math.min(255, Math.round(channel * 255 / color[3])));
      nav!.style.setProperty('--city-nav-light', rgb.join(' '));
      canvas.setAttribute('data-ready', '');
    }
  }

  function update() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  }

  function loadImage() {
    texture.image = image!;
    texture.needsUpdate = true;
    update();
  }

  function contextLost() {
    lost = true;
    canvas.removeAttribute('data-ready');
    nav!.style.removeProperty('--city-nav-light');
  }

  const resize = new ResizeObserver(update);
  resize.observe(nav);
  resize.observe(active);
  resize.observe(image);
  image.addEventListener('load', loadImage);
  canvas.addEventListener('webglcontextlost', contextLost);
  if (image.complete && image.naturalWidth) loadImage();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    image.removeEventListener('load', loadImage);
    canvas.removeEventListener('webglcontextlost', contextLost);
    canvas.removeAttribute('data-ready');
    nav.style.removeProperty('--city-nav-light');
    geometry.remove();
    program.remove();
    gl.deleteShader(program.vertexShader);
    gl.deleteShader(program.fragmentShader);
    gl.deleteTexture(texture.texture);
  };
}

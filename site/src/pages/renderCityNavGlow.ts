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
  const street = nav?.parentElement?.querySelector('.city-street');
  const image = street?.querySelector<HTMLImageElement>('img');
  if (!nav || !active || !image) return;

  const renderer = new Renderer({
    canvas, alpha: true, depth: false, premultipliedAlpha: true, autoClear: false,
  });
  const { gl } = renderer;
  const options = {
    flipY: false,
    generateMipmaps: renderer.isWebgl2,
    minFilter: renderer.isWebgl2 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
  };
  const texture = new Texture(gl, options);
  const uniforms = {
    city: { value: texture },
    size: { value: new Vec2() },
    imageOrigin: { value: new Vec2() },
    imageSpan: { value: new Vec2() },
    tab: { value: [0, 0, 0] },
    hoverTab: { value: [0, 0, 0] },
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

  function tabGeometry(link: HTMLElement, bounds: DOMRect) {
    const rect = (link.querySelector('.city-nav-label') ?? link).getBoundingClientRect();
    return [
      (rect.left + rect.right) / 2 - bounds.left,
      Math.min(nav!.clientHeight - 3, rect.bottom - bounds.top + 7),
      Math.min(28, rect.width * 0.48),
    ];
  }

  function sampleTint([x, y]: number[], property: string) {
    gl.readPixels(
      Math.floor(x * renderer.dpr),
      canvas.height - 1 - Math.floor(y * renderer.dpr),
      1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color,
    );
    if (color[3] <= 100) return false;
    const rgb = Array.from(color.subarray(0, 3), (channel) => Math.min(255, Math.round(channel * 255 / color[3])));
    nav!.style.setProperty(property, rgb.join(' '));
    return true;
  }

  function draw() {
    if (lost || !image!.complete || !image!.naturalWidth) return;
    const bounds = canvas.getBoundingClientRect();
    const { width, height, left, top } = bounds;
    const city = image!.getBoundingClientRect();
    if (!width || !height || !city.width || !city.height) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    if (renderer.width !== width || renderer.height !== height || renderer.dpr !== dpr) {
      renderer.dpr = dpr;
      renderer.setSize(width, height);
      canvas.style.removeProperty('width');
      canvas.style.removeProperty('height');
    }

    const scale = Math.max(city.width / image!.naturalWidth, city.height / image!.naturalHeight);
    const imageWidth = image!.naturalWidth * scale;
    const imageHeight = image!.naturalHeight * scale;
    const imageLeft = city.left + (city.width - imageWidth) / 2;
    const imageTop = city.top + (city.height - imageHeight) / 2;
    uniforms.size.value.set(width, height);
    uniforms.imageOrigin.value.set((left - imageLeft) / imageWidth, (top - imageTop) / imageHeight);
    uniforms.imageSpan.value.set(width / imageWidth, height / imageHeight);
    const hovered = nav!.querySelector<HTMLElement>('.city-nav-links a:hover:not([aria-current="page"])')
      ?? nav!.querySelector<HTMLElement>('.city-nav-links a:focus-visible:not([aria-current="page"])');
    uniforms.tab.value = tabGeometry(active!, bounds);
    uniforms.hoverTab.value = hovered ? tabGeometry(hovered, bounds) : [0, 0, 0];
    uniforms.bottom.value = nav!.clientHeight - 0.5;
    renderer.render({ scene: mesh, frustumCull: false });

    // Sample both underlines so the link text can use the same city colors as the shader.
    if (sampleTint(uniforms.tab.value, '--city-nav-light')) canvas.setAttribute('data-ready', '');
    if (!hovered || !sampleTint(uniforms.hoverTab.value, '--city-nav-hover-light')) {
      nav!.style.removeProperty('--city-nav-hover-light');
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
    nav!.style.removeProperty('--city-nav-hover-light');
  }

  const resize = new ResizeObserver(update);
  resize.observe(nav);
  resize.observe(active);
  resize.observe(image);
  const interactions = ['pointerover', 'pointerout', 'focusin', 'focusout'] as const;
  for (const type of interactions) nav.addEventListener(type, update);
  image.addEventListener('load', loadImage);
  canvas.addEventListener('webglcontextlost', contextLost);
  if (image.complete && image.naturalWidth) loadImage();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    for (const type of interactions) nav.removeEventListener(type, update);
    image.removeEventListener('load', loadImage);
    canvas.removeEventListener('webglcontextlost', contextLost);
    canvas.removeAttribute('data-ready');
    nav.style.removeProperty('--city-nav-light');
    nav.style.removeProperty('--city-nav-hover-light');
    geometry.remove();
    program.remove();
    gl.deleteShader(program.vertexShader);
    gl.deleteShader(program.fragmentShader);
    gl.deleteTexture(texture.texture);
  };
}

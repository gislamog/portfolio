import { Mesh, Program, Renderer, Texture, Triangle, Vec2 } from 'ogl';
import fragmentShader from './glass.fragment.glsl?raw';

const vertexShader = `
attribute vec2 position;
varying vec2 viewUV;

void main() {
  viewUV = vec2(position.x, -position.y) * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

function releaseMesh(mesh: Mesh) {
  const { gl, program, geometry } = mesh;
  geometry.remove();
  program.remove();
  gl.deleteShader(program.vertexShader);
  gl.deleteShader(program.fragmentShader);
}

export function startGlass(
  canvas: HTMLCanvasElement, image: HTMLImageElement, mask: SVGMaskElement,
) {
  const renderer = new Renderer({
    canvas,
    alpha: true,
    depth: false,
    antialias: false,
    premultipliedAlpha: true,
    autoClear: false,
  });
  const { gl } = renderer;
  canvas.style.removeProperty('width');
  canvas.style.removeProperty('height');

  const clearCity = new Texture(gl, { flipY: false, generateMipmaps: false });
  const view = canvas.parentElement;
  const maskBase = mask.querySelector('rect')!;
  const maskMarks = mask.querySelector('g')!;
  const uniforms = {
    clearCity: { value: clearCity },
    size: { value: new Vec2() },
    cover: { value: new Vec2() },
    clock: { value: 0 },
  };
  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms,
    cullFace: false,
    depthTest: false,
    depthWrite: false,
  });
  const glass = new Mesh(gl, { geometry: new Triangle(gl), program });

  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let textureAspect = 0;
  let visible = false;
  let lost = false;
  const scene = canvas.closest<HTMLElement>('.portfolio-home');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let width = 0;
  let height = 0;
  const cursor = new Vec2(-1, -1);
  let lastWipeTime = -Infinity;
  const wipeTrail: { x: number; y: number; time: number; mark: SVGUseElement }[] = [];
  const wipeHold = 4400;
  const wipeFade = 1600;
  let maskActive = false;

  function addMark() {
    const mark = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    mark.setAttribute('href', `#${mask.id}-brush`);
    maskMarks.append(mark);
    return mark;
  }

  const tip = addMark();

  function placeMark(mark: SVGUseElement, x: number, y: number, opacity: number) {
    const transform = `translate(${(x * width).toFixed(1)} ${(y * height).toFixed(1)})`;
    if (mark.getAttribute('transform') !== transform) mark.setAttribute('transform', transform);
    const alpha = opacity.toFixed(2);
    if (mark.getAttribute('opacity') !== alpha) mark.setAttribute('opacity', alpha);
  }

  function panePoint(event: MouseEvent) {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    return { x, y };
  }

  function drawWipeMask(now: number) {
    while (wipeTrail.length && now - wipeTrail[0].time >= wipeHold + wipeFade) {
      wipeTrail.shift()!.mark.remove();
    }
    if (!wipeTrail.length) {
      if (maskActive) view?.style.removeProperty('--city-wipe-mask');
      maskActive = false;
      return;
    }
    if (!maskActive) {
      view?.style.setProperty('--city-wipe-mask', `url("#${mask.id}")`);
      maskActive = true;
    }
    for (const { x, y, time, mark } of wipeTrail) {
      placeMark(mark, x, y, 1 - Math.max(0, (now - time - wipeHold) / wipeFade));
    }
    placeMark(tip, cursor.x, cursor.y, 1 - Math.max(0, (now - lastWipeTime - wipeHold) / wipeFade));
  }

  function followPointer(event: PointerEvent) {
    if (!finePointer.matches || event.pointerType !== 'mouse' || event.buttons > 1) return;
    const point = panePoint(event);
    if (!point || (point.x === cursor.x && point.y === cursor.y)) return;
    const last = wipeTrail[wipeTrail.length - 1];
    const now = performance.now();
    const distance = last ? Math.hypot((point.x - last.x) * width, (point.y - last.y) * height) : 0;
    if (!last || distance >= 18) {
      // Bridge gaps from coalesced mouse events without connecting a re-entry to the old trail.
      const steps = last && now - lastWipeTime < 140 ? Math.min(12, Math.ceil(distance / 22)) : 1;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const x = last ? last.x + (point.x - last.x) * t : point.x;
        const y = last ? last.y + (point.y - last.y) * t : point.y;
        wipeTrail.push({ x, y, time: now, mark: addMark() });
        if (wipeTrail.length > 36) wipeTrail.shift()!.mark.remove();
      }
    } else {
      last.time = now;
    }
    cursor.set(point.x, point.y);
    lastWipeTime = now;
  }

  function visibilityChanged() {
    update();
  }

  function render(now: number) {
    const step = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    elapsed += step;
    previous = now;
    // Match the centered object-fit crop.
    const ratio = width / height / textureAspect;
    uniforms.cover.value.set(Math.min(1, ratio), Math.min(1, 1 / ratio));
    uniforms.clock.value = elapsed;
    drawWipeMask(now);
    renderer.render({ scene: glass, frustumCull: false });
    if (!canvas.hasAttribute('data-ready')) canvas.setAttribute('data-ready', '');
    frame = requestAnimationFrame(render);
  }

  function update() {
    cancelAnimationFrame(frame);
    previous = 0;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    maskBase.setAttribute('width', String(width));
    maskBase.setAttribute('height', String(height));
    if (!textureAspect || !width || !height || !visible || lost || document.hidden) return;
    renderer.dpr = Math.min(devicePixelRatio, 1.5);
    renderer.setSize(width, height);
    // CSS owns the layout size so preview resizing stays responsive.
    canvas.style.removeProperty('width');
    canvas.style.removeProperty('height');
    uniforms.size.value.set(width, height);
    frame = requestAnimationFrame(render);
  }

  function loadImage() {
    if (!image.complete || !image.naturalWidth || lost) return;
    textureAspect = image.naturalWidth / image.naturalHeight;
    clearCity.image = image;
    clearCity.needsUpdate = true;
    update();
  }

  function contextLost() {
    lost = true;
    view?.style.removeProperty('--city-wipe-mask');
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
  canvas.addEventListener('webglcontextlost', contextLost);
  loadImage();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    intersection.disconnect();
    image.removeEventListener('load', loadImage);
    document.removeEventListener('visibilitychange', visibilityChanged);
    scene?.removeEventListener('pointermove', followPointer);
    canvas.removeEventListener('webglcontextlost', contextLost);
    canvas.removeAttribute('data-ready');
    view?.style.removeProperty('--city-wipe-mask');
    maskMarks.replaceChildren();
    releaseMesh(glass);
    gl.deleteTexture(clearCity.texture);
  };
}

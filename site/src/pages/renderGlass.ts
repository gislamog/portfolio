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
  let drag: { pointerId: number; x: number; y: number; started: boolean } | undefined;
  let lastWipeTime = -Infinity;
  const wipeTrail: { x: number; y: number; time: number; mark: SVGUseElement }[] = [];
  const wipeHold = 4000;
  const wipeFade = 2400;
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
    const alpha = opacity.toFixed(3);
    if (mark.getAttribute('opacity') !== alpha) mark.setAttribute('opacity', alpha);
  }

  function markOpacity(now: number, time: number) {
    const progress = Math.min(1, Math.max(0, (now - time - wipeHold) / wipeFade));
    const remaining = 1 - progress * progress * (3 - 2 * progress);
    // Overlapping marks reinforce the clear area, so taper each mark early in the fade.
    return remaining * remaining;
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
      placeMark(mark, x, y, markOpacity(now, time));
    }
    const last = wipeTrail[wipeTrail.length - 1];
    const tipOpacity = last.x === cursor.x && last.y === cursor.y ? 0 : markOpacity(now, lastWipeTime);
    placeMark(tip, cursor.x, cursor.y, tipOpacity);
  }

  function startDrag(event: PointerEvent) {
    if (!finePointer.matches || event.pointerType !== 'mouse' || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, [contenteditable]')) return;
    const point = panePoint(event);
    if (point) drag = { ...point, pointerId: event.pointerId, started: false };
  }

  function endDrag(event: PointerEvent) {
    if (drag?.pointerId === event.pointerId) drag = undefined;
  }

  function followPointer(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId || (event.buttons & 1) === 0) return;
    const point = panePoint(event);
    const previousPoint = drag.started ? cursor : drag;
    if (!point || (point.x === previousPoint.x && point.y === previousPoint.y)) return;
    const last = drag.started ? wipeTrail[wipeTrail.length - 1] : undefined;
    const now = performance.now();
    const origin = last ?? previousPoint;
    const distance = Math.hypot((point.x - origin.x) * width, (point.y - origin.y) * height);
    if (!last || distance >= 18) {
      // Fill gaps within this drag without joining it to the previous stroke.
      const steps = Math.max(1, Math.min(32, Math.ceil(distance / 22)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const x = origin.x + (point.x - origin.x) * t;
        const y = origin.y + (point.y - origin.y) * t;
        wipeTrail.push({ x, y, time: now, mark: addMark() });
      }
    } else {
      last.time = now;
    }
    drag.started = true;
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
  scene?.addEventListener('pointerdown', startDrag);
  scene?.addEventListener('pointermove', followPointer, { passive: true });
  window.addEventListener('pointerup', endDrag, true);
  window.addEventListener('pointercancel', endDrag, true);
  canvas.addEventListener('webglcontextlost', contextLost);
  loadImage();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    intersection.disconnect();
    image.removeEventListener('load', loadImage);
    document.removeEventListener('visibilitychange', visibilityChanged);
    scene?.removeEventListener('pointerdown', startDrag);
    scene?.removeEventListener('pointermove', followPointer);
    window.removeEventListener('pointerup', endDrag, true);
    window.removeEventListener('pointercancel', endDrag, true);
    canvas.removeEventListener('webglcontextlost', contextLost);
    canvas.removeAttribute('data-ready');
    view?.style.removeProperty('--city-wipe-mask');
    maskMarks.replaceChildren();
    releaseMesh(glass);
    gl.deleteTexture(clearCity.texture);
  };
}

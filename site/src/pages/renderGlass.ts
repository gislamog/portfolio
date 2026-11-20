import { Flowmap, Mesh, Program, Renderer, Texture, Triangle, Vec2 } from 'ogl';
import fragmentShader from './glass.fragment.glsl?raw';
import { isCityBackdrop } from './cityInteraction';

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

// Use OGL's original Flowmap from the Codrops Mouse Flowmap Deformation demo.
function setupFlowmap(renderer: Renderer) {
  const { gl } = renderer;
  const supported = renderer.isWebgl2
    ? gl.getExtension('EXT_color_buffer_float')
    : gl.getExtension('OES_texture_half_float') && gl.getExtension('EXT_color_buffer_half_float');
  if (!supported || !gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision) return;
  return new Flowmap(gl, { size: 192, falloff: 0.19, alpha: 0.90, dissipation: 0.947 });
}

export function startGlass(
  canvas: HTMLCanvasElement, image: HTMLImageElement, lightsOff: HTMLImageElement, fog: HTMLDivElement,
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

  const flowmap = setupFlowmap(renderer);
  const clearCity = new Texture(gl, { flipY: false, generateMipmaps: false });
  const darkCity = new Texture(gl, { flipY: false, generateMipmaps: false });
  const view = fog.parentElement;
  const street = image.closest('.city-street');
  const emptyFlow = flowmap ? undefined : new Texture(gl, { generateMipmaps: false });
  const uniforms = {
    clearCity: { value: clearCity },
    flowField: flowmap?.uniform ?? { value: emptyFlow },
    size: { value: new Vec2() },
    cover: { value: new Vec2() },
    clock: { value: 0 },
    gaze: { value: new Vec2() },
    opening: { value: [0, 0, 0, 0] },
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
  let targetX = 0;
  let targetY = 0;
  let gazeX = 0;
  let gazeY = 0;
  let width = 0;
  let height = 0;
  const cursor = new Vec2(-1, -1);
  const velocity = new Vec2();
  let pointerTime = -Infinity;
  let moved = false;

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
    if (!isCityBackdrop(target)) return;
    const point = panePoint(event);
    if (!point) return;
    // A drag that starts on the backdrop moves the portal without selecting page text.
    if (event.pointerType === 'mouse' && target instanceof Element && !target.closest('p, h1, li')) {
      event.preventDefault();
    }
    heldPointer = event.pointerId;
    portalX = point.x;
    portalY = point.y;
  }

  function closePortal() {
    heldPointer = undefined;
    portalRadius = 0;
    view?.style.removeProperty('--city-portal-mask');
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
    const opening = uniforms.opening.value;
    opening[0] = x;
    opening[1] = y;
    opening[2] = portalRadius;
    opening[3] = feather;

    // Match the shader's opening so both the glass and the street blur clear together.
    const mask = portalRadius
      ? `radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, transparent ${portalRadius.toFixed(1)}px, black ${(portalRadius + feather).toFixed(1)}px)`
      : '';
    if (mask !== previousMask) {
      view?.style.setProperty('--city-portal-mask', mask);
      previousMask = mask;
    }
  }

  function resetGaze() {
    targetX = 0;
    targetY = 0;
    pointerTime = -Infinity;
    moved = false;
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
    if (flowmap) {
      const delay = event.timeStamp - pointerTime;
      if (delay < 85) {
        const dt = Math.max(8, delay);
        velocity.set((point.x - cursor.x) * width / dt, (point.y - cursor.y) * height / dt);
        const speed = velocity.len();
        if (speed > 1) velocity.scale(1 / speed);
        moved = true;
      }
      cursor.set(point.x, point.y);
      pointerTime = event.timeStamp;
    }
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

  function render(now: number) {
    const step = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    elapsed += step;
    const ease = 1 - Math.exp(-step * 8);
    gazeX += (targetX - gazeX) * ease;
    gazeY += (targetY - gazeY) * ease;
    previous = now;
    if (flowmap) {
      // When the pointer pauses, keep decaying the existing wake without adding a new stamp.
      if (moved) {
        flowmap.mouse.set(cursor.x, 1 - cursor.y);
        flowmap.velocity.lerp(velocity, 0.65);
      } else {
        flowmap.mouse.set(-1, -1);
        flowmap.velocity.scale(0.6);
      }
      flowmap.update();
      moved = false;
    }
    const dark = darkCity.image && street?.hasAttribute('data-lights-off');
    uniforms.clearCity.value = dark ? darkCity : clearCity;
    // Match the centered object-fit crop for the current exposure.
    const sourceAspect = dark ? lightsOff.naturalWidth / lightsOff.naturalHeight : textureAspect;
    const ratio = width / height / sourceAspect;
    uniforms.cover.value.set(Math.min(1, ratio), Math.min(1, 1 / ratio));
    uniforms.clock.value = elapsed;
    uniforms.gaze.value.set(gazeX, gazeY);
    drawPortal(ease);
    renderer.render({ scene: glass, frustumCull: false });
    if (!canvas.hasAttribute('data-ready')) canvas.setAttribute('data-ready', '');
    frame = requestAnimationFrame(render);
  }

  function update() {
    cancelAnimationFrame(frame);
    previous = 0;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!textureAspect || !width || !height || !visible || lost || document.hidden) return;
    renderer.dpr = Math.min(devicePixelRatio, 1.5);
    renderer.setSize(width, height);
    // CSS owns the layout size so preview resizing stays responsive.
    canvas.style.removeProperty('width');
    canvas.style.removeProperty('height');
    uniforms.size.value.set(width, height);
    if (flowmap) flowmap.aspect = width / height;
    frame = requestAnimationFrame(render);
  }

  function loadImage() {
    if (!image.complete || !image.naturalWidth || lost) return;
    textureAspect = image.naturalWidth / image.naturalHeight;
    clearCity.image = image;
    clearCity.needsUpdate = true;
    update();
  }

  function loadDarkImage() {
    if (!lightsOff.complete || !lightsOff.naturalWidth || lost) return;
    darkCity.image = lightsOff;
    darkCity.needsUpdate = true;
    darkCity.update();
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
  lightsOff.addEventListener('load', loadDarkImage);
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
  loadDarkImage();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    intersection.disconnect();
    image.removeEventListener('load', loadImage);
    lightsOff.removeEventListener('load', loadDarkImage);
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
    view?.style.removeProperty('--city-portal-mask');
    releaseMesh(glass);
    gl.deleteTexture(clearCity.texture);
    gl.deleteTexture(darkCity.texture);
    if (emptyFlow) gl.deleteTexture(emptyFlow.texture);
    if (flowmap) {
      releaseMesh(flowmap.mesh);
      for (const target of [flowmap.mask.read, flowmap.mask.write]) {
        gl.deleteFramebuffer(target.buffer);
        gl.deleteTexture(target.texture.texture);
      }
    }
  };
}

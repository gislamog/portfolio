const simulationStep = 1 / 60;
const restTime = 1.6;
const neutralHeight = 128 / 255;

type PanePoint = { x: number; y: number };

export function createCursorRipples(gl: WebGLRenderingContext, program: WebGLProgram) {
  const framebuffer = gl.createFramebuffer();
  const textures = [gl.createTexture(), gl.createTexture()];
  if (!framebuffer || textures.some(texture => !texture)) {
    gl.deleteFramebuffer(framebuffer);
    textures.forEach(texture => gl.deleteTexture(texture));
    return;
  }

  const history = gl.getUniformLocation(program, 'history');
  const texel = gl.getUniformLocation(program, 'texel');
  const stroke = gl.getUniformLocation(program, 'stroke');
  const impulse = gl.getUniformLocation(program, 'impulse');
  gl.useProgram(program);
  gl.uniform1i(history, 1);
  gl.activeTexture(gl.TEXTURE1);
  for (const texture of textures) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  let width = 0;
  let height = 0;
  let current = 0;
  let accumulator = 0;
  let remaining = 0;
  let pending: PanePoint | undefined;
  let lastSample: PanePoint | undefined;

  function clearField() {
    // The two signed heights are packed into RG and BA for WebGL 1 RGBA8 targets.
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.clearColor(neutralHeight, 0, neutralHeight, 0);
    for (const texture of textures) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function endStroke() {
    pending = undefined;
    lastSample = undefined;
  }

  return {
    resize(viewWidth: number, viewHeight: number) {
      const scale = Math.min(128 / Math.min(viewWidth, viewHeight), 240 / Math.max(viewWidth, viewHeight));
      const nextWidth = Math.max(1, Math.round(viewWidth * scale));
      const nextHeight = Math.max(1, Math.round(viewHeight * scale));
      if (width === nextWidth && height === nextHeight) return;
      width = nextWidth;
      height = nextHeight;
      gl.activeTexture(gl.TEXTURE1);
      for (const texture of textures) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
      clearField();
      remaining = 0;
      endStroke();
    },
    move(point: PanePoint) {
      pending = point;
      lastSample ??= point;
    },
    endStroke,
    advance(step: number, viewWidth: number, viewHeight: number) {
      accumulator += step;
      if (accumulator < simulationStep) return;
      const steps = Math.floor(accumulator / simulationStep);
      accumulator -= steps * simulationStep;

      const start = lastSample;
      const end = pending;
      let strength = 0;
      if (start && end) {
        const distance = Math.hypot((end.x - start.x) * viewWidth, (end.y - start.y) * viewHeight);
        if (distance >= 0.75 && distance < 180) {
          strength = Math.min(0.26, 0.026 + distance * 0.005);
        }
        lastSample = end;
      }

      if (strength > 0) remaining = restTime;
      if (!remaining) return;
      remaining = Math.max(0, remaining - steps * simulationStep);
      if (!remaining) {
        clearField();
        return;
      }

      gl.useProgram(program);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, width, height);
      gl.uniform2f(texel, 1 / width, 1 / height);
      if (start && end && strength > 0) {
        gl.uniform4f(stroke, start.x, 1 - start.y, end.x, 1 - end.y);
      }
      gl.activeTexture(gl.TEXTURE1);
      for (let i = 0; i < steps; i++) {
        const next = 1 - current;
        gl.bindTexture(gl.TEXTURE_2D, textures[current]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[next], 0);
        gl.uniform1f(impulse, i === 0 ? strength : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        current = next;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    bind(fieldSize: WebGLUniformLocation | null) {
      gl.uniform2f(fieldSize, remaining ? 1 / width : 0, remaining ? 1 / height : 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[current]);
    },
    dispose() {
      gl.deleteFramebuffer(framebuffer);
      textures.forEach(texture => gl.deleteTexture(texture));
    },
  };
}

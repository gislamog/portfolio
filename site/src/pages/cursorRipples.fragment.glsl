// Adapted from Shaders' MIT-licensed CursorRipples simulation.
// https://github.com/shader-effects-inc/shaders/tree/main/packages/core/src/shaders/CursorRipples
// See cursorRipples.LICENSE.txt.
precision highp float;

uniform sampler2D history;
uniform vec2 texel;
uniform vec4 stroke;
uniform float impulse;

float unpackHeight(vec2 encoded) {
    return dot(encoded, vec2(255.0, 1.0)) / 128.0 - 1.0;
}

vec2 packHeight(float height) {
    float value = clamp(height * 128.0 + 128.0, 0.0, 255.0);
    return vec2(floor(value) / 255.0, fract(value));
}

float heightAt(vec2 uv) {
    return unpackHeight(texture2D(history, uv).rg);
}

void main() {
    vec2 uv = gl_FragCoord.xy * texel;
    vec4 state = texture2D(history, uv);
    float height = unpackHeight(state.rg);
    float previous = unpackHeight(state.ba);
    float neighbors = heightAt(uv + vec2(texel.x, 0.0))
        + heightAt(uv - vec2(texel.x, 0.0))
        + heightAt(uv + vec2(0.0, texel.y))
        + heightAt(uv - vec2(0.0, texel.y));
    float next = (height + (height - previous) * 0.93
        + (neighbors - 4.0 * height) * 0.42) * 0.992;

    if (impulse > 0.0) {
        // Deposit along the segment travelled this frame, including between pointer samples.
        vec2 start = stroke.xy / texel;
        vec2 segment = stroke.zw / texel - start;
        vec2 offset = gl_FragCoord.xy - start;
        float along = clamp(dot(offset, segment) / max(dot(segment, segment), 0.001), 0.0, 1.0);
        vec2 distanceToStroke = offset - segment * along;
        next += impulse * exp(-dot(distanceToStroke, distanceToStroke) * 0.19);
    }

    // Neutralize the outside cells so waves don't reflect off the edges of the scene.
    vec2 edge = min(uv, 1.0 - uv) / texel;
    next *= smoothstep(0.5, 4.0, min(edge.x, edge.y));
    gl_FragColor = vec4(packHeight(next), state.rg);
}

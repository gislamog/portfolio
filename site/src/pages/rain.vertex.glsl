// Adapted from Rain Effect by Sirrah Space, Framer Marketplace.
attribute vec2 a_position;
attribute float a_life;
attribute float a_type;
attribute vec2 a_velocity;
attribute float a_depth;

uniform vec2 u_mouse;
uniform float u_splashSize;
uniform mediump float u_streakLength;

varying float v_life;
varying float v_type;
varying vec2 v_velocity;
varying float v_depth;
varying vec2 v_worldPos;

void main() {
    float parallaxStrength = (1.5 - a_depth) * 0.15;
    vec2 parallaxPos = a_position + (u_mouse * parallaxStrength * (1.0 - a_type));

    gl_Position = vec4(parallaxPos, 0.0, 1.0);

    if (a_type > 0.5) {
        gl_PointSize = max(1.0, (3.0 * a_depth + 1.0) * u_splashSize);
    } else {
        gl_PointSize = (25.0 * a_depth + 10.0) * max(1.0, u_streakLength);
    }

    v_life = a_life;
    v_type = a_type;
    v_velocity = a_velocity;
    v_depth = a_depth;
    v_worldPos = parallaxPos;
}

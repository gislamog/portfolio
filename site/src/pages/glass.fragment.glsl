#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D clearCity;
uniform vec2 size;
uniform vec2 cover;
uniform float clock;
varying vec2 viewUV;

float random(vec2 cell) {
    vec3 p = fract(vec3(cell.xyx) * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

struct Drop {
    vec2 normal;
    float coverage;
};

// Store the lens slope and coverage together so edges remain soft.
Drop bead(vec2 p, float fade, float skew) {
    p.x -= skew * p.y * p.y;
    p.x *= 1.0 - p.y * 0.22;
    float radius = length(p);
    float coverage = (1.0 - smoothstep(0.72, 1.05, radius)) * fade;
    vec2 normal = p * sqrt(max(0.0, 1.0 - dot(p, p) * 0.78));
    return Drop(normal, coverage);
}

Drop condensation(vec2 pixel) {
    vec2 cell = floor(pixel / 33.0);
    float seed = random(cell + 23.0);
    vec2 center = 7.0 + 19.0 * vec2(random(cell), random(cell.yx + 8.0));
    float radius = mix(1.3, 4.2, seed * seed);
    vec2 p = (mod(pixel, 33.0) - center) / vec2(radius, radius * 1.22);
    return bead(p, smoothstep(0.34, 0.7, seed), seed * 0.16);
}

Drop runningWater(vec2 pixel) {
    vec2 spacing = vec2(84.0, 145.0);
    vec2 cell = floor(pixel / spacing);
    float seed = random(cell + 57.0);
    float phase = fract(clock * mix(0.14, 0.29, seed) + random(cell + 11.0));
    float travel = phase * phase;
    float y = mix(31.0, 127.0, travel);
    float x = mix(15.0, 69.0, random(cell.yx + 17.0));
    x += sin(y * 0.064 + seed * 15.0) * 2.1;
    vec2 offset = mod(pixel, spacing) - vec2(x, y);
    float radius = mix(2.4, 6.9, seed * seed);
    float fade = smoothstep(0.0, 0.12, phase) * (1.0 - smoothstep(0.86, 1.0, phase));
    fade *= smoothstep(0.22, 0.65, seed);
    Drop head = bead(offset / vec2(radius, radius * mix(1.12, 1.7, phase)), fade, seed * 0.23);
    // A moving bead leaves a thin, fading strip of clearer glass.
    float trail = smoothstep(-min(y - 2.0, 29.0), -4.0, offset.y)
        * (1.0 - smoothstep(-4.0, 0.0, offset.y))
        * (1.0 - smoothstep(0.2, 1.8, abs(offset.x)));
    return Drop(head.normal, max(head.coverage, trail * fade * travel * 0.45));
}

void main() {
    vec2 pixel = viewUV * size;
    vec2 cityUV = (viewUV - 0.5) * cover + 0.5;
    Drop fine = condensation(pixel);
    Drop running = runningWater(pixel + vec2(37.0, 61.0));
    float coverage = max(fine.coverage, running.coverage);
    vec2 normal = mix(fine.normal, running.normal, step(fine.coverage, running.coverage));
    vec2 refractedUV = cityUV - normal * 23.0 / size * cover;
    vec3 sharpCity = texture2D(clearCity, refractedUV).rgb;
    gl_FragColor = vec4(sharpCity, coverage);
}

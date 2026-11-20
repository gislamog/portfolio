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

Drop strongest(Drop a, Drop b) {
    return Drop(mix(a.normal, b.normal, step(a.coverage, b.coverage)), max(a.coverage, b.coverage));
}

Drop bead(vec2 p, float fade, float skew) {
    p.x -= skew * p.y * p.y;
    p.x *= 1.0 - clamp(p.y, -1.0, 1.0) * 0.23;
    float radius = length(p);
    float coverage = (1.0 - smoothstep(0.73, 1.08, radius)) * fade;
    vec2 normal = p * sqrt(max(0.0, 1.0 - dot(p, p) * 0.78));
    return Drop(normal, coverage);
}

// Uneven wet patches follow roughly vertical bands across the pane.
float wetness(vec2 pixel) {
    float x = pixel.x + 8.0 * sin(pixel.y * 0.019) + 4.0 * sin(pixel.y * 0.047);
    float bands = sin(x * 0.083) + 0.64 * sin(x * 0.037 + pixel.y * 0.019);
    return smoothstep(-0.46, 1.1, bands + 0.37 * sin(pixel.y * 0.057 + x * 0.028));
}

Drop condensation(vec2 pixel, float wet) {
    vec2 cell = floor(pixel / 7.0);
    float seed = random(cell + 23.0);
    vec2 center = 1.9 + 3.2 * vec2(random(cell), random(cell.yx + 8.0));
    float radius = mix(0.65, 1.65, seed * seed);
    vec2 p = (mod(pixel, 7.0) - center) / vec2(radius, radius * 1.1);
    float fade = smoothstep(0.49, 0.84, seed + wet * 0.35) * mix(0.14, 0.62, wet);
    return bead(p, fade, seed * 0.18);
}

Drop beads(vec2 pixel) {
    vec2 cell = floor(pixel / 28.0);
    float seed = random(cell + 41.0);
    vec2 center = 7.0 + 14.0 * vec2(random(cell + 51.0), random(cell.yx + 3.0));
    float radius = mix(1.3, 4.6, seed * seed);
    float stretch = mix(0.87, 1.48, random(cell + 79.0));
    vec2 p = (mod(pixel, 28.0) - center) / vec2(radius, radius * stretch);
    return bead(p, smoothstep(0.26, 0.68, seed), seed * 0.24 - 0.08);
}

float runoffX(float y, float seed) {
    return sin(y * 0.055 + seed * 15.0) * 2.4
        + sin(y * 0.027 + seed * 6.0) * 3.6;
}

Drop runningWater(vec2 pixel) {
    vec2 spacing = vec2(93.0, 228.0);
    vec2 cell = floor(pixel / spacing);
    vec2 local = mod(pixel, spacing);
    float seed = random(cell + 57.0);
    float phase = fract(clock * mix(0.14, 0.29, seed) + random(cell + 11.0));
    float travel = phase * phase;
    float y = mix(37.0, 205.0, travel);
    float x = mix(18.0, 75.0, random(cell.yx + 17.0));
    vec2 offset = local - vec2(x + runoffX(y, seed), y);
    float radius = mix(2.5, 7.4, seed * seed);
    float fade = smoothstep(0.0, 0.12, phase) * (1.0 - smoothstep(0.89, 1.0, phase));
    fade *= smoothstep(0.24, 0.65, seed);
    Drop head = bead(offset / vec2(radius, radius * mix(1.18, 1.85, phase)), fade, seed * 0.23);

    float lengthBehind = min(y - 2.0, mix(35.0, 126.0, seed));
    float tail = smoothstep(-lengthBehind, -lengthBehind * 0.31, offset.y)
        * (1.0 - smoothstep(-4.0, 0.0, offset.y));
    float width = mix(0.72, radius * 0.47, tail)
        * (0.82 + 0.18 * sin(local.y * 0.29 + seed * 17.0));
    float channel = (local.x - x - runoffX(local.y, seed)) / width;
    float coverage = (1.0 - smoothstep(0.47, 1.15, abs(channel))) * tail * fade * 0.72;
    return strongest(head, Drop(vec2(clamp(channel, -1.0, 1.0) * 0.48, 0.06), coverage));
}

void main() {
    vec2 pixel = viewUV * size;
    vec2 cityUV = (viewUV - 0.5) * cover + 0.5;
    float wet = wetness(pixel);
    Drop water = strongest(condensation(pixel, wet), beads(pixel + vec2(11.0, 17.0)));
    water = strongest(water, runningWater(pixel + vec2(37.0, 61.0)));

    vec2 displacement = water.normal * 23.0;
    vec3 refracted = texture2D(clearCity, cityUV - displacement / size * cover).rgb;
    vec2 light = vec2(-0.44, -0.9);
    float rim = smoothstep(0.43, 0.56, dot(water.normal, light));
    float shade = smoothstep(0.32, 0.56, dot(water.normal, -light));
    float brightness = dot(refracted, vec3(0.2126, 0.7152, 0.0722));
    vec3 lens = refracted * (1.07 - shade * 0.12)
        + vec3(0.22, 0.33, 0.43) * 0.48
        + vec3(0.71, 0.85, 0.96) * rim * (0.27 + brightness * 0.34);

    // Broad variations in the mist keep the smaller wet bands from reading as stripes.
    float fogBank = 0.5 + 0.5 * sin(pixel.x * 0.008 - pixel.y * 0.006
        + sin(pixel.y * 0.012 + pixel.x * 0.004) * 1.7);
    float mist = 0.145 + wet * 0.16 + fogBank * 0.07;
    float coverage = water.coverage * 0.76;
    float alpha = coverage + mist * (1.0 - coverage);
    vec3 film = vec3(0.51, 0.64, 0.75) * mist;
    vec3 color = lens * coverage + film * (1.0 - coverage);
    gl_FragColor = vec4(color, alpha);
}

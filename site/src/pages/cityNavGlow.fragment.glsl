precision mediump float;

uniform sampler2D city;
uniform vec2 size;
uniform vec2 imageOrigin;
uniform vec2 imageSpan;
uniform vec3 tab;
uniform vec3 hoverTab;
uniform float bottom;
varying mediump vec2 viewUV;

vec3 sceneAt(vec2 pixel) {
    return texture2D(city, imageOrigin + pixel / size * imageSpan, 3.0).rgb;
}

float lightness(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

vec4 cityLight(vec2 pixel) {
    vec3 a = sceneAt(pixel + vec2(-32.0, 10.0));
    vec3 b = sceneAt(pixel + vec2(-11.0, 28.0));
    vec3 c = sceneAt(pixel + vec2(17.0, 8.0));
    vec3 d = sceneAt(pixel + vec2(36.0, 30.0));
    vec4 weights = vec4(lightness(a), lightness(b), lightness(c), lightness(d));
    weights = weights * weights + 0.025;
    vec3 sampled = (a * weights.x + b * weights.y + c * weights.z + d * weights.w)
        / dot(weights, vec4(1.0));
    float peak = max(max(sampled.r, sampled.g), sampled.b);
    vec3 hue = mix(vec3(0.57, 0.61, 0.77), sampled / max(peak, 0.09), smoothstep(0.07, 0.35, peak));
    return vec4(hue, smoothstep(0.09, 0.62, peak));
}

vec4 underline(vec2 pixel, vec3 geometry, float intensity) {
    float dy = abs(pixel.y - geometry.y);
    float dx = max(0.0, abs(pixel.x - geometry.x) - geometry.z);
    float core = (1.0 - smoothstep(0.28, 1.16, dy)) * (1.0 - smoothstep(0.0, 1.5, dx));
    float halo = 0.19 * exp(-dy * 0.33 - dx * 0.19)
        + 0.065 * exp(-dy * 0.105 - dx * 0.10);
    vec3 color = mix(cityLight(geometry.xy).rgb, vec3(1.0), 0.20);
    float alpha = min(0.90, (core * 0.78 + halo) * intensity);
    return vec4(color * alpha, alpha);
}

void main() {
    vec2 pixel = size * viewUV;
    float fade = smoothstep(0.0, 0.18, viewUV.x)
        * (1.0 - smoothstep(0.82, 1.0, viewUV.x));
    float rise = max(bottom - pixel.y, 0.0);
    float spill = max(pixel.y - bottom, 0.0);
    float distanceToLine = rise + spill;
    vec2 baseline = vec2(pixel.x, bottom);
    float spread = 15.0 + rise * 0.52;
    vec4 local = (cityLight(baseline) * 2.0
        + cityLight(baseline - vec2(spread, 0.0)) + cityLight(baseline + vec2(spread, 0.0))) * 0.25;
    float core = 0.29 * exp(-distanceToLine * 1.15);
    float bloom = (0.17 + local.a * 0.15) * exp(-rise * 0.18 - spill * 0.50);
    float haze = (0.025 + local.a * 0.10) * exp(-rise * 0.062 - spill * 0.34);
    float separator = fade * (core + bloom + haze);

    vec4 light = underline(pixel, tab, 1.0);
    if (hoverTab.z > 0.0) {
        vec4 hover = underline(pixel, hoverTab, 0.76);
        light += hover * (1.0 - light.a);
    }
    gl_FragColor = light + vec4(local.rgb, 1.0) * separator * (1.0 - light.a);
}

precision mediump float;

uniform sampler2D city;
uniform vec2 size;
uniform vec2 imageOrigin;
uniform vec2 imageSpan;
uniform vec3 tab;
uniform float bottom;
varying mediump vec2 viewUV;

vec3 sceneAt(vec2 pixel) {
    return texture2D(city, imageOrigin + pixel / size * imageSpan).rgb;
}

float lightness(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

vec3 cityLight(vec2 pixel) {
    vec3 a = sceneAt(pixel + vec2(-32.0, 10.0));
    vec3 b = sceneAt(pixel + vec2(-11.0, 28.0));
    vec3 c = sceneAt(pixel + vec2(17.0, 8.0));
    vec3 d = sceneAt(pixel + vec2(36.0, 30.0));
    vec4 weights = vec4(lightness(a), lightness(b), lightness(c), lightness(d));
    weights = weights * weights + 0.025;
    vec3 sampled = (a * weights.x + b * weights.y + c * weights.z + d * weights.w)
        / dot(weights, vec4(1.0));
    float peak = max(max(sampled.r, sampled.g), sampled.b);
    return mix(vec3(0.61, 0.65, 0.79), sampled / max(peak, 0.09), smoothstep(0.07, 0.35, peak));
}

void main() {
    vec2 pixel = size * viewUV;
    float fade = smoothstep(0.0, 0.20, viewUV.x) * (1.0 - smoothstep(0.80, 1.0, viewUV.x));
    float separatorDistance = abs(pixel.y - bottom);
    float separator = fade * (0.37 * exp(-separatorDistance * 1.6)
        + 0.17 * exp(-separatorDistance * 0.29));
    vec3 separatorColor = cityLight(vec2(pixel.x, bottom));

    vec3 activeColor = mix(cityLight(tab.xy), vec3(1.0), 0.27);
    float dy = abs(pixel.y - tab.y);
    float dx = max(0.0, abs(pixel.x - tab.x) - tab.z);
    float core = (1.0 - smoothstep(0.35, 1.45, dy)) * (1.0 - smoothstep(0.0, 1.5, dx));
    float halo = 0.43 * exp(-dy * 0.23 - dx * 0.17)
        + 0.16 * exp(-dy * 0.085 - dx * 0.08);
    float active = min(0.98, core * 0.94 + halo);
    vec3 color = activeColor * active + separatorColor * separator * (1.0 - active);
    gl_FragColor = vec4(color, active + separator * (1.0 - active));
}

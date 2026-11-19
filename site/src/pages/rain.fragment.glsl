// Adapted from Rain Effect by Sirrah Space, Framer Marketplace.
precision mediump float;
uniform vec3 u_rainColor;
uniform float u_streakLength;
uniform float u_streakThickness;
uniform float u_rainOpacity;
uniform vec3 u_splashColor;
uniform bool u_enableLighting;
uniform vec3 u_lightColor;
uniform float u_lightIntensity;
uniform float u_lightRadius;
uniform vec2 u_lightPos;
uniform float u_lightningIntensity;
uniform vec3 u_lightningColor;

varying float v_life;
varying float v_type;
varying vec2 v_velocity;
varying float v_depth;
varying vec2 v_worldPos;

void main() {
    float lightDist = distance(v_worldPos, u_lightPos);
    float lightFalloff = 1.0 / (1.0 + (lightDist * lightDist) / (u_lightRadius * u_lightRadius));
    float lightEffect = lightFalloff * u_lightIntensity;

    float flashEffect = u_lightningIntensity * 0.8;

    if (v_type < 0.5) {
        vec2 coord = gl_PointCoord - vec2(0.5);

        float speed = length(v_velocity);
        float dropLength = speed * 60.0 * min(1.0, u_streakLength);

        float angle = atan(v_velocity.y, v_velocity.x) - 1.5708;
        float c = cos(angle);
        float s = sin(angle);
        vec2 rotated = vec2(
            coord.x * c - coord.y * s,
            coord.x * s + coord.y * c
        );

        float taper = (1.0 - smoothstep(-0.4, 0.4, rotated.y));
        float thickness = (25.0 + (1.0 - v_depth) * 15.0) * max(1.0, u_streakLength) / u_streakThickness;

        float distX = rotated.x * thickness / (taper + 0.15);
        float distY = (rotated.y + 0.15) / dropLength;
        float dist = length(vec2(distX, distY));

        float alpha = (1.0 - smoothstep(0.1, 1.0, dist));

        float tailGradient = smoothstep(-0.4, 0.4, rotated.y);
        alpha *= (1.0 - tailGradient * 0.9);

        float glowDist = length(vec2(rotated.x * thickness * 0.8, (rotated.y + 0.2) / (dropLength * 0.4)));
        float glow = exp(-glowDist * 6.0) * 0.8;
        alpha = max(alpha, glow);

        alpha *= (0.15 + 0.85 * v_depth) * u_rainOpacity;

        vec3 highlightColor = clamp(u_rainColor * 1.5 + vec3(0.1, 0.2, 0.25), 0.0, 1.0);
        vec3 finalColor = mix(u_rainColor, highlightColor, glow * 1.2);

        if (u_enableLighting) {
            finalColor *= (1.0 + u_lightColor * lightEffect * 1.5);
            alpha *= (1.0 + lightEffect * 0.5);
        }

        finalColor += u_lightningColor * flashEffect * 0.6;
        alpha *= (1.0 + flashEffect * 0.3);

        gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), alpha);
    } else {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);

        float alpha = max(0.0, (1.0 - dist * 2.0)) * v_life * 1.5;
        alpha *= (0.3 + 0.7 * v_depth);

        vec3 highlightColor = clamp(u_splashColor * 1.2 + vec3(0.1, 0.2, 0.25), 0.0, 1.0);
        vec3 finalColor = mix(u_splashColor, highlightColor, (1.0 - dist) * v_life);

        if (u_enableLighting) {
            finalColor *= (1.0 + u_lightColor * lightEffect * 2.0);
            alpha *= (1.0 + lightEffect * 0.8);
        }

        finalColor += u_lightningColor * flashEffect * 0.8;
        alpha *= (1.0 + flashEffect * 0.5);

        gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), alpha);
    }
}

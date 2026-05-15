/**
 * Mercury — a mercury-like WebGL gradient shader.
 *
 * Uniforms (matches the useWebGL / aurora/plasma convention):
 *   R            vec2   canvas resolution
 *   T            float  elapsed time (seconds)
 *   uColors[8]   vec3   colour palette (padded to 8 by useWebGL.setColors)
 *   uColorCount  int    actual number of colours in use
 *   uFlow        float  how fast the mercury warp evolves   (default 0.4)
 *   uScale       float  spatial zoom of the warp pattern (default 1.2)
 *   uSheen       float  specular-sheen intensity          (default 0.5)
 *   uNoise       float  fine grain overlay amount         (default 0.06)
 */
export function buildMercuryShader() {
    return `
    precision mediump float;

    uniform vec2  R;
    uniform float T;
    uniform vec3  uColors[8];
    uniform int   uColorCount;
    uniform float uFlow;
    uniform float uScale;
    uniform float uSheen;
    uniform float uNoise;

    /* ── palette: smooth cyclic blend across uColorCount stops ── */
    vec3 palette(float t) {
        t = fract(t);
        float count = float(uColorCount);
        float s = t * count;
        int   i = int(s);
        float f = smoothstep(0.0, 1.0, fract(s));
        for (int j = 0; j < 7; j++) {
            if (j == i) {
                int next = int(mod(float(j) + 1.0, count));
                vec3 a = uColors[j];
                vec3 b = (next == 0) ? uColors[0] :
                         (next == 1) ? uColors[1] :
                         (next == 2) ? uColors[2] :
                         (next == 3) ? uColors[3] :
                         (next == 4) ? uColors[4] :
                         (next == 5) ? uColors[5] :
                         (next == 6) ? uColors[6] : uColors[7];
                return mix(a, b, f);
            }
        }
        return uColors[0];
    }

    /* ── cheap high-quality hash ── */
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    /* ── mercury warp: 8-iteration feedback loop (same kernel as mercuryGradient.jsx) ── */
    vec2 mercuryWarp(vec2 c, float t) {
        float damp = 1.0 / (1.0 + uScale * 0.1);
        float d = -t * 0.5;
        float a = 0.0;
        for (float i = 0.0; i < 8.0; ++i) {
            a += cos(i - d - a * c.x) * damp;
            d += sin(c.y * i + a) * damp;
        }
        d += t * 0.5;
        return vec2(a, d);
    }

    void main() {
        /* normalised coords, centred, aspect-corrected */
        vec2 uv = (gl_FragCoord.xy - 0.5 * R) / min(R.x, R.y);
        uv *= uScale;

        float t = T * uFlow;

        /* mercury warp field */
        vec2 wd = mercuryWarp(uv, t);
        float a = wd.x;
        float d = wd.y;

        /* three interference channels → palette lookup key */
        vec3 pat = vec3(
            cos(uv.x * d + a) * 0.5 + 0.5,
            cos(uv.y * a + d) * 0.5 + 0.5,
            cos((uv.x + uv.y) * (d + a) * 0.5) * 0.5 + 0.5
        );

        float palKey = fract(pat.x * 0.5 + pat.y * 0.3 + pat.z * 0.2 + t * 0.05);
        vec3 col = palette(palKey);

        /* cross-blend with a second palette sample for richer iridescence */
        vec3 col2 = palette(fract(palKey + 0.33));
        col = mix(col, col2, pat.z * 0.4);

        /* specular sheen — bright streak along warp ridges */
        float ridge = pow(clamp(cos(a * 3.0 + d * 2.0) * 0.5 + 0.5, 0.0, 1.0), 6.0);
        col = mix(col, vec3(1.0), ridge * uSheen * 0.6);

        /* secondary dark trough for contrast */
        float trough = pow(clamp(cos(d * 3.0 - a * 2.0 + 1.5) * 0.5 + 0.5, 0.0, 1.0), 4.0);
        col = mix(col, col * 0.6, trough * 0.3); 

        /* fine grain noise */
        if (uNoise > 0.001) {
            float grain = hash(uv * 300.0 + t * 0.1);
            col += uNoise * (grain - 0.5) * 0.5;
        }

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
    `;
}
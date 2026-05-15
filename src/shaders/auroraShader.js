export function buildAuroraShader(colorCount = 4) {
    return `
    precision mediump float;
    uniform vec2  R;
    uniform float T;
    uniform float uBlobSize;
    uniform float uPalSpeed;
    uniform vec3  uColors[8];
    uniform int   uColorCount;

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

    float blob(vec2 uv, vec2 c, float r) {
      return r / length(uv - c);
    }

    void main() {
      vec2  uv = (gl_FragCoord.xy - 0.5 * R) / min(R.x, R.y);
      float t  = T * 0.4;
      float sz = uBlobSize;

      float f = clamp(
        blob(uv, vec2( sin(t * 1.1) * 0.5,  cos(t * 0.7) * 0.4), sz)       +
        blob(uv, vec2( cos(t * 0.8) * 0.4,  sin(t * 1.3) * 0.5), sz * 0.9) +
        blob(uv, vec2( sin(t * 1.5 + 1.0) * 0.3, cos(t * 0.9 + 2.0) * 0.3), sz * 0.8) +
        blob(uv, vec2( cos(t * 0.6 + 1.5) * 0.5, sin(t * 1.2) * 0.4), sz),
      0.0, 1.0);

      vec3 col = palette(f * 0.7 + t * uPalSpeed);
      col = mix(vec3(0.04, 0.04, 0.06), col, pow(f, 0.6));
      gl_FragColor = vec4(col, 1.0);
    }
  `;
}
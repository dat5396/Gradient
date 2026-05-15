export function buildPlasmaShader() {
  return `
    precision mediump float;
    uniform vec2  R;
    uniform float T;
    uniform float uDensity;
uniform float uWarp;
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

    void main() {
  vec2 uv = gl_FragCoord.xy / R;
  float x = uv.x * 8.0 * uDensity;
  float y = uv.y * 6.0 * uDensity;

  float wx = x + uWarp * sin(y * 1.2 + T * 0.4);
  float wy = y + uWarp * cos(x * 0.9 - T * 0.3);

  float v = sin(wx + T);
  v += sin(wy + T * 0.7);
  v += sin(wx + wy + T * 0.5);

  float cx = wx + 0.5 * sin(T * 0.33);
  float cy = wy + 0.5 * cos(T * 0.25);
  v += sin(sqrt(cx * cx + cy * cy) + T * 0.8);
  v += sin(wx * 0.5 + T * 1.3) * 0.5;
  v += cos(wy * 0.7 - T * 0.9) * 0.5;
  v += sin((wx + wy) * 0.4 + T * 0.6) * 0.4;
  v /= 4.0;

  float t2 = v * 0.5 + 0.5 + T * 0.04;
  gl_FragColor = vec4(palette(t2), 1.0);
}
  `;
}
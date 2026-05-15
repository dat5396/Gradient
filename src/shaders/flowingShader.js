// ─── Simplex noise (2D + 3D) ─────────────────────────────────────────────────
// Ian McEwan & Stefan Gustavson — MIT licence
const SIMPLEX_GLSL = `
vec3 _mod289v3(vec3 x) { return x - floor(x*(1.0/289.0))*289.0; }
vec4 _mod289v4(vec4 x) { return x - floor(x*(1.0/289.0))*289.0; }
vec2 _mod289v2(vec2 x) { return x - floor(x*(1.0/289.0))*289.0; }
vec3 _permv3(vec3 x)   { return _mod289v3(((x*34.0)+1.0)*x); }
vec4 _permv4(vec4 x)   { return _mod289v4(((x*34.0)+1.0)*x); }
vec4 _taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314*r; }

float snoise2(vec2 v) {
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1  = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = _mod289v2(i);
  vec3 p = _permv3(_permv3(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0*fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float snoise3(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0,0.5,1.0,2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = _mod289v3(i);
  vec4 p = _permv4(_permv4(_permv4(
    i.z + vec4(0.0,i1.z,i2.z,1.0))
    + i.y + vec4(0.0,i1.y,i2.y,1.0))
    + i.x + vec4(0.0,i1.x,i2.x,1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4  j  = p - 49.0*floor(p*ns.z*ns.z);
  vec4  x_ = floor(j*ns.z);
  vec4  y_ = floor(j - 7.0*x_);
  vec4  x  = x_*ns.x + ns.yyyy;
  vec4  y  = y_*ns.x + ns.yyyy;
  vec4  h  = 1.0 - abs(x) - abs(y);
  vec4  b0 = vec4(x.xy, y.xy);
  vec4  b1 = vec4(x.zw, y.zw);
  vec4  s0 = floor(b0)*2.0 + 1.0;
  vec4  s1 = floor(b1)*2.0 + 1.0;
  vec4  sh = -step(h, vec4(0.0));
  vec4  a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4  a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3  p0 = vec3(a0.xy, h.x);
  vec3  p1 = vec3(a0.zw, h.y);
  vec3  p2 = vec3(a1.xy, h.z);
  vec3  p3 = vec3(a1.zw, h.w);
  vec4  norm = _taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
  m = m*m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

// ─── Fragment shader body ─────────────────────────────────────────────────────
export function buildFlowingShader() {
    return `
precision mediump float;

uniform vec2  R;       // canvas resolution (drawingBufferWidth, drawingBufferHeight)
uniform float T;       // time in seconds (driven by useAnimationFrame / export pipeline)
uniform float uWaveAmp;    // wave amplitude  — maps to params.waveAmp
uniform float uWaveSpeed;  // wave speed      — maps to params.waveSpeed
uniform float uBlurAmt;    // blur softness   — maps to params.blurAmt
uniform vec3  uColors[8];  // gradient stops  — same layout as AuroraCanvas
uniform int   uColorCount;
uniform sampler2D uGradientTex; // 256×1 texture baked from uColors each frame
uniform float uScale; 

${SIMPLEX_GLSL}

// ── Utilities ──────────────────────────────────────────────────────────────
float smoothstep5(float t) { return t*t*t*(t*(6.0*t-15.0)+10.0); }
float _lerp(float a, float b, float t) { return a*(1.0-t)+b*t; }
float easeIn(float x) { return 1.0 - cos(x * 3.14159 * 0.5); }

// Canvas-space x — centres the noise field independent of canvas width
float cx() { return (900.0 + gl_FragCoord.x - R.x*0.5) / uScale; }

// ── Wave Y noise (stacked simplex) ────────────────────────────────────────
float waveYNoise(float offset) {
  float spd   = uWaveSpeed;
  float time  = T + offset;
  float x     = cx() * 0.000845;
  float xs    = time * 0.026 * spd;
  float y     = time * 0.075 * spd;
  float sum   = 0.0;
  sum += snoise2(vec2(x*1.30 + xs, y*0.54)) * 0.85;
  sum += snoise2(vec2(x*1.00 + xs, y*0.68)) * 1.15;
  sum += snoise2(vec2(x*0.70 + xs, y*0.59)) * 0.60;
  sum += snoise2(vec2(x*0.40 + xs, y*0.48)) * 0.40;
  return sum;
}

// ── Background lightness noise (animated 2D via 3D simplex) ──────────────
float bgNoise(float offset) {
  float time  = T + offset;
  float xs    = time * 0.04;
  float x     = cx()            * 0.00085;
  float y     = gl_FragCoord.y  * 0.00085 * (1.0/0.27);
  float sum   = 0.5;
  sum += snoise3(vec3(x*1.5 + xs*1.1, y*1.00, time*0.064)) * 0.30;
  sum += snoise3(vec3(x*0.9 - xs*0.6, y*0.85, time*0.064)) * 0.25;
  sum += snoise3(vec3(x*0.6 + xs*0.8, y*0.70, time*0.064)) * 0.20;
  return sum;
}

// ── Dynamic blur factor ───────────────────────────────────────────────────
float calcBlur(float offset) {
  float time = T + offset;
  float x    = cx() * 0.0011;
  float bf   = _lerp(-0.17, -0.04, (sin(T*0.261)+1.0)*0.5); // oscillating bias
  bf += snoise2(vec2(x*0.60 + time*0.03,   time*0.049)) * 0.5;
  bf += snoise2(vec2(x*1.30 - time*0.024,  time*0.07))  * 0.4;
  return clamp((bf + 1.0)*0.5, 0.0, 1.0);
}

// ── Wave alpha with smoothstep blur ───────────────────────────────────────
float waveAlpha(float waveY, float waveH, float offset) {
  float wy   = waveY + waveYNoise(offset) * waveH * uWaveAmp;
  float dist = wy - gl_FragCoord.y;
  float bf   = calcBlur(offset);
  float blurMax = uBlurAmt * 600.0;
  // 4-sample quality loop (matches blurQuality=4 from the article)
  float sum = 0.0;
  for (int i = 0; i < 4; i++) {
    float t  = 0.25*float(i) + 0.125;
    float ex = _lerp(0.9, 1.2, t);
    float v  = pow(bf, ex);
    v = easeIn(v);
    v = smoothstep5(v);
    v = clamp(v, 0.008, 1.0) * blurMax;
    float a = clamp(0.5 + dist/v, 0.0, 1.0);
    sum += smoothstep5(a) * 0.25;
  }
  return sum;
}

void main() {
  // Wave geometry — proportional to canvas height, same as the article
  float W1_Y = 0.45 * R.y;
  float W2_Y = 0.90 * R.y;
  float W1_H = 0.195 * R.y;
  float W2_H = 0.144 * R.y;

  // Three independent noise fields (offsets keep them from syncing)
  float bgL = bgNoise(-192.4);
  float w1L = bgNoise( 273.3);
  float w2L = bgNoise( 623.1);

  // Two waves
  float w1A = waveAlpha(W1_Y, W1_H, 112.5 * 48.75);
  float w2A = waveAlpha(W2_Y, W2_H, 225.0 * 36.00);

  // Composite
  float lightness = bgL;
  lightness = _lerp(lightness, w2L, w2A);
  lightness = _lerp(lightness, w1L, w1A);
  lightness = clamp(lightness, 0.0, 1.0);

  // Map lightness → colour via gradient texture (same sampler2D pattern as palette())
  gl_FragColor = texture2D(uGradientTex, vec2(lightness, 0.5));
}
  `;
}
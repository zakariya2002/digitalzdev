/**
 * Shaders GLSL des scènes WebGL.
 *
 * Le bruit simplex 3D est l'implémentation de référence d'Ashima Arts /
 * Stefan Gustavson (licence MIT), utilisée telle quelle.
 */

const SIMPLEX_NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Bruit fractal : quatre octaves suffisent pour des crêtes lisibles sans coût.
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}
`

/* ------------------------------------------------------------------ */
/* Hero : sphère déformée par le bruit, liseré accentué par le Fresnel  */
/* ------------------------------------------------------------------ */

export const heroVertex = /* glsl */ `
${SIMPLEX_NOISE}

uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uVelocity;
uniform vec2  uPointer;

varying vec3  vNormal;
varying vec3  vViewPosition;
varying float vDisplacement;

// Déplacement radial d'un point de la sphère unité.
float displace(vec3 p) {
  // Deux échelles superposées : les grandes ondulations donnent la silhouette,
  // la seconde passe creuse les crêtes fines qui accrochent la lumière.
  float base = fbm(p * uFrequency + vec3(0.0, 0.0, uTime * 0.22));
  float ridges = snoise(p * uFrequency * 3.1 + vec3(0.0, uTime * 0.12, 0.0));
  // Le pointeur creuse localement la surface, comme une main posée dessus.
  float pointer = smoothstep(1.1, 0.0, distance(p.xy, uPointer * 1.4));
  return (base + ridges * 0.15) * uAmplitude + pointer * 0.13 + uVelocity * 0.1 * base;
}

void main() {
  vec3 base = normalize(position);
  float d = displace(base);
  vec3 displaced = base * (1.0 + d);

  // Normales recalculées par différences finies : sans ça l'éclairage reste
  // celui de la sphère lisse et les crêtes disparaissent. Le pas est court,
  // sinon le lissage efface le relief fin qu'on vient d'ajouter.
  vec3 up = abs(base.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(base, up));
  vec3 t2 = normalize(cross(base, t1));
  float eps = 0.018;

  vec3 na = normalize(base + t1 * eps);
  vec3 nb = normalize(base + t2 * eps);
  vec3 pa = na * (1.0 + displace(na));
  vec3 pb = nb * (1.0 + displace(nb));

  vec3 newNormal = normalize(cross(pa - displaced, pb - displaced));
  if (dot(newNormal, base) < 0.0) newNormal = -newNormal;

  vNormal = normalize(normalMatrix * newNormal);
  vDisplacement = d;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`

export const heroFragment = /* glsl */ `
uniform vec3  uBaseColor;
uniform vec3  uAccentColor;
uniform vec3  uGlowColor;
uniform vec3  uShadowColor;
uniform float uOpacity;
uniform float uTime;

varying vec3  vNormal;
varying vec3  vViewPosition;
varying float vDisplacement;

const vec3 KEY_DIR  = vec3( 0.55,  0.72,  0.42);
const vec3 FILL_DIR = vec3(-0.72, -0.15,  0.35);

void main() {
  vec3 normal  = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 keyDir  = normalize(KEY_DIR);
  vec3 fillDir = normalize(FILL_DIR);

  float key  = clamp(dot(normal, keyDir),  0.0, 1.0);
  float fill = clamp(dot(normal, fillDir), 0.0, 1.0);

  // Fresnel : la lumière rase les bords, c'est là que naît le liseré doré.
  float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 3.0);

  // Spéculaire Blinn-Phong : c'est ce point brillant qui fait lire la matière
  // comme une céramique plutôt que comme un aplat de couleur.
  vec3 halfway = normalize(keyDir + viewDir);
  float spec = pow(clamp(dot(normal, halfway), 0.0, 1.0), 42.0);

  // Les ombres tirent vers une teinte froide : un objet monochrome paraît plat,
  // la dérive chromatique lui rend son volume.
  vec3 color = mix(uShadowColor, uBaseColor, 0.18 + key * 0.82);
  color += uBaseColor * fill * 0.28;
  color = mix(color, uAccentColor, fresnel * 0.55);
  color += uGlowColor * spec * 1.6;

  // Les crêtes captent un supplément de lumière, comme des arêtes polies.
  color += uAccentColor * smoothstep(0.03, 0.16, vDisplacement) * 0.22;

  // Respiration très lente, pour que la surface ne paraisse jamais figée.
  color *= 1.0 + 0.03 * sin(uTime * 0.6 + vDisplacement * 12.0);

  float alpha = uOpacity * (0.9 + fresnel * 0.1);
  gl_FragColor = vec4(color, alpha);
}
`

/* ------------------------------------------------------------------ */
/* Galerie : plans texturés, coins arrondis, aberration à la vitesse    */
/* ------------------------------------------------------------------ */

export const planeVertex = /* glsl */ `
uniform float uTime;
uniform float uVelocity;
uniform float uActive;
uniform float uHover;

varying vec2 vUv;
varying float vWave;

void main() {
  vUv = uv;

  vec3 pos = position;

  // La vitesse de scroll cintre le plan : il « traîne » derrière le mouvement.
  float bend = sin(uv.x * 3.14159265) * uVelocity * 0.55;
  float float_ = sin(uv.x * 6.2831853 + uTime * 0.6) * 0.012 * (1.0 - uActive * 0.5);

  pos.z += bend;
  pos.y += float_;

  // Au survol, le plan avance légèrement vers la caméra.
  pos.z += uHover * 0.12;

  vWave = bend;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

export const planeFragment = /* glsl */ `
uniform sampler2D uTexture;
uniform vec2  uPlaneSize;      // dimensions du plan, en unités monde
uniform vec2  uTextureSize;    // dimensions de l'image, en pixels
uniform float uActive;         // 1 quand le projet est au centre
uniform float uHover;
uniform float uVelocity;
uniform float uRadius;         // rayon des coins, en unités monde
uniform vec3  uTint;
uniform float uOpacity;

varying vec2 vUv;
varying float vWave;

// Distance signée à un rectangle aux coins arrondis.
float roundedBoxSDF(vec2 point, vec2 halfSize, float radius) {
  vec2 q = abs(point) - halfSize + radius;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}

void main() {
  // Cadrage « cover » : l'image remplit le plan sans jamais se déformer.
  float planeAspect = uPlaneSize.x / uPlaneSize.y;
  float imageAspect = uTextureSize.x / uTextureSize.y;
  vec2 scale = planeAspect > imageAspect
    ? vec2(1.0, imageAspect / planeAspect)
    : vec2(planeAspect / imageAspect, 1.0);
  // Les captures sont cadrées haut : on garde le sommet plutôt que le centre.
  vec2 uv = (vUv - vec2(0.5, 1.0)) * scale + vec2(0.5, 1.0);

  // Zoom léger au survol, appliqué depuis le haut de l'image.
  uv = (uv - vec2(0.5, 1.0)) / (1.0 + uHover * 0.06) + vec2(0.5, 1.0);

  // Aberration chromatique proportionnelle à la vitesse de scroll.
  float shift = uVelocity * 0.012 + vWave * 0.02;
  vec3 color;
  color.r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
  color.g = texture2D(uTexture, uv).g;
  color.b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;

  // Hors du centre, le projet se désature et s'assombrit : l'œil sait où aller.
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  vec3 desaturated = mix(vec3(luma), uTint * luma * 1.15, 0.35);
  color = mix(desaturated, color, clamp(uActive + uHover * 0.6, 0.0, 1.0));
  color *= mix(0.52, 1.0, clamp(uActive + uHover * 0.5, 0.0, 1.0));

  // Masque à coins arrondis, adouci sur un pixel pour éviter l'escalier.
  vec2 halfSize = uPlaneSize * 0.5;
  vec2 point = (vUv - 0.5) * uPlaneSize;
  float dist = roundedBoxSDF(point, halfSize, uRadius);
  float edge = fwidth(dist) * 1.5;
  float mask = 1.0 - smoothstep(-edge, edge, dist);

  if (mask <= 0.001) discard;

  gl_FragColor = vec4(color, mask * uOpacity);
}
`

/* ------------------------------------------------------------------ */
/* Poussière : nappe de particules derrière la sphère du hero           */
/* ------------------------------------------------------------------ */

export const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uVelocity;

attribute float aScale;
attribute float aOffset;

varying float vAlpha;

void main() {
  vec3 pos = position;
  // Dérive lente, désynchronisée particule par particule via aOffset.
  pos.y += sin(uTime * 0.25 + aOffset) * 0.35;
  pos.x += cos(uTime * 0.18 + aOffset * 1.7) * 0.28;
  pos.z += uVelocity * 0.6;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = aScale * uPixelRatio * (14.0 / -mvPosition.z);

  // Les particules les plus lointaines s'effacent, ce qui creuse la profondeur.
  vAlpha = smoothstep(-14.0, -2.0, mvPosition.z);
}
`

export const dustFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;

varying float vAlpha;

void main() {
  // Point circulaire à bord doux plutôt que le carré par défaut.
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.1, d);
  if (alpha <= 0.01) discard;
  gl_FragColor = vec4(uColor, alpha * vAlpha * uOpacity);
}
`

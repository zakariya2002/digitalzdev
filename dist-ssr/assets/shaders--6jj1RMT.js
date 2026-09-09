const planeVertex = (
  /* glsl */
  `
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
);
const planeFragment = (
  /* glsl */
  `
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
);
const dustVertex = (
  /* glsl */
  `
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
);
const dustFragment = (
  /* glsl */
  `
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
);
export {
  dustVertex as a,
  planeVertex as b,
  dustFragment as d,
  planeFragment as p
};

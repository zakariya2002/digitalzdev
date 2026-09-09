import { jsx } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { i as isWebGLAvailable, c as createRenderer, r as readPalette, w as watchTheme, o as observeResize, a as createRenderLoop, d as disposeScene, p as pixelRatio, b as clamp, l as lerp, e as scrollState } from "../entry-server.js";
import { d as dustFragment, a as dustVertex } from "./shaders--6jj1RMT.js";
import "react-dom/server";
import "react-router-dom/server.mjs";
import "@supabase/supabase-js";
import "react-router-dom";
import "framer-motion";
import "lenis";
import "@emailjs/browser";
function roundedRect(width, height, radius) {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w, h);
  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(w, h - r);
  shape.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-w + r, h);
  shape.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-w, -h + r);
  shape.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}
function roundedFrame(width, height, radius, thickness) {
  const outer = roundedRect(width, height, radius);
  const inner = roundedRect(
    width - thickness * 2,
    height - thickness * 2,
    Math.max(radius - thickness, 1e-3)
  );
  outer.holes.push(new THREE.Path(inner.getPoints(24)));
  return outer;
}
const PANEL_W = 2.44;
const PANEL_H = 1.52;
const LAYERS = [
  // Barre de navigateur : trois pastilles et un champ d'adresse
  {
    offset: [-0.46, 0.66],
    blocks: [
      { x: -1.023, y: 0.517, w: 0.079, h: 0.078, weight: 1, pill: true },
      { x: -0.889, y: 0.517, w: 0.079, h: 0.078, weight: 1, pill: true },
      { x: -0.756, y: 0.517, w: 0.079, h: 0.078, weight: 1, pill: true },
      { x: 0.157, y: 0.517, w: 1.574, h: 0.157, weight: 0.45, pill: true }
    ]
  },
  // Héro : un grand titre, deux lignes de texte, un bouton
  {
    offset: [-0.155, 0.22],
    blocks: [
      { x: -0.472, y: 0.266, w: 1.307, h: 0.235, weight: 1 },
      { x: -0.677, y: -0.047, w: 0.897, h: 0.071, weight: 0.45 },
      { x: -0.771, y: -0.172, w: 0.708, h: 0.071, weight: 0.45 },
      { x: -0.811, y: -0.423, w: 0.63, h: 0.188, weight: 0.95, pill: true }
    ]
  },
  // Grille de contenu : deux rangées de trois cartes
  {
    offset: [0.155, -0.22],
    blocks: [
      { x: -0.787, y: 0.282, w: 0.677, h: 0.439, weight: 0.5 },
      { x: 0, y: 0.282, w: 0.677, h: 0.439, weight: 0.5 },
      { x: 0.787, y: 0.282, w: 0.677, h: 0.439, weight: 0.5 },
      { x: -0.787, y: -0.282, w: 0.677, h: 0.439, weight: 0.3 },
      { x: 0, y: -0.282, w: 0.677, h: 0.439, weight: 0.3 },
      { x: 0.787, y: -0.282, w: 0.677, h: 0.439, weight: 0.3 }
    ]
  },
  // Pied de page : trois colonnes de liens et une ligne de mentions
  {
    offset: [0.46, -0.66],
    blocks: [
      { x: -0.826, y: 0.251, w: 0.551, h: 0.063, weight: 0.6 },
      { x: -0.882, y: 0.118, w: 0.441, h: 0.047, weight: 0.28 },
      { x: -0.913, y: 8e-3, w: 0.378, h: 0.047, weight: 0.28 },
      { x: 0.142, y: 0.251, w: 0.551, h: 0.063, weight: 0.6 },
      { x: 0.087, y: 0.118, w: 0.441, h: 0.047, weight: 0.28 },
      { x: 0.826, y: 0.251, w: 0.551, h: 0.063, weight: 0.6 },
      { x: 0.771, y: 0.118, w: 0.441, h: 0.047, weight: 0.28 },
      { x: 0, y: -0.376, w: 1.968, h: 0.039, weight: 0.2 }
    ]
  }
];
const LAYER_GAP = 0.52;
const DUST_COUNT = 320;
function HeroScene({ className }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || !isWebGLAvailable()) return;
    let renderer;
    try {
      renderer = createRenderer(canvas);
    } catch {
      return;
    }
    const onContextLost = (event) => {
      event.preventDefault();
      canvas.style.visibility = "hidden";
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 6.6);
    const stack = new THREE.Group();
    scene.add(stack);
    const materials = [];
    const geometries = [];
    const makeMaterial = (weight, depth) => {
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      material.userData = { weight, depth };
      materials.push(material);
      return material;
    };
    const panelGeometry = new THREE.ShapeGeometry(
      roundedRect(PANEL_W, PANEL_H, 0.105),
      12
    );
    const frameGeometry = new THREE.ShapeGeometry(
      roundedFrame(PANEL_W, PANEL_H, 0.105, 0.013),
      12
    );
    geometries.push(panelGeometry, frameGeometry);
    const nodes = LAYERS.map((layer, index) => {
      const group = new THREE.Group();
      const depth = 1 - index / LAYERS.length;
      group.add(
        new THREE.Mesh(panelGeometry, makeMaterial(-1, depth)),
        new THREE.Mesh(frameGeometry, makeMaterial(-2, depth))
      );
      for (const block of layer.blocks) {
        const radius = block.pill ? Math.min(block.w, block.h) / 2 : 0.022;
        const geometry = new THREE.ShapeGeometry(
          roundedRect(block.w, block.h, radius),
          block.pill ? 10 : 4
        );
        geometries.push(geometry);
        const mesh = new THREE.Mesh(geometry, makeMaterial(block.weight ?? 0.5, depth));
        mesh.position.set(block.x, block.y, 2e-3);
        group.add(mesh);
      }
      group.renderOrder = LAYERS.length - index;
      stack.add(group);
      return { group, restZ: -index * LAYER_GAP, offset: layer.offset };
    });
    const dustUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio() },
      uVelocity: { value: 0 },
      uColor: { value: new THREE.Color() },
      uOpacity: { value: 0.4 }
    };
    const dustGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(DUST_COUNT * 3);
    const scales = new Float32Array(DUST_COUNT);
    const offsets = new Float32Array(DUST_COUNT);
    for (let i = 0; i < DUST_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
      positions[i * 3 + 2] = 1 - Math.random() * 8;
      scales[i] = 0.5 + Math.random() * 1.9;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    dustGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    dustGeometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
    geometries.push(dustGeometry);
    const dustMaterial = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: dustUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);
    const applyPalette = (p) => {
      for (const material of materials) {
        const weight = material.userData.weight;
        const depth = material.userData.depth;
        const fade = 0.4 + depth * 0.6;
        if (weight === -1) {
          material.color.copy(p.accent);
          material.opacity = (p.isDark ? 0.06 : 0.09) * fade;
        } else if (weight === -2) {
          material.color.copy(p.accent).multiplyScalar(p.isDark ? 1.35 : 1);
          material.opacity = (p.isDark ? 0.8 : 0.7) * fade;
        } else {
          material.color.copy(p.accent).multiplyScalar(p.isDark ? 1.2 : 0.95);
          material.opacity = weight * (p.isDark ? 0.85 : 0.75) * fade;
        }
      }
      dustUniforms.uColor.value.copy(p.accent);
      dustUniforms.uOpacity.value = p.isDark ? 0.45 : 0.28;
    };
    applyPalette(readPalette());
    const stopTheme = watchTheme(applyPalette);
    const pointerTarget = new THREE.Vector2(0, 0);
    const pointer = new THREE.Vector2(0, 0);
    const onPointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      pointerTarget.set(
        (event.clientX - rect.left) / rect.width * 2 - 1,
        -((event.clientY - rect.top) / rect.height * 2 - 1)
      );
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const maxOffsetX = Math.max(...LAYERS.map((l) => Math.abs(l.offset[0])));
    const maxOffsetY = Math.max(...LAYERS.map((l) => Math.abs(l.offset[1])));
    const YAW = 0.42;
    const depthExtent = (LAYERS.length - 1) * LAYER_GAP;
    const extentW = (PANEL_W + maxOffsetX * 2) * Math.cos(YAW) + depthExtent * Math.sin(YAW);
    const extentH = PANEL_H + maxOffsetY * 2;
    const stopResize = observeResize(container, (width, height) => {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const tan = Math.tan(38 * Math.PI / 360);
      const fill = 0.82;
      const fitH = extentH / (fill * 2 * tan);
      const fitW = extentW / (fill * 2 * tan * camera.aspect);
      camera.position.z = clamp(Math.max(fitH, fitW), 4.5, 20);
      camera.updateProjectionMatrix();
    });
    let velocity = 0;
    let entrance = 0;
    let assembled = 0;
    const stopLoop = createRenderLoop(canvas, (elapsed, delta) => {
      const heroProgress = clamp(
        scrollState.y / Math.max(window.innerHeight, 1),
        0,
        1
      );
      assembled = lerp(assembled, heroProgress, 0.08);
      velocity = lerp(velocity, scrollState.smoothVelocity, 0.08);
      entrance = Math.min(1, entrance + delta * 0.5);
      pointer.lerp(pointerTarget, 0.05);
      const spread = entrance * (1 - assembled * 0.92);
      nodes.forEach((node, index) => {
        const wave = Math.sin(elapsed * 0.42 + index * 1.15);
        node.group.position.set(
          node.offset[0] * spread + wave * 0.02,
          node.offset[1] * spread + Math.cos(elapsed * 0.36 + index) * 0.024,
          node.restZ * spread
        );
        node.group.rotation.z = wave * 7e-3;
      });
      stack.rotation.y = -YAW + pointer.x * 0.2 - velocity * 0.05;
      stack.rotation.x = 0.16 + pointer.y * 0.13;
      stack.position.y = -assembled * 0.55;
      dustUniforms.uTime.value = elapsed;
      dustUniforms.uVelocity.value = velocity;
      dust.rotation.z = elapsed * 8e-3;
      renderer.render(scene, camera);
    });
    return () => {
      stopLoop();
      stopResize();
      stopTheme();
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      disposeScene(scene);
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      renderer.dispose();
    };
  }, []);
  return /* @__PURE__ */ jsx("div", { ref: containerRef, className, "aria-hidden": true, children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "block h-full w-full" }) });
}
export {
  HeroScene as default
};

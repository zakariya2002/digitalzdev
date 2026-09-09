import { jsx } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { c as createRenderer, r as readPalette, w as watchTheme, o as observeResize, a as createRenderLoop, b as clamp, l as lerp, d as disposeScene, e as scrollState } from "../entry-server.js";
import { p as planeFragment, b as planeVertex } from "./shaders--6jj1RMT.js";
import "react-dom/server";
import "react-router-dom/server.mjs";
import "@supabase/supabase-js";
import "react-router-dom";
import "framer-motion";
import "lenis";
import "@emailjs/browser";
const PLANE_WIDTH = 2.8;
const PLANE_HEIGHT = PLANE_WIDTH * (10 / 16);
const SPACING = 3.25;
const FOV = 40;
const INFO_BAND = 250;
const TOP_BAND = 96;
function GalleryScene({
  projects,
  trackRef,
  onActiveChange,
  onHoverChange,
  onSelect,
  onUnavailable,
  infoRef,
  className
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const handlers = useRef({ onActiveChange, onHoverChange, onSelect, onUnavailable });
  handlers.current = { onActiveChange, onHoverChange, onSelect, onUnavailable };
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    let renderer;
    try {
      renderer = createRenderer(canvas);
    } catch {
      handlers.current.onUnavailable();
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);
    const onContextLost = (event) => {
      event.preventDefault();
      handlers.current.onUnavailable();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    const stage = new THREE.Group();
    scene.add(stage);
    const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, 24, 1);
    const loader = new THREE.TextureLoader();
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const slides = projects.map((project, index) => {
      const tint = new THREE.Color(project.color);
      const uniforms = {
        uTexture: { value: null },
        uPlaneSize: { value: new THREE.Vector2(PLANE_WIDTH, PLANE_HEIGHT) },
        uTextureSize: { value: new THREE.Vector2(16, 10) },
        uActive: { value: 0 },
        uHover: { value: 0 },
        uVelocity: { value: 0 },
        uRadius: { value: 0.09 },
        uTint: { value: tint },
        uOpacity: { value: 0 },
        uTime: { value: 0 }
      };
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.ShaderMaterial({
          vertexShader: planeVertex,
          fragmentShader: planeFragment,
          uniforms,
          transparent: true,
          depthWrite: false
        })
      );
      const group = new THREE.Group();
      group.position.x = index * SPACING;
      group.add(mesh);
      stage.add(group);
      loader.load(project.heroImage, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAnisotropy;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.generateMipmaps = true;
        uniforms.uTexture.value = texture;
        uniforms.uTextureSize.value.set(texture.image.width, texture.image.height);
      });
      return { group, mesh, uniforms, hover: 0 };
    });
    let isDark = readPalette().isDark;
    const stopTheme = watchTheme((palette) => {
      isDark = palette.isDark;
    });
    const pointer = new THREE.Vector2(-10, -10);
    const raycaster = new THREE.Raycaster();
    let hoveredIndex = -1;
    let hovering = false;
    const updatePointer = (event) => {
      const rect = container.getBoundingClientRect();
      pointer.set(
        (event.clientX - rect.left) / rect.width * 2 - 1,
        -((event.clientY - rect.top) / rect.height * 2 - 1)
      );
    };
    const clearPointer = () => pointer.set(-10, -10);
    container.addEventListener("pointermove", updatePointer, { passive: true });
    container.addEventListener("pointerleave", clearPointer);
    const onClick = () => {
      if (hoveredIndex >= 0) handlers.current.onSelect(hoveredIndex);
    };
    container.addEventListener("click", onClick);
    let lift = 0;
    let frameWidth = 0;
    let frameHeight = 0;
    let infoBand = INFO_BAND;
    const reframe = () => {
      if (frameWidth <= 0 || frameHeight <= 0) return;
      renderer.setSize(frameWidth, frameHeight, false);
      camera.aspect = frameWidth / frameHeight;
      const usable = Math.max(
        frameHeight - infoBand - TOP_BAND,
        frameHeight * 0.2
      );
      const planePx = usable * 0.88;
      const tan = Math.tan(FOV * Math.PI / 360);
      const fitHeight = PLANE_HEIGHT * frameHeight / (2 * tan * planePx);
      const fitWidth = PLANE_WIDTH * 1.3 / (2 * tan * camera.aspect);
      camera.position.z = clamp(Math.max(fitHeight, fitWidth), 4.2, 13);
      camera.updateProjectionMatrix();
      const centerPx = TOP_BAND + usable / 2;
      const ndc = 1 - 2 * centerPx / frameHeight;
      lift = ndc * camera.position.z * tan;
    };
    const stopResize = observeResize(container, (width, height) => {
      frameWidth = width;
      frameHeight = height;
      reframe();
    });
    let stopInfo = () => {
    };
    const infoEl = infoRef == null ? void 0 : infoRef.current;
    if (infoEl) {
      const readInfo = () => {
        const next = infoEl.getBoundingClientRect().height;
        if (next > 0 && Math.abs(next - infoBand) > 1) {
          infoBand = next;
          reframe();
        }
      };
      const infoObserver = new ResizeObserver(readInfo);
      infoObserver.observe(infoEl);
      readInfo();
      stopInfo = () => infoObserver.disconnect();
    }
    let travel = 0;
    let velocity = 0;
    let lastActive = -1;
    let intro = 0;
    const stopLoop = createRenderLoop(canvas, (elapsed, delta) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const distance = Math.max(rect.height - window.innerHeight, 1);
      const progress = clamp(-rect.top / distance, 0, 1);
      const raw = progress * (projects.length - 1);
      const index = Math.floor(raw);
      const fraction = raw - index;
      const t = clamp((fraction - 0.2) / 0.6, 0, 1);
      const eased = t * t * t * (t * (t * 6 - 15) + 10);
      const target = Math.min(index + eased, projects.length - 1);
      travel = lerp(travel, target, 0.12);
      velocity = lerp(velocity, scrollState.smoothVelocity, 0.1);
      intro = Math.min(1, intro + delta * 1.1);
      stage.position.x = -travel * SPACING;
      const activeIndex = Math.round(travel);
      if (activeIndex !== lastActive) {
        lastActive = activeIndex;
        handlers.current.onActiveChange(activeIndex);
      }
      raycaster.setFromCamera(pointer, camera);
      const candidates = slides.filter((_, i) => Math.abs(i - travel) < 1.5).map((s) => s.mesh);
      const hit = raycaster.intersectObjects(candidates, false)[0];
      const nextHovered = hit ? slides.findIndex((s) => s.mesh === hit.object) : -1;
      if (nextHovered !== hoveredIndex) {
        hoveredIndex = nextHovered;
        const nowHovering = hoveredIndex >= 0;
        if (nowHovering !== hovering) {
          hovering = nowHovering;
          container.style.cursor = hovering ? "pointer" : "";
          handlers.current.onHoverChange(hovering);
        }
      }
      slides.forEach((slide, index2) => {
        const offset = index2 - travel;
        const absOffset = Math.abs(offset);
        slide.group.position.z = -Math.pow(absOffset, 1.55) * 0.62;
        slide.group.rotation.y = -offset * 0.16;
        slide.group.position.y = Math.sin(offset * 0.9) * 0.06 + lift;
        const scale = (1 - Math.min(absOffset, 3) * 0.045) * (0.9 + intro * 0.1);
        slide.group.scale.setScalar(scale);
        slide.hover = lerp(slide.hover, hoveredIndex === index2 ? 1 : 0, 0.12);
        const active = clamp(1 - absOffset * 1.15, 0, 1);
        const visibility = clamp(1 - (absOffset - 2.4) / 1.2, 0, 1) * intro;
        slide.group.visible = visibility > 0.01;
        const u = slide.uniforms;
        u.uTime.value = elapsed;
        u.uActive.value = active;
        u.uHover.value = slide.hover;
        u.uVelocity.value = velocity;
        u.uOpacity.value = visibility * (isDark ? 1 : 0.97);
      });
      renderer.render(scene, camera);
    });
    return () => {
      stopLoop();
      stopResize();
      stopInfo();
      stopTheme();
      container.removeEventListener("pointermove", updatePointer);
      container.removeEventListener("pointerleave", clearPointer);
      container.removeEventListener("click", onClick);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      disposeScene(scene);
      geometry.dispose();
      renderer.dispose();
    };
  }, [projects, trackRef, infoRef]);
  return /* @__PURE__ */ jsx("div", { ref: containerRef, className, children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "block h-full w-full" }) });
}
export {
  GalleryScene as default
};

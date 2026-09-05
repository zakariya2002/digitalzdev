import * as THREE from 'three'
import { prefersReducedMotion } from '../lib/scroll'

/**
 * Socle commun aux scènes WebGL du site.
 *
 * Chaque scène possède son propre renderer (elles ne sont jamais visibles en
 * même temps et restent petites) mais partage ici la création, le
 * redimensionnement, la boucle de rendu et la libération mémoire.
 */

export interface SceneContext {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  clock: THREE.Clock
  /** Taille du canvas en pixels CSS */
  size: { width: number; height: number }
}

/**
 * Le résultat du test est mémorisé : la capacité WebGL ne change pas en cours
 * de session, et chaque test consomme un contexte.
 */
let webglSupport: boolean | null = null

/** WebGL peut être absent (vieux navigateur, GPU blacklisté, mode économie). */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false
  // Volontairement hors du cache : le réglage peut changer en cours de session.
  if (prefersReducedMotion()) return false
  if (webglSupport !== null) return webglSupport

  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl')) as WebGLRenderingContext | null

    // Le contexte de test doit être rendu immédiatement. Un navigateur n'en
    // accorde qu'une quinzaine par processus : les laisser fuiter finit par
    // faire échouer les vraies scènes, d'abord la dernière montée, la galerie.
    gl?.getExtension('WEBGL_lose_context')?.loseContext()

    webglSupport = !!gl
  } catch {
    webglSupport = false
  }

  return webglSupport
}

/**
 * Le pixel ratio est plafonné : au-delà de 2 le gain visuel est nul et le coût
 * de remplissage explose sur les écrans Retina.
 */
export const pixelRatio = () =>
  Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)

export function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(pixelRatio())
  renderer.outputColorSpace = THREE.SRGBColorSpace
  return renderer
}

/**
 * Boucle de rendu qui se met en pause quand l'onglet passe en arrière-plan ou
 * quand le canvas sort du viewport : inutile de brûler du GPU hors écran.
 */
export function createRenderLoop(
  canvas: HTMLCanvasElement,
  frame: (elapsed: number, delta: number) => void
) {
  const clock = new THREE.Clock()
  let raf = 0
  let visible = true
  let onScreen = true

  const running = () => visible && onScreen

  const tick = () => {
    raf = requestAnimationFrame(tick)
    const delta = Math.min(clock.getDelta(), 1 / 30)
    if (!running()) return
    frame(clock.getElapsedTime(), delta)
  }

  const onVisibility = () => {
    visible = document.visibilityState === 'visible'
  }
  document.addEventListener('visibilitychange', onVisibility)

  const observer = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting
    },
    { rootMargin: '200px' }
  )
  observer.observe(canvas)

  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    document.removeEventListener('visibilitychange', onVisibility)
    observer.disconnect()
  }
}

/** Observe la taille de l'élément parent et prévient la scène. */
export function observeResize(
  element: HTMLElement,
  onResize: (width: number, height: number) => void
) {
  const observer = new ResizeObserver((entries) => {
    const rect = entries[0].contentRect
    if (rect.width > 0 && rect.height > 0) onResize(rect.width, rect.height)
  })
  observer.observe(element)
  const rect = element.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) onResize(rect.width, rect.height)
  return () => observer.disconnect()
}

/**
 * Couleurs de la scène, lues sur les variables CSS du thème pour que le WebGL
 * suive la bascule clair / sombre.
 */
export interface ThemePalette {
  surface: THREE.Color
  accent: THREE.Color
  text: THREE.Color
  isDark: boolean
}

const readVar = (name: string): THREE.Color => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  const [r, g, b] = raw.split(/\s+/).map(Number)
  const color = new THREE.Color()
  if ([r, g, b].every((n) => Number.isFinite(n))) {
    color.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)
  }
  return color
}

export function readPalette(): ThemePalette {
  return {
    surface: readVar('--surface'),
    accent: readVar('--accent'),
    text: readVar('--text-primary'),
    isDark: document.documentElement.classList.contains('dark'),
  }
}

/** Prévient quand l'utilisateur bascule le thème (classe `dark` sur <html>). */
export function watchTheme(onChange: (palette: ThemePalette) => void) {
  const observer = new MutationObserver(() => onChange(readPalette()))
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}

/**
 * Libère toutes les ressources GPU d'une scène : three.js ne le fait pas seul,
 * et une navigation SPA répétée finirait par saturer la mémoire.
 */
export function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const material = mesh.material
    if (!material) return
    const materials = Array.isArray(material) ? material : [material]
    for (const mat of materials) {
      for (const value of Object.values(mat)) {
        if (value instanceof THREE.Texture) value.dispose()
      }
      const uniforms = (mat as THREE.ShaderMaterial).uniforms
      if (uniforms) {
        for (const uniform of Object.values(uniforms)) {
          if (uniform.value instanceof THREE.Texture) uniform.value.dispose()
        }
      }
      mat.dispose()
    }
  })
  scene.clear()
}

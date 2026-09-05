import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  createRenderLoop,
  createRenderer,
  disposeScene,
  observeResize,
  readPalette,
  watchTheme,
} from './core'
import { planeFragment, planeVertex } from './shaders'
import { clamp, lerp, scrollState } from '../lib/scroll'
import type { Project } from '../data/projects'

interface Props {
  projects: Project[]
  /** Section haute qui pilote le défilement de la galerie */
  trackRef: React.RefObject<HTMLElement>
  onActiveChange: (index: number) => void
  onHoverChange: (hovering: boolean) => void
  onSelect: (index: number) => void
  className?: string
}

/** Largeur d'un plan en unités monde ; la hauteur suit le format 16:10. */
const PLANE_WIDTH = 2.8
const PLANE_HEIGHT = PLANE_WIDTH * (10 / 16)
/** Écart entre deux projets, centre à centre. */
const SPACING = 3.25
/**
 * Remontée des plans dans le cadre : le tiers bas de l'écran est réservé à la
 * fiche du projet, qui doit se lire sur un fond propre.
 */
const LIFT = 0.54
/** Distance caméra minimale : fixe la taille du plan actif à l'écran. */
const MIN_CAMERA_Z = 5.15

interface Slide {
  group: THREE.Group
  mesh: THREE.Mesh
  uniforms: Record<string, THREE.IUniform>
  hover: number
}

/**
 * Galerie 3D des réalisations.
 *
 * Les projets sont alignés sur un arc : le scroll vertical de la page fait
 * défiler l'arc horizontalement, le projet au centre revient face à la caméra
 * pendant que ses voisins reculent et se désaturent. Rien n'est stocké dans un
 * state React : seul le changement de projet actif remonte, pour l'habillage.
 */
export default function GalleryScene({
  projects,
  trackRef,
  onActiveChange,
  onHoverChange,
  onSelect,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Les callbacks changent d'identité à chaque rendu du parent : on les lit
  // via une ref pour ne pas reconstruire toute la scène WebGL.
  const handlers = useRef({ onActiveChange, onHoverChange, onSelect })
  handlers.current = { onActiveChange, onHoverChange, onSelect }

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const renderer = createRenderer(canvas)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0, 5.2)

    const stage = new THREE.Group()
    scene.add(stage)

    const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, 24, 1)
    const loader = new THREE.TextureLoader()
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()

    const slides: Slide[] = projects.map((project, index) => {
      const tint = new THREE.Color(project.color)

      const uniforms: Record<string, THREE.IUniform> = {
        uTexture: { value: null as THREE.Texture | null },
        uPlaneSize: { value: new THREE.Vector2(PLANE_WIDTH, PLANE_HEIGHT) },
        uTextureSize: { value: new THREE.Vector2(16, 10) },
        uActive: { value: 0 },
        uHover: { value: 0 },
        uVelocity: { value: 0 },
        uRadius: { value: 0.09 },
        uTint: { value: tint },
        uOpacity: { value: 0 },
        uTime: { value: 0 },
      }

      const mesh = new THREE.Mesh(
        geometry,
        new THREE.ShaderMaterial({
          vertexShader: planeVertex,
          fragmentShader: planeFragment,
          uniforms,
          transparent: true,
          depthWrite: false,
        })
      )

      const group = new THREE.Group()
      group.position.x = index * SPACING
      group.add(mesh)
      stage.add(group)

      // La texture arrive après coup : le plan reste invisible jusque-là, puis
      // se révèle. Mieux vaut un vide franc qu'un aplat de couleur qui saute.
      loader.load(project.heroImage, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = maxAnisotropy
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.generateMipmaps = true
        uniforms.uTexture.value = texture
        uniforms.uTextureSize.value.set(texture.image.width, texture.image.height)
      })

      return { group, mesh, uniforms, hover: 0 }
    })

    /* --- Thème ----------------------------------------------------- */

    let isDark = readPalette().isDark
    const stopTheme = watchTheme((palette) => {
      isDark = palette.isDark
    })

    /* --- Pointeur -------------------------------------------------- */

    const pointer = new THREE.Vector2(-10, -10)
    const raycaster = new THREE.Raycaster()
    let hoveredIndex = -1
    let hovering = false

    const updatePointer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      )
    }
    const clearPointer = () => pointer.set(-10, -10)

    container.addEventListener('pointermove', updatePointer, { passive: true })
    container.addEventListener('pointerleave', clearPointer)

    const onClick = () => {
      if (hoveredIndex >= 0) handlers.current.onSelect(hoveredIndex)
    }
    container.addEventListener('click', onClick)

    /* --- Redimensionnement ----------------------------------------- */

    const stopResize = observeResize(container, (width, height) => {
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      // Sur écran étroit ou court, on recule pour que le plan actif tienne
      // entièrement dans le cadre avec ses marges.
      const fitWidth = (PLANE_WIDTH * 1.35) / (2 * Math.tan((40 * Math.PI) / 360))
      const fitHeight =
        (PLANE_HEIGHT * 2.1) / (2 * Math.tan((40 * Math.PI) / 360) * camera.aspect)
      camera.position.z = clamp(
        Math.max(fitWidth / camera.aspect, fitHeight),
        MIN_CAMERA_Z,
        9
      )
      camera.updateProjectionMatrix()
    })

    /* --- Boucle ---------------------------------------------------- */

    let travel = 0
    let velocity = 0
    let lastActive = -1
    let intro = 0

    const stopLoop = createRenderLoop(canvas, (elapsed, delta) => {
      const track = trackRef.current
      if (!track) return

      // Progression dans la section épinglée, indépendante de la hauteur du
      // viewport : le pilotage reste identique sur un laptop et sur un 27".
      const rect = track.getBoundingClientRect()
      const distance = Math.max(rect.height - window.innerHeight, 1)
      const progress = clamp(-rect.top / distance, 0, 1)

      // Le défilement est remis en forme pour que chaque projet s'attarde au
      // centre : sans ça, l'arc glisse en continu et aucun projet n'est jamais
      // vraiment « présenté ».
      const raw = progress * (projects.length - 1)
      const index = Math.floor(raw)
      const fraction = raw - index
      const t = clamp((fraction - 0.2) / 0.6, 0, 1)
      const eased = t * t * t * (t * (t * 6 - 15) + 10)
      const target = Math.min(index + eased, projects.length - 1)

      travel = lerp(travel, target, 0.12)
      velocity = lerp(velocity, scrollState.smoothVelocity, 0.1)
      intro = Math.min(1, intro + delta * 1.1)

      stage.position.x = -travel * SPACING

      const activeIndex = Math.round(travel)
      if (activeIndex !== lastActive) {
        lastActive = activeIndex
        handlers.current.onActiveChange(activeIndex)
      }

      // Survol : on ne teste que le plan actif et ses deux voisins, le reste
      // est hors champ ou trop reculé pour être cliquable.
      raycaster.setFromCamera(pointer, camera)
      const candidates = slides
        .filter((_, i) => Math.abs(i - travel) < 1.5)
        .map((s) => s.mesh)
      const hit = raycaster.intersectObjects(candidates, false)[0]
      const nextHovered = hit ? slides.findIndex((s) => s.mesh === hit.object) : -1

      if (nextHovered !== hoveredIndex) {
        hoveredIndex = nextHovered
        const nowHovering = hoveredIndex >= 0
        if (nowHovering !== hovering) {
          hovering = nowHovering
          container.style.cursor = hovering ? 'pointer' : ''
          handlers.current.onHoverChange(hovering)
        }
      }

      slides.forEach((slide, index) => {
        const offset = index - travel
        const absOffset = Math.abs(offset)

        // L'arc : plus un projet s'éloigne du centre, plus il recule et pivote.
        slide.group.position.z = -Math.pow(absOffset, 1.55) * 0.62
        slide.group.rotation.y = -offset * 0.16
        slide.group.position.y = Math.sin(offset * 0.9) * 0.06 + LIFT

        const scale = (1 - Math.min(absOffset, 3) * 0.045) * (0.9 + intro * 0.1)
        slide.group.scale.setScalar(scale)

        slide.hover = lerp(slide.hover, hoveredIndex === index ? 1 : 0, 0.12)

        const active = clamp(1 - absOffset * 1.15, 0, 1)
        // Au-delà de trois positions, le projet est masqué : inutile de le
        // dessiner, et ça évite un empilement de transparences illisible.
        const visibility = clamp(1 - (absOffset - 2.4) / 1.2, 0, 1) * intro

        slide.group.visible = visibility > 0.01

        const u = slide.uniforms
        u.uTime.value = elapsed
        u.uActive.value = active
        u.uHover.value = slide.hover
        u.uVelocity.value = velocity
        u.uOpacity.value = visibility * (isDark ? 1 : 0.97)
      })

      renderer.render(scene, camera)
    })

    return () => {
      stopLoop()
      stopResize()
      stopTheme()
      container.removeEventListener('pointermove', updatePointer)
      container.removeEventListener('pointerleave', clearPointer)
      container.removeEventListener('click', onClick)
      disposeScene(scene)
      geometry.dispose()
      renderer.dispose()
    }
  }, [projects, trackRef])

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}

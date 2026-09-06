import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  createRenderLoop,
  createRenderer,
  disposeScene,
  isWebGLAvailable,
  observeResize,
  pixelRatio,
  readPalette,
  watchTheme,
} from './core'
import type { ThemePalette } from './core'
import { dustFragment, dustVertex } from './shaders'
import { clamp, lerp, scrollState } from '../lib/scroll'

interface Props {
  className?: string
}

/* ------------------------------------------------------------------ */
/* Géométrie : rectangles à coins arrondis                             */
/* ------------------------------------------------------------------ */

/** Contour d'un rectangle arrondi, centré sur l'origine. */
function roundedRect(width: number, height: number, radius: number): THREE.Shape {
  const w = width / 2
  const h = height / 2
  const r = Math.min(radius, w, h)
  const shape = new THREE.Shape()

  shape.moveTo(-w + r, -h)
  shape.lineTo(w - r, -h)
  shape.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false)
  shape.lineTo(w, h - r)
  shape.absarc(w - r, h - r, r, 0, Math.PI / 2, false)
  shape.lineTo(-w + r, h)
  shape.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false)
  shape.lineTo(-w, -h + r)
  shape.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false)

  return shape
}

/**
 * Cadre : un rectangle arrondi évidé par un second, plus petit.
 *
 * On ne peut pas compter sur l'épaisseur de trait des lignes WebGL, plafonnée
 * à un pixel sur la plupart des plateformes. Le contour est donc une vraie
 * surface pleine, dont on maîtrise l'épaisseur.
 */
function roundedFrame(
  width: number,
  height: number,
  radius: number,
  thickness: number
): THREE.Shape {
  const outer = roundedRect(width, height, radius)
  const inner = roundedRect(
    width - thickness * 2,
    height - thickness * 2,
    Math.max(radius - thickness, 0.001)
  )
  outer.holes.push(new THREE.Path(inner.getPoints(24)))
  return outer
}

/* ------------------------------------------------------------------ */
/* Description des couches de l'interface                              */
/* ------------------------------------------------------------------ */

/** Un élément d'interface posé sur une couche, en coordonnées locales. */
interface Block {
  x: number
  y: number
  w: number
  h: number
  /** Opacité relative : hiérarchise les blocs à l'intérieur d'une couche */
  weight?: number
  /** Coins entièrement arrondis, pour les pastilles et les boutons */
  pill?: boolean
}

interface Layer {
  /** Décalage de la couche par rapport au centre de la pile, une fois dépliée */
  offset: [number, number]
  blocks: Block[]
}

const PANEL_W = 2.44
const PANEL_H = 1.52

/**
 * Les quatre couches d'une page web, de la barre du navigateur au pied de
 * page. C'est la lecture immédiate recherchée : un site en cours d'assemblage,
 * plutôt qu'une forme abstraite.
 */
const LAYERS: Layer[] = [
  // Barre de navigateur : trois pastilles et un champ d'adresse
  {
    offset: [-0.46, 0.66],
    blocks: [
      { x: -1.023, y: 0.517, w: 0.079, h: 0.078, weight: 1, pill: true },
      { x: -0.889, y: 0.517, w: 0.079, h: 0.078, weight: 1, pill: true },
      { x: -0.756, y: 0.517, w: 0.079, h: 0.078, weight: 1, pill: true },
      { x: 0.157, y: 0.517, w: 1.574, h: 0.157, weight: 0.45, pill: true },
    ],
  },
  // Héro : un grand titre, deux lignes de texte, un bouton
  {
    offset: [-0.155, 0.22],
    blocks: [
      { x: -0.472, y: 0.266, w: 1.307, h: 0.235, weight: 1 },
      { x: -0.677, y: -0.047, w: 0.897, h: 0.071, weight: 0.45 },
      { x: -0.771, y: -0.172, w: 0.708, h: 0.071, weight: 0.45 },
      { x: -0.811, y: -0.423, w: 0.63, h: 0.188, weight: 0.95, pill: true },
    ],
  },
  // Grille de contenu : deux rangées de trois cartes
  {
    offset: [0.155, -0.22],
    blocks: [
      { x: -0.787, y: 0.282, w: 0.677, h: 0.439, weight: 0.5 },
      { x: 0.0, y: 0.282, w: 0.677, h: 0.439, weight: 0.5 },
      { x: 0.787, y: 0.282, w: 0.677, h: 0.439, weight: 0.5 },
      { x: -0.787, y: -0.282, w: 0.677, h: 0.439, weight: 0.3 },
      { x: 0.0, y: -0.282, w: 0.677, h: 0.439, weight: 0.3 },
      { x: 0.787, y: -0.282, w: 0.677, h: 0.439, weight: 0.3 },
    ],
  },
  // Pied de page : trois colonnes de liens et une ligne de mentions
  {
    offset: [0.46, -0.66],
    blocks: [
      { x: -0.826, y: 0.251, w: 0.551, h: 0.063, weight: 0.6 },
      { x: -0.882, y: 0.118, w: 0.441, h: 0.047, weight: 0.28 },
      { x: -0.913, y: 0.008, w: 0.378, h: 0.047, weight: 0.28 },
      { x: 0.142, y: 0.251, w: 0.551, h: 0.063, weight: 0.6 },
      { x: 0.087, y: 0.118, w: 0.441, h: 0.047, weight: 0.28 },
      { x: 0.826, y: 0.251, w: 0.551, h: 0.063, weight: 0.6 },
      { x: 0.771, y: 0.118, w: 0.441, h: 0.047, weight: 0.28 },
      { x: 0.0, y: -0.376, w: 1.968, h: 0.039, weight: 0.2 },
    ],
  },
]

/** Écart en profondeur entre deux couches, à l'état déplié. */
const LAYER_GAP = 0.52

const DUST_COUNT = 320

/* ------------------------------------------------------------------ */

/**
 * Décor du hero : les couches d'une page web flottant séparées en
 * perspective, qui se rapprochent à mesure qu'on descend, comme si le site
 * s'assemblait.
 *
 * Remplace la sphère de bruit qui occupait cette place : soignée, mais
 * abstraite, et les visiteurs n'y lisaient rien.
 */
export default function HeroScene({ className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || !isWebGLAvailable()) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = createRenderer(canvas)
    } catch {
      return
    }

    const onContextLost = (event: Event) => {
      event.preventDefault()
      canvas.style.visibility = 'hidden'
    }
    canvas.addEventListener('webglcontextlost', onContextLost)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0, 6.6)

    /* --- Construction des couches ---------------------------------- */

    const stack = new THREE.Group()
    scene.add(stack)

    // Un matériau par couche plutôt qu'un seul partagé : c'est ce qui permet
    // d'estomper les couches du fond. Sans ce dégradé, les quatre panneaux se
    // superposent à intensité égale et le centre devient illisible.
    const materials: THREE.MeshBasicMaterial[] = []
    const geometries: THREE.BufferGeometry[] = []

    const makeMaterial = (weight: number, depth: number) => {
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      material.userData = { weight, depth }
      materials.push(material)
      return material
    }

    const panelGeometry = new THREE.ShapeGeometry(
      roundedRect(PANEL_W, PANEL_H, 0.105),
      12
    )
    const frameGeometry = new THREE.ShapeGeometry(
      roundedFrame(PANEL_W, PANEL_H, 0.105, 0.013),
      12
    )
    geometries.push(panelGeometry, frameGeometry)

    interface LayerNode {
      group: THREE.Group
      restZ: number
      offset: [number, number]
    }

    const nodes: LayerNode[] = LAYERS.map((layer, index) => {
      const group = new THREE.Group()
      // Chaque couche vers le fond perd un cran d'intensité.
      const depth = 1 - index / LAYERS.length

      group.add(
        new THREE.Mesh(panelGeometry, makeMaterial(-1, depth)),
        new THREE.Mesh(frameGeometry, makeMaterial(-2, depth))
      )

      for (const block of layer.blocks) {
        const radius = block.pill ? Math.min(block.w, block.h) / 2 : 0.022
        const geometry = new THREE.ShapeGeometry(
          roundedRect(block.w, block.h, radius),
          block.pill ? 10 : 4
        )
        geometries.push(geometry)

        const mesh = new THREE.Mesh(geometry, makeMaterial(block.weight ?? 0.5, depth))
        mesh.position.set(block.x, block.y, 0.002)
        group.add(mesh)
      }

      // Ordre de rendu explicite : sans lui, les transparences des couches
      // s'empilent dans l'ordre de la scène et non dans celui de la profondeur.
      group.renderOrder = LAYERS.length - index
      stack.add(group)

      return { group, restZ: -index * LAYER_GAP, offset: layer.offset }
    })

    /* --- Poussière ------------------------------------------------- */

    const dustUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio() },
      uVelocity: { value: 0 },
      uColor: { value: new THREE.Color() },
      uOpacity: { value: 0.4 },
    }

    const dustGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(DUST_COUNT * 3)
    const scales = new Float32Array(DUST_COUNT)
    const offsets = new Float32Array(DUST_COUNT)

    for (let i = 0; i < DUST_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6.5
      positions[i * 3 + 2] = 1 - Math.random() * 8
      scales[i] = 0.5 + Math.random() * 1.9
      offsets[i] = Math.random() * Math.PI * 2
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    dustGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    dustGeometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))
    geometries.push(dustGeometry)

    const dustMaterial = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: dustUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const dust = new THREE.Points(dustGeometry, dustMaterial)
    scene.add(dust)

    /* --- Thème ----------------------------------------------------- */

    const applyPalette = (p: ThemePalette) => {
      // En thème sombre, les couches se détachent en clair sur le fond ; en
      // thème clair il faut au contraire appuyer le doré pour qu'elles
      // ressortent du crème.
      for (const material of materials) {
        const weight = material.userData.weight as number
        const depth = material.userData.depth as number
        // La profondeur ne réduit jamais complètement : une couche du fond
        // reste lisible, elle recule seulement.
        const fade = 0.4 + depth * 0.6

        if (weight === -1) {
          // Fond du panneau
          material.color.copy(p.accent)
          material.opacity = (p.isDark ? 0.06 : 0.09) * fade
        } else if (weight === -2) {
          // Cadre du panneau
          material.color.copy(p.accent).multiplyScalar(p.isDark ? 1.35 : 1)
          material.opacity = (p.isDark ? 0.8 : 0.7) * fade
        } else {
          // Bloc d'interface
          material.color.copy(p.accent).multiplyScalar(p.isDark ? 1.2 : 0.95)
          material.opacity = weight * (p.isDark ? 0.85 : 0.75) * fade
        }
      }

      dustUniforms.uColor.value.copy(p.accent)
      dustUniforms.uOpacity.value = p.isDark ? 0.45 : 0.28
    }

    applyPalette(readPalette())
    const stopTheme = watchTheme(applyPalette)

    /* --- Entrées --------------------------------------------------- */

    const pointerTarget = new THREE.Vector2(0, 0)
    const pointer = new THREE.Vector2(0, 0)

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      )
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    // Encombrement de la pile dépliée, marges des décalages comprises.
    const maxOffsetX = Math.max(...LAYERS.map((l) => Math.abs(l.offset[0])))
    const maxOffsetY = Math.max(...LAYERS.map((l) => Math.abs(l.offset[1])))
    // Vue de trois quarts, la pile projette sa profondeur en largeur : sans ce
    // terme, le calcul sous-estime l'encombrement et les panneaux débordent.
    const YAW = 0.42
    const depthExtent = (LAYERS.length - 1) * LAYER_GAP
    const extentW =
      (PANEL_W + maxOffsetX * 2) * Math.cos(YAW) + depthExtent * Math.sin(YAW)
    const extentH = PANEL_H + maxOffsetY * 2

    const stopResize = observeResize(container, (width, height) => {
      renderer.setSize(width, height, false)
      camera.aspect = width / height

      // La caméra recule juste ce qu'il faut pour que la pile entière tienne
      // dans le cadre. Une échelle fixe débordait sur les formats étroits.
      // La borne haute doit rester au-dessus du recul exigé par les formats
      // les plus étroits (colonne de 543 px sur 1366 px de haut en 1024x1366,
      // fenêtre mobile 320x900) : plafonnée à 14, la pile était tranchée sur
      // le bord droit.
      const tan = Math.tan((38 * Math.PI) / 360)
      const fill = 0.82
      const fitH = extentH / (fill * 2 * tan)
      const fitW = extentW / (fill * 2 * tan * camera.aspect)
      camera.position.z = clamp(Math.max(fitH, fitW), 4.5, 20)
      camera.updateProjectionMatrix()
    })

    /* --- Boucle ---------------------------------------------------- */

    let velocity = 0
    let entrance = 0
    let assembled = 0

    const stopLoop = createRenderLoop(canvas, (elapsed, delta) => {
      // Progression dans le hero : les couches se rapprochent à mesure qu'on
      // descend, comme si la page finissait de s'assembler.
      const heroProgress = clamp(
        scrollState.y / Math.max(window.innerHeight, 1),
        0,
        1
      )
      assembled = lerp(assembled, heroProgress, 0.08)
      velocity = lerp(velocity, scrollState.smoothVelocity, 0.08)
      entrance = Math.min(1, entrance + delta * 0.5)

      pointer.lerp(pointerTarget, 0.05)

      // L'entrée déplie la pile ; le scroll la replie.
      const spread = entrance * (1 - assembled * 0.92)

      nodes.forEach((node, index) => {
        const wave = Math.sin(elapsed * 0.42 + index * 1.15)
        node.group.position.set(
          node.offset[0] * spread + wave * 0.02,
          node.offset[1] * spread + Math.cos(elapsed * 0.36 + index) * 0.024,
          node.restZ * spread
        )
        node.group.rotation.z = wave * 0.007
      })

      // La pile est vue de trois quarts et suit le curseur avec retard.
      stack.rotation.y = -YAW + pointer.x * 0.2 - velocity * 0.05
      stack.rotation.x = 0.16 + pointer.y * 0.13
      stack.position.y = -assembled * 0.55

      dustUniforms.uTime.value = elapsed
      dustUniforms.uVelocity.value = velocity
      dust.rotation.z = elapsed * 0.008

      renderer.render(scene, camera)
    })

    return () => {
      stopLoop()
      stopResize()
      stopTheme()
      window.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      disposeScene(scene)
      for (const geometry of geometries) geometry.dispose()
      for (const material of materials) material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className={className} aria-hidden>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}

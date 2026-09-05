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
import {
  dustFragment,
  dustVertex,
  heroFragment,
  heroVertex,
} from './shaders'
import { clamp, lerp, scrollState } from '../lib/scroll'

interface Props {
  className?: string
}

/**
 * Subdivisions de l'icosaèdre. `IcosahedronGeometry` découpe chacune de ses 20
 * faces en (detail + 1)² triangles : en dessous de ~30, les facettes se voient
 * et la sphère prend un air de caillou. Le mobile ne peut pas suivre.
 */
const detailFor = (width: number) => (width < 768 ? 20 : 40)

const DUST_COUNT = 420

/**
 * Sphère de bruit qui tient le hero.
 *
 * Elle réagit à trois choses : le temps (dérive lente), le pointeur (creux
 * local sous la souris) et la vitesse de scroll (les crêtes se dilatent quand
 * on descend). Tout est lu dans la boucle de rendu, sans state React.
 */
export default function HeroScene({ className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || !isWebGLAvailable()) return

    const renderer = createRenderer(canvas)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 3.4)

    const palette = readPalette()

    /* --- Sphère ---------------------------------------------------- */

    const applyPalette = (p: ThemePalette) => {
      // En thème clair la sphère doit rester dense pour se détacher du fond
      // crème ; en thème sombre, c'est le liseré qui porte la lecture.
      uniforms.uBaseColor.value.copy(p.accent).multiplyScalar(p.isDark ? 0.85 : 1.15)
      // Le liseré et le point brillant doivent dépasser la couleur du corps,
      // sinon la sphère reste un aplat quel que soit l'éclairage.
      uniforms.uAccentColor.value
        .copy(p.accent)
        .multiplyScalar(p.isDark ? 1.6 : 1.45)
      uniforms.uGlowColor.value.setRGB(1, 0.96, 0.88, THREE.SRGBColorSpace)
      // Ombres froides : elles creusent le volume sans salir la teinte dorée.
      uniforms.uShadowColor.value.setRGB(
        p.isDark ? 0.02 : 0.07,
        p.isDark ? 0.025 : 0.075,
        p.isDark ? 0.045 : 0.105,
        THREE.SRGBColorSpace
      )
      uniforms.uOpacity.value = 1
      dustUniforms.uColor.value.copy(p.accent)
      dustUniforms.uOpacity.value = p.isDark ? 0.5 : 0.32
    }

    const uniforms = {
      uTime: { value: 0 },
      uAmplitude: { value: 0.12 },
      uFrequency: { value: 2.1 },
      uVelocity: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uBaseColor: { value: new THREE.Color() },
      uAccentColor: { value: new THREE.Color() },
      uGlowColor: { value: new THREE.Color() },
      uShadowColor: { value: new THREE.Color() },
      uOpacity: { value: 1 },
    }

    const dustUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio() },
      uVelocity: { value: 0 },
      uColor: { value: new THREE.Color() },
      uOpacity: { value: 0.4 },
    }

    const geometry = new THREE.IcosahedronGeometry(1, detailFor(window.innerWidth))
    const material = new THREE.ShaderMaterial({
      vertexShader: heroVertex,
      fragmentShader: heroFragment,
      uniforms,
      transparent: true,
      depthWrite: true,
    })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    /* --- Poussière ------------------------------------------------- */

    const dustGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(DUST_COUNT * 3)
    const scales = new Float32Array(DUST_COUNT)
    const offsets = new Float32Array(DUST_COUNT)

    for (let i = 0; i < DUST_COUNT; i++) {
      // Réparties dans une coquille sphérique, jamais à l'intérieur du volume
      // occupé par la sphère centrale.
      const radius = 1.9 + Math.random() * 4.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.7
      positions[i * 3 + 2] = radius * Math.cos(phi) - 2.0
      scales[i] = 0.6 + Math.random() * 2.2
      offsets[i] = Math.random() * Math.PI * 2
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    dustGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    dustGeometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))

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

    applyPalette(palette)

    /* --- Entrées --------------------------------------------------- */

    const pointerTarget = new THREE.Vector2(0, 0)
    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      )
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    const stopResize = observeResize(container, (width, height) => {
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      // La sphère doit rester un objet posé dans la page, pas un fond : elle
      // occupe environ 60 % de la hauteur utile, quel que soit le format.
      const scale = clamp(Math.min(width, height) / 1150, 0.46, 0.86)
      sphere.scale.setScalar(scale)
    })

    const stopTheme = watchTheme(applyPalette)

    /* --- Boucle ---------------------------------------------------- */

    let velocity = 0
    let entrance = 0

    const stopLoop = createRenderLoop(canvas, (elapsed, delta) => {
      // La progression dans le hero (0 → 1) écarte la sphère du centre.
      const heroProgress = clamp(
        scrollState.y / Math.max(window.innerHeight, 1),
        0,
        1.6
      )

      velocity = lerp(velocity, scrollState.smoothVelocity, 0.08)
      entrance = Math.min(1, entrance + delta * 0.9)

      uniforms.uTime.value = elapsed
      uniforms.uVelocity.value = velocity
      uniforms.uAmplitude.value =
        (0.105 + Math.abs(velocity) * 0.12) * (0.35 + entrance * 0.65)
      uniforms.uPointer.value.lerp(pointerTarget, 0.06)

      dustUniforms.uTime.value = elapsed
      dustUniforms.uVelocity.value = velocity

      sphere.rotation.y = elapsed * 0.08 + pointerTarget.x * 0.18
      sphere.rotation.x = -pointerTarget.y * 0.14
      // Elle plonge et grossit au fur et à mesure qu'on quitte le hero.
      sphere.position.y = -heroProgress * 0.9
      sphere.position.z = heroProgress * 1.4

      dust.rotation.y = elapsed * 0.02

      renderer.render(scene, camera)
    })

    return () => {
      stopLoop()
      stopResize()
      stopTheme()
      window.removeEventListener('pointermove', onPointerMove)
      disposeScene(scene)
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className={className} aria-hidden>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}

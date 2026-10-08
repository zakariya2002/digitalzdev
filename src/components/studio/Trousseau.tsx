import { useEffect, useRef } from 'react'

/**
 * Trousseau en 3D suspendu en haut de page, inspiré de butter.video.
 *
 * Une chaîne pend depuis le haut de l'écran jusqu'à un anneau ; cinq objets y
 * sont accrochés : un mousqueton, le logo, une clé USB, une clé et
 * « digitalzdev » en volume. Au chargement, le trousseau tombe et rebondit sur
 * sa chaîne ; ensuite il se balance doucement, et la souris le bouscule.
 *
 * La physique est volontairement simple (intégration de Verlet, contraintes
 * de distance, répulsion entre objets) : pas de moteur physique à charger.
 * three.js n'est importé qu'au montage, pour ne pas peser sur le premier
 * affichage.
 */

type Vec = { x: number; y: number; z: number }
const v = (x = 0, y = 0, z = 0): Vec => ({ x, y, z })

interface Pendule {
  pivot: Vec // point d'accroche sur l'anneau, relatif à son centre
  pos: Vec
  prec: Vec
  longueur: number
  rayon: number
  lacet: number
  lacetV: number
  lacetRepos: number
}

export default function Trousseau({ className = '' }: { className?: string }) {
  const hoteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hote = hoteRef.current
    if (!hote) return
    let arret = false
    let nettoyer = () => {}

    ;(async () => {
      const THREE = await import('three')
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')
      const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js')
      const { TextGeometry } = await import('three/examples/jsm/geometries/TextGeometry.js')
      const { FontLoader } = await import('three/examples/jsm/loaders/FontLoader.js')
      const police = await new FontLoader().loadAsync('/fonts/nunito-black.typeface.json')
      if (arret) return

      const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Rendu
      const rendu = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      rendu.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      rendu.outputColorSpace = THREE.SRGBColorSpace
      rendu.toneMapping = THREE.ACESFilmicToneMapping
      rendu.toneMappingExposure = 1.05
      rendu.domElement.style.cssText = 'width:100%;height:100%;display:block;pointer-events:none'
      hote.appendChild(rendu.domElement)

      const scene = new THREE.Scene()
      const pmrem = new THREE.PMREMGenerator(rendu)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      const soleil = new THREE.DirectionalLight(0xffffff, 1.6)
      soleil.position.set(3, 6, 8)
      scene.add(soleil)

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
      camera.position.set(0, 0, 14)

      // Matières
      const chrome = new THREE.MeshPhysicalMaterial({ color: 0xe9e9ee, metalness: 1, roughness: 0.12 })
      const bleu = new THREE.MeshPhysicalMaterial({ color: 0x3654f4, metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 })
      const citron = new THREE.MeshPhysicalMaterial({ color: 0xd9f45a, metalness: 0, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2 })
      const noir = new THREE.MeshPhysicalMaterial({ color: 0x1d1d1f, metalness: 0.2, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.25 })
      const sombre = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.6 })
      const led = new THREE.MeshStandardMaterial({ color: 0x3654f4, emissive: 0x3654f4, emissiveIntensity: 1.4 })

      const anneauPetit = () => new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.028, 12, 32), chrome)

      // Les objets. Chacun pend depuis l'origine locale, le corps vers le bas.
      const fabriquer = {
        mousqueton() {
          const g = new THREE.Group()
          const courbe = new THREE.CatmullRomCurve3(
            [v(0, 0), v(0.3, -0.1), v(0.36, -0.7), v(0.22, -1.32), v(0, -1.42), v(-0.22, -1.3), v(-0.3, -0.7), v(-0.26, -0.12)].map(
              (p) => new THREE.Vector3(p.x, p.y, p.z)
            ),
            true
          )
          g.add(new THREE.Mesh(new THREE.TubeGeometry(courbe, 120, 0.075, 16, true), bleu))
          const doigt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 12), chrome)
          doigt.position.set(-0.18, -0.68, 0.02)
          doigt.rotation.z = -0.08
          g.add(doigt)
          return g
        },
        logo() {
          const g = new THREE.Group()
          const a = anneauPetit()
          a.position.y = -0.1
          g.add(a)
          const plaque = new THREE.Mesh(new RoundedBoxGeometry(1.05, 1.05, 0.28, 5, 0.22), noir)
          plaque.position.y = -0.74
          g.add(plaque)
          const trois = new TextGeometry('3', { font: police, size: 0.72, depth: 0.16, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 4 })
          trois.computeBoundingBox()
          const bb = trois.boundingBox!
          trois.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, 0)
          const m = new THREE.Mesh(trois, chrome)
          m.position.set(0, -0.74, 0.12)
          g.add(m)
          return g
        },
        usb() {
          const g = new THREE.Group()
          const a = anneauPetit()
          a.position.y = -0.1
          g.add(a)
          const corps = new THREE.Mesh(new RoundedBoxGeometry(0.62, 1.12, 0.26, 5, 0.1), noir)
          corps.position.y = -0.8
          g.add(corps)
          const voyant = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), led)
          voyant.position.set(0.16, -0.42, 0.135)
          g.add(voyant)
          const bande = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.262), bleu)
          bande.position.y = -1.2
          g.add(bande)
          const prise = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.5, 0.15, 3, 0.02), chrome)
          prise.position.y = -1.6
          g.add(prise)
          for (const x of [-0.1, 0.1]) {
            const trou = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.02), sombre)
            trou.position.set(x, -1.68, 0.075)
            g.add(trou)
          }
          return g
        },
        cle() {
          const g = new THREE.Group()
          const tete = new THREE.Shape()
          tete.absarc(0, -0.3, 0.42, 0, Math.PI * 2, false)
          const oeil = new THREE.Path()
          oeil.absarc(0, -0.12, 0.11, 0, Math.PI * 2, true)
          tete.holes.push(oeil)
          const lame = new THREE.Shape()
          lame.moveTo(-0.11, -0.6)
          lame.lineTo(-0.11, -2.05)
          lame.lineTo(0.02, -2.18)
          lame.lineTo(0.13, -2.05)
          for (let i = 0; i < 5; i++) {
            const y = -1.95 + i * 0.22
            lame.lineTo(0.13, y)
            lame.lineTo(0.24, y + 0.07)
            lame.lineTo(0.24, y + 0.13)
            lame.lineTo(0.13, y + 0.18)
          }
          lame.lineTo(0.13, -0.6)
          lame.lineTo(-0.11, -0.6)
          const reglages = { depth: 0.09, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 3, curveSegments: 40 }
          for (const s of [tete, lame]) {
            const geo = new THREE.ExtrudeGeometry(s, reglages)
            geo.translate(0, 0.12, -0.045)
            g.add(new THREE.Mesh(geo, chrome))
          }
          const a = anneauPetit()
          a.rotation.y = Math.PI / 2
          g.add(a)
          return g
        },
        texte() {
          const g = new THREE.Group()
          const a = anneauPetit()
          a.position.y = -0.1
          g.add(a)
          const geo = new TextGeometry('digitalzdev', { font: police, size: 0.27, depth: 0.2, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 4 })
          geo.computeBoundingBox()
          const bb = geo.boundingBox!
          // Le mot se lit de haut en bas, comme le « Butter » d'origine.
          geo.translate(-bb.min.x, -(bb.max.y + bb.min.y) / 2, -0.1)
          geo.rotateZ(-Math.PI / 2)
          const m = new THREE.Mesh(geo, citron)
          m.position.y = -0.2
          g.add(m)
          return g
        },
      }

      const trousseau = new THREE.Group()
      scene.add(trousseau)

      const anneau = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 16, 64), chrome)
      trousseau.add(anneau)

      // Chaîne : de l'ancre (hors écran) à l'anneau. Elle est assez longue pour
      // que l'ancre reste au-dessus de l'écran quelle que soit sa taille : c'est
      // l'ancre qui se place, pour que l'anneau finisse toujours au même endroit.
      const PAS = 0.28
      const NB = 30
      const LONGUEUR = PAS * (NB - 1)
      const chaine: { pos: Vec; prec: Vec }[] = Array.from({ length: NB }, () => ({ pos: v(), prec: v() }))
      const maillons = Array.from({ length: NB - 1 }, (_, i) => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.028, 10, 28), chrome)
        m.scale.set(1, 1.6, 1)
        m.userData.alterne = i % 2
        trousseau.add(m)
        return m
      })

      // Les objets, de gauche à droite.
      const objets = [
        { mesh: fabriquer.mousqueton(), pivot: v(-0.4, -0.18, 0.06), longueur: 0.75, rayon: 0.42, repos: 0.6 },
        { mesh: fabriquer.logo(), pivot: v(-0.22, -0.36, 0.16), longueur: 0.78, rayon: 0.62, repos: 0.05 },
        { mesh: fabriquer.usb(), pivot: v(0.0, -0.43, -0.1), longueur: 0.95, rayon: 0.45, repos: -0.2 },
        { mesh: fabriquer.cle(), pivot: v(0.22, -0.36, 0.12), longueur: 1.05, rayon: 0.42, repos: -0.4 },
        { mesh: fabriquer.texte(), pivot: v(0.4, -0.18, -0.06), longueur: 1.25, rayon: 0.34, repos: -0.15 },
      ]
      const pendules: Pendule[] = objets.map((o) => {
        trousseau.add(o.mesh)
        return { pivot: o.pivot, pos: v(), prec: v(), longueur: o.longueur, rayon: o.rayon, lacet: o.repos, lacetV: 0, lacetRepos: o.repos }
      })

      // Cadrage : le trousseau pend à droite du titre sur ordinateur.
      let demiH = 1
      let demiL = 1
      let ancreX = 0
      let anneauY = 0
      let echelle = 1
      const redimensionner = () => {
        const l = hote.clientWidth
        const h = hote.clientHeight
        rendu.setSize(l, h, false)
        camera.aspect = l / h
        camera.updateProjectionMatrix()
        demiH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
        demiL = demiH * camera.aspect
        const mobile = l < 768
        echelle = mobile ? 0.5 : 0.95
        ancreX = mobile ? demiL * 0.56 : demiL * 0.46
        // L'anneau vers le tiers de la hauteur : le trousseau finit à côté du titre.
        anneauY = demiH * (1 - 2 * (mobile ? 0.39 : 0.3))
        trousseau.scale.setScalar(echelle)
      }
      redimensionner()
      window.addEventListener('resize', redimensionner)

      // Arrivée : le trousseau tombe, dépasse sa place, puis remonte s'y poser.
      const ancreFinale = () => v(ancreX / echelle, anneauY / echelle + LONGUEUR, 0)
      const debut = performance.now()
      const DELAI = reduit ? 0 : 350
      const CHUTE = 0.75
      const REMONTEE = 0.9
      const DEPASSE = -2.2
      const decalage = () => {
        if (reduit) return 0
        const t = (performance.now() - debut - DELAI) / 1000
        if (t <= 0) return 12
        if (t < CHUTE) {
          const e = t / CHUTE
          return 12 + (DEPASSE - 12) * (e * e * (3 - 2 * e))
        }
        const u = Math.min(1, (t - CHUTE) / REMONTEE)
        const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2
        return DEPASSE * (1 - e)
      }
      const ancre = () => {
        const f = ancreFinale()
        return v(f.x, f.y + decalage(), f.z)
      }
      {
        const a = ancre()
        chaine.forEach((n, i) => {
          n.pos = v(a.x, a.y - i * PAS, 0)
          n.prec = { ...n.pos }
        })
        const c = chaine[NB - 1].pos
        pendules.forEach((p) => {
          p.pos = v(c.x + p.pivot.x, c.y + p.pivot.y - p.longueur, c.z + p.pivot.z)
          p.prec = { ...p.pos }
        })
      }

      // Souris, en coordonnées de la scène (plan z = 0, repère du trousseau).
      const souris = { x: 99, y: 99, vx: 0, vy: 0, actif: false }
      let dernier = { x: 99, y: 99, t: performance.now() }
      const bouger = (e: PointerEvent) => {
        const r = hote.getBoundingClientRect()
        if (e.clientY < r.top || e.clientY > r.bottom) return
        const x = (((e.clientX - r.left) / r.width) * 2 - 1) * demiL / echelle
        const y = (-(((e.clientY - r.top) / r.height) * 2 - 1)) * demiH / echelle
        const t = performance.now()
        const dt = Math.max(8, t - dernier.t) / 1000
        souris.vx = (x - dernier.x) / dt
        souris.vy = (y - dernier.y) / dt
        souris.x = x
        souris.y = y
        souris.actif = true
        dernier = { x, y, t }
      }
      window.addEventListener('pointermove', bouger, { passive: true })

      // Attraper un objet : il suit le pointeur, la chaîne et le reste suivent.
      const rayon = new THREE.Raycaster()
      const ndc = new THREE.Vector2()
      let saisi = -1
      const toucher = (e: { clientX: number; clientY: number }) => {
        const r = hote.getBoundingClientRect()
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
        rayon.setFromCamera(ndc, camera)
        for (let i = 0; i < objets.length; i++)
          if (rayon.intersectObject(objets[i].mesh, true).length) return i
        if (rayon.intersectObject(anneau).length) return objets.length
        return -1
      }
      const appuyer = (e: PointerEvent) => {
        const i = toucher(e)
        if (i < 0) return
        saisi = i
        bouger(e)
        souris.vx = souris.vy = 0
        e.preventDefault()
        document.documentElement.style.cursor = 'grabbing'
        document.body.style.userSelect = 'none'
      }
      const relacher = () => {
        if (saisi < 0) return
        saisi = -1
        document.documentElement.style.cursor = ''
        document.body.style.userSelect = ''
      }
      const survoler = (e: PointerEvent) => {
        if (saisi >= 0 || e.pointerType !== 'mouse') return
        document.documentElement.style.cursor = toucher(e) >= 0 ? 'grab' : ''
      }
      // Pendant la saisie au doigt, la page ne défile pas.
      const bloquerDefilement = (e: TouchEvent) => {
        if (saisi >= 0) e.preventDefault()
      }
      // Sur mobile, un glissement du doigt vers la gauche ou la droite, n'importe
      // où dans le haut de page, balance le trousseau dans ce sens.
      let doigtX = 0
      let doigtY = 0
      let elan = 0
      const debutDoigt = (e: TouchEvent) => {
        doigtX = e.touches[0].clientX
        doigtY = e.touches[0].clientY
      }
      const glisser = (e: TouchEvent) => {
        if (saisi >= 0) return
        const t = e.touches[0]
        const r = hote.getBoundingClientRect()
        if (t.clientY < r.top || t.clientY > r.bottom) return
        const dx = t.clientX - doigtX
        const dy = t.clientY - doigtY
        doigtX = t.clientX
        doigtY = t.clientY
        if (Math.abs(dx) > Math.abs(dy)) elan += (dx / r.width) * 6
      }
      // Sur Mac, le glissement à deux doigts sur le trackpad fait la même chose.
      const balayer = (e: WheelEvent) => {
        if (saisi >= 0 || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
        const r = hote.getBoundingClientRect()
        if (r.bottom < 0 || r.top > window.innerHeight) return
        elan -= (e.deltaX / r.width) * 7
      }
      window.addEventListener('wheel', balayer, { passive: true })
      window.addEventListener('touchstart', debutDoigt, { passive: true })
      window.addEventListener('touchmove', glisser, { passive: true })
      window.addEventListener('pointerdown', appuyer)
      window.addEventListener('pointerup', relacher)
      window.addEventListener('pointercancel', relacher)
      window.addEventListener('pointermove', survoler, { passive: true })
      window.addEventListener('touchmove', bloquerDefilement, { passive: false })

      // Simulation
      const GRAVITE = -14
      const AMORTI = 0.984
      const contraindre = (a: Vec, b: Vec, longueur: number, poidsA: number) => {
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z
        const d = Math.hypot(dx, dy, dz) || 1e-6
        const k = (d - longueur) / d
        a.x += dx * k * poidsA; a.y += dy * k * poidsA; a.z += dz * k * poidsA
        b.x -= dx * k * (1 - poidsA); b.y -= dy * k * (1 - poidsA); b.z -= dz * k * (1 - poidsA)
      }
      const integrer = (n: { pos: Vec; prec: Vec }, dt: number, vent: number) => {
        const vx = (n.pos.x - n.prec.x) * AMORTI
        const vy = (n.pos.y - n.prec.y) * AMORTI
        const vz = (n.pos.z - n.prec.z) * AMORTI
        n.prec = { ...n.pos }
        n.pos.x += vx + vent * dt * dt
        n.pos.y += vy + GRAVITE * dt * dt
        n.pos.z += vz
      }

      const pas = (dt: number, temps: number) => {
        // Pas de vent : au repos, le trousseau ne bouge pas.
        const vent = 0
        const a = ancre()
        chaine[0].pos = a
        chaine[0].prec = { ...a }
        for (let i = 1; i < NB; i++) integrer(chaine[i], dt, vent * 0.4)
        pendules.forEach((p) => integrer(p, dt, vent))

        // Poussée de la souris
        if (souris.actif && saisi < 0) {
          pendules.forEach((p) => {
            const d = Math.hypot(p.pos.x - souris.x, p.pos.y - souris.y)
            const portee = p.rayon + 0.55
            if (d < portee) {
              const f = (1 - d / portee) * dt * 0.9
              p.prec.x -= souris.vx * f * 0.06
              p.prec.y -= souris.vy * f * 0.04
              p.prec.z -= (Math.abs(souris.vx) + Math.abs(souris.vy)) * f * 0.02 * (p.pivot.z >= 0 ? 1 : -1)
              p.lacetV += souris.vx * f * 1.3
            }
          })
          souris.vx *= 0.85
          souris.vy *= 0.85
        }

        // Élan donné par le doigt : tout le trousseau part dans le sens du geste.
        if (elan !== 0) {
          const e = elan * 0.25
          pendules.forEach((p, i) => {
            p.prec.x -= e * dt * (1 + i * 0.12)
            p.lacetV += e * 4 * dt
          })
          const c = chaine[NB - 1]
          c.prec.x -= e * dt * 0.6
          elan -= e
          if (Math.abs(elan) < 1e-3) elan = 0
        }

        // L'objet saisi est tiré vers le pointeur ; les contraintes font le reste.
        if (saisi >= 0) {
          const cible = saisi < pendules.length ? pendules[saisi].pos : chaine[NB - 1].pos
          cible.x += (souris.x - cible.x) * 0.35
          cible.y += (souris.y - cible.y) * 0.35
          if (saisi < pendules.length) pendules[saisi].lacetV += souris.vx * dt * 0.8
        }

        for (let it = 0; it < 14; it++) {
          for (let i = 0; i < NB - 1; i++) contraindre(chaine[i].pos, chaine[i + 1].pos, PAS, i === 0 ? 0 : 0.5)
          const c = chaine[NB - 1].pos
          pendules.forEach((p, i) => {
            const piv = v(c.x + p.pivot.x, c.y + p.pivot.y, c.z + p.pivot.z)
            const avant = { ...piv }
            // Saisi, l'objet mène : c'est l'anneau qui le suit.
            const tenu = i === saisi
            contraindre(piv, p.pos, p.longueur, tenu ? 0.95 : 0.12)
            // L'objet tire un peu l'anneau : le trousseau bouge d'un bloc.
            const k = tenu ? 1 : 0.6
            c.x += (piv.x - avant.x) * k; c.y += (piv.y - avant.y) * k; c.z += (piv.z - avant.z) * k
          })
          // Les objets ne se traversent pas.
          for (let i = 0; i < pendules.length; i++)
            for (let j = i + 1; j < pendules.length; j++) {
              const A = pendules[i].pos, B = pendules[j].pos
              const min = (pendules[i].rayon + pendules[j].rayon) * 0.95
              const dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z
              const d = Math.hypot(dx, dy, dz) || 1e-6
              if (d < min) {
                const k = ((min - d) / d) * 0.5
                A.x -= dx * k; A.y -= dy * k; A.z -= dz * k
                B.x += dx * k; B.y += dy * k; B.z += dz * k
              }
            }
        }
        // La chaîne ne s'étire pas : chaque maillon trop loin est ramené vers le haut.
        for (let i = 1; i < NB; i++) {
          const a = chaine[i - 1].pos, b = chaine[i].pos
          const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z
          const d = Math.hypot(dx, dy, dz)
          if (d > PAS) {
            const k = PAS / d
            const nx = a.x + dx * k, ny = a.y + dy * k, nz = a.z + dz * k
            // Le point précédent bouge d'autant : la correction ne crée pas d'élan.
            const n = chaine[i]
            n.prec.x += nx - b.x; n.prec.y += ny - b.y; n.prec.z += nz - b.z
            b.x = nx; b.y = ny; b.z = nz
          }
        }

        // Rotation de chaque objet sur lui-même : un ressort vers sa pose de repos.
        pendules.forEach((p) => {
          p.lacetV += -(p.lacet - p.lacetRepos) * 6 * dt
          p.lacetV *= 0.97
          p.lacet += p.lacetV * dt
        })
      }

      // Mise à jour des maillages
      const haut = new THREE.Vector3(0, 1, 0)
      const bas = new THREE.Vector3(0, -1, 0)
      const dir = new THREE.Vector3()
      const qA = new THREE.Quaternion()
      const qB = new THREE.Quaternion()
      const afficher = () => {
        for (let i = 0; i < NB - 1; i++) {
          const a = chaine[i].pos, b = chaine[i + 1].pos
          const m = maillons[i]
          m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
          dir.set(b.x - a.x, b.y - a.y, b.z - a.z).normalize()
          qA.setFromUnitVectors(haut, dir.multiplyScalar(-1))
          qB.setFromAxisAngle(haut, m.userData.alterne ? Math.PI / 2 : 0)
          m.quaternion.copy(qA).multiply(qB)
        }
        const c = chaine[NB - 1].pos
        anneau.position.set(c.x, c.y - 0.1, c.z)
        anneau.rotation.set(0, 0.5, 0)
        pendules.forEach((p, i) => {
          const m = objets[i].mesh
          const piv = v(c.x + p.pivot.x, c.y + p.pivot.y, c.z + p.pivot.z)
          m.position.set(piv.x, piv.y, piv.z)
          dir.set(p.pos.x - piv.x, p.pos.y - piv.y, p.pos.z - piv.z).normalize()
          qA.setFromUnitVectors(bas, dir)
          qB.setFromAxisAngle(haut, p.lacet)
          m.quaternion.copy(qA).multiply(qB)
        })
      }

      // Boucle, suspendue quand le trousseau n'est pas visible.
      let visible = true
      const obs = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
      obs.observe(hote)
      let raf = 0
      let avant = performance.now()
      let reste = 0
      const PAS_FIXE = 1 / 120
      const boucle = (t: number) => {
        raf = requestAnimationFrame(boucle)
        const ecoule = Math.min(0.05, (t - avant) / 1000)
        avant = t
        if (!visible || document.hidden) return
        reste += ecoule
        while (reste >= PAS_FIXE) {
          pas(PAS_FIXE, t / 1000)
          reste -= PAS_FIXE
        }
        afficher()
        rendu.render(scene, camera)
      }
      if (reduit) {
        for (let i = 0; i < 600; i++) pas(PAS_FIXE, i * PAS_FIXE)
        afficher()
        rendu.render(scene, camera)
      } else {
        raf = requestAnimationFrame(boucle)
      }

      nettoyer = () => {
        cancelAnimationFrame(raf)
        obs.disconnect()
        window.removeEventListener('resize', redimensionner)
        window.removeEventListener('pointermove', bouger)
        window.removeEventListener('pointerdown', appuyer)
        window.removeEventListener('pointerup', relacher)
        window.removeEventListener('pointercancel', relacher)
        window.removeEventListener('pointermove', survoler)
        window.removeEventListener('touchmove', bloquerDefilement)
        window.removeEventListener('touchstart', debutDoigt)
        window.removeEventListener('wheel', balayer)
        window.removeEventListener('touchmove', glisser)
        document.documentElement.style.cursor = ''
        scene.traverse((o) => {
          const m = o as InstanceType<typeof THREE.Mesh>
          if (m.isMesh) m.geometry.dispose()
        })
        ;[chrome, bleu, citron, noir, sombre, led].forEach((m) => m.dispose())
        pmrem.dispose()
        rendu.dispose()
        rendu.domElement.remove()
      }
    })()

    return () => {
      arret = true
      nettoyer()
    }
  }, [])

  return <div ref={hoteRef} aria-hidden className={className} />
}

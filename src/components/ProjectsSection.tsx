import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import ProjectsIndex from './ProjectsIndex'
import { Magnetic, Reveal, SplitText } from './motion'
import { EASE_OUT, VIEWPORT } from './motion/config'
import { isWebGLAvailable } from '../webgl/core'
import { clamp, scrollTo } from '../lib/scroll'
import { projects } from '../data/projects'

// Chargée seulement quand la galerie 3D est retenue : le mobile et les
// navigateurs sans WebGL ne téléchargent jamais three.js.
const GalleryScene = lazy(() => import('../webgl/GalleryScene'))

/** Hauteur de scroll allouée à chaque projet dans la section épinglée. */
const VH_PER_PROJECT = 85

/**
 * Largeur minimale pour la galerie 3D. En dessous, l'arc de projets n'a plus
 * la place de se déployer et l'index en liste passe devant. Le seuil est bas
 * pour qu'une fenêtre non maximisée y ait droit.
 */
const MIN_GALLERY_WIDTH = 900

export default function ProjectsSection() {
  const navigate = useNavigate()
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [hovering, setHovering] = useState(false)

  // La galerie 3D demande de la largeur et un contexte WebGL. `failed` retient
  // un échec réel de création du rendu : dans ce cas on ne retente pas, l'index
  // en liste devient définitif pour la session.
  const [wide, setWide] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${MIN_GALLERY_WIDTH}px)`)
    // Suivre le redimensionnement : sans ça, une fenêtre agrandie après le
    // chargement resterait bloquée sur la liste jusqu'au prochain rechargement.
    const sync = () => setWide(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const useWebGL = wide && !failed && isWebGLAvailable()

  const project = projects[clamp(active, 0, projects.length - 1)]

  /* --- Étiquette qui suit le curseur au-dessus de la galerie -------- */

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const smoothX = useSpring(cursorX, { stiffness: 400, damping: 32, mass: 0.4 })
  const smoothY = useSpring(cursorY, { stiffness: 400, damping: 32, mass: 0.4 })

  const trackCursor = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    cursorX.set(event.clientX - rect.left)
    cursorY.set(event.clientY - rect.top)
  }

  /* --- Navigation ------------------------------------------------- */

  const goToProject = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return
    const top = track.getBoundingClientRect().top + window.scrollY
    const distance = track.offsetHeight - window.innerHeight
    const ratio = index / Math.max(projects.length - 1, 1)
    scrollTo(top + distance * ratio, { duration: 1.1 })
  }, [])

  const openProject = useCallback(
    (index: number) => navigate(projects[index].route),
    [navigate]
  )

  // Flèches gauche / droite quand la galerie occupe l'écran : c'est le geste
  // attendu sur ce type de carrousel, et ça rend la section navigable au clavier.
  useEffect(() => {
    if (!useWebGL) return
    const onKey = (event: KeyboardEvent) => {
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const pinned = rect.top <= 1 && rect.bottom >= window.innerHeight
      if (!pinned) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToProject(Math.min(active + 1, projects.length - 1))
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToProject(Math.max(active - 1, 0))
      } else if (event.key === 'Enter') {
        openProject(active)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, useWebGL, goToProject, openProject])

  const trackHeight = useMemo(
    () => `${projects.length * VH_PER_PROJECT}vh`,
    []
  )

  return (
    <section id="projets" className="relative bg-surface">
      {/* En-tête */}
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Réalisations
              </span>
            </Reveal>
            <SplitText
              as="h2"
              by="char"
              text="Nos réalisations"
              delay={0.1}
              className="mt-5 block font-display text-4xl font-bold leading-[0.95] tracking-tight text-text-primary md:text-7xl"
            />
          </div>

          <Reveal delay={0.2} className="max-w-sm">
            <p className="text-text-secondary">
              Des boutiques Shopify aux plateformes métier. Chaque projet part
              d'un problème concret et se juge sur ce qu'il change une fois en
              ligne.
            </p>
            <Magnetic className="mt-6 inline-block">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-text-primary px-7 py-3 font-display text-sm font-semibold tracking-wider text-surface transition-opacity hover:opacity-90"
              >
                DEMANDER UN DEVIS
                <span aria-hidden>→</span>
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </div>

      {useWebGL ? (
        <div ref={trackRef} className="relative" style={{ height: trackHeight }}>
          <div
            className="sticky top-0 h-screen overflow-hidden"
            onMouseMove={trackCursor}
          >
            <Suspense fallback={null}>
              <GalleryScene
                projects={projects}
                trackRef={trackRef}
                onActiveChange={setActive}
                onHoverChange={setHovering}
                onSelect={openProject}
                onUnavailable={() => setFailed(true)}
                className="absolute inset-0"
              />
            </Suspense>

            {/* Habillage : tout est en pointer-events-none pour laisser le
                canvas recevoir le survol, sauf les commandes explicites.
                Tout est logé dans la bande basse, laissée libre par les plans. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-10 md:px-12 md:pb-14">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="relative min-h-[14rem] flex-1 md:min-h-[15rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.5, ease: EASE_OUT }}
                      className="absolute inset-x-0 bottom-0 max-w-2xl"
                    >
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                          {project.subtitle}
                        </span>
                        <span className="font-mono text-xs text-text-muted">
                          · {project.year}
                        </span>
                      </div>

                      <h3
                        className={`font-display font-bold tracking-tight text-text-primary ${
                          project.title.length > 19
                            ? 'text-3xl md:text-5xl'
                            : 'text-4xl md:text-6xl'
                        }`}
                      >
                        {project.title}
                      </h3>

                      <p className="mt-4 max-w-xl text-text-secondary">
                        {project.description}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-surface-border bg-surface-card/60 px-3 py-1 text-[11px] uppercase tracking-wider text-text-secondary backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                        <Link
                          to={project.route}
                          className="pointer-events-auto ml-1 inline-flex items-center gap-2 border-b border-accent/40 pb-0.5 font-display text-sm font-semibold text-accent transition-colors hover:border-accent"
                        >
                          Voir le projet <span aria-hidden>→</span>
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Repères de navigation, un trait par projet */}
                <div className="hidden shrink-0 items-center gap-2 pb-1 md:flex">
                  {projects.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToProject(index)}
                      aria-label={`Aller au projet ${item.title}`}
                      aria-current={index === active}
                      className="pointer-events-auto group flex h-8 items-center px-1"
                    >
                      <span
                        className={`block h-px transition-all duration-500 ${
                          index === active
                            ? 'w-10 bg-accent'
                            : 'w-5 bg-text-muted group-hover:w-8 group-hover:bg-text-secondary'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Étiquette de survol */}
            <motion.div
              className="pointer-events-none absolute left-0 top-0 z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ x: smoothX, y: smoothY }}
              animate={{ scale: hovering ? 1 : 0, opacity: hovering ? 1 : 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              <span className="block rounded-full bg-accent px-5 py-5 font-display text-[11px] font-bold uppercase tracking-widest text-white">
                Voir
              </span>
            </motion.div>
          </div>
        </div>
      ) : (
        <ProjectsIndex projects={projects} />
      )}

      {/* Rappel discret de la mécanique, seulement en version WebGL */}
      {useWebGL && (
        <motion.p
          className="pb-20 pt-10 text-center font-mono text-xs uppercase tracking-[0.25em] text-text-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
        >
          Faites défiler · ← → pour naviguer
        </motion.p>
      )}
    </section>
  )
}

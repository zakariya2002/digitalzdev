import { useCallback, useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import { Reveal, SplitText } from './motion'
import { EASE_OUT } from './motion/config'
import { clamp } from '../lib/scroll'
import { testimonials } from '../data/testimonials'
import type { Testimonial } from '../data/testimonials'

/** Largeur d'une carte et écart entre deux cartes, en pixels. */
const CARD = 380
const GAP = 24
const STEP = CARD + GAP

/** Durée d'un palier de lecture automatique, en millisecondes. */
const AUTOPLAY = 6000

/* ------------------------------------------------------------------ */

function Card({
  item,
  index,
  trackX,
  viewport,
}: {
  item: Testimonial
  index: number
  trackX: ReturnType<typeof useMotionValue<number>>
  viewport: number
}) {
  // Distance entre le centre de la carte et le centre du cadre. Tout le
  // relief de la carte en découle : rotation, échelle, opacité, profondeur.
  const distance = useTransform(trackX, (x) => {
    if (!viewport) return 0
    return index * STEP + x + CARD / 2 - viewport / 2
  })

  const normalized = useTransform(distance, (d) =>
    viewport ? clamp(d / (viewport / 2), -1.6, 1.6) : 0
  )

  const rotateY = useTransform(normalized, (n) => -n * 22)
  const scale = useTransform(normalized, (n) => 1 - Math.min(Math.abs(n), 1) * 0.1)
  const opacity = useTransform(normalized, (n) => 1 - Math.min(Math.abs(n), 1) * 0.55)
  const z = useTransform(normalized, (n) => -Math.abs(n) * 120)

  const estTemoignage = item.quote !== null && item.author !== null

  return (
    <motion.li
      className="shrink-0"
      style={{
        width: CARD,
        rotateY,
        scale,
        opacity,
        z,
        transformStyle: 'preserve-3d',
      }}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
        <div className="relative h-40 overflow-hidden">
          <img
            src={item.image}
            alt=""
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover object-top"
          />
          {/* Voile teinté de la couleur du client, pour lier image et carte */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, rgb(var(--surface-card)) 4%, ${item.color}22 60%, transparent)`,
            }}
          />
        </div>

        <div className="flex flex-1 flex-col p-7">
          <h3 className="font-display text-xl font-bold text-text-primary">
            {item.company}
          </h3>
          <p className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {item.sector}
          </p>

          {estTemoignage ? (
            <blockquote className="mt-5 flex-1">
              <p className="leading-relaxed text-text-secondary">
                « {item.quote} »
              </p>
              <footer className="mt-5 text-sm">
                <span className="font-semibold text-text-primary">
                  {item.author!.name}
                </span>
                <span className="text-text-muted"> · {item.author!.role}</span>
              </footer>
            </blockquote>
          ) : (
            <p className="mt-5 flex-1 leading-relaxed text-text-secondary">
              {item.delivered}
            </p>
          )}

          <Link
            to={item.route}
            className="mt-7 inline-flex w-fit items-center gap-2 border-b border-accent/40 pb-0.5 font-display text-sm font-semibold text-accent transition-colors hover:border-accent"
          >
            Voir le projet <span aria-hidden>→</span>
          </Link>
        </div>
      </article>
    </motion.li>
  )
}

/* ------------------------------------------------------------------ */

export default function TestimonialsSection() {
  const cadreRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState(0)
  const [actif, setActif] = useState(0)
  const [enPause, setEnPause] = useState(false)
  const reduced = useReducedMotion()

  const trackX = useMotionValue(0)
  const doux = useSpring(trackX, { stiffness: 120, damping: 26, mass: 0.6 })

  const largeurTotale = testimonials.length * STEP - GAP
  const minX = Math.min(0, viewport - largeurTotale)

  useEffect(() => {
    const el = cadreRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) =>
      setViewport(entry.contentRect.width)
    )
    observer.observe(el)
    setViewport(el.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [])

  // Position de repos d'une carte : centrée dans le cadre, bornée aux limites.
  const positionDe = useCallback(
    (index: number) =>
      clamp(viewport / 2 - index * STEP - CARD / 2, minX, 0),
    [viewport, minX]
  )

  const allerA = useCallback(
    (index: number) => {
      const cible = clamp(index, 0, testimonials.length - 1)
      setActif(cible)
      trackX.set(positionDe(cible))
    },
    [positionDe, trackX]
  )

  // L'indice actif suit la position réelle, y compris pendant un glissement.
  useMotionValueEvent(doux, 'change', (x) => {
    if (!viewport) return
    const index = Math.round((viewport / 2 - x - CARD / 2) / STEP)
    const borne = clamp(index, 0, testimonials.length - 1)
    setActif((precedent) => (precedent === borne ? precedent : borne))
  })

  // Recale la carte active quand le cadre change de largeur.
  useEffect(() => {
    if (viewport) trackX.set(positionDe(actif))
    // `actif` est volontairement absent : on ne recale qu'au redimensionnement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, positionDe, trackX])

  // Lecture automatique, suspendue au survol, au glissement et au focus.
  useEffect(() => {
    if (reduced || enPause || !viewport) return
    const id = window.setInterval(() => {
      setActif((precedent) => {
        const suivant = (precedent + 1) % testimonials.length
        trackX.set(positionDe(suivant))
        return suivant
      })
    }, AUTOPLAY)
    return () => window.clearInterval(id)
  }, [reduced, enPause, viewport, positionDe, trackX])

  const teinte = testimonials[actif]?.color ?? '#9A7B4A'

  return (
    <section
      id="avis"
      className="relative overflow-hidden bg-surface py-24 md:py-36"
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
      onFocusCapture={() => setEnPause(true)}
      onBlurCapture={() => setEnPause(false)}
    >
      {/* Nappe qui prend la couleur du client mis en avant */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        animate={{ backgroundColor: teinte, opacity: 0.14 }}
        transition={{ duration: 1.2, ease: EASE_OUT }}
      />

      <div className="relative">
        <div className="mx-auto mb-14 max-w-6xl px-6 md:mb-20">
          <Reveal>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Ils nous ont fait confiance
            </span>
          </Reveal>
          <SplitText
            as="h2"
            by="word"
            text="Des marques qui nous ont confié leur site"
            delay={0.1}
            className="mt-5 block max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-5xl"
          />
        </div>

        {/* Piste glissante */}
        <div
          ref={cadreRef}
          className="cursor-grab overflow-hidden active:cursor-grabbing"
          style={{ perspective: 1400 }}
        >
          <motion.ul
            className="flex items-stretch"
            style={{ x: doux, gap: GAP, transformStyle: 'preserve-3d' }}
            drag={reduced ? false : 'x'}
            dragConstraints={{ left: minX, right: 0 }}
            dragElastic={0.08}
            onDragStart={() => setEnPause(true)}
            onDragEnd={() => setEnPause(false)}
            // La piste commence après une marge, pour que la première carte
            // arrive au centre plutôt que collée au bord gauche.
            initial={false}
          >
            {testimonials.map((item, index) => (
              <Card
                key={item.projectId}
                item={item}
                index={index}
                trackX={doux}
                viewport={viewport}
              />
            ))}
          </motion.ul>
        </div>

        {/* Repères et commandes */}
        <div className="mx-auto mt-10 flex max-w-6xl items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-2">
            {testimonials.map((item, index) => (
              <button
                key={item.projectId}
                type="button"
                onClick={() => allerA(index)}
                aria-label={`Voir ${item.company}`}
                aria-current={index === actif}
                className="group flex h-8 items-center px-1"
              >
                <span
                  className={`block h-px transition-all duration-500 ${
                    index === actif
                      ? 'w-10 bg-accent'
                      : 'w-5 bg-text-muted group-hover:w-8 group-hover:bg-text-secondary'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => allerA(actif - 1)}
              disabled={actif === 0}
              aria-label="Client précédent"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-border text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
            >
              <span aria-hidden>←</span>
            </button>
            <button
              type="button"
              onClick={() => allerA(actif + 1)}
              disabled={actif === testimonials.length - 1}
              aria-label="Client suivant"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-border text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
            >
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

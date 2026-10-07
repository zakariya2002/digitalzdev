import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

/**
 * Le manifeste, éclairé mot à mot au défilement.
 *
 * Les mots sont posés d'avance en sourdine et s'allument un à un pendant que
 * la phrase traverse l'écran : la lecture est guidée sans retenir personne.
 * Après la phrase, les deux engagements de l'agence, en plus petit.
 */
const PHRASE = [
  { texte: 'Pas seulement esthétique.', accent: false },
  { texte: 'Pensé pour être choisi.', accent: true },
]

const MOTS = PHRASE.flatMap((p) =>
  p.texte.split(' ').map((mot) => ({ mot, accent: p.accent }))
)

function Mot({
  mot,
  accent,
  p,
  i,
  n,
}: {
  mot: string
  accent: boolean
  p: MotionValue<number>
  i: number
  n: number
}) {
  const opacite = useTransform(p, [i / n, (i + 1) / n], [0.14, 1])
  return (
    <motion.span style={{ opacity: opacite }} className={accent ? 'text-accent' : 'text-text-primary'}>
      {mot}{' '}
    </motion.span>
  )
}

export default function ManifesteStudio() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })

  return (
    <section className="bg-surface px-5 py-24 md:px-10 md:py-40">
      <div ref={ref} className="mx-auto max-w-7xl">
        {/* Sur mobile, le texte d'accroche du haut de page vient ici : la
            carte vidéo lui laissait trop peu de place. */}
        <p className="mb-16 text-lg font-medium leading-relaxed text-text-secondary md:hidden">
          Cabinets d'avocats, agences d'architecture, photographes et
          vidéastes : nous concevons des sites sobres et rapides, qui
          inspirent confiance et font venir les bons clients.
        </p>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-text-muted">
          Notre approche
        </p>
        <h2 className="mt-8 text-[13vw] md:text-[9vw] lg:text-[min(9vw,168px)]">
          {MOTS.map((m, i) => (
            <Mot key={`${m.mot}-${i}`} mot={m.mot} accent={m.accent} p={scrollYProgress} i={i} n={MOTS.length} />
          ))}
        </h2>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

/**
 * Le manifeste, éclairé mot à mot au défilement.
 *
 * Les mots sont posés d'avance en sourdine et s'allument un à un pendant que
 * la phrase traverse presque tout l'écran : la lecture est guidée sans retenir personne.
 * Après la phrase, les deux engagements de l'agence, en plus petit.
 */
const PHRASE = [
  { texte: 'Pas seulement esthétique.', accent: false },
  { texte: 'Pensé pour le référencement.', accent: true },
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
    <motion.span style={{ opacity: opacite }} className={accent ? 'text-pop' : 'text-text-primary'}>
      {mot}{' '}
    </motion.span>
  )
}

export default function ManifesteStudio() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'end 0.2'] })

  return (
    <section className="bg-surface px-5 pb-2 pt-20 md:px-10 md:pb-4 md:pt-32">
      <div ref={ref} className="mx-auto max-w-7xl">
        <h2 className="mx-auto max-w-5xl text-center text-[8vw] font-extrabold uppercase leading-[1.04] md:text-[4.6vw] lg:text-[min(4.4vw,76px)]">
          {MOTS.map((m, i) => (
            <Mot key={`${m.mot}-${i}`} mot={m.mot} accent={m.accent} p={scrollYProgress} i={i} n={MOTS.length} />
          ))}
        </h2>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'

/**
 * La phrase manifeste, qui s'allume mot à mot au défilement.
 *
 * Chaque mot passe du voilé au plein pendant que la phrase traverse l'écran,
 * la première en blanc, la seconde en citron. La section n'est plus épinglée :
 * figée sur deux écrans, elle laissait un écran vide avant et après le texte.
 */
const PHRASES = [
  { mots: ['Pas', 'seulement', 'esthétique.'], accent: false },
  { mots: ['Pensé', 'pour', 'le', 'référencement.'], accent: true },
]

const MOTS = PHRASES.flatMap((p) => p.mots.map((mot) => ({ mot, accent: p.accent })))

function Mot({
  mot,
  accent,
  progression,
  debut,
  fin,
}: {
  mot: string
  accent: boolean
  progression: MotionValue<number>
  debut: number
  fin: number
}) {
  // Chaque mot part de rien : invisible, plus bas et flou, il n'apparaît
  // qu'à son tour, après le précédent.
  const opacite = useTransform(progression, [debut, fin], [0, 1])
  const decalage = useTransform(progression, [debut, fin], [48, 0])
  const flou = useTransform(progression, [debut, fin], [12, 0])
  const filtre = useMotionTemplate`blur(${flou}px)`
  return (
    <motion.span
      style={{ opacity: opacite, y: decalage, filter: filtre }}
      className={`inline-block ${accent ? 'text-accent' : 'text-text-primary'}`}
    >
      {mot}
    </motion.span>
  )
}

export default function StatementSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    // De l'entrée par le bas jusqu'au milieu de l'écran : la phrase est
    // entièrement allumée quand on la lit au centre.
    offset: ['start 0.85', 'end 0.55'],
  })

  const pas = 1 / MOTS.length

  return (
    <section ref={ref} aria-label="Notre approche" className="relative bg-surface py-12 md:py-20">
      <div className="flex items-center justify-center px-5">
        <h2 className="mx-auto max-w-6xl text-center text-[9.2vw] !leading-[1.04] sm:text-[8.6vw] lg:text-[min(7.4vw,136px)]">
          {PHRASES.map((phrase, iPhrase) => (
            <span key={iPhrase} className="block">
              {phrase.mots.map((mot, iMot) => {
                const index =
                  PHRASES.slice(0, iPhrase).reduce((n, p) => n + p.mots.length, 0) + iMot
                return (
                  <span key={mot}>
                    <Mot
                      mot={mot}
                      accent={phrase.accent}
                      progression={scrollYProgress}
                      debut={index * pas}
                      fin={(index + 1) * pas}
                    />
                    {iMot < phrase.mots.length - 1 ? ' ' : null}
                  </span>
                )
              })}
            </span>
          ))}
        </h2>
      </div>
    </section>
  )
}

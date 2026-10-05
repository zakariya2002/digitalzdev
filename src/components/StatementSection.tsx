import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

/**
 * La phrase manifeste, qui s'allume mot à mot au défilement.
 *
 * La section est épinglée le temps de la lecture : chaque mot passe du voilé
 * au plein à mesure qu'on descend, la première phrase en blanc, la seconde en
 * citron. Les mots restent lisibles dès le départ, à faible opacité : l'écran
 * n'est jamais vide, même sur mobile où l'on défile vite.
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
  const opacite = useTransform(progression, [debut, fin], [0.16, 1])
  const decalage = useTransform(progression, [debut, fin], [18, 0])
  return (
    <motion.span
      style={{ opacity: opacite, y: decalage }}
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
    offset: ['start start', 'end end'],
  })

  // La lecture occupe les trois quarts de la traversée ; le dernier quart
  // laisse la phrase entière à l'écran avant de passer à la suite.
  const pas = 0.75 / MOTS.length

  return (
    <section ref={ref} aria-label="Notre approche" className="relative h-[220vh] bg-surface">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-5">
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

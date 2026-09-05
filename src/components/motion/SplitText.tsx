import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { EASE_OUT, VIEWPORT } from './config'

interface Props {
  text: string
  className?: string
  /** Le mot est l'unité par défaut : plus lisible et bien moins de nœuds DOM */
  by?: 'word' | 'char'
  delay?: number
  stagger?: number
  /** Anime dès le montage plutôt qu'à l'entrée dans le viewport */
  immediate?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
})

const item: Variants = {
  hidden: { y: '110%', rotate: 4, opacity: 0 },
  visible: {
    y: '0%',
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: EASE_OUT },
  },
}

/**
 * Découpe un mot en fragments insécables, la coupure ne pouvant intervenir
 * qu'après un trait d'union ou un point. « lissage-sur-mesure.com » donne
 * ainsi « lissage- », « sur- », « mesure. » et « com ».
 */
function segmentsOf(word: string): string[] {
  return word.match(/[^-.]*[-.]+|[^-.]+/g) ?? [word]
}

/**
 * Révèle un titre unité par unité, chaque unité glissant depuis sous une
 * ligne de masque. C'est le geste signature des portfolios primés : il donne
 * du poids au titre sans recourir à une bibliothèque de découpage de texte.
 *
 * Le texte reste lisible par les lecteurs d'écran grâce à `aria-label` : les
 * fragments animés sont, eux, masqués de l'arbre d'accessibilité.
 */
export default function SplitText({
  text,
  className,
  by = 'word',
  delay = 0,
  stagger = by === 'char' ? 0.022 : 0.06,
  immediate = false,
  as: Tag = 'span',
}: Props) {
  const reduced = useReducedMotion()

  if (reduced) return <Tag className={className}>{text}</Tag>

  const words = text.split(' ')

  const animationProps = immediate
    ? { animate: 'visible' as const }
    : { whileInView: 'visible' as const, viewport: VIEWPORT }

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        className="inline"
        initial="hidden"
        variants={container(stagger, delay)}
        aria-hidden
        {...animationProps}
      >
        {words.map((word, wordIndex) => (
          <span
            key={`${word}-${wordIndex}`}
            // Le masque doit suivre la ligne de base, d'où le padding vertical :
            // sans lui, jambages et accents seraient rognés.
            className="inline-block overflow-hidden align-bottom py-[0.12em] -my-[0.12em]"
          >
            {by === 'char' ? (
              <span className="inline-block">
                {segmentsOf(word).map((segment, segmentIndex) => (
                  // Chaque fragment est insécable : le retour à la ligne ne
                  // peut tomber qu'après un trait d'union ou un point. Sans
                  // ça, un nom de domaine long se coupe en plein milieu d'un
                  // mot, les lettres étant des blocs indépendants.
                  <span
                    key={`${segment}-${segmentIndex}`}
                    className="inline-block whitespace-nowrap"
                  >
                    {[...segment].map((char, charIndex) => (
                      <motion.span
                        key={`${char}-${charIndex}`}
                        className="inline-block"
                        variants={item}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                ))}
                {wordIndex < words.length - 1 && (
                  <span className="inline-block whitespace-pre"> </span>
                )}
              </span>
            ) : (
              <motion.span className="inline-block" variants={item}>
                {word}
                {wordIndex < words.length - 1 && ' '}
              </motion.span>
            )}
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}

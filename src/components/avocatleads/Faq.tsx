import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Reveal, SplitText } from '../motion'
import { EASE_OUT, VIEWPORT } from '../motion/config'

import { FAQ } from './contenu'

/**
 * Foire aux questions.
 *
 * Elle sert deux objectifs : répondre aux questions qui reviennent avant un
 * devis, et alimenter le balisage FAQPage que Google peut afficher
 * directement dans ses résultats. Le schéma est injecté ici plutôt que dans
 * index.html pour rester au plus près des questions affichées, les deux ne
 * devant jamais diverger.
 */
export default function Faq() {
  const [ouverte, setOuverte] = useState<number | null>(0)


  return (
    <section id="faq" className="relative bg-surface-light py-10 md:py-14">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-14 text-center md:mb-20">
          <SplitText
            as="h2"
            by="word"
            text="Les questions que posent les avocats"
            delay={0.1}
            className="mx-auto block font-display text-3xl font-medium leading-[1.05] tracking-tight text-text-primary md:text-5xl"
          />
        </div>

        <dl>
          {FAQ.map((item, index) => {
            const estOuverte = ouverte === index
            return (
              <motion.div
                key={item.question}
                className="mb-3 rounded-2xl bg-surface-card px-5 last:mb-0 md:px-7"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.5, delay: index * 0.04, ease: EASE_OUT }}
              >
                <dt>
                  <button
                    type="button"
                    onClick={() => setOuverte(estOuverte ? null : index)}
                    aria-expanded={estOuverte}
                    aria-controls={`faq-reponse-${index}`}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-base font-medium text-text-primary md:text-lg">
                      {item.question}
                    </span>
                    <motion.span
                      aria-hidden
                      className="shrink-0 text-2xl leading-none text-accent"
                      animate={{ rotate: estOuverte ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                    >
                      +
                    </motion.span>
                  </button>
                </dt>

                <AnimatePresence initial={false}>
                  {estOuverte && (
                    <motion.dd
                      id={`faq-reponse-${index}`}
                      className="overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE_OUT }}
                    >
                      <p className="pb-6 leading-relaxed text-text-secondary sm:pr-10">
                        {item.reponse}
                      </p>
                    </motion.dd>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}

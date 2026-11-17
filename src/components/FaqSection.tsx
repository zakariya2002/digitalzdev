import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Reveal, SplitText } from './motion'
import { EASE_OUT, VIEWPORT } from './motion/config'

interface QuestionReponse {
  question: string
  reponse: string
}

export const FAQ: QuestionReponse[] = [
  {
    question: 'Combien coûte un projet ?',
    reponse:
      "Un site vitrine démarre autour de 1 500 € ; un e-commerce, une application ou un CRM sur mesure se chiffre selon les fonctionnalités et les intégrations. Nous chiffrons après un premier échange, sur la base d'un cahier des charges écrit : pas de fourchette au doigt mouillé, et pas de surprise en cours de route.",
  },
  {
    question: 'Que réalisez-vous exactement ?',
    reponse:
      "Des sites internet et e-commerce, des applications mobiles iOS et Android, des CRM et back-offices sur mesure, et les intégrations qui vont avec : paiement, téléphonie, emails, Google, Meta. Nous assurons aussi le référencement et les campagnes publicitaires.",
  },
  {
    question: 'Combien de temps prend un projet ?',
    reponse:
      "Comptez trois à six semaines pour un site, davantage pour un e-commerce, une application ou un CRM, livrés par étapes. Le calendrier dépend surtout de la disponibilité de vos contenus et de vos retours, qui sont le premier facteur de retard.",
  },
  {
    question: 'Le site sera-t-il visible sur Google ?',
    reponse:
      "Le référencement naturel est intégré à la conception, pas ajouté après coup : structure des URL, balises, données structurées, temps de chargement, maillage interne et contenus rédigés pour les recherches réelles de vos futurs clients. Nous pouvons aussi suivre les positions après la mise en ligne ou lancer des campagnes Google Ads.",
  },
  {
    question: 'Puis-je modifier mon site moi-même ensuite ?',
    reponse:
      "Oui. Vous ajoutez vous-même vos articles, produits et pages depuis un back-office simple, sans toucher au code. Nous vous formons à la prise en main à la livraison, et nous restons joignables ensuite.",
  },
  {
    question: 'Travaillez-vous partout en France ?',
    reponse:
      "Oui, dans toute la France et à l'international. Les échanges se font en visioconférence, avec des points d'avancement réguliers et un interlocuteur unique.",
  },
  {
    question: 'Que se passe-t-il après la mise en ligne ?',
    reponse:
      "Le site vous appartient, code et hébergement compris. Nous proposons ensuite un suivi à la carte : corrections, évolutions, ajout de pages, campagnes Meta Ads et Google Ads, ou simplement une intervention ponctuelle quand vous en avez besoin. Aucun abonnement n'est imposé.",
  },
]

/**
 * Foire aux questions.
 *
 * Elle sert deux objectifs : répondre aux questions qui reviennent avant un
 * devis, et alimenter le balisage FAQPage que Google peut afficher
 * directement dans ses résultats. Le schéma est injecté ici plutôt que dans
 * index.html pour rester au plus près des questions affichées, les deux ne
 * devant jamais diverger.
 */
export default function FaqSection() {
  const [ouverte, setOuverte] = useState<number | null>(0)

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.reponse },
      })),
    })
    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [])

  return (
    <section id="faq" className="relative bg-surface-light py-10 md:py-14">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-14 text-center md:mb-20">
          <SplitText
            as="h2"
            by="word"
            text="Ce qu’on nous demande avant de se lancer"
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

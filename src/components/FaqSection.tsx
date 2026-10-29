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
    question: 'Combien coûte le site d’un cabinet d’avocats ?',
    reponse:
      "Un site d'avocat démarre autour de 1 500 € ; un site avec une page par domaine d'intervention, prise de rendez-vous en ligne et espace client se situe plus haut, selon le nombre de pages et le travail de rédaction. Nous chiffrons après un premier échange, sur la base d'un cahier des charges écrit : pas de fourchette au doigt mouillé, et pas de surprise en cours de route.",
  },
  {
    question: 'Le site respecte-t-il les règles déontologiques ?',
    reponse:
      "Oui. Les textes sont rédigés dans le cadre des règles de communication de la profession (article 10 du Règlement intérieur national) : informations obligatoires, mentions de spécialisation réservées aux certificats obtenus, pas de promesse de résultat ni de comparaison avec d'autres confrères, informations claires sur les honoraires. Vous validez chaque page avant la mise en ligne.",
  },
  {
    question: 'Combien de temps prend un projet de site web ?',
    reponse:
      "Comptez trois à six semaines pour un site de cabinet, six à dix semaines avec la prise de rendez-vous en ligne et un espace client. Le calendrier dépend surtout de la disponibilité de vos contenus, présentation des associés, domaines d'intervention et relecture, qui sont le premier facteur de retard.",
  },
  {
    question: 'Le site sera-t-il visible sur Google ?',
    reponse:
      "Le référencement naturel est intégré à la conception, pas ajouté après coup : structure des URL, balises, données structurées, temps de chargement, maillage interne et contenus rédigés pour les recherches réelles de vos futurs clients : « avocat divorce », « avocat droit du travail », « avocat pénaliste » suivis de votre ville. Nous pouvons aussi accompagner le site après sa mise en ligne, en suivi de positions ou en campagnes Google Ads.",
  },
  {
    question: 'Puis-je modifier mon site moi-même ensuite ?',
    reponse:
      "Oui. Vous ajoutez vous-même vos articles, actualités juridiques et nouveaux collaborateurs depuis un back-office simple, sans toucher au code. Nous vous formons à la prise en main à la livraison, et nous restons joignables ensuite.",
  },
  {
    question: 'Travaillez-vous partout en France ?',
    reponse:
      "Oui, dans toute la France et à l'international. Nous avons notamment travaillé pour Fidal, cabinet d'avocats d'affaires, et nous accompagnons aussi bien l'avocat qui s'installe que les cabinets de plusieurs associés. Les échanges se font en visioconférence, avec des points d'avancement réguliers et un interlocuteur unique.",
  },
  {
    question: 'Que se passe-t-il après la mise en ligne ?',
    reponse:
      "Le site vous appartient, code et hébergement compris. Nous proposons ensuite un suivi à la carte : corrections, évolutions, ajout de pages, campagnes Meta Ads et Google Ads, ou simplement une intervention ponctuelle quand vous en avez besoin. Aucun abonnement n'est imposé.",
  },
  {
    question: 'Reprenez-vous un site existant pour une refonte ?',
    reponse:
      "Régulièrement. Nous partons de l'existant, de vos statistiques et de ce qui fonctionne déjà, puis nous établissons un plan de redirections complet pour conserver le référencement acquis. Une refonte mal préparée fait chuter les positions : c'est précisément ce que ce plan évite.",
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

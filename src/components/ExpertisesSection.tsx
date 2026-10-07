import { motion } from 'framer-motion'
import { Reveal } from './motion'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Les trois métiers visés, et ce que leur site doit faire pour eux.
 *
 * Chaque métier a sa propre exigence : un avocat vend de la confiance, un
 * architecte vend ses réalisations, un photographe ou un vidéaste vend son
 * regard. La section le dit dans leurs mots plutôt que dans ceux d'une agence.
 */
export const METIERS = [
  {
    cible: 'Avocats et cabinets',
    titre: 'Un site qui rassure avant le premier appel.',
    texte:
      "Vos futurs clients comparent plusieurs cabinets avant de décrocher. Votre site doit dire clairement ce que vous traitez, comment vous travaillez et comment vous joindre, dans le respect des règles de la profession.",
    points: [
      'Une page par domaine d’intervention',
      'Prise de rendez-vous et premier contact en ligne',
      'Mentions et communication conformes à la déontologie',
      'Référencement local : « avocat », spécialité et ville',
    ],
  },
  {
    cible: 'Architectes et agences',
    titre: 'Vos projets, présentés comme ils le méritent.',
    texte:
      "Un projet d'architecture se juge sur l'image. Nous mettons vos réalisations en grand, sans compression qui les abîme, avec les informations qu'un maître d'ouvrage cherche.",
    points: [
      'Portfolio plein écran en haute définition',
      'Fiches projet : programme, lieu, surface, année',
      'Chargement rapide malgré des images lourdes',
      'Pages par type de mission pour être trouvé',
    ],
  },
  {
    cible: 'Photographes, vidéastes, studios',
    titre: 'Un portfolio qui se regarde comme un film.',
    texte:
      "Votre site est votre première bande démo. Galeries et vidéos s'affichent en pleine qualité, et le parcours mène naturellement jusqu'à la demande de devis.",
    points: [
      'Galeries et vidéos en pleine qualité',
      'Lecteur vidéo sur mesure, sans publicité',
      'Espaces privés pour livrer vos clients',
      'Demande de devis guidée selon la prestation',
    ],
  },
]

export default function ExpertisesSection() {
  return (
    <section id="expertises" className="relative bg-surface-light py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <span className="font-display text-xs uppercase tracking-[0.3em] text-text-muted">
            Expertises
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-5 max-w-3xl text-5xl text-text-primary md:text-7xl">
            Trois métiers, <em className="text-accent">trois exigences</em>.
          </h2>
        </Reveal>

        <div className="mt-16 space-y-16 md:mt-24 md:space-y-24">
          {METIERS.map((metier) => (
            <motion.article
              key={metier.cible}
              className="grid gap-6 md:grid-cols-12 md:gap-10"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <div className="md:col-span-5">
                <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">
                  {metier.cible}
                </p>
                <h3 className="titre-serif mt-4 text-3xl leading-tight text-text-primary md:text-[2.6rem]">
                  {metier.titre}
                </h3>
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <p className="text-base leading-relaxed text-text-secondary md:text-lg">
                  {metier.texte}
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {metier.points.map((point) => (
                    <li
                      key={point}
                      className="rounded-xl bg-surface px-4 py-3 text-sm text-text-primary"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

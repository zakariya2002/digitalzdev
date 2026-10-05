import { useState } from 'react'
import { motion } from 'framer-motion'
import { Magnetic, Reveal, SplitText } from './motion'
import { EASE_OUT, VIEWPORT } from './motion/config'
import CalendlyModal from './CalendlyModal'

/**
 * Ce qui amène les clients sur le site, une fois en ligne.
 *
 * Le site n'est que la vitrine : le référencement, les campagnes et la fiche
 * Google font venir les gens devant. La section se clôt sur la promesse de
 * l'agence et un rendez-vous Calendly.
 */
const LEVIERS = [
  {
    titre: 'Référencement SEO',
    accroche: 'Être trouvé sans payer chaque clic.',
    points: [
      'Articles de blog écrits sur les recherches de vos clients',
      'Structure technique, vitesse et balisage soignés',
      'Mots-clés locaux et pages par ville ou par service',
      'Suivi mensuel des positions et du trafic',
    ],
  },
  {
    titre: 'Google Ads',
    accroche: 'En tête des résultats dès demain.',
    points: [
      'Campagnes sur les requêtes qui précèdent un achat',
      'Annonces, extensions d’appel et de lieu',
      'Suivi des appels et des formulaires reçus',
      'Budget piloté sur le coût par contact',
    ],
  },
  {
    titre: 'Meta Ads',
    accroche: 'Devant vos clients sur Instagram et Facebook.',
    points: [
      'Ciblage par zone, centres d’intérêt et audiences similaires',
      'Créations visuelles et vidéos pensées pour le fil',
      'Reciblage des visiteurs de votre site',
      'Formulaires de contact intégrés aux publicités',
    ],
  },
  {
    titre: 'Fiche Google',
    accroche: 'Le premier résultat sur Google Maps.',
    points: [
      'Fiche d’établissement complétée et optimisée',
      'Photos, horaires, services et publications régulières',
      'Collecte et réponse aux avis clients',
      'Visibilité dans le pack local et sur Maps',
    ],
  },
]

export default function AcquisitionSection() {
  const [rdvOuvert, setRdvOuvert] = useState(false)

  return (
    <section id="acquisition" className="relative overflow-hidden bg-surface-light py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Faire venir vos clients
          </span>
        </Reveal>
        <SplitText
          as="h2"
          by="word"
          text="Un site ne suffit pas. Il faut du monde devant."
          delay={0.1}
          className="mt-5 block max-w-4xl font-display text-4xl md:text-7xl"
        />

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2">
          {LEVIERS.map((levier, index) => (
            <motion.article
              key={levier.titre}
              className="group rounded-3xl bg-surface p-7 transition-colors duration-500 [@media(hover:hover)]:hover:bg-accent md:p-9"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, delay: (index % 2) * 0.1, ease: EASE_OUT }}
            >
              <h3 className="font-display text-2xl font-black uppercase tracking-tight text-accent transition-colors duration-500 [@media(hover:hover)]:group-hover:text-surface md:text-3xl">
                {levier.titre}
              </h3>
              <p className="mt-2 text-lg font-semibold text-text-primary transition-colors duration-500 [@media(hover:hover)]:group-hover:text-surface">
                {levier.accroche}
              </p>
              <ul className="mt-6 space-y-2.5">
                {levier.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-text-secondary transition-colors duration-500 [@media(hover:hover)]:group-hover:text-surface"
                  >
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent transition-colors duration-500 [@media(hover:hover)]:group-hover:bg-surface" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        {/* La promesse, puis le rendez-vous */}
        <div className="mt-24 text-center md:mt-36">
          <h2 className="mx-auto max-w-5xl font-display text-[2.6rem] sm:text-6xl md:text-8xl">
            <SplitText
              as="span"
              by="word"
              text="Nous vendons plus qu'un site."
              className="block text-text-primary"
            />
            <SplitText
              as="span"
              by="word"
              text="Nous vendons des appels."
              delay={0.25}
              className="mt-2 block text-accent"
            />
          </h2>
          <Reveal delay={0.3}>
            <p className="mx-auto mt-8 max-w-xl text-lg text-text-secondary md:text-xl">
              Commandez le site qui vous apportera vos prochains prospects.
            </p>
          </Reveal>
          <Reveal delay={0.4} className="mt-10">
            <Magnetic className="inline-block">
              <button
                type="button"
                onClick={() => setRdvOuvert(true)}
                className="group inline-flex min-h-[60px] items-center gap-3 rounded-full bg-accent px-9 font-display text-base font-extrabold uppercase tracking-tight text-surface transition-colors hover:bg-accent-hover"
              >
                Réserver un call
                <svg className="h-5 w-5 transition-transform duration-300 [@media(hover:hover)]:group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            </Magnetic>
          </Reveal>
        </div>
      </div>

      <CalendlyModal open={rdvOuvert} onClose={() => setRdvOuvert(false)} />
    </section>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Magnetic, Reveal } from './motion'
import CalendlyModal from './CalendlyModal'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Ce qui amène les clients sur le site, une fois en ligne.
 *
 * Le site n'est que la vitrine : le référencement, les campagnes et la fiche
 * Google font venir les gens devant. La section se clôt sur la promesse de
 * l'agence, sur fond sombre et plein écran, avec un rendez-vous Calendly.
 */
export const LEVIERS = [
  {
    titre: 'Référencement naturel',
    accroche: 'Être trouvé sur ce que cherchent vos clients.',
    points: [
      'Articles de fond sur les questions de vos clients',
      'Pages par spécialité, type de projet ou prestation',
      'Structure technique, vitesse et balisage soignés',
      'Suivi mensuel des positions et du trafic',
    ],
  },
  {
    titre: 'Fiche Google',
    accroche: 'Apparaître dans les premiers résultats de Maps.',
    points: [
      'Fiche d’établissement complétée et optimisée',
      'Photos, horaires, domaines et publications régulières',
      'Collecte et réponse aux avis clients',
      'Visibilité locale, ville par ville',
    ],
  },
  {
    titre: 'Google Ads',
    accroche: 'En tête des recherches dès la semaine suivante.',
    points: [
      'Campagnes sur les recherches qui précèdent un appel',
      'Annonces, extensions d’appel et de lieu',
      'Suivi des appels et des formulaires reçus',
      'Budget piloté sur le coût par demande',
    ],
  },
  {
    titre: 'Meta Ads',
    accroche: 'Montrer votre travail là où il se regarde.',
    points: [
      'Diffusion de vos réalisations sur Instagram et Facebook',
      'Ciblage par zone et par profil de client',
      'Reciblage des visiteurs de votre site',
      'Formulaires de contact intégrés aux publicités',
    ],
  },
]

export default function AcquisitionSection() {
  const [rdvOuvert, setRdvOuvert] = useState(false)

  return (
    <>
      <section id="acquisition" className="relative bg-surface py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal>
            <span className="font-display text-xs uppercase tracking-[0.3em] text-text-muted">
              Faire venir vos clients
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 max-w-4xl text-5xl text-text-primary md:text-7xl">
              Un beau site ne suffit pas. <em className="text-accent">Il doit être trouvé.</em>
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-4 md:mt-20 md:grid-cols-2">
            {LEVIERS.map((levier, index) => (
              <motion.article
                key={levier.titre}
                className="group rounded-2xl bg-surface-light p-7 transition-colors duration-500 [@media(hover:hover)]:hover:bg-accent md:p-10"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, delay: (index % 2) * 0.1, ease: EASE }}
              >
                <h3 className="text-xl text-text-primary transition-colors duration-500 [@media(hover:hover)]:group-hover:text-surface md:text-2xl">
                  {levier.titre}
                </h3>
                <p className="titre-serif mt-2 text-2xl leading-snug text-text-secondary transition-colors duration-500 [@media(hover:hover)]:group-hover:text-surface md:text-3xl">
                  {levier.accroche}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {levier.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-[15px] text-text-secondary transition-colors duration-500 [@media(hover:hover)]:group-hover:text-surface"
                    >
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent transition-colors duration-500 [@media(hover:hover)]:group-hover:bg-surface"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* La promesse, plein écran sur fond sombre, puis le rendez-vous */}
      <section className="relative bg-[#141413] px-5 py-24 text-center md:px-10 md:py-40">
        <Reveal>
          <span className="font-display text-xs uppercase tracking-[0.3em] text-[#8A857E]">
            Notre engagement
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mx-auto mt-6 max-w-5xl text-5xl text-[#F4F1EC] sm:text-6xl md:text-8xl">
            Nous vendons plus qu'un site.
            <br />
            <em className="text-[#CFC8BC]">Nous vendons des appels.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl text-lg text-[#B9B3AA] md:text-xl">
            Commandez le site qui vous apportera vos prochains prospects.
          </p>
        </Reveal>
        <Reveal delay={0.3} className="mt-10">
          <Magnetic className="inline-block">
            <button
              type="button"
              onClick={() => setRdvOuvert(true)}
              className="group inline-flex min-h-[58px] items-center gap-3 rounded-full bg-[#F4F1EC] px-9 font-display text-base font-semibold text-[#141413] transition-colors hover:bg-white"
            >
              Réserver un call
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </Magnetic>
        </Reveal>
      </section>

      <CalendlyModal open={rdvOuvert} onClose={() => setRdvOuvert(false)} />
    </>
  )
}

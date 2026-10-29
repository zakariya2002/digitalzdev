import { motion } from 'framer-motion'
import { MEMBERS } from '../TeamSection'

/** Seul le fondateur est nommé ; le reste de l'équipe apparaît sans nom. */
const FONDATEUR = MEMBERS[0]

const DISCIPLINES_EQUIPE = [
  'Direction artistique',
  'Rédaction juridique grand public',
  'Communication des avocats',
  'Google Ads',
  'Meta Ads',
  'Mesure des demandes',
  'Gestion de projet',
]

/** Photos Pexels, libres de droits. */
const PHOTOS = [
  { src: '/images/equipe/atelier.webp', alt: "L'équipe au travail autour d'un bureau", classe: 'aspect-[4/3] md:col-span-7 md:aspect-auto md:h-[28rem]' },
  { src: '/images/equipe/creation.webp', alt: 'Séance de création sur un projet de site', classe: 'hidden md:block md:col-span-5 md:h-[28rem]' },
]

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * L'agence : les deux personnes, ce qu'elles prennent en charge, et les
 * chiffres tirés du portfolio.
 */
export default function Equipe() {
  return (
    <section id="agence" className="bg-surface-light px-5 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-[9vw] text-text-primary md:text-5xl lg:text-6xl">
              Une équipe, <span className="font-bold text-pop">un seul client : l'avocat.</span>
            </h2>
          </div>
          <p className="self-end text-lg font-medium leading-relaxed text-text-secondary lg:col-span-5">
            Aucun intermédiaire : vous échangez directement avec l'équipe qui
            conçoit, rédige et développe votre site. Après la mise en ligne,
            nous pilotons votre visibilité, du référencement local aux
            campagnes Google Ads.
          </p>
        </div>

        {/* Photos d'équipe, pour mettre des visages sur le travail */}
        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-12">
          {PHOTOS.map((photo, i) => (
            <motion.figure
              key={photo.src}
              className={`overflow-hidden rounded-[1.75rem] bg-surface-card ${photo.classe}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03]"
              />
            </motion.figure>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Le fondateur */}
          <motion.article
            className="flex flex-col rounded-[1.75rem] bg-surface-card p-8 md:p-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pop text-xl font-normal text-white">
                {FONDATEUR.initials}
              </span>
              <div>
                <h3 className="text-2xl font-normal tracking-tight text-text-primary md:text-3xl">{FONDATEUR.name}</h3>
                <p className="text-sm font-medium text-accent">Fondateur · {FONDATEUR.role}</p>
              </div>
            </div>
            <p className="mt-6 flex-1 text-[15px] font-medium leading-relaxed text-text-secondary">{FONDATEUR.pitch}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {FONDATEUR.disciplines.map((d) => (
                <li key={d} className="rounded-full bg-surface-light px-3 py-1.5 text-xs font-medium text-text-secondary">
                  {d}
                </li>
              ))}
            </ul>
            <a
              href={FONDATEUR.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-[44px] w-fit items-center text-sm font-medium text-text-primary transition-colors hover:text-accent"
            >
              Profil LinkedIn
            </a>
          </motion.article>

          {/* L'équipe, sans nom */}
          <motion.article
            className="flex flex-col rounded-[1.75rem] bg-pop p-8 text-white md:p-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          >
            <h3 className="text-2xl font-normal tracking-tight md:text-3xl">L'équipe</h3>
            <p className="text-sm font-medium text-white/75">Direction de projet, design et marketing</p>
            <p className="mt-6 flex-1 text-[15px] font-medium leading-relaxed text-white/85">
              Autour du développement, une équipe cadre votre besoin, rédige vos
              pages dans le respect des règles de la profession, pilote le projet
              jusqu'à la livraison, puis fait vivre le site : référencement,
              campagnes et mesure des demandes de rendez-vous.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {DISCIPLINES_EQUIPE.map((d) => (
                <li key={d} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white">
                  {d}
                </li>
              ))}
            </ul>
          </motion.article>
        </div>

      </div>
    </section>
  )
}

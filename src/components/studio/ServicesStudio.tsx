import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { SERVICES, WHATSAPP_PROJET } from '../ServicesSection'

type Service = (typeof SERVICES)[number]

/**
 * Une carte de la pile. Elle s'accroche en haut de l'écran, un peu plus bas
 * que la précédente, et recule à mesure que les suivantes la recouvrent.
 */
function Carte({
  service,
  i,
  n,
  progression,
}: {
  service: Service
  i: number
  n: number
  progression: MotionValue<number>
}) {
  const echelle = useTransform(progression, [i / n, 1], [1, 1 - (n - 1 - i) * 0.035])
  const lumiere = useTransform(progression, [i / n, 1], [1, 1 - (n - 1 - i) * 0.08])
  const filtre = useTransform(lumiere, (l) => `brightness(${l})`)
  const accent = i === n - 1

  return (
    <div className="sticky" style={{ top: `calc(12vh + ${i * 22}px)` }}>
      <motion.article
        style={{ scale: echelle, filter: filtre }}
        className={`origin-top rounded-[1.75rem] p-7 md:min-h-[62vh] md:p-12 ${
          accent ? 'bg-pop text-white' : 'bg-surface-card text-text-primary'
        }`}
      >
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <h3 className="text-3xl font-normal leading-[1] tracking-tight md:text-5xl">
              {service.title}
            </h3>
            <p className={`mt-4 text-lg font-medium md:text-xl ${accent ? 'text-white' : 'text-accent'}`}>
              {service.lead}
            </p>
          </div>
          <div className="md:col-span-5">
            <p className={`text-[15px] font-medium leading-relaxed md:text-base ${accent ? 'text-white/80' : 'text-text-secondary'}`}>
              {service.body}
            </p>
            <ul className="mt-6 space-y-2">
              {service.points.map((point) => (
                <li
                  key={point}
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${accent ? 'bg-white/15' : 'bg-surface-light'}`}
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.article>
    </div>
  )
}

/**
 * Les services, en cartes empilées.
 *
 * Le texte de chaque service est celui de la section d'origine : seul le
 * dispositif change.
 */
export default function ServicesStudio() {
  const pileRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: pileRef, offset: ['start start', 'end end'] })

  return (
    <section id="services" className="bg-surface px-5 pb-8 pt-8 md:px-10 md:pb-10 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-5xl text-[9vw] text-text-primary md:text-5xl lg:text-6xl">
          Une agence web qui conçoit, développe <span className="text-accent">et fait connaître votre site.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg font-medium text-text-secondary">
          Création de site internet, boutique en ligne, refonte, outil métier et
          campagnes publicitaires. Un projet de site web se juge sur ce qu'il
          rapporte une fois en ligne, pas sur sa maquette.
        </p>

        <div ref={pileRef} className="mt-16 space-y-6 md:mt-24 md:space-y-10">
          {SERVICES.map((s, i) => (
            <Carte key={s.title} service={s} i={i} n={SERVICES.length} progression={scrollYProgress} />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-6 rounded-[1.75rem] bg-surface-light p-8 md:mt-16 md:flex-row md:items-center md:justify-between md:p-12">
          <p className="max-w-2xl text-xl font-medium leading-snug text-text-primary md:text-2xl">
            Vous avez un projet de site internet, une boutique à ouvrir ou un site
            à refondre ? Décrivez-le-nous directement sur WhatsApp.
          </p>
          <a
            href={WHATSAPP_PROJET}
            target="_blank"
            rel="noopener noreferrer"
            data-curseur="WhatsApp"
            className="inline-flex min-h-[56px] shrink-0 items-center rounded-full bg-accent px-8 text-base font-medium text-surface transition-colors hover:bg-accent-hover"
          >
            Décrire mon projet
          </a>
        </div>
      </div>
    </section>
  )
}

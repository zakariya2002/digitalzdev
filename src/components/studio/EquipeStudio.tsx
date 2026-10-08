import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { FACTS, MEMBERS, SERVICES as ROLES } from '../TeamSection'

/** Seul le fondateur est nommé ; le reste de l'équipe apparaît sans nom. */
const FONDATEUR = MEMBERS[0]

const DISCIPLINES_EQUIPE = [
  'Direction artistique',
  'UX / UI',
  'Stratégie de marque',
  'Meta Ads',
  'Google Ads',
  'Tracking & conversions',
  'Gestion de projet',
]

/** Photos Pexels, libres de droits. */
const PHOTOS = [
  { src: '/images/equipe/atelier.webp', alt: "L'équipe au travail autour d'un bureau", classe: 'aspect-[4/3] md:col-span-7 md:aspect-auto md:h-[28rem]' },
  { src: '/images/equipe/creation.webp', alt: 'Séance de création sur un projet de site', classe: 'hidden md:block md:col-span-5 md:h-[28rem]' },
]

const EASE = [0.22, 1, 0.36, 1] as const

/** Un chiffre qui défile jusqu'à sa valeur quand il entre à l'écran. */
function Chiffre({ valeur }: { valeur: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const vu = useInView(ref, { once: true, margin: '-60px' })
  const cible = parseInt(valeur, 10)
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!vu || Number.isNaN(cible)) return
    const debut = performance.now()
    let f = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - debut) / 1200)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * cible))
      if (p < 1) f = requestAnimationFrame(tick)
    }
    f = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(f)
  }, [vu, cible])

  return <span ref={ref}>{Number.isNaN(cible) ? valeur : n}</span>
}

/**
 * L'agence : les deux personnes, ce qu'elles prennent en charge, et les
 * chiffres tirés du portfolio.
 */
export default function EquipeStudio() {
  return (
    <section id="agence" className="bg-surface-light px-5 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-[9vw] text-text-primary md:text-5xl lg:text-6xl">
              Une équipe, <span className="font-bold text-citron">deux métiers complets.</span>
            </h2>
          </div>
          <p className="self-end text-lg font-medium leading-relaxed text-text-secondary lg:col-span-5">
            Pas de chaîne d'intermédiaires : vous parlez directement à l'équipe
            qui conçoit et qui développe votre site. Et le travail ne s'arrête
            pas à la mise en ligne : nous mettons aussi en place et pilotons vos
            campagnes Meta Ads et Google Ads.
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
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-citron text-xl font-normal text-[#1d1d1f]">
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
              Profil LinkedIn ↗
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
              Autour du développement, une équipe cadre votre besoin, dessine le
              parcours, pilote le projet jusqu'à la livraison, puis fait vivre le
              site une fois en ligne : campagnes Meta Ads et Google Ads, suivi des
              conversions, améliorations continues.
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

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.title}
              className="rounded-[1.75rem] bg-surface-card p-7"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
            >
              <h3 className="text-lg font-normal text-text-primary">{r.title}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-text-secondary">{r.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 md:mt-24">
          {FACTS.map((f) => (
            <div key={f.label} className="text-center">
              <p className="text-[13vw] font-extrabold leading-none tracking-[-0.04em] text-pop md:text-[6vw] lg:text-[min(6vw,104px)]">
                <Chiffre valeur={f.value} />
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-text-secondary md:text-sm">
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

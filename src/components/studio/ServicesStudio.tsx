import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { SERVICES, WHATSAPP_PROJET } from '../ServicesSection'

type Service = (typeof SERVICES)[number]

/**
 * Point de départ de chaque carte, avant qu'elle ne se range : décalée vers
 * le centre du paquet et inclinée, comme un jeu de cartes jeté sur la table.
 * Les valeurs sont en pourcentage de la carte (x, y) et en degrés (r).
 */
const DEPART = [
  { x: 55, y: 30, r: -9 },
  { x: 0, y: 10, r: 3 },
  { x: -55, y: 35, r: 8 },
  { x: 45, y: -40, r: 6 },
  { x: 0, y: -60, r: -5 },
  { x: -45, y: -35, r: -8 },
]

/**
 * Fonds pastel, autant de chaque : gris, bleu, jaune. L'ordre évite que deux
 * cartes de même couleur se touchent dans la grille de 3 × 2.
 */
const FONDS = ['bg-[#efeff2]', 'bg-[#e4ebfd]', 'bg-[#f6fbd6]', 'bg-[#e4ebfd]', 'bg-[#f6fbd6]', 'bg-[#efeff2]']

/**
 * Une carte de service : elle part de sa position « en vrac » et rejoint sa
 * place dans la grille à mesure que la section entre à l'écran.
 */
function Carte({
  service,
  i,
  progression,
  mobile,
}: {
  service: Service
  i: number
  progression: MotionValue<number>
  mobile: boolean
}) {
  // Sur mobile, chaque carte a sa propre progression, calculée sur sa propre
  // entrée à l'écran, et arrive en alternance de la droite et de la gauche.
  const carteRef = useRef<HTMLElement>(null)
  const { scrollYProgress: propre } = useScroll({ target: carteRef, offset: ['start 1', 'start 0.5'] })
  const p = mobile ? propre : progression
  const d = mobile
    ? { x: i % 2 === 0 ? 28 : -28, y: 12, r: i % 2 === 0 ? 7 : -7 }
    : DEPART[i % DEPART.length]
  const x = useTransform(p, [0, 1], [`${d.x}%`, '0%'])
  const y = useTransform(p, [0, 1], [`${d.y}%`, '0%'])
  const rotate = useTransform(p, [0, 1], [d.r, 0])

  return (
    <motion.article
      ref={carteRef}
      style={{ x, y, rotate, zIndex: 10 - i }}
      className={`relative flex flex-col rounded-[1.75rem] p-7 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] ring-4 ring-surface will-change-transform md:p-9 ${FONDS[i % FONDS.length]}`}
    >
      <span aria-hidden className="text-5xl leading-none text-text-muted/50">❞</span>
      <h3 className="mt-4 text-2xl font-normal leading-tight tracking-tight text-text-primary md:text-3xl">
        {service.title}
      </h3>
      <p className="mt-2 text-[15px] font-medium text-pop">{service.lead}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">{service.body}</p>
      <ul className="mt-6 space-y-1.5">
        {service.points.map((point) => (
          <li key={point} className="flex gap-2.5 text-sm text-text-primary">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pop" />
            {point}
          </li>
        ))}
      </ul>
    </motion.article>
  )
}

/**
 * Les services, en cartes jetées puis rangées au défilement (inspiré de
 * cuberto.com).
 *
 * Le texte de chaque service est celui de la section d'origine : seul le
 * dispositif change.
 */
export default function ServicesStudio() {
  const grilleRef = useRef<HTMLDivElement>(null)
  // Les cartes se rangent pendant que la grille monte du bas de l'écran
  // jusqu'à son quart supérieur.
  const { scrollYProgress } = useScroll({ target: grilleRef, offset: ['start 0.95', 'start 0.2'] })
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const requete = window.matchMedia('(max-width: 767px)')
    const suivre = () => setMobile(requete.matches)
    suivre()
    requete.addEventListener('change', suivre)
    return () => requete.removeEventListener('change', suivre)
  }, [])

  return (
    <section id="services" className="overflow-x-clip bg-surface px-5 pb-8 pt-8 md:px-10 md:pb-10 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-5xl text-[9vw] text-text-primary md:text-5xl lg:text-6xl">
          Une agence web qui conçoit, développe <span className="font-bold text-pop">et fait connaître votre site.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg font-medium text-text-secondary">
          Création de site internet, boutique en ligne, refonte, outil métier et
          campagnes publicitaires. Un projet de site web se juge sur ce qu'il
          rapporte une fois en ligne, pas sur sa maquette.
        </p>

        <div ref={grilleRef} className="mt-14 grid gap-5 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Carte key={s.title} service={s} i={i} progression={scrollYProgress} mobile={mobile} />
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

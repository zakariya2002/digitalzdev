import { motion } from 'framer-motion'
import { Counter, Magnetic, Marquee, Reveal, SplitText } from './motion'
import { EASE_OUT, VIEWPORT } from './motion/config'

interface Member {
  initials: string
  name: string
  role: string
  pitch: string
  disciplines: string[]
  linkedin: string
}

const MEMBERS: Member[] = [
  {
    initials: 'ZN',
    name: 'Zakariya Nebbache',
    role: 'Développement',
    pitch:
      "Développeur fullstack. Je prends le projet du premier commit à la mise en ligne : interface, back-office, intégrations et applications iOS.",
    disciplines: [
      'React & Next.js',
      'TypeScript / Node',
      'iOS',
      'Shopify & Liquid',
      'PostgreSQL & Supabase',
      'WebGL',
    ],
    linkedin: 'https://www.linkedin.com/in/zakariya-nebbache-7b0644214/',
  },
  {
    initials: 'AN',
    name: 'Anissa Nebbache',
    role: 'Direction de projet, marketing & design',
    pitch:
      "Cheffe de projet et directrice marketing et design. Je cadre le besoin, dessine le parcours et pilote le projet jusqu'à la livraison, puis ce qu'il produit une fois en ligne : campagnes Meta Ads et Google Ads, suivi des conversions, itérations.",
    disciplines: [
      'Direction artistique',
      'UX / UI',
      'Stratégie de marque',
      'Meta Ads',
      'Google Ads',
      'Tracking & conversions',
      'Gestion de projet',
      'Relation client',
    ],
    linkedin: 'https://www.linkedin.com/in/anissa-nebbache-696bb9150/',
  },
]

/** Chiffres tirés du portfolio publié sur cette page, rien de déclaratif. */
const FACTS = [
  { value: '8', label: 'projets en ligne' },
  { value: '6', label: 'secteurs couverts' },
  { value: '2', label: 'métiers réunis' },
]

const SECTORS = [
  'MODE',
  'BEAUTÉ',
  'MUSIQUE',
  'SANTÉ',
  'FRANCHISE B2B',
  'SOURCING INDUSTRIEL',
]

/** Ce que l'agence prend en charge, au-delà de la seule mise en ligne. */
const SERVICES = [
  { title: 'Conception et développement', body: "Sites vitrines, boutiques Shopify, plateformes métier et applications iOS. Du cadrage à la mise en ligne." },
  { title: 'Meta Ads et Google Ads', body: "Mise en place et pilotage des campagnes : structure des comptes, audiences, création des annonces, budget et arbitrages." },
  { title: 'Mesure et conversions', body: "Tracking, événements de conversion et lecture des résultats, pour savoir ce qui rapporte et ce qui coûte." },
]

function MemberCard({ member, index }: { member: Member; index: number }) {
  return (
    <motion.article
      className="group relative"
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.8, delay: index * 0.12, ease: EASE_OUT }}
    >
      <div className="flex h-full flex-col rounded-2xl border border-surface-border bg-surface-card p-7 transition-colors duration-500 hover:border-accent/40 md:p-9">
        <div className="flex items-start gap-4">
          {/* Monogramme purement décoratif : il ne réagit pas au survol, pour
              ne pas laisser croire qu'il est cliquable. */}
          <div
            aria-hidden
            className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 md:h-20 md:w-20"
          >
            <span className="font-display text-lg font-bold tracking-widest text-accent md:text-xl">
              {member.initials}
            </span>
          </div>
        </div>

        <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          {member.name}
        </h3>
        <p className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {member.role}
        </p>

        <p className="mt-5 leading-relaxed text-text-secondary">{member.pitch}</p>

        <ul className="mt-7 flex flex-wrap gap-2">
          {member.disciplines.map((discipline, i) => (
            <motion.li
              key={discipline}
              className="rounded-full border border-surface-border px-3 py-1 text-[11px] uppercase tracking-wider text-text-secondary"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.04, ease: EASE_OUT }}
            >
              {discipline}
            </motion.li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 font-display text-sm font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Profil LinkedIn
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        </div>
      </div>
    </motion.article>
  )
}

export default function TeamSection() {
  return (
    <section id="agence" className="relative overflow-hidden bg-surface-light py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        {/* En-tête */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                L'agence
              </span>
            </Reveal>
            <SplitText
              as="h2"
              by="word"
              text="Une équipe restreinte, deux métiers complets"
              delay={0.1}
              className="mt-5 block font-display text-3xl font-bold leading-[1.02] tracking-tight text-text-primary md:text-6xl"
            />
          </div>

          <Reveal delay={0.2} className="max-w-sm">
            <p className="leading-relaxed text-text-secondary">
              Pas de chaîne d'intermédiaires : vous parlez directement aux deux
              personnes qui conçoivent et qui développent. Et le travail ne
              s'arrête pas à la mise en ligne : nous mettons aussi en place et
              pilotons vos campagnes Meta Ads et Google Ads.
            </p>
          </Reveal>
        </div>

        {/* Ce que nous prenons en charge */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-surface-border bg-surface-border md:mt-20 md:grid-cols-3">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.title}
              className="bg-surface-light p-6 md:p-8"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.6, delay: index * 0.1, ease: EASE_OUT }}
            >
              <h3 className="font-display text-base font-bold text-text-primary md:text-lg">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {service.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Profils */}
        <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-2 md:gap-8">
          {MEMBERS.map((member, index) => (
            <MemberCard key={member.name} member={member} index={index} />
          ))}
        </div>

        {/* Chiffres, tous vérifiables dans le portfolio ci-dessus */}
        <div className="mt-16 grid grid-cols-3 gap-4 border-t border-surface-border pt-12 md:mt-24">
          {FACTS.map((fact, index) => (
            <motion.div
              key={fact.label}
              className="text-center md:text-left"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.6, delay: index * 0.1, ease: EASE_OUT }}
            >
              <Counter
                value={fact.value}
                className="block font-display text-4xl font-bold text-text-primary md:text-6xl"
              />
              <div className="mt-2 text-xs uppercase tracking-wider text-text-muted md:text-sm">
                {fact.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Secteurs traversés, en bandeau */}
      <div className="mt-16 border-y border-surface-border py-4 md:mt-24">
        <Marquee
          items={SECTORS}
          speed={26}
          direction={-1}
          className="font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-text-secondary"
        />
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-6 text-center md:mt-20">
        <Reveal>
          <Magnetic className="inline-block">
            <a
              href="mailto:zdigitalzdev@gmail.com"
              className="inline-flex items-center gap-3 rounded-full bg-text-primary px-8 py-4 font-display text-sm font-semibold tracking-wider text-surface transition-opacity hover:opacity-90"
            >
              PARLONS DE VOTRE PROJET
              <span aria-hidden>→</span>
            </a>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  )
}

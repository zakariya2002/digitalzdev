import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Counter, Magnetic, Parallax, Reveal, SplitText } from './motion'
import { EASE_OUT, VIEWPORT } from './motion/config'

const PARAGRAPHS = [
  "Ce projet est né d'un constat simple mais désolant : il n'y a pas suffisamment de places dans les établissements spécialisés, et beaucoup de familles se retrouvent à domicile, sans solution.",
  'NeuroCare met en relation des professionnels spécialisés en troubles du neurodéveloppement (autisme, TDAH, troubles DYS…) avec les personnes concernées et leurs familles.',
]

const STATS = [
  { value: '100%', label: 'des revenus réinvestis' },
  { value: '4', label: 'étapes de vérification' },
  { value: '30+', label: 'villes couvertes' },
]

export default function MissionSection() {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // La nappe verte se dilate lentement pendant la traversée de la section.
  const auraScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.35])
  const auraOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.06, 0])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-surface py-24 md:py-36"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5BA89D] blur-[130px]"
        style={{ scale: auraScale, opacity: auraOpacity }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center md:mb-24">
          <Reveal>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-[#5BA89D]">
              Notre mission
            </span>
          </Reveal>

          <SplitText
            as="h2"
            by="word"
            text="Chaque projet finance une cause"
            delay={0.1}
            className="mx-auto mt-5 block max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-6xl"
          />

          <Reveal delay={0.25} className="mx-auto mt-8 max-w-2xl">
            <p className="text-lg leading-relaxed text-text-secondary">
              100% des revenus générés par Digitalz Dev sont réinvestis dans{' '}
              <a
                href="https://neuro-care.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#5BA89D] underline-offset-4 hover:underline"
              >
                NeuroCare
              </a>
              , une plateforme dédiée aux personnes en situation de handicap.
            </p>
          </Reveal>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal from="left" distance={60} duration={1}>
            {/* Le cadre est rogné pour que l'image puisse dériver dedans */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <Parallax speed={0.06} zoom>
                <img
                  src="/screenshots/neurocare-hero.webp"
                  alt="NeuroCare, plateforme dédiée au neurodéveloppement"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </Parallax>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
            </div>
          </Reveal>

          <div>
            <Reveal from="right" distance={50}>
              <h3 className="mb-6 font-display text-2xl font-bold text-text-primary md:text-3xl">
                NeuroCare : bien plus qu'une plateforme
              </h3>
            </Reveal>

            <div className="space-y-4 leading-relaxed text-text-secondary">
              {PARAGRAPHS.map((paragraph, index) => (
                <Reveal key={index} from="right" distance={40} delay={0.1 + index * 0.1}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
              <Reveal from="right" distance={40} delay={0.3}>
                <p className="font-medium text-text-primary">
                  Plus qu'une plateforme, nous guidons et accompagnons les
                  familles dans leur parcours.
                </p>
              </Reveal>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="rounded-xl border border-surface-border bg-surface-card p-4"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: EASE_OUT }}
                >
                  <Counter
                    value={stat.value}
                    className="block font-display text-2xl font-bold text-[#5BA89D]"
                  />
                  <div className="mt-1 text-xs leading-snug text-text-muted">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <Reveal delay={0.2} className="mt-10">
              <Magnetic className="inline-block">
                <a
                  href="https://neuro-care.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#5BA89D] px-8 py-3 font-display text-sm font-semibold tracking-wider text-white transition-colors hover:bg-[#4A9488]"
                >
                  DÉCOUVRIR NEUROCARE
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </a>
              </Magnetic>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

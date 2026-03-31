import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function MissionSection() {
  return (
    <section className="relative py-24 md:py-32 bg-surface overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#5BA89D] blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[#5BA89D] font-display font-semibold text-sm tracking-[0.2em] uppercase">
            Notre mission
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-text-primary mt-4 mb-6">
            Chaque projet finance une cause
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
            100% des revenus générés par Digitalz Dev sont réinvestis dans{' '}
            <a
              href="https://neuro-care.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5BA89D] font-semibold hover:underline"
            >
              NeuroCare
            </a>
            , une plateforme dédiée aux personnes en situation de handicap.
          </p>
        </motion.div>

        {/* Content grid */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Image / Visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/screenshots/neurocare-hero.png"
                alt="NeuroCare - Plateforme de neurodéveloppement"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
            </div>
          </motion.div>

          {/* Right: Text content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="font-display font-bold text-2xl md:text-3xl text-text-primary mb-6">
              NeuroCare — bien plus qu'une plateforme
            </h3>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Ce projet est né d'un constat simple mais désolant : il n'y a
                pas suffisamment de places dans les établissements spécialisés,
                et beaucoup de familles se retrouvent à domicile, sans solution.
              </p>
              <p>
                NeuroCare met en relation des professionnels spécialisés en
                troubles du neurodéveloppement (autisme, TDAH, troubles DYS…)
                avec les personnes concernées et leurs familles.
              </p>
              <p className="font-medium text-text-primary">
                Plus qu'une plateforme, nous guidons et accompagnons les
                familles dans leur parcours.
              </p>
            </div>

            {/* Stats / Key points */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
                <div className="text-[#5BA89D] font-display font-bold text-2xl">100%</div>
                <div className="text-text-muted text-sm mt-1">
                  des revenus réinvestis
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
                <div className="text-[#5BA89D] font-display font-bold text-2xl">Gratuit</div>
                <div className="text-text-muted text-sm mt-1">
                  pour les familles
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="https://neuro-care.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#5BA89D] text-white rounded-full font-display font-semibold tracking-wider text-sm hover:bg-[#4A9488] transition-colors"
              >
                DÉCOUVRIR NEUROCARE
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

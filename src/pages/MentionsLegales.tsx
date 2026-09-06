import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function MentionsLegales() {
  return (
    <main className="bg-surface min-h-screen">
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="-mt-3 mb-5 inline-flex min-h-[44px] items-center gap-2 py-3 text-sm text-text-secondary transition-colors hover:text-accent"
            >
              <span>←</span> Retour
            </Link>
          </motion.div>

          <motion.h1
            className="mb-12 font-display text-3xl font-black text-text-primary [hyphens:auto] sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Mentions légales
          </motion.h1>

          <motion.div
            className="space-y-8 text-text-secondary leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Éditeur du site
              </h2>
              <p>
                Digitalz Dev est le nom commercial de :
              </p>
              <p className="mt-3">
                <strong className="text-text-primary">NeuroCare</strong>
                <br />
                Société par actions simplifiée à associé unique (SASU)
                <br />
                Capital social : 150 €
                <br />
                Siège social : 8 avenue Édouard Branly, 93420 Villepinte,
                France
                <br />
                RCS Bobigny : immatriculation en cours
                <br />
                Email :{' '}
                <a
                  href="mailto:zdigitalzdev@gmail.com"
                  className="text-accent underline underline-offset-2"
                >
                  zdigitalzdev@gmail.com
                </a>
                <br />
                Site : digitalzdev.com
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Directeur de la publication
              </h2>
              <p>
                Zakariya Nebbache, président de la société NeuroCare.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Hébergement
              </h2>
              <p>
                Ce site est hébergé par :<br />
                Vercel Inc.<br />
                340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
                Site : vercel.com
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Propriété intellectuelle
              </h2>
              <p>
                L'ensemble du contenu de ce site (textes, images, logos,
                maquettes, code source) est la propriété exclusive de la société
                NeuroCare, sauf mention contraire. Les captures d'écran des
                réalisations restent la propriété de leurs marques respectives.
                Toute reproduction, même partielle, est interdite sans
                autorisation préalable.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Données personnelles
              </h2>
              <p>
                Pour en savoir plus sur la collecte et le traitement de vos
                données, consultez notre{' '}
                <Link
                  to="/politique-confidentialite"
                  className="text-accent underline"
                >
                  Politique de confidentialité
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Cookies
              </h2>
              <p>
                Ce site n'utilise aucun cookie tiers ni outil de tracking. Seul
                le stockage local du navigateur (localStorage) est utilisé pour
                mémoriser votre préférence de thème (clair/sombre). Cette donnée
                reste sur votre appareil et n'est jamais transmise.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

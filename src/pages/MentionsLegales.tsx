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
              className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm mb-8"
            >
              <span>←</span> Retour
            </Link>
          </motion.div>

          <motion.h1
            className="font-display font-black text-4xl md:text-5xl text-text-primary mb-12"
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
                Digitalz Dev<br />
                Entrepreneur individuel<br />
                Email : zdigitalzdev@gmail.com<br />
                Site : digitalzdev.com
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
                maquettes, code source) est la propriété exclusive de Digitalz
                Dev, sauf mention contraire. Toute reproduction, même partielle,
                est interdite sans autorisation préalable.
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

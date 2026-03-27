import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function PolitiqueConfidentialite() {
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
            Politique de confidentialité
          </motion.h1>

          <motion.div
            className="space-y-8 text-text-secondary leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Responsable du traitement
              </h2>
              <p>
                Digitalz Dev, entrepreneur individuel.<br />
                Email : zdigitalzdev@gmail.com
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Données collectées
              </h2>
              <p>
                Lorsque vous utilisez le formulaire de contact, les données
                suivantes peuvent être collectées :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Nom complet</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone (facultatif)</li>
                <li>Nom d'entreprise (facultatif)</li>
                <li>Description du projet</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Finalité du traitement
              </h2>
              <p>
                Vos données sont collectées uniquement pour répondre à votre
                demande de devis et vous recontacter dans le cadre de votre
                projet. Elles ne sont jamais utilisées à des fins commerciales
                ou publicitaires.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Base légale
              </h2>
              <p>
                Le traitement repose sur votre consentement explicite (case
                cochée avant l'envoi du formulaire), conformément à l'article
                6.1.a du RGPD.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Destinataires
              </h2>
              <p>
                Vos données sont transmises uniquement au responsable de
                Digitalz Dev via email. Aucun sous-traitant ni tiers n'y a
                accès.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Durée de conservation
              </h2>
              <p>
                Vos données sont conservées pendant la durée nécessaire au
                traitement de votre demande, puis supprimées dans un délai
                maximum de 12 mois après le dernier échange.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Vos droits
              </h2>
              <p>
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement (« droit à l'oubli »)</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition</li>
                <li>Droit de retirer votre consentement à tout moment</li>
              </ul>
              <p className="mt-3">
                Pour exercer vos droits, contactez-nous à :{' '}
                <a
                  href="mailto:zdigitalzdev@gmail.com"
                  className="text-accent underline"
                >
                  zdigitalzdev@gmail.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Cookies et stockage local
              </h2>
              <p>
                Ce site n'utilise aucun cookie. Le stockage local du navigateur
                (localStorage) est utilisé uniquement pour mémoriser votre
                préférence de thème (clair/sombre). Cette donnée est strictement
                fonctionnelle et reste sur votre appareil.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Services tiers
              </h2>
              <p>
                Ce site n'intègre aucun service tiers de tracking ou
                d'analyse. Les polices de caractères sont hébergées localement
                sur notre serveur. Aucune donnée n'est transmise à Google ou
                tout autre fournisseur externe.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-3">
                Réclamation
              </h2>
              <p>
                Si vous estimez que le traitement de vos données ne respecte
                pas la réglementation, vous pouvez adresser une réclamation à
                la CNIL :{' '}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline"
                >
                  www.cnil.fr
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Magnetic, Reveal, SplitText } from './motion'
import { EASE_OUT, VIEWPORT } from './motion/config'

interface Service {
  title: string
  lead: string
  body: string
  points: string[]
}

const SERVICES: Service[] = [
  {
    title: 'Site vitrine sur mesure',
    lead: "Pour présenter une activité et déclencher la prise de contact.",
    body: "Nous concevons un site internet taillé pour votre métier plutôt qu'un gabarit repeint : arborescence, rédaction, direction artistique et développement. Chaque page vise une intention de recherche précise et mène à une action claire, appel, formulaire ou prise de rendez-vous.",
    points: [
      'Maquettes validées avant la première ligne de code',
      'Rédaction et structure orientées référencement naturel',
      'Formulaire de contact et suivi des demandes',
      'Formation à la prise en main, vous restez autonome',
    ],
  },
  {
    title: 'Boutique e-commerce Shopify',
    lead: "Pour vendre en ligne sans se battre contre son propre site.",
    body: "Thème Shopify développé sur mesure, fiches produits pensées pour la conversion, tunnel d'achat réduit au strict nécessaire et paiements Shop Pay, PayPal, Klarna et carte bancaire. Nous branchons ensuite vos outils marketing pour que chaque visite compte.",
    points: [
      'Thème sur mesure, pas de gabarit du commerce',
      'Fiches produits, packs et ventes additionnelles',
      'Capture e-mail et scénarios automatisés',
      'Suivi des ventes et des conversions',
    ],
  },
  {
    title: 'Refonte de site internet',
    lead: "Pour un site qui ne convertit plus, ou qui ne suit plus.",
    body: "Nous partons de l'existant : ce qui fonctionne, ce qui coince, ce que disent vos statistiques. La refonte préserve votre référencement acquis grâce à un plan de redirections complet, et corrige ce qui vous coûtait des visiteurs, notamment la lenteur et le confort de lecture sur mobile.",
    points: [
      'Audit du site actuel, contenus et performances',
      'Plan de redirections pour ne rien perdre en référencement',
      'Reprise et réécriture des contenus existants',
      'Mise en conformité RGPD et accessibilité',
    ],
  },
  {
    title: 'Application web et dashboard',
    lead: "Pour outiller une activité que les tableurs ne suivent plus.",
    body: "Quand le besoin dépasse le site web, nous développons l'outil métier : espace client, back-office, tableau de bord, facturation, automatisations. Les mêmes personnes conçoivent et développent, ce qui évite le jeu de téléphone entre agence et prestataire technique.",
    points: [
      'Espaces client et back-office sur mesure',
      'Tableaux de bord et indicateurs métier',
      'Automatisations et intégrations tierces',
      'Applications iOS lorsque le mobile est central',
    ],
  },
  {
    title: 'Meta Ads et Google Ads',
    lead: "Pour aller chercher le trafic que le site ne capte pas seul.",
    body: "Un site sans visiteurs ne sert à rien. Nous mettons en place et pilotons vos campagnes : structure des comptes, audiences, rédaction et création des annonces, arbitrages de budget. Les conversions sont mesurées, pour savoir ce qui rapporte et ce qui coûte.",
    points: [
      'Création et structuration des comptes publicitaires',
      'Annonces, visuels et audiences',
      'Suivi des conversions et attribution',
      'Rapports lisibles, sans jargon inutile',
    ],
  },
  {
    title: 'Référencement naturel',
    lead: "Pour exister sur Google au-delà de votre propre nom.",
    body: "Le référencement se construit dès la conception : structure des URL, balises, données structurées, temps de chargement, maillage interne et contenus qui répondent aux questions réelles de vos clients. Nous livrons un site déjà prêt, puis nous suivons les positions.",
    points: [
      'Architecture et balisage optimisés dès le départ',
      'Données structurées et extraits enrichis',
      'Temps de chargement et Core Web Vitals',
      'Suivi des positions et corrections continues',
    ],
  },
]

/**
 * Section services de la page d'accueil.
 *
 * Elle porte l'essentiel du contenu indexable du site : avant elle, la page
 * ne comptait que quelques centaines de mots et ne contenait littéralement
 * aucune occurrence de « agence web » ni de « site internet », les termes sur
 * lesquels elle doit se positionner.
 */
export default function ServicesSection() {
  return (
    <section id="services" className="relative bg-surface py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Nos services
              </span>
            </Reveal>
            <SplitText
              as="h2"
              by="word"
              text="Une agence web qui conçoit, développe et fait connaître votre site"
              delay={0.1}
              className="mt-5 block font-display text-3xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-5xl"
            />
          </div>

          <Reveal delay={0.2} className="max-w-sm">
            <p className="leading-relaxed text-text-secondary">
              Création de site internet, boutique en ligne, refonte, outil
              métier et campagnes publicitaires. Un projet de site web se juge
              sur ce qu'il rapporte une fois en ligne, pas sur sa maquette.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-2 md:gap-8">
          {SERVICES.map((service, index) => (
            <motion.article
              key={service.title}
              className="rounded-2xl border border-surface-border bg-surface-card p-7 md:p-9"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, delay: (index % 2) * 0.1, ease: EASE_OUT }}
            >
              <h3 className="font-display text-xl font-bold text-text-primary md:text-2xl">
                {service.title}
              </h3>
              <p className="mt-2 font-display text-sm font-semibold text-accent">
                {service.lead}
              </p>
              <p className="mt-4 leading-relaxed text-text-secondary">
                {service.body}
              </p>
              <ul className="mt-6 space-y-2">
                {service.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-baseline gap-3 text-sm text-text-secondary"
                  >
                    <span aria-hidden className="text-accent">
                      ·
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-14 text-center md:mt-20">
          <p className="mx-auto max-w-2xl leading-relaxed text-text-secondary">
            Vous avez un projet de site internet, une boutique à ouvrir ou un
            site à refondre ? Décrivez-le en deux minutes, nous revenons vers
            vous sous 24 à 48 heures avec un devis adapté.
          </p>
          <Magnetic className="mt-8 inline-block">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-text-primary px-8 py-4 font-display text-sm font-semibold tracking-wider text-surface transition-opacity hover:opacity-90"
            >
              DÉCRIRE MON PROJET
              <span aria-hidden>→</span>
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  )
}

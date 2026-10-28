import { motion } from 'framer-motion'
import { Magnetic, Reveal, SplitText } from './motion'
import { EASE_OUT, VIEWPORT } from './motion/config'

/** Conversation WhatsApp avec Zakariya, message d'ouverture prérempli. */
export const WHATSAPP_PROJET = `https://wa.me/33783259869?text=${encodeURIComponent(
  "Bonjour Digitalz Dev, je suis architecte et j'aimerais vous parler du site de mon agence : "
)}`

interface Service {
  title: string
  lead: string
  body: string
  points: string[]
}

export const SERVICES: Service[] = [
  {
    title: "Site d'agence d'architecture",
    lead: "Pour présenter votre agence et déclencher la prise de contact.",
    body: "Nous concevons un site taillé pour votre agence plutôt qu'un gabarit repeint : arborescence, rédaction, direction artistique et développement. Chaque page vise une recherche précise, « architecte maison contemporaine », « extension », « rénovation », et mène à une action claire : appel, formulaire ou prise de rendez-vous.",
    points: [
      'Maquettes validées avant la première ligne de code',
      'Pages par type de projet et par ville, rédigées pour Google',
      'Formulaire de contact qui qualifie les demandes',
      'Formation à la prise en main, vous restez autonome',
    ],
  },
  {
    title: 'Portfolio de réalisations',
    lead: "Pour que vos projets parlent avant vous.",
    body: "Vos réalisations montrées en grand, sans perte de qualité et sans ralentir le site : galeries plein écran, fiches projet avec programme, surface, lieu et photos avant-après. Vous ajoutez vous-même chaque nouveau chantier livré.",
    points: [
      'Galeries haute définition, chargement rapide',
      'Fiche par projet : programme, surface, lieu, année',
      'Filtres par type : neuf, extension, rénovation, intérieur',
      'Mise en avant des prix et publications',
    ],
  },
  {
    title: 'Refonte de site internet',
    lead: "Pour un site d'agence qui ne montre plus ce que vous faites.",
    body: "Nous partons de l'existant : ce qui fonctionne, ce qui coince, ce que disent vos statistiques. La refonte préserve votre référencement acquis grâce à un plan de redirections complet, et corrige ce qui vous coûtait des visiteurs, notamment la lenteur et le confort de lecture sur mobile.",
    points: [
      'Audit du site actuel, contenus et performances',
      'Plan de redirections pour ne rien perdre en référencement',
      'Reprise et réécriture des contenus existants',
      'Mise en conformité RGPD et accessibilité',
    ],
  },
  {
    title: "Espace client maîtres d'ouvrage",
    lead: "Pour suivre vos chantiers sans multiplier les e-mails.",
    body: "Un espace privé où vos maîtres d'ouvrage retrouvent plans, comptes rendus de chantier, photos d'avancement et documents à signer. Les mêmes personnes conçoivent et développent, ce qui évite le jeu de téléphone entre agence et prestataire technique.",
    points: [
      'Plans et documents partagés par projet',
      "Comptes rendus et photos d'avancement",
      'Validation des étapes par le client',
      'Accès sécurisé, sur ordinateur et mobile',
    ],
  },
  {
    title: 'Meta Ads et Google Ads',
    lead: "Pour toucher les particuliers qui cherchent un architecte maintenant.",
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
    lead: "Pour être trouvé sur « architecte » + votre ville, pas seulement sur votre nom.",
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
    <section id="services" className="relative bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* L'en-tête ne passe sur deux colonnes qu'à partir de `lg` : à
            768 px, `max-w-2xl` et `max-w-sm` côte à côte laissaient au titre
            une colonne de 343 px, où il se cassait en six lignes. */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
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
              className="mt-5 block font-display text-3xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-4xl lg:text-5xl"
            />
          </div>

          <Reveal delay={0.2} className="max-w-sm lg:shrink-0">
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
              className="flex flex-col rounded-2xl border border-surface-border bg-surface-card p-7 md:h-[22rem] md:p-9"
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

              {/* Corps défilant.
                  Les quatre services n'ont pas la même longueur de texte, ce
                  qui donnait une grille en escalier et une section
                  interminable. La carte est bornée en hauteur à partir de md
                  et le détail défile à l'intérieur, sous un titre qui reste
                  visible. Sur téléphone la carte s'étire au contraire : un
                  défilement dans un défilement est pénible au doigt. */}
              <div className="relative mt-4 min-h-0 flex-1 md:overflow-hidden">
                <div className="h-full md:overflow-y-auto md:pr-3">
                  <p className="leading-relaxed text-text-secondary">
                    {service.body}
                  </p>
                  <ul className="mt-6 space-y-2 md:pb-6">
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
                </div>
                {/* Voile de bas de carte : sans lui, le texte se coupe net sur
                    une ligne pleine et rien ne dit qu'il en reste. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-10 bg-gradient-to-t from-surface-card to-transparent md:block"
                />
              </div>
            </motion.article>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-14 text-center md:mt-20">
          <p className="mx-auto max-w-2xl leading-relaxed text-text-secondary">
            Vous avez un projet de site internet, une boutique à ouvrir ou un
            site à refondre ? Décrivez-le-nous directement sur WhatsApp, nous
            revenons vers vous avec un devis adapté.
          </p>
          <Magnetic className="mt-8 inline-block">
            {/* Ouvre une conversation WhatsApp avec un premier message déjà
                écrit : le prospect n'a plus qu'à compléter et envoyer. */}
            <a
              href={WHATSAPP_PROJET}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-sm font-semibold text-surface transition-opacity hover:opacity-90"
            >
              Décrire mon projet
            </a>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  )
}

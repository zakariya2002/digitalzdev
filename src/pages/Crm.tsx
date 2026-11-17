import type { ReactNode } from 'react'
import { motion, MotionConfig, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { WHATSAPP } from '../components/avocatleads/contenu'
import Navbar from '../components/Navbar'
import type { CSSProperties } from 'react'

/** Variables du thème studio : la barre de l'accueil garde son apparence ici. */
const THEME_STUDIO = {
  '--surface': '255 255 255',
  '--surface-light': '245 245 247',
  '--surface-card': '240 240 242',
  '--surface-border': '222 222 226',
  '--accent': '29 29 31',
  '--accent-hover': '58 58 60',
  '--accent-muted': '152 155 161',
  '--text-primary': '29 29 31',
  '--text-secondary': '99 99 104',
  '--text-muted': '142 142 147',
  fontFamily: "'Nunito', system-ui, sans-serif",
} as CSSProperties

/*
 * Portfolio CRM et back-offices de Digitalz Dev.
 *
 * Fond blanc, noir en seconde couleur, Poppins. Toutes les images sont de
 * vraies captures : sites en ligne, et application mobile NeuroCare lancée
 * sur simulateur iPhone. Les chiffres viennent des dépôts des projets.
 */

const CONTACT = 'mailto:zdigitalzdev@gmail.com?subject=Projet%20CRM'

const POLICE_MARQUE = { fontFamily: "'Inter Tight', system-ui, sans-serif" }

/** Logo Digitalz Dev, dessiné comme celui d'AvocatLeads : carré gris, nom en deux graisses. */
function Logo({ grand = false }: { grand?: boolean }) {
  return (
    <span className={`inline-flex items-center ${grand ? 'gap-4' : 'gap-2.5'}`}>
      <svg viewBox="0 0 40 40" className={grand ? 'h-14 w-14' : 'h-8 w-8'} aria-hidden>
        <rect width="40" height="40" rx="10" fill="#9EA2AA" />
        <path d="M15.5 13.5L9 20l6.5 6.5M24.5 13.5L31 20l-6.5 6.5" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`whitespace-nowrap tracking-[-0.03em] text-[#1D1D1F] ${grand ? 'text-[44px]' : 'text-[21px]'}`} style={POLICE_MARQUE}>
        <span className="font-light">digitalz</span>
        <span className="font-bold">dev</span>
      </span>
    </span>
  )
}

const LIEN_PIED = 'inline-block py-2 text-[15px] font-medium text-black/55 transition-colors hover:text-black'

function PiedDePage() {
  return (
    <footer className="overflow-hidden bg-[#F5F5F7] px-5 pt-12 md:px-10 md:pt-16">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Plan de la page" className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-sm font-medium text-black/40">La page</p>
            <ul className="mt-4">
              {[['#savoir-faire', 'Savoir-faire'], ['#realisations', 'Réalisations'], ['#integrations', 'Intégrations'], ['#architecture', 'Architecture']].map(([h, l]) => (
                <li key={h}><a href={h} className={LIEN_PIED}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-4">
            <p className="text-sm font-medium text-black/40">Parler de votre projet</p>
            <ul className="mt-4">
              <li><a href={CONTACT} className={LIEN_PIED}>zdigitalzdev@gmail.com</a></li>
              <li><a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={LIEN_PIED}>WhatsApp</a></li>
              <li><a href="https://www.linkedin.com/in/zakariya-nebbache-7b0644214/" target="_blank" rel="noopener noreferrer" className={LIEN_PIED}>LinkedIn</a></li>
            </ul>
          </div>
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-xs py-2 text-[15px] font-medium leading-relaxed text-black/55">
              CRM, back-offices, applications mobiles et sites sur mesure, conçus et mis en production par notre équipe.
            </p>
          </div>
        </nav>

        <div className="mt-14 flex flex-col gap-3 text-sm font-medium text-black/40 md:flex-row md:items-center md:justify-between">
          <p>Digitalz Dev &copy; {new Date().getFullYear()}, nom commercial de NEUROCARE SAS, RCS Bobigny 131 907 420.</p>
          <div className="flex gap-6">
            <Link to="/mentions-legales" className="py-2 transition-colors hover:text-black">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="py-2 transition-colors hover:text-black">Politique de confidentialité</Link>
          </div>
        </div>
      </div>

      {/* Le nom en lettres géantes, comme sur AvocatLeads ; le jambage du « g » reste visible. */}
      <div className="mt-10 overflow-hidden">
        <motion.p
          aria-hidden
          className="whitespace-nowrap pb-[0.06em] text-center text-[13.5vw] font-bold leading-[1.05] tracking-[-0.05em] text-[#1D1D1F]"
          style={POLICE_MARQUE}
          initial={{ y: '60%' }}
          whileInView={{ y: '0%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-light">digitalz</span>
          <span>dev</span>
        </motion.p>
      </div>
    </footer>
  )
}

/** Apparition douce au défilement. */
function Apparait({ children, delai = 0, className = '' }: { children: ReactNode; delai?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: delai, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Fenêtre de navigateur claire autour d'une capture d'écran. */
function Navigateur({ src, alt, url }: { src: string; alt: string; url: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06]">
      <div className="flex items-center gap-3 bg-[#F2F2F4] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </span>
        <span className="mx-auto truncate rounded-md bg-white px-4 py-0.5 text-[11px] text-black/45">{url}</span>
        <span className="w-[46px]" />
      </div>
      <img src={src} alt={alt} loading="lazy" className="block w-full" />
    </div>
  )
}

/**
 * iPhone noir autour d'une capture mobile. Les captures de l'application
 * contiennent déjà la barre d'état ; celles des sites (`web`) en reçoivent
 * une, comme dans Safari.
 */
function Iphone({ src, alt, className = '', web = false }: { src: string; alt: string; className?: string; web?: boolean }) {
  return (
    <div className={`rounded-[2.6rem] bg-[#111] p-[7px] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.45)] ring-1 ring-black/20 ${className}`}>
      <div className="relative flex aspect-[9/19.5] flex-col overflow-hidden rounded-[2.2rem] bg-white">
        {web && (
          <div className="relative flex h-[6.3%] shrink-0 items-center justify-between px-[11%] text-[clamp(7px,1vw,12px)] font-semibold">
            <span>9:41</span>
            <span className="absolute left-1/2 top-[22%] h-[56%] w-[31%] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-end gap-[2px]">
              <span className="h-[4px] w-[3px] rounded-[1px] bg-black" />
              <span className="h-[6px] w-[3px] rounded-[1px] bg-black" />
              <span className="h-[8px] w-[3px] rounded-[1px] bg-black" />
              <span className="ml-1 h-[9px] w-[18px] rounded-[3px] bg-black" />
            </span>
          </div>
        )}
        <img src={src} alt={alt} loading="lazy" className="block min-h-0 w-full flex-1 object-cover object-top" />
      </div>
    </div>
  )
}

function Titre({ children, intro, centre = false }: { sur?: string; children: ReactNode; intro?: ReactNode; centre?: boolean }) {
  return (
    <Apparait>
      <h2 className={`max-w-3xl ${centre ? 'mx-auto text-center' : ''} text-3xl font-semibold leading-tight tracking-tight md:text-5xl`}>{children}</h2>
      {intro && <p className="mt-5 max-w-2xl text-base leading-relaxed text-black/60">{intro}</p>}
    </Apparait>
  )
}

function Puces({ items, sombre = false }: { items: string[]; sombre?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <span key={i} className={`rounded-full px-3 py-1 text-xs ${sombre ? 'bg-white/10 text-white/80' : 'bg-black/[0.05] text-black/75'}`}>
          {i}
        </span>
      ))}
    </div>
  )
}

const SAVOIR_FAIRE: [string, string, string][] = [
  ['Fiches clients et pipeline', 'Entreprises, contacts, historique des échanges, étapes de vente en tableau.', 'NeuroCare, Drive, Digitalz'],
  ['Devis, factures, avoirs', 'Numérotation légale, facturation groupée, export comptable CSV.', 'NeuroCare, Drive, Digitalz'],
  ['Paiements et reversements', 'Encaissement, abonnements, reversements à des tiers, webhooks.', 'NeuroCare, Drive'],
  ['Téléphonie intégrée', 'Appel depuis la fiche, historique, SMS, résumé d’appel rédigé par IA.', 'NeuroCare, Digitalz'],
  ['Relances automatiques', 'SMS et emails programmés : rappels, pièces manquantes, impayés.', 'NeuroCare, Drive'],
  ['Rôles et droits', 'Chaque profil ne voit que ce qui le concerne, contrôlé en base.', 'Drive, NeuroCare'],
  ['Documents', 'Stockage privé, liens de partage sécurisés, lecture automatique (OCR).', 'NeuroCare, Drive'],
  ['Pilotage', 'Objectifs, taux de conversion, satisfaction NPS, tableaux de bord.', 'NeuroCare, Drive'],
  ['Application mobile', 'iOS et Android sur la même base que le site et le back-office.', 'NeuroCare'],
  ['Acquisition reliée au CRM', 'Formulaires, simulateurs et publicités qui alimentent le CRM, statuts renvoyés à Meta.', 'Digitalz, AdsPilot'],
]

/** Une fonctionnalité : capture d'un côté, explication de l'autre. */
type EtapeProps = { sur: string; titre: string; texte: string; src: string; url: string; points?: string[]; inverse?: boolean; image?: boolean }

function Etape({ sur, titre, texte, src, url, points, inverse = false, image = false }: EtapeProps) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-[1.45fr_1fr] md:gap-12 [&>*]:min-w-0">
      <Apparait className={inverse ? 'md:order-2' : ''}>
        {image ? (
          <img src={src} alt={titre} loading="lazy" className="w-full rounded-2xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.3)] ring-1 ring-black/[0.06]" />
        ) : (
          <Navigateur src={src} alt={titre} url={url} />
        )}
      </Apparait>
      <Apparait delai={0.1} className={inverse ? 'md:order-1' : ''}>
        <h4 className="text-2xl font-semibold leading-snug tracking-tight md:text-3xl">{titre}</h4>
        <p className="mt-4 text-[15px] leading-relaxed text-black/60">{texte}</p>
        {points && (
          <ul className="mt-5 space-y-2">
            {points.map((pt) => (
              <li key={pt} className="flex gap-3 text-sm text-black/75">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                {pt}
              </li>
            ))}
          </ul>
        )}
      </Apparait>
    </div>
  )
}

const ETAPES_DZ: EtapeProps[] = [
  {
    sur: 'Leads Meta',
    titre: 'Les leads des publicités arrivent seuls dans le CRM.',
    texte: 'Chaque formulaire rempli sur Facebook ou Instagram est transmis par webhook et crée sa fiche en quelques secondes, avec la source, les réponses et un statut de suivi.',
    points: ['Webhook Facebook Lead Ads', 'Pipeline : nouveau, contacté, qualifié, client', 'Statut renvoyé à Meta pour optimiser les campagnes'],
    src: '/crm/dz-clients.webp',
    url: 'digitalzdev.com/dashboard/clients',
  },
  {
    sur: 'Appels et notes',
    titre: 'On appelle depuis la fiche et on note pendant l’appel.',
    texte: 'Le téléphone est dans le navigateur. La fiche affiche tout ce qu’il faut savoir pendant l’appel, le script s’adapte au prospect, et la note est enregistrée avec le résultat et la date de rappel.',
    points: ['Softphone Twilio intégré', 'Script d’appel partagé par l’équipe', 'Résultat en un clic et rappel programmé'],
    src: '/crm/dz-fiche.webp',
    url: 'digitalzdev.com/dashboard/prospection',
  },
  {
    sur: 'Historique',
    titre: 'Chaque échange reste sur la fiche du client.',
    texte: 'Appels entrants et sortants, durée, SMS envoyés, prochaine relance : toute l’équipe sait où en est le client avant de l’appeler.',
    src: '/crm/dz-client-appels.webp',
    url: 'digitalzdev.com/dashboard/clients/studio-duval',
  },
  {
    sur: 'Devis',
    titre: 'Le devis se crée en quelques minutes, puis devient une facture.',
    texte: 'Lignes depuis la grille tarifaire, conditions, validité, PDF à la charte. Une fois accepté, un clic le convertit en facture.',
    points: ['Grille tarifaire réutilisable', 'Import d’un devis existant par IA', 'Lien de partage pour le client'],
    src: '/crm/dz-devis.webp',
    url: 'digitalzdev.com/dashboard/quotes/DEV-2026-041',
  },
  {
    sur: 'Facture',
    titre: 'La facture suit les paiements reçus.',
    texte: 'Numérotation continue, acompte et solde, encaissements partiels : le statut passe de envoyée à payée tout seul quand le paiement est enregistré.',
    src: '/crm/dz-facture.webp',
    url: 'digitalzdev.com/dashboard/invoices/FAC-2026-118',
  },
  {
    sur: 'Comptabilité',
    titre: 'Les encaissements alimentent directement la comptabilité.',
    texte: 'Chiffre d’affaires du mois et de l’année, charges estimées, revenu net, plafond du régime : la compta se tient à jour à partir des factures, sans ressaisie.',
    src: '/crm/dz-finances.webp',
    url: 'digitalzdev.com/dashboard/finances',
  },
]

const ETAPES_ADS: EtapeProps[] = [
  {
    sur: 'Vue d’ensemble',
    titre: 'Tous les comptes publicitaires des clients sur un seul écran.',
    texte: 'Le super admin voit chaque client en lecture seule : dépense, leads, coût par lead, ROAS et meilleur ensemble de publicités, sur la période choisie, du jour même jusqu’à l’historique complet.',
    points: ['Plusieurs comptes Meta réunis', 'Période au choix, jusqu’à « All Time »', 'Appels obtenus suivis avec Hyros et Calendly'],
    src: '/crm/ads-overview-all.webp',
    url: 'adspilot / admin / vue d’ensemble',
  },
  {
    sur: 'Par client',
    titre: 'Chaque campagne résumée en une carte.',
    texte: 'Pour un client, toutes les campagnes s’affichent avec leur dépense, leurs leads, leur coût par lead et leur meilleur ensemble de publicités. On repère en quelques secondes ce qui fonctionne et ce qui coûte trop cher.',
    src: '/crm/ads-ipe.webp',
    url: 'adspilot / admin / immopourexpat',
  },
  {
    sur: 'Comparer',
    titre: 'Les meilleures audiences remontent d’elles-mêmes.',
    texte: 'Sur le compte Excellers, le coût par lead moyen descend à 1,50 € sur 49 397 leads. Les campagnes gagnantes, leurs audiences et leurs appels obtenus sont visibles sans ouvrir le gestionnaire de publicités de Meta.',
    src: '/crm/ads-excellers.webp',
    url: 'adspilot / admin / excellers',
  },
  {
    sur: 'Moteur de budget',
    titre: 'Les budgets s’ajustent seuls, selon vos règles.',
    texte: 'Chaque jour, un serveur dédié évalue chaque publicité sur la fenêtre choisie : il augmente le budget des gagnantes par paliers, met en sommeil celles qui dépassent le coût par lead visé, puis les relance après le délai prévu. Chaque décision peut aussi être validée à la main.',
    points: ['Objectif de coût par lead et fenêtre d’évaluation', 'Scaling par paliers de dépense', 'Mise en sommeil et relance automatiques'],
    src: '/crm/ads-rules.webp',
    url: 'adspilot / rules',
  },
]

const ETAPES_PRO: EtapeProps[] = [
  {
    sur: 'Tableau de bord',
    titre: 'L’activité du professionnel d’un coup d’œil.',
    texte: 'Revenus du mois, vues du profil, rendez-vous à venir, avis : l’essentiel dès l’ouverture.',
    src: '/crm/pro-accueil.webp',
    url: 'neuro-care.fr/dashboard/educator',
  },
  {
    sur: 'Transcription automatique',
    titre: 'Il parle pendant la séance, le compte rendu s’écrit seul.',
    texte: 'En mode séance, la dictée vocale ajoute le texte aux notes en direct. Les visios peuvent être transcrites avec l’accord de la famille, puis une synthèse est proposée, relue et validée par le professionnel.',
    points: ['Dictée vocale en direct', 'Transcription des visios avec consentement', 'Synthèse rédigée par IA, validée par le pro'],
    src: '/crm/pro-seance.webp',
    url: 'neuro-care.fr/dashboard/educator/session',
  },
  {
    sur: 'Facturation électronique',
    titre: 'Factures au format Factur-X, en partenariat avec Pennylane.',
    texte: 'NeuroCare est partenaire Solution Compatible de Pennylane, plateforme agréée pour la facturation électronique obligatoire. Les factures et avoirs sont produits depuis l’espace pro, sans rien changer aux habitudes.',
    points: ['Factures et avoirs au format Factur-X', 'Partenaire Solution Compatible Pennylane', 'Statut de chaque facture suivi dans l’espace pro'],
    src: '/crm/pro-pennylane.webp',
    url: '',
    image: true,
  },
  {
    sur: 'Factures',
    titre: 'Toutes les factures, prêtes en PDF.',
    texte: 'Numérotation par série, montant facturé, statut, téléchargement : la facturation ne demande plus aucune saisie.',
    src: '/crm/pro-factures.webp',
    url: 'neuro-care.fr/dashboard/educator/invoices',
  },
  {
    sur: 'Dossier de suivi',
    titre: 'Le dossier de l’enfant, partagé avec la famille.',
    texte: 'Objectifs, compétences, préférences, séances et PPA réunis au même endroit, partageables avec les parents et l’équipe.',
    src: '/crm/pro-dossier.webp',
    url: 'neuro-care.fr/dashboard/educator/dossier',
  },
]

type Projet = {
  id: string
  nom: string
  type: string
  resume: string
  visuels: ReactNode
  modules: string[]
  integrations: string[]
  stack: string[]
  stockage: string
  chiffres: [string, string][]
}

const PROJETS: Projet[] = [
  {
    id: 'neurocare',
    nom: 'NeuroCare',
    type: 'Plateforme web et mobile, avec back-office complet',
    resume:
      'Mise en relation de familles et de professionnels de l’accompagnement. Le back-office pilote toute l’activité : inscriptions, vérification des diplômes, rendez-vous, paiements, factures, campagnes, appels et objectifs. Le site, l’application iOS et Android et l’administration partagent la même base.',
    visuels: (
      <>
        <div className="grid gap-5 md:grid-cols-2">
          <Apparait><Navigateur src="/crm/neuro-accueil-ordi.webp" alt="Accueil du site NeuroCare" url="neuro-care.fr" /></Apparait>
          <Apparait delai={0.1}><Navigateur src="/crm/neuro-recherche-ordi.webp" alt="Recherche de professionnels sur carte" url="neuro-care.fr/recherche" /></Apparait>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
          {[
            ['app-accueil', 'Accueil de l’application'],
            ['app-recherche', 'Recherche'],
            ['app-profil', 'Profil d’un professionnel'],
            ['app-communaute', 'Communauté'],
            ['app-accueil3', 'Guides et services'],
          ].map(([f, alt], i) => (
            <Apparait key={f} delai={i * 0.08} className={i === 4 ? 'hidden md:block' : i === 3 ? 'hidden sm:block' : ''}>
              <Iphone src={`/crm/${f}.webp`} alt={alt} />
              <p className="mt-3 text-center text-xs text-black/50">{alt}</p>
            </Apparait>
          ))}
        </div>
        <div className="mt-24">
          <Apparait>
            <h4 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-4xl">L’espace des professionnels : séances, dossiers, factures.</h4>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-black/60">
              Chaque professionnel gère son activité depuis son espace : agenda, dossiers de suivi, messagerie, facturation. Écrans réels de l’outil, avec des données fictives.
            </p>
          </Apparait>
          <div className="mt-10 space-y-16">
            {ETAPES_PRO.map((e, i) => <Etape key={e.titre} {...e} inverse={i % 2 === 1} />)}
          </div>
        </div>
      </>
    ),
    modules: [
      'Cockpit et budgets de temps',
      'Fiches professionnels, familles, structures',
      'Campagnes email avec import CSV et suivi',
      'Relances automatiques',
      'Softphone et résumés d’appel',
      'Vérification des diplômes',
      'Paiements et reversements',
      'Factures, avoirs, export CSV',
      'Agenda synchronisé Google',
      'Messagerie et signalements',
      'Objectifs trimestriels',
      'Carte de la demande',
      'Mode séance et dictée vocale',
      'Transcription automatique des visios',
      'Facturation électronique Factur-X',
    ],
    integrations: ['Pennylane, facturation électronique', 'Stripe et Stripe Connect', 'Twilio Voice et SMS', 'Resend', 'Brevo', 'Claude (Anthropic)', 'Daily.co visio', 'Google Agenda', 'Google Ads et GA4', 'Meta Pixel et Conversions API', 'INSEE SIRET', 'Annuaire RPPS', 'OCR Tesseract', 'Calendly', 'Sentry'],
    stack: ['Next.js 14', 'React 18', 'Expo et React Native', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    stockage: 'Supabase Postgres, 93 migrations, environ 115 tables, sécurité ligne par ligne, 7 espaces de stockage de fichiers, connexion email, Google et Apple.',
    chiffres: [
      ['≈ 190', 'pages web'],
      ['≈ 300', 'routes d’API'],
      ['84', 'écrans mobiles'],
      ['10', 'tâches planifiées'],
    ],
  },
  {
    id: 'digitalz',
    nom: 'Digitalz Dev',
    type: 'Notre propre CRM, utilisé chaque jour',
    resume:
      'Nous avons construit le CRM qui fait tourner l’agence. Les leads des campagnes Meta arrivent seuls, on les appelle depuis leur fiche, on prend des notes, puis le devis devient une facture reliée aux encaissements et à la comptabilité. Il sert aussi à AvocatLeads, notre offre pour les avocats, avec une base de 81 101 cabinets à prospecter.',
    visuels: (
      <>
        <Apparait><Navigateur src="/crm/dz-home.webp" alt="Tableau de bord du CRM Digitalz" url="digitalzdev.com/dashboard" /></Apparait>
        <p className="mt-3 text-center text-xs text-black/45">Écrans réels du CRM, remplis de données fictives.</p>
        <div className="mt-20 space-y-20">
          {ETAPES_DZ.map((e, i) => <Etape key={e.titre} {...e} inverse={i % 2 === 1} />)}
        </div>
      </>
    ),
    modules: ['Clients et tunnel de vente', 'Prospection avec softphone', 'Script d’appel partagé', 'Base d’avocats enrichie', 'Devis, factures, paiements', 'Import de devis par IA', 'Simulateur fiscal', 'Projets, jalons, recette', 'Pointage et temps passé', 'Portail client', 'Messages et modèles SMS', 'Automatisations'],
    integrations: ['Twilio Voice et SMS', 'Resend', 'Claude (Anthropic)', 'Facebook Lead Ads', 'Meta Conversions API', 'Serper (positions Google)', 'Cloudflare Turnstile', 'Upstash Redis'],
    stack: ['React 18', 'Vite', 'TypeScript', 'Supabase Edge Functions', 'Next.js pour le tunnel', 'Vercel'],
    stockage: 'Supabase Postgres et Auth, 10 fonctions serveur, déclencheur en base qui prévient Meta à chaque changement de statut d’un lead.',
    chiffres: [
      ['81 101', 'avocats en base'],
      ['10', 'fonctions serveur'],
      ['17', 'modules'],
      ['CRM vers Meta', 'statuts synchronisés'],
    ],
  },
  {
    id: 'drive',
    nom: 'Drive',
    type: 'CRM et site pour un réseau d’agences automobiles en franchise',
    resume:
      'Un CRM multi-agences pour le franchiseur et chaque franchisé : prospects, ventes, stock de véhicules, livre de police, comptabilité complète et campagnes. Le site public affiche le catalogue issu du CRM et lui transmet chaque demande.',
    visuels: (
      <>
        <Apparait><Navigateur src="/screenshots/drive-hero.webp" alt="Site Drive" url="drive" /></Apparait>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {['drive-2', 'drive-3', 'drive-4'].map((f, i) => (
            <Apparait key={f} delai={i * 0.08}><Navigateur src={`/screenshots/${f}.webp`} alt="Catalogue Drive" url="drive / catalogue" /></Apparait>
          ))}
        </div>
      </>
    ),
    modules: [
      'Pipeline des prospects',
      'Ventes',
      'Contacts et journal d’activité',
      'Stock de véhicules et recherche par plaque',
      'Livre de police',
      'Devis, factures, bons de commande',
      'Cessions entre agences',
      'Facturation groupée et export',
      'Campagnes SMS et email',
      'Tableau de bord franchiseur et NPS',
      'Invitations et rôles',
      'Contenus du site éditables',
    ],
    integrations: ['Stripe abonnements et webhooks', 'Twilio SMS', 'Resend', 'Sanity', 'API d’immatriculation', 'Gemini et OpenAI pour l’assistant vocal', 'WhatsApp Business', 'Google Analytics'],
    stack: ['Next.js 16', 'React 19', 'shadcn/ui', 'Tailwind CSS 4', 'Zod', 'Vitest et Playwright', 'Vercel'],
    stockage: 'Supabase Postgres et Auth, 46 règles d’accès selon six rôles, Sanity pour les contenus. Le site lit le CRM par une API REST et lui transmet les leads.',
    chiffres: [
      ['58', 'écrans CRM'],
      ['56', 'routes d’API'],
      ['6', 'rôles'],
      ['15', 'fichiers de tests'],
    ],
  },
]

const ADSPILOT = {
  modules: ['Centre de commande des campagnes', 'Moteur de règles de budget', 'Génération de créas', 'Landing pages et leads', 'Tableau de tâches en glisser-déposer', 'Meilleures publicités', 'Liens de partage', 'Invitations et super admin'],
  integrations: ['Meta Marketing API', 'Claude (Anthropic)', 'Higgsfield vidéo IA', 'Hyros attribution', 'Google Sheets', 'ActiveCampaign', 'Calendly'],
  stack: ['Next.js 16', 'React 19', 'Tailwind CSS 4', 'dnd-kit', 'Workers Node sur serveur dédié', 'Supabase, 77 migrations'],
}

const INTEGRATIONS: [string, string[]][] = [
  ['Paiement', ['Stripe', 'Stripe Connect', 'Webhooks de paiement', 'Export CSV comptable']],
  ['Téléphonie et messages', ['Twilio Voice', 'Twilio SMS', 'WhatsApp Business', 'Daily.co visio']],
  ['Email', ['Resend', 'Brevo', 'ActiveCampaign', 'SMTP']],
  ['Intelligence artificielle', ['Claude (Anthropic)', 'Gemini', 'OpenAI', 'OCR Tesseract']],
  ['Google', ['Agenda', 'Analytics 4', 'Ads', 'Sheets']],
  ['Meta', ['Marketing API', 'Conversions API', 'Pixel', 'Lead Ads']],
  ['Données publiques', ['INSEE SIRET', 'Annuaire RPPS', 'Immatriculation', 'Annuaire CNB']],
  ['Contenu et suivi', ['Sanity', 'Calendly', 'Sentry', 'Hyros']],
]

const ARCHI: [string, string[]][] = [
  ['Site et tunnels', ['Next.js, rendu serveur, référencé', 'Formulaires et simulateurs', 'Leads envoyés au CRM']],
  ['CRM et back-office', ['Espaces par rôle', 'Tableaux de bord', 'Application mobile possible']],
  ['Base et serveur', ['Supabase Postgres', 'Sécurité ligne par ligne', 'Fichiers privés, tâches planifiées']],
  ['Services connectés', ['Paiement', 'Email, SMS, téléphonie', 'IA, Google, Meta']],
]

/** Pictogrammes au trait, dessinés sur une grille de 24. */
const ICONES: Record<string, ReactNode> = {
  role: <><circle cx="10" cy="7.5" r="3.5" /><path d="M3.5 20c0-3.9 2.9-6.5 6.5-6.5 1.2 0 2.3.3 3.2.8" /><path d="M17.5 13l3.5 1.4v2.7c0 2.2-1.5 3.9-3.5 4.9-2-1-3.5-2.7-3.5-4.9v-2.7z" /><path d="M16.2 17.4l.9.9 1.8-1.9" /></>,
  document: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h4" /><path d="M14 3l5 5h-4a1 1 0 01-1-1z" /><rect x="13" y="14" width="8" height="7" rx="1.5" /><path d="M15 14v-1.5a2 2 0 014 0V14" /><path d="M8 9h3M8 13h3" /></>,
  trace: <><rect x="4" y="4" width="13" height="17" rx="2" /><path d="M8 4V3h5v1" /><path d="M7.5 10h6M7.5 13.5h4" /><circle cx="17.5" cy="17.5" r="3.5" /><path d="M20 20l1.5 1.5" /></>,
  rgpd: <><path d="M12 2.8l7.5 3v5.4c0 4.6-3.1 8.4-7.5 10-4.4-1.6-7.5-5.4-7.5-10V5.8z" /><path d="M8.6 12.2l2.4 2.4 4.6-4.8" /></>,
  protection: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M3 8h18" /><rect x="6.5" y="11" width="3.5" height="3.5" rx=".8" /><path d="M7.4 12.8l.7.7 1.2-1.3" /><path d="M12.5 12.8h5" /><path d="M9 21h6M12 17v4" /></>,
  qualite: <><circle cx="12" cy="9" r="6" /><path d="M9.6 9.2l1.7 1.7 3.2-3.3" /><path d="M8.5 14l-1.5 7 5-2.5 5 2.5-1.5-7" /></>,
  cadrage: <><circle cx="9" cy="9" r="3" /><circle cx="16.5" cy="10" r="2.5" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M14.5 15.2c.6-.2 1.3-.2 2-.2 2.4 0 4 1.5 4 4" /></>,
  maquette: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8h18" /><rect x="6" y="11" width="5" height="4" rx=".8" /><path d="M14 11h4M14 14h3" /><path d="M9 21h6" /></>,
  modules: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><path d="M17 14v6M14 17h6" /></>,
  donnees: <><ellipse cx="12" cy="6" rx="7" ry="2.8" /><path d="M5 6v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6" /><path d="M5 12v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6" /></>,
  lancement: <><path d="M12 3c3.5 2 5 5.5 5 9l-2.5 3h-5L7 12c0-3.5 1.5-7 5-9z" /><circle cx="12" cy="9.5" r="1.6" /><path d="M9.5 15l-1.5 4 2.5-1.2M14.5 15l1.5 4-2.5-1.2" /></>,
}

function Picto({ nom, className = 'h-6 w-6' }: { nom: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONES[nom]}
    </svg>
  )
}

const SECURITE: [string, string, string][] = [
  ['Accès par rôle', 'role', 'Règles d’accès écrites en base de données : même une erreur d’interface ne peut pas exposer les données d’un autre compte.'],
  ['Documents privés', 'document', 'Pièces et contrats dans des espaces privés, servis par liens signés à durée limitée.'],
  ['Traçabilité', 'trace', 'Journal d’activité et journal d’audit des actions d’administration.'],
  ['RGPD', 'rgpd', 'Suppression des données par lien signé, email et téléphone hachés avant tout envoi publicitaire.'],
  ['Protection', 'protection', 'Limitation du nombre de requêtes et vérification anti-robot sur les formulaires.'],
  ['Qualité', 'qualite', 'Tests unitaires et tests de parcours sur les écrans critiques, alertes d’erreur en production.'],
]

const METHODE: [string, string, string][] = [
  ['Cadrage', 'cadrage', 'Ateliers avec vos équipes pour lister les parcours, les données et ce qui doit sortir des fichiers Excel.'],
  ['Maquettes', 'maquette', 'Les écrans principaux dessinés et validés avec vous avant toute ligne de code.'],
  ['Livraison par modules', 'modules', 'Chaque module est utilisable dès sa livraison, le suivant s’appuie sur vos retours.'],
  ['Reprise des données', 'donnees', 'Import de vos clients, contrats et historiques, contrôlé ligne à ligne.'],
  ['Mise en production', 'lancement', 'Formation des équipes, suivi rapproché, évolutions ensuite.'],
]

function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const monte = useTransform(scrollYProgress, [0, 1], [0, -90])
  const descend = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-5 pb-10 pt-32 md:pt-40">
      <Apparait>
        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.06] tracking-tight md:text-[68px]">
          Des CRM sur mesure, déjà en production.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-black/60">
          Fiches clients, facturation, paiements, téléphonie, relances, applications mobiles : voici les plateformes de gestion que nous avons conçues, intégrées et mises en ligne.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#realisations" className="rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-80">Voir les réalisations</a>
          <a href={CONTACT} className="rounded-full bg-black/[0.06] px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-black/[0.1]">Parler de votre projet</a>
        </div>
      </Apparait>

      <div className="relative mt-16 md:mt-20">
        <motion.div style={{ y: descend }}>
          <Apparait delai={0.15} className="md:w-[82%]">
            <Navigateur src="/crm/neuro-recherche-ordi.webp" alt="NeuroCare, recherche de professionnels" url="neuro-care.fr/recherche" />
          </Apparait>
        </motion.div>
        <motion.div style={{ y: monte }} className="absolute -bottom-10 right-0 hidden w-[23%] md:block">
          <Apparait delai={0.3}><Iphone src="/crm/app-accueil.webp" alt="Application NeuroCare" /></Apparait>
        </motion.div>
        <motion.div style={{ y: monte }} className="absolute -bottom-24 right-[19%] hidden w-[19%] md:block">
          <Apparait delai={0.4}><Iphone src="/crm/app-profil.webp" alt="Profil dans l’application NeuroCare" /></Apparait>
        </motion.div>
      </div>

      <div className="mt-24 grid grid-cols-2 gap-3 md:mt-36 md:grid-cols-4">
        {[
          ['4', 'plateformes en production'],
          ['30+', 'API tierces intégrées'],
          ['≈ 300 000', 'lignes de TypeScript'],
          ['400+', 'routes d’API écrites'],
        ].map(([v, l], i) => (
          <Apparait key={l} delai={i * 0.06}>
            <div className="rounded-2xl bg-[#F5F5F7] p-5">
              <p className="text-2xl font-semibold md:text-3xl">{v}</p>
              <p className="mt-1 text-sm text-black/55">{l}</p>
            </div>
          </Apparait>
        ))}
      </div>
    </section>
  )
}

export default function Crm() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white font-['Poppins',sans-serif] text-[#0A0A0A] antialiased selection:bg-black selection:text-white">
        {/* La barre de navigation de l'accueil, avec les couleurs du thème studio. */}
        <div style={THEME_STUDIO}>
          <Navbar />
        </div>

        <main>
          <Hero />

          <section id="savoir-faire" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <Titre sur="Savoir-faire" intro="Les briques qu’on retrouve dans tout CRM sérieux, et les projets où elles tournent déjà.">
              Ce que nous savons construire.
            </Titre>
            <div className="mt-12 grid gap-3 md:grid-cols-2">
              {SAVOIR_FAIRE.map(([t, d, ou], i) => (
                <Apparait key={t} delai={(i % 2) * 0.08}>
                  <article className="h-full rounded-2xl bg-[#F5F5F7] p-6">
                    <h3 className="text-lg font-semibold">{t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/60">{d}</p>
                    <p className="mt-4 text-xs font-medium text-black/45">En production sur {ou}</p>
                  </article>
                </Apparait>
              ))}
            </div>
          </section>

          <section id="realisations" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <Titre sur="Réalisations" intro="Pour chaque projet : de vraies captures, les modules, les services connectés, la technologie et le stockage des données.">
              Nos plateformes, en détail.
            </Titre>

            <div className="mt-20 space-y-36">
              {PROJETS.map((p) => (
                <article key={p.id} id={p.id}>
                  <Apparait>
                    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-end">
                      <div>
                        <h3 className="text-3xl font-semibold tracking-tight md:text-5xl">{p.nom}</h3>
                        <p className="mt-3 text-sm font-medium text-black/50">{p.type}</p>
                      </div>
                      <p className="text-[15px] leading-relaxed text-black/60">{p.resume}</p>
                    </div>
                  </Apparait>

                  <div className="mt-12">{p.visuels}</div>

                  <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {p.chiffres.map(([v, l], i) => (
                      <Apparait key={l} delai={i * 0.05}>
                        <div className="rounded-2xl bg-[#F5F5F7] p-5">
                          <p className="text-xl font-semibold">{v}</p>
                          <p className="text-xs text-black/50">{l}</p>
                        </div>
                      </Apparait>
                    ))}
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Apparait className="h-full">
                      <div className="h-full rounded-2xl bg-[#F5F5F7] p-6">
                        <p className="mb-4 text-sm font-semibold">Modules du back-office</p>
                        <Puces items={p.modules} />
                      </div>
                    </Apparait>
                    <div className="space-y-3">
                      <Apparait delai={0.08}>
                        <div className="rounded-2xl bg-[#F5F5F7] p-6">
                          <p className="mb-4 text-sm font-semibold">Intégrations API</p>
                          <Puces items={p.integrations} />
                        </div>
                      </Apparait>
                      <Apparait delai={0.12}>
                        <div className="rounded-2xl bg-[#F5F5F7] p-6">
                          <p className="mb-4 text-sm font-semibold">Technologies</p>
                          <Puces items={p.stack} />
                        </div>
                      </Apparait>
                    </div>
                  </div>
                  <Apparait>
                    <div className="mt-3 rounded-2xl bg-black p-6 text-white">
                      <p className="text-sm font-semibold">Stockage et architecture</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">{p.stockage}</p>
                    </div>
                  </Apparait>
                </article>
              ))}

              <article id="adspilot">
                <Apparait>
                  <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-end">
                    <div>
                      <h3 className="text-3xl font-semibold tracking-tight md:text-5xl">AdsPilot</h3>
                      <p className="mt-3 text-sm font-medium text-black/50">Back-office de pilotage publicitaire Meta, multi-clients</p>
                    </div>
                    <p className="text-[15px] leading-relaxed text-black/60">
                      Une plateforme pour piloter les campagnes Meta de plusieurs clients depuis un seul outil : suivi des dépenses et des leads jusqu’au rendez-vous, moteur qui ajuste les budgets chaque jour, génération de créas par IA et landing pages qui testent plusieurs accroches. Les traitements lourds tournent sur un serveur dédié, l’interface reste instantanée.
                    </p>
                  </div>
                </Apparait>
                <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ['592 839 €', 'de dépenses pilotées'],
                    ['75 560', 'leads suivis'],
                    ['165', 'campagnes'],
                    ['3 751', 'publicités'],
                  ].map(([v, l], i) => (
                    <Apparait key={l} delai={i * 0.05}>
                      <div className="rounded-2xl bg-black p-5 text-white">
                        <p className="text-xl font-semibold md:text-2xl">{v}</p>
                        <p className="text-xs text-white/55">{l}</p>
                      </div>
                    </Apparait>
                  ))}
                </div>
                <p className="mt-3 text-xs text-black/45">Données réelles « All Time » des deux comptes clients, au 17 novembre 2026.</p>
                <div className="mt-16 space-y-20">
                  {ETAPES_ADS.map((e, i) => <Etape key={e.titre} {...e} inverse={i % 2 === 1} />)}
                </div>
                <div className="mt-16 grid gap-3 md:grid-cols-3">
                  {[['Modules', ADSPILOT.modules], ['Intégrations API', ADSPILOT.integrations], ['Technologies et stockage', ADSPILOT.stack]].map(([t, items], i) => (
                    <Apparait key={t as string} delai={i * 0.08} className="h-full">
                      <div className="h-full rounded-2xl bg-[#F5F5F7] p-6">
                        <p className="mb-4 text-sm font-semibold">{t as string}</p>
                        <Puces items={items as string[]} />
                      </div>
                    </Apparait>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section id="integrations" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <Titre sur="Intégrations" intro="Paiement, téléphonie, email, IA, Google, Meta, registres publics : un CRM utile se branche sur les outils de l’entreprise.">
              Plus de trente services déjà branchés.
            </Titre>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {INTEGRATIONS.map(([cat, items], i) => (
                <Apparait key={cat} delai={(i % 4) * 0.06}>
                  <div className="h-full rounded-2xl bg-[#F5F5F7] p-6">
                    <p className="text-sm font-semibold">{cat}</p>
                    <ul className="mt-4 space-y-2">
                      {items.map((it) => (
                        <li key={it} className="text-sm text-black/65">{it}</li>
                      ))}
                    </ul>
                  </div>
                </Apparait>
              ))}
            </div>
          </section>

          <section id="architecture" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <Titre sur="Architecture" intro="Le socle commun de nos projets : un site rapide, un CRM avec des espaces par rôle, une base unique sécurisée et des services connectés.">
              Un seul socle pour le site, le CRM et le mobile.
            </Titre>
            <div className="mt-12 grid gap-3 md:grid-cols-4">
              {ARCHI.map(([t, items], i) => (
                <Apparait key={t} delai={i * 0.08}>
                  <div className={`h-full rounded-2xl p-6 ${i === 1 ? 'bg-black text-white' : 'bg-[#F5F5F7]'}`}>
                    <p className="text-base font-semibold">{t}</p>
                    <ul className="mt-4 space-y-2">
                      {items.map((it) => (
                        <li key={it} className={`text-sm ${i === 1 ? 'text-white/70' : 'text-black/60'}`}>{it}</li>
                      ))}
                    </ul>
                  </div>
                </Apparait>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <Titre sur="Sécurité et données">Des données protégées dès la conception.</Titre>
            <div className="mt-12 grid gap-3 md:grid-cols-3">
              {SECURITE.map(([t, ic, d], i) => (
                <Apparait key={t} delai={(i % 3) * 0.06}>
                  <div className="h-full rounded-2xl bg-[#F5F5F7] p-6">
                    <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2a2a2c] to-black text-white shadow-[0_14px_30px_-14px_rgba(0,0,0,0.7)] ring-1 ring-white/10"><Picto nom={ic} className="h-7 w-7" /></span>
                    <p className="text-base font-semibold">{t}</p>
                    <p className="mt-2 text-sm leading-relaxed text-black/60">{d}</p>
                  </div>
                </Apparait>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <Titre sur="Méthode" centre>Un CRM livré par modules, utilisable dès la première étape.</Titre>
            <ol className="mt-14 flex flex-col items-stretch gap-2 md:flex-row md:items-start md:gap-0">
              {METHODE.map(([t, ic, d], i) => (
                <li key={t} className="flex flex-col items-center md:flex-1 md:flex-row md:items-start">
                  <motion.div
                    className="flex w-full flex-col items-center text-center md:px-2"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-[0_16px_40px_-18px_rgba(0,0,0,0.6)]">
                      <Picto nom={ic} className="h-7 w-7" />
                    </span>
                    <p className="mt-5 text-base font-semibold">{t}</p>
                    <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-black/60">{d}</p>
                  </motion.div>
                  {i < METHODE.length - 1 && (
                    <motion.span
                      aria-hidden
                      className="my-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-black/60 md:my-0 md:mt-4"
                      initial={{ opacity: 0, scale: 0.6 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.4, delay: i * 0.18 + 0.12 }}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 rotate-90 md:rotate-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </motion.span>
                  )}
                </li>
              ))}
            </ol>
          </section>

        </main>

        <PiedDePage />
      </div>
    </MotionConfig>
  )
}

import type { ReactNode } from 'react'
import {
  MaquetteAds,
  MaquetteDigitalz,
  MaquetteDrive,
  MaquetteDriveCompta,
  MaquetteNeuro,
  MaquetteWage,
  TelephoneNeuro,
} from '../components/crm/Maquettes'

/*
 * Portfolio CRM préparé pour Wage Portage (portage salarial, ESN).
 *
 * Page autonome, hors de l'index : elle reprend la couleur menthe et la
 * Poppins de Wage Portage sur fond noir. Les chiffres viennent des dépôts
 * des projets cités ; les maquettes utilisent des données fictives.
 */

const CONTACT = 'mailto:zdigitalzdev@gmail.com?subject=CRM%20Wage%20Portage'

function Section({ id, sur, titre, intro, children }: { id?: string; sur: string; titre: ReactNode; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2EFFD1]">{sur}</p>
      <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-[44px]">{titre}</h2>
      {intro && <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60">{intro}</p>}
      <div className="mt-12">{children}</div>
    </section>
  )
}

function Puces({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <span key={i} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/75">
          {i}
        </span>
      ))}
    </div>
  )
}

/* Besoins d'un CRM de portage salarial, et où nous les avons déjà construits. */
const BESOINS: { besoin: string; detail: string; preuve: string }[] = [
  {
    besoin: 'ESN clientes et consultants',
    detail: 'Une fiche par entreprise et par consultant, avec historique des échanges, documents et statut.',
    preuve: 'Fiches professionnels, familles et structures sur NeuroCare, contacts et journal d’activité sur Drive.',
  },
  {
    besoin: 'Missions et comptes rendus d’activité',
    detail: 'Suivi des missions, saisie et validation des jours travaillés, relance des CRA manquants.',
    preuve: 'Missions et candidatures des structures sur NeuroCare, pointage et temps passé dans notre back-office.',
  },
  {
    besoin: 'Facturation des ESN',
    detail: 'Factures générées depuis les CRA validés, avoirs, numérotation légale, export comptable.',
    preuve: 'Factures, séries et avoirs avec export CSV sur NeuroCare, devis, factures, bons de commande et facturation groupée sur Drive.',
  },
  {
    besoin: 'Paiements et versements',
    detail: 'Encaissements, prélèvements, suivi des retards et versement aux consultants.',
    preuve: 'Stripe Connect et reversements aux professionnels sur NeuroCare, abonnements des franchisés sur Drive.',
  },
  {
    besoin: 'Simulateur de salaire',
    detail: 'Le consultant saisit son TJM et voit son net estimé, et la simulation devient un lead dans le CRM.',
    preuve: 'Simulateur fiscal dans notre back-office, leads du simulateur suivis sur NeuroCare.',
  },
  {
    besoin: 'Documents et conformité',
    detail: 'Contrats, pièces d’identité, attestations, stockés de façon privée et partagés par lien sécurisé.',
    preuve: 'Sept espaces de stockage privés et lecture OCR des diplômes sur NeuroCare, documents partagés par lien sur Drive.',
  },
  {
    besoin: 'Relances automatiques',
    detail: 'SMS et emails envoyés au bon moment : CRA manquant, facture impayée, pièce à fournir.',
    preuve: 'Neuf tâches planifiées sur NeuroCare, dont les rappels SMS toutes les quinze minutes, campagnes SMS et email sur Drive.',
  },
  {
    besoin: 'Rôles et droits d’accès',
    detail: 'Direction, commerciaux, gestionnaires de paie, comptabilité : chacun voit uniquement ce qui le concerne.',
    preuve: 'Six rôles et 46 règles d’accès en base sur Drive, plus de 110 tables protégées ligne par ligne sur NeuroCare.',
  },
  {
    besoin: 'Téléphonie et suivi commercial',
    detail: 'Appeler une ESN depuis sa fiche, garder la trace de l’appel, obtenir un résumé et les prochaines actions.',
    preuve: 'Softphone Twilio et résumés d’appel par IA sur NeuroCare, prospection téléphonique avec script partagé chez nous.',
  },
  {
    besoin: 'Pilotage',
    detail: 'Missions en cours, chiffre facturé, délais de paiement, satisfaction des consultants.',
    preuve: 'Objectifs trimestriels et taux de conversion sur NeuroCare, enquêtes NPS franchisés et clients sur Drive.',
  },
]

type Projet = {
  nom: string
  type: string
  resume: string
  visuel: ReactNode
  second?: ReactNode
  modules: string[]
  integrations: string[]
  stack: string[]
  stockage: string
  chiffres: [string, string][]
}

const PROJETS: Projet[] = [
  {
    nom: 'NeuroCare',
    type: 'Plateforme de santé, web et mobile, avec back-office complet',
    resume:
      'Mise en relation de familles et de professionnels de l’accompagnement. Le back-office pilote toute l’activité : inscriptions, vérification des diplômes, rendez-vous, paiements, factures, campagnes, appels et objectifs. Le site, l’application mobile et l’administration partagent la même base.',
    visuel: <MaquetteNeuro />,
    second: (
      <div className="grid items-center gap-6 md:grid-cols-[1.6fr_1fr]">
        <img src="/screenshots/neurocare-hero.webp" alt="Site public NeuroCare" loading="lazy" className="w-full rounded-2xl ring-1 ring-white/[0.06]" />
        <TelephoneNeuro />
      </div>
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
    ],
    integrations: ['Stripe et Stripe Connect', 'Twilio Voice et SMS', 'Resend', 'Brevo', 'Claude (Anthropic)', 'Daily.co visio', 'Google Agenda', 'Google Ads et GA4', 'Meta Pixel et Conversions API', 'INSEE SIRET', 'Annuaire RPPS', 'OCR Tesseract', 'Calendly', 'Sentry'],
    stack: ['Next.js 14', 'React 18', 'Expo et React Native', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    stockage: 'Supabase Postgres, 93 migrations, environ 115 tables, sécurité par ligne, 7 espaces de stockage de fichiers, authentification email, Google et Apple.',
    chiffres: [
      ['≈ 190', 'pages web'],
      ['≈ 300', 'routes d’API'],
      ['84', 'écrans mobiles'],
      ['10', 'tâches planifiées'],
    ],
  },
  {
    nom: 'Drive',
    type: 'CRM et site pour un réseau d’agences automobiles en franchise',
    resume:
      'Un CRM multi-agences pour le franchiseur et chaque franchisé : prospects, ventes, stock de véhicules, livre de police, comptabilité complète et campagnes. Le site public affiche le catalogue issu du CRM et y renvoie chaque demande.',
    visuel: <MaquetteDrive />,
    second: (
      <div className="grid items-center gap-6 md:grid-cols-2">
        <MaquetteDriveCompta />
        <img src="/screenshots/drive-hero.webp" alt="Site public Drive" loading="lazy" className="w-full rounded-2xl ring-1 ring-white/[0.06]" />
      </div>
    ),
    modules: [
      'Pipeline des prospects',
      'Ventes et contrats',
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
    stockage: 'Supabase Postgres et Auth, 46 règles d’accès par rôle, Sanity pour les contenus. Le site lit le CRM par une API REST et lui transmet les leads.',
    chiffres: [
      ['58', 'écrans CRM'],
      ['56', 'routes d’API'],
      ['6', 'rôles'],
      ['15', 'fichiers de tests'],
    ],
  },
  {
    nom: 'AdsPilot',
    type: 'Back-office de pilotage publicitaire Meta',
    resume:
      'Un centre de commande qui lance, coupe et ajuste les campagnes Meta, propose des décisions de budget à valider en un clic et suit chaque lead jusqu’au rendez-vous. Les traitements lourds tournent sur un serveur dédié, l’interface reste instantanée.',
    visuel: <MaquetteAds />,
    modules: ['Centre de commande des campagnes', 'Moteur de règles de budget', 'Génération de créas', 'Landing pages et leads', 'Tableau de tâches en glisser-déposer', 'Meilleures publicités', 'Liens de partage', 'Invitations et super admin'],
    integrations: ['Meta Marketing API', 'Claude (Anthropic)', 'Higgsfield vidéo IA', 'Hyros attribution', 'Google Sheets', 'ActiveCampaign', 'Calendly'],
    stack: ['Next.js 16', 'React 19', 'Tailwind CSS 4', 'dnd-kit', 'Workers Node sur serveur dédié', 'Vercel'],
    stockage: 'Supabase Postgres, 77 migrations, sécurité par ligne, clés API des clients chiffrées en base.',
    chiffres: [
      ['77', 'migrations'],
      ['≈ 60', 'routes d’API'],
      ['4', 'workers'],
      ['≈ 34 000', 'lignes de code'],
    ],
  },
  {
    nom: 'Digitalz back-office',
    type: 'Notre propre CRM, utilisé chaque jour',
    resume:
      'Le CRM de l’agence : clients, tunnel de vente, prospection téléphonique sur une base de 81 000 avocats, devis et factures, projets, pointage, messagerie et portail client. Les statuts du CRM remontent à Meta pour que les campagnes optimisent sur les vrais clients.',
    visuel: <MaquetteDigitalz />,
    modules: ['Clients et tunnel de vente', 'Prospection avec softphone', 'Script d’appel partagé', 'Base d’avocats enrichie', 'Devis, factures, paiements', 'Import de devis par IA', 'Simulateur fiscal', 'Projets, jalons, recette', 'Pointage et temps passé', 'Portail client', 'Messages et modèles SMS', 'Automatisations'],
    integrations: ['Twilio Voice et SMS', 'Resend', 'Claude (Anthropic)', 'Facebook Lead Ads', 'Meta Conversions API', 'Serper (positions Google)', 'Cloudflare Turnstile', 'Upstash Redis'],
    stack: ['React 18', 'Vite', 'TypeScript', 'Supabase Edge Functions', 'Next.js pour le tunnel', 'Vercel'],
    stockage: 'Supabase Postgres et Auth, 10 fonctions serveur, déclencheur base de données qui prévient Meta à chaque changement de statut.',
    chiffres: [
      ['81 101', 'avocats en base'],
      ['10', 'fonctions serveur'],
      ['17', 'modules'],
      ['CRM vers Meta', 'statuts synchronisés'],
    ],
  },
]

const INTEGRATIONS: [string, string[]][] = [
  ['Paiement et facturation', ['Stripe', 'Stripe Connect', 'Webhooks de paiement', 'Export CSV comptable']],
  ['Téléphonie et messages', ['Twilio Voice', 'Twilio SMS', 'WhatsApp Business', 'Daily.co visio']],
  ['Email', ['Resend', 'Brevo', 'ActiveCampaign', 'SMTP']],
  ['Intelligence artificielle', ['Claude (Anthropic)', 'Gemini', 'OpenAI', 'OCR Tesseract']],
  ['Google', ['Agenda', 'Analytics 4', 'Ads', 'Sheets']],
  ['Meta', ['Marketing API', 'Conversions API', 'Pixel', 'Lead Ads']],
  ['Données publiques', ['INSEE SIRET', 'Annuaire RPPS', 'Immatriculation', 'Annuaire CNB']],
  ['Contenu et suivi', ['Sanity', 'Calendly', 'Sentry', 'Hyros']],
]

const SECURITE: [string, string][] = [
  ['Accès par rôle', 'Chaque table est protégée en base : un gestionnaire ne lit que ses consultants, une ESN que ses missions.'],
  ['Données sensibles', 'Pièces d’identité, RIB et contrats dans des espaces privés, servis par liens signés à durée limitée.'],
  ['Traçabilité', 'Journal d’activité et journal d’audit des actions d’administration.'],
  ['RGPD', 'Demande de suppression par lien signé, email et téléphone hachés avant tout envoi à un service publicitaire.'],
  ['Protection des formulaires', 'Limitation du nombre de requêtes et vérification anti-robot.'],
  ['Qualité', 'Tests unitaires et tests de parcours sur les écrans critiques, alertes d’erreur en production.'],
]

const METHODE: [string, string][] = [
  ['Cadrage', 'Ateliers avec vos équipes : parcours d’une ESN, d’un consultant, d’un mois de paie. On liste ce qui doit sortir de vos fichiers Excel.'],
  ['Maquettes', 'Les écrans principaux dessinés et validés avec vous avant toute ligne de code.'],
  ['Livraison par modules', 'ESN et consultants d’abord, puis missions et CRA, puis facturation. Chaque module est utilisable dès sa livraison.'],
  ['Reprise des données', 'Import de vos ESN, consultants et missions en cours, contrôlé ligne à ligne.'],
  ['Mise en production', 'Formation des équipes, suivi rapproché les premières semaines, évolutions ensuite.'],
]

/* Architecture proposée, de gauche à droite. */
const ARCHI: { titre: string; items: string[]; fort?: boolean }[] = [
  { titre: 'Vitrine Wage Portage', items: ['Site refait, référencé', 'Simulateur de salaire', 'Formulaires ESN et consultants'] },
  { titre: 'CRM Wage Portage', items: ['Espace équipe', 'Espace ESN', 'Espace consultant'], fort: true },
  { titre: 'Base et serveur', items: ['Postgres et sécurité par ligne', 'Stockage privé des documents', 'Tâches planifiées et webhooks'] },
  { titre: 'Services connectés', items: ['Paiement et prélèvement', 'Email et SMS', 'Logiciel de paie et comptabilité, à cadrer'] },
]

export default function Crm() {
  return (
    <div className="min-h-screen bg-black font-['Poppins',sans-serif] text-white antialiased selection:bg-[#2EFFD1] selection:text-black">
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="text-sm font-semibold tracking-wide">
            Digitalz Dev <span className="px-1.5 text-white/35">pour</span>
            <span className="text-[#2EFFD1]">WAGE PORTAGE</span>
          </p>
          <nav className="hidden items-center gap-7 text-sm text-white/60 md:flex">
            <a href="#besoins" className="hover:text-white">Besoins</a>
            <a href="#realisations" className="hover:text-white">Réalisations</a>
            <a href="#integrations" className="hover:text-white">Intégrations</a>
            <a href="#architecture" className="hover:text-white">Architecture</a>
          </nav>
          <a href={CONTACT} className="rounded-full bg-[#2EFFD1] px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-85">
            Parlons du CRM
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#2EFFD1]/[0.08] blur-[120px]" />
          <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2EFFD1]">Proposition pour Wage Portage</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.08] md:text-[64px]">
              Le CRM du portage salarial, construit par une équipe qui en a déjà livré <span className="text-[#2EFFD1]">quatre</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              ESN, consultants, missions, comptes rendus d’activité, facturation et paie réunis dans un seul outil. Voici ce que nous avons déjà conçu, intégré et mis en production, et comment nous l’appliquerions à Wage Portage.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#realisations" className="rounded-full bg-[#2EFFD1] px-7 py-3.5 text-sm font-semibold text-black transition-opacity hover:opacity-85">
                Voir les réalisations
              </a>
              <a href="#architecture" className="rounded-full bg-white/[0.08] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.14]">
                L’architecture proposée
              </a>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ['4', 'back-offices en production'],
                ['30+', 'API tierces intégrées'],
                ['≈ 300 000', 'lignes de TypeScript'],
                ['400+', 'routes d’API écrites'],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-white/[0.04] p-5">
                  <p className="text-2xl font-semibold text-[#2EFFD1] md:text-3xl">{v}</p>
                  <p className="mt-1 text-sm text-white/55">{l}</p>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <MaquetteWage />
              <p className="mt-3 text-center text-xs text-white/40">Aperçu de principe du CRM Wage Portage, données fictives.</p>
            </div>
          </div>
        </section>

        <Section
          id="besoins"
          sur="Ce que le CRM doit tenir"
          titre="Chaque besoin du portage salarial, nous l’avons déjà construit ailleurs."
          intro="Un CRM de portage n’est pas un CRM commercial classique : il relie une ESN, un consultant, une mission, des jours travaillés, une facture et une paie. Voici les briques nécessaires et l’endroit où elles tournent déjà."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {BESOINS.map((b) => (
              <article key={b.besoin} className="rounded-2xl bg-white/[0.04] p-6">
                <h3 className="text-lg font-semibold text-white">{b.besoin}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{b.detail}</p>
                <p className="mt-4 rounded-xl bg-[#2EFFD1]/[0.06] p-3 text-[13px] leading-relaxed text-white/75">
                  <span className="font-semibold text-[#2EFFD1]">Déjà fait : </span>
                  {b.preuve}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <section id="realisations" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2EFFD1]">Réalisations</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight md:text-[44px]">Quatre plateformes de gestion, en détail.</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60">
            Pour chacune : les modules, les services connectés, la technologie et la façon dont les données sont stockées. Les écrans sont reproduits avec des données fictives pour protéger nos clients.
          </p>

          <div className="mt-16 space-y-28">
            {PROJETS.map((p) => (
              <article key={p.nom}>
                <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-end">
                  <div>
                    <h3 className="text-3xl font-semibold text-white md:text-4xl">{p.nom}</h3>
                    <p className="mt-2 text-sm font-medium text-[#2EFFD1]">{p.type}</p>
                  </div>
                  <p className="text-[15px] leading-relaxed text-white/60">{p.resume}</p>
                </div>

                <div className="mt-8">{p.visuel}</div>
                {p.second && <div className="mt-6">{p.second}</div>}

                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {p.chiffres.map(([v, l]) => (
                    <div key={l} className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-xl font-semibold text-white">{v}</p>
                      <p className="text-xs text-white/50">{l}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/[0.04] p-6">
                    <p className="mb-4 text-sm font-semibold text-white">Modules</p>
                    <Puces items={p.modules} />
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-white/[0.04] p-6">
                      <p className="mb-4 text-sm font-semibold text-white">Intégrations API</p>
                      <Puces items={p.integrations} />
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] p-6">
                      <p className="mb-4 text-sm font-semibold text-white">Technologies</p>
                      <Puces items={p.stack} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl bg-[#2EFFD1]/[0.06] p-6">
                  <p className="text-sm font-semibold text-[#2EFFD1]">Stockage et architecture</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{p.stockage}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <Section
          id="integrations"
          sur="Intégrations"
          titre="Plus de trente services déjà branchés, en production."
          intro="Paiement, téléphonie, email, IA, Google, Meta, registres publics : nous savons connecter un CRM aux outils de l’entreprise et à ceux de ses clients."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INTEGRATIONS.map(([cat, items]) => (
              <div key={cat} className="rounded-2xl bg-white/[0.04] p-6">
                <p className="text-sm font-semibold text-[#2EFFD1]">{cat}</p>
                <ul className="mt-4 space-y-2">
                  {items.map((i) => (
                    <li key={i} className="text-sm text-white/75">{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="architecture"
          sur="Architecture proposée"
          titre="Un seul socle pour le site, le CRM et les espaces clients."
          intro="La même architecture que nos projets en production : un site rapide et référencé, un CRM avec trois espaces, une base unique sécurisée, et des services connectés pour le paiement, les messages et la paie."
        >
          <div className="grid gap-3 md:grid-cols-4">
            {ARCHI.map((bloc) => (
              <div key={bloc.titre} className={`rounded-2xl p-6 ${bloc.fort ? 'bg-[#2EFFD1] text-black' : 'bg-white/[0.04]'}`}>
                <p className={`text-base font-semibold ${bloc.fort ? 'text-black' : 'text-white'}`}>{bloc.titre}</p>
                <ul className="mt-4 space-y-2">
                  {bloc.items.map((i) => (
                    <li key={i} className={`text-sm ${bloc.fort ? 'text-black/75' : 'text-white/65'}`}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {[
              ['Technologie', 'Next.js, React et TypeScript, hébergés sur Vercel. La technologie de nos quatre plateformes.'],
              ['Données', 'Supabase Postgres hébergé en Europe, sauvegardes automatiques, accès contrôlé table par table.'],
              ['Évolutif', 'Une API pour vos partenaires et une application mobile consultants possible sur le même socle, comme pour NeuroCare.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white/[0.04] p-6">
                <p className="text-sm font-semibold text-white">{t}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section sur="Sécurité et données" titre="Des données de paie se protègent dès la conception.">
          <div className="grid gap-3 md:grid-cols-3">
            {SECURITE.map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white/[0.04] p-6">
                <p className="text-base font-semibold text-white">{t}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section sur="Méthode" titre="Un CRM livré par modules, utilisable dès la première étape.">
          <div className="grid gap-3 md:grid-cols-5">
            {METHODE.map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white/[0.04] p-6">
                <p className="text-base font-semibold text-[#2EFFD1]">{t}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="relative overflow-hidden rounded-3xl bg-[#2EFFD1] px-8 py-14 text-center text-black md:py-20">
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">Zéro retard, zéro limite, un CRM à votre image.</h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-black/70">
              Le nouveau site et le CRM de Wage Portage, conçus ensemble. Parlons de vos process et de vos priorités.
            </p>
            <a href={CONTACT} className="mt-8 inline-flex rounded-full bg-black px-8 py-4 text-sm font-semibold text-white transition-opacity hover:opacity-85">
              Planifier un atelier de cadrage
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-xs text-white/40">
        Digitalz Dev, NEUROCARE SAS. Document préparé pour Wage Portage, novembre 2026.
      </footer>
    </div>
  )
}

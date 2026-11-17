import type { ReactNode } from 'react'
import { motion, MotionConfig, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

/*
 * Portfolio CRM et back-offices de Digitalz Dev.
 *
 * Fond blanc, noir en seconde couleur, Poppins. Toutes les images sont de
 * vraies captures : sites en ligne, et application mobile NeuroCare lancée
 * sur simulateur iPhone. Les chiffres viennent des dépôts des projets.
 */

const CONTACT = 'mailto:zdigitalzdev@gmail.com?subject=Projet%20CRM'

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
        <span className="mx-auto rounded-md bg-white px-4 py-0.5 text-[11px] text-black/45">{url}</span>
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

function Titre({ sur, children, intro }: { sur: string; children: ReactNode; intro?: ReactNode }) {
  return (
    <Apparait>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">{sur}</p>
      <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">{children}</h2>
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
        <div className="mt-12 grid items-center gap-5 md:grid-cols-[1.7fr_1fr]">
          <Apparait><Navigateur src="/crm/neuro-pro-ordi.webp" alt="Tunnel d’inscription des professionnels" url="pro.neuro-care.fr" /></Apparait>
          <Apparait delai={0.1} className="mx-auto w-[62%] md:w-[70%]"><Iphone src="/crm/neuro-pro-mobile.webp" web alt="Tunnel professionnels sur mobile" /></Apparait>
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
    ],
    integrations: ['Stripe et Stripe Connect', 'Twilio Voice et SMS', 'Resend', 'Brevo', 'Claude (Anthropic)', 'Daily.co visio', 'Google Agenda', 'Google Ads et GA4', 'Meta Pixel et Conversions API', 'INSEE SIRET', 'Annuaire RPPS', 'OCR Tesseract', 'Calendly', 'Sentry'],
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
  {
    id: 'digitalz',
    nom: 'Digitalz et AvocatLeads',
    type: 'Notre propre CRM, son site et son tunnel d’acquisition',
    resume:
      'Le CRM de l’agence : clients, tunnel de vente, prospection téléphonique sur une base de 81 101 avocats, devis et factures, projets, pointage, messagerie et portail client. Le site et le tunnel alimentent le CRM, et les statuts du CRM remontent à Meta pour que les campagnes optimisent sur les vrais clients.',
    visuels: (
      <>
        <div className="grid items-center gap-5 md:grid-cols-[1.7fr_1fr]">
          <Apparait><Navigateur src="/crm/avocatleads-ordi.webp" alt="Site AvocatLeads" url="digitalzdev.com/avocatleads" /></Apparait>
          <Apparait delai={0.1} className="mx-auto w-[62%] md:w-[70%]"><Iphone src="/crm/avocatleads-mobile.webp" web alt="AvocatLeads sur mobile" /></Apparait>
        </div>
        <div className="mt-5 grid items-center gap-5 md:grid-cols-[1fr_1.7fr]">
          <Apparait className="order-2 mx-auto w-[62%] md:order-1 md:w-[70%]"><Iphone src="/crm/quiz-mobile.webp" web alt="Tunnel quiz sur mobile" /></Apparait>
          <Apparait delai={0.1} className="order-1 md:order-2"><Navigateur src="/crm/quiz-ordi.webp" alt="Tunnel quiz" url="quiz.digitalzdev.com" /></Apparait>
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

const SECURITE: [string, string][] = [
  ['Accès par rôle', 'Règles d’accès écrites en base de données : même une erreur d’interface ne peut pas exposer les données d’un autre compte.'],
  ['Documents privés', 'Pièces et contrats dans des espaces privés, servis par liens signés à durée limitée.'],
  ['Traçabilité', 'Journal d’activité et journal d’audit des actions d’administration.'],
  ['RGPD', 'Suppression des données par lien signé, email et téléphone hachés avant tout envoi publicitaire.'],
  ['Protection', 'Limitation du nombre de requêtes et vérification anti-robot sur les formulaires.'],
  ['Qualité', 'Tests unitaires et tests de parcours sur les écrans critiques, alertes d’erreur en production.'],
]

const METHODE: [string, string][] = [
  ['Cadrage', 'Ateliers avec vos équipes pour lister les parcours, les données et ce qui doit sortir des fichiers Excel.'],
  ['Maquettes', 'Les écrans principaux dessinés et validés avec vous avant toute ligne de code.'],
  ['Livraison par modules', 'Chaque module est utilisable dès sa livraison, le suivant s’appuie sur vos retours.'],
  ['Reprise des données', 'Import de vos clients, contrats et historiques, contrôlé ligne à ligne.'],
  ['Mise en production', 'Formation des équipes, suivi rapproché, évolutions ensuite.'],
]

function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const monte = useTransform(scrollYProgress, [0, 1], [0, -90])
  const descend = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-5 pb-10 pt-14 md:pt-24">
      <Apparait>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Portfolio CRM et back-offices</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-tight md:text-[68px]">
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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <a href="/crm" className="text-sm font-semibold tracking-wide">Digitalz Dev</a>
            <nav className="hidden items-center gap-7 text-sm text-black/55 md:flex">
              <a href="#savoir-faire" className="hover:text-black">Savoir-faire</a>
              <a href="#realisations" className="hover:text-black">Réalisations</a>
              <a href="#integrations" className="hover:text-black">Intégrations</a>
              <a href="#architecture" className="hover:text-black">Architecture</a>
            </nav>
            <a href={CONTACT} className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80">Nous contacter</a>
          </div>
        </header>

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
                  <div className="rounded-3xl bg-black p-8 text-white md:p-12">
                    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-end">
                      <div>
                        <h3 className="text-3xl font-semibold tracking-tight md:text-5xl">AdsPilot</h3>
                        <p className="mt-3 text-sm font-medium text-white/55">Back-office de pilotage publicitaire Meta</p>
                      </div>
                      <p className="text-[15px] leading-relaxed text-white/65">
                        Un centre de commande qui lance, coupe et ajuste les campagnes Meta, propose des décisions de budget à valider en un clic et suit chaque lead jusqu’au rendez-vous. Les traitements lourds tournent sur un serveur dédié, l’interface reste instantanée.
                      </p>
                    </div>
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                      <div>
                        <p className="mb-4 text-sm font-semibold">Modules</p>
                        <Puces sombre items={ADSPILOT.modules} />
                      </div>
                      <div>
                        <p className="mb-4 text-sm font-semibold">Intégrations API</p>
                        <Puces sombre items={ADSPILOT.integrations} />
                      </div>
                      <div>
                        <p className="mb-4 text-sm font-semibold">Technologies et stockage</p>
                        <Puces sombre items={ADSPILOT.stack} />
                      </div>
                    </div>
                  </div>
                </Apparait>
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
              {SECURITE.map(([t, d], i) => (
                <Apparait key={t} delai={(i % 3) * 0.06}>
                  <div className="h-full rounded-2xl bg-[#F5F5F7] p-6">
                    <p className="text-base font-semibold">{t}</p>
                    <p className="mt-2 text-sm leading-relaxed text-black/60">{d}</p>
                  </div>
                </Apparait>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <Titre sur="Méthode">Un CRM livré par modules, utilisable dès la première étape.</Titre>
            <div className="mt-12 grid gap-3 md:grid-cols-5">
              {METHODE.map(([t, d], i) => (
                <Apparait key={t} delai={i * 0.06}>
                  <div className="h-full rounded-2xl bg-[#F5F5F7] p-6">
                    <p className="text-base font-semibold">{t}</p>
                    <p className="mt-2 text-sm leading-relaxed text-black/60">{d}</p>
                  </div>
                </Apparait>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 pb-24">
            <Apparait>
              <div className="rounded-3xl bg-black px-8 py-14 text-center text-white md:py-20">
                <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">Un CRM à l’image de votre activité.</h2>
                <p className="mx-auto mt-5 max-w-xl text-base text-white/65">Parlons de vos process, de vos outils actuels et de vos priorités.</p>
                <a href={CONTACT} className="mt-8 inline-flex rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-opacity hover:opacity-85">
                  Planifier un échange
                </a>
              </div>
            </Apparait>
          </section>
        </main>

        <footer className="mx-auto max-w-6xl px-5 pb-10 text-xs text-black/40">Digitalz Dev, NEUROCARE SAS.</footer>
      </div>
    </MotionConfig>
  )
}

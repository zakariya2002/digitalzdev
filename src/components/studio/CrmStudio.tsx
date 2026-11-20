import { Link } from 'react-router-dom'

/**
 * Les CRM déjà livrés, juste après les réalisations : chiffres d'ensemble,
 * une carte par plateforme avec une vraie capture, puis le renvoi vers /crm
 * où chaque projet est détaillé.
 */

const CHIFFRES: [string, string][] = [
  ['4', 'plateformes en production'],
  ['30+', 'API tierces intégrées'],
  ['≈ 300 000', 'lignes de TypeScript'],
  ['400+', 'routes d’API écrites'],
]

const CRM: { nom: string; type: string; image: string; url: string; chiffres: [string, string][] }[] = [
  {
    nom: 'NeuroCare',
    type: 'Plateforme web et mobile, avec back-office complet',
    image: '/crm/neuro-recherche-ordi.webp',
    url: 'neuro-care.fr',
    chiffres: [['≈ 190', 'pages web'], ['84', 'écrans mobiles']],
  },
  {
    nom: 'Digitalz Dev',
    type: 'Notre propre CRM, utilisé chaque jour',
    image: '/crm/dz-home.webp',
    url: 'digitalzdev.com/dashboard',
    chiffres: [['17', 'modules'], ['10', 'fonctions serveur']],
  },
  {
    nom: 'Drive',
    type: 'CRM multi-agences pour un réseau automobile en franchise',
    image: '/screenshots/drive-hero.webp',
    url: 'drive',
    chiffres: [['58', 'écrans CRM'], ['6', 'rôles']],
  },
  {
    nom: 'AdsPilot',
    type: 'Pilotage des campagnes Meta de plusieurs clients',
    image: '/crm/ads-overview-all.webp',
    url: 'adspilot',
    chiffres: [['592 839 €', 'de dépenses pilotées'], ['75 560', 'leads suivis']],
  },
]

function Carte({ crm }: { crm: (typeof CRM)[number] }) {
  return (
    <Link to="/crm" data-curseur="Voir" className="group block">
      <div className="overflow-hidden rounded-2xl bg-surface-card">
        <div className="flex items-center gap-1.5 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-text-primary/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-text-primary/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-text-primary/15" />
          <span className="ml-3 truncate text-xs text-text-secondary">{crm.url}</span>
        </div>
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={crm.image}
            alt={`${crm.nom}, capture réelle`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        </div>
      </div>
      <h3 className="mt-5 text-2xl font-normal tracking-tight text-text-primary md:text-3xl">{crm.nom}</h3>
      <p className="mt-1 text-sm font-medium text-text-secondary md:text-base">{crm.type}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {crm.chiffres.map(([v, l]) => (
          <span key={l} className="rounded-full bg-surface-card px-3 py-1 text-xs font-medium text-text-secondary">
            <span className="text-text-primary">{v}</span> {l}
          </span>
        ))}
      </div>
    </Link>
  )
}

export default function CrmStudio() {
  return (
    <section id="crm" className="bg-surface px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-text-muted">CRM et back-offices</p>
            <h2 className="mt-3 text-4xl font-extrabold uppercase tracking-tight text-text-primary md:text-5xl">
              Des CRM sur mesure, déjà en production
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
              Leads, appels, devis, factures, paiements et comptabilité réunis dans un seul outil. Voici les plateformes de gestion que nous avons conçues et mises en ligne.
            </p>
          </div>
          <Link
            to="/crm"
            className="inline-flex min-h-[56px] shrink-0 items-center self-start rounded-full bg-accent px-8 text-base font-medium text-surface transition-colors hover:bg-accent-hover md:self-auto"
          >
            Voir nos CRM en détail
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {CHIFFRES.map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-surface-light p-5">
              <p className="text-2xl font-semibold text-text-primary md:text-3xl">{v}</p>
              <p className="mt-1 text-sm text-text-secondary">{l}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {CRM.map((c) => (
            <Carte key={c.nom} crm={c} />
          ))}
        </div>
      </div>
    </section>
  )
}

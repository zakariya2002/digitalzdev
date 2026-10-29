import { projects } from '../data/projects'

/**
 * Métadonnées de référencement, une entrée par page.
 *
 * Jusqu'ici le site était une application monopage servant le même `<title>`
 * et la même description sur toutes les routes : Google ne pouvait
 * distinguer aucune page des autres. Ce fichier est la source unique, lue à
 * la fois par le composant `Seo` (navigation côté client) et par le script
 * de pré-rendu (HTML statique servi aux robots).
 */

export const SITE_URL = 'https://digitalzdev.com'
export const SITE_NAME = 'Digitalz Dev'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export interface PageSeo {
  path: string
  title: string
  description: string
  /** Page d'atterrissage publicitaire, tenue hors de l'index. */
  noindex?: boolean
  /** Image de partage propre à la page, chemin depuis la racine du site. */
  image?: string
  /** Largeur et hauteur de cette image, en pixels. */
  imageSize?: [number, number]
  imageAlt?: string
  /** Nom du site affiché au partage, si la page porte une autre marque. */
  siteName?: string
  /** Icône d'onglet propre à la page. */
  icon?: string
}

/** Titre affiché dans l'onglet et en résultat de recherche. Viser 50 à 60 signes. */
const HOME: PageSeo = {
  path: '/',
  title: "Agence web pour avocats et cabinets d'avocats | Digitalz Dev",
  description:
    "Sites internet sur mesure pour avocats et cabinets d'avocats : domaines d'intervention, prise de rendez-vous en ligne et référencement local. Devis sous 48 h.",
}

const STATIC_PAGES: PageSeo[] = [
  HOME,
  {
    path: '/avocatleads',
    title: 'AvocatLeads | Création de site internet pour avocats',
    description:
      "Sites internet pour avocats, conformes au RIN : une page par domaine d'intervention, prise de rendez-vous en ligne et référencement local. Devis sous 48 h.",
    image: '/og-avocatleads.png',
    imageSize: [2400, 1260],
    imageAlt: "AvocatLeads : le site qui amène des clients à votre cabinet. Sites internet pour avocats, conformes aux règles de la profession.",
    siteName: 'AvocatLeads',
    icon: '/avocatleads-icon.svg',
  },
  {
    path: '/contact',
    title: "Devis gratuit pour le site de votre cabinet d'avocats | Digitalz Dev",
    description:
      "Avocats : décrivez le site de votre cabinet en deux minutes (domaines d'intervention, budget, délais). Réponse sous 24 à 48 h avec un devis adapté.",
  },
  {
    path: '/projet',
    title: 'Parlons de votre site | Digitalz Dev',
    description:
      "Avocats : quatre questions sur votre cabinet et votre site, puis on en parle directement sur WhatsApp. Réponse rapide, devis adapté.",
    noindex: true,
  },
  {
    path: '/mentions-legales',
    title: 'Mentions légales | Digitalz Dev',
    description:
      "Mentions légales du site digitalzdev.com : éditeur, directeur de la publication, hébergeur et propriété intellectuelle.",
  },
  {
    path: '/politique-confidentialite',
    title: 'Politique de confidentialité | Digitalz Dev',
    description:
      "Comment Digitalz Dev collecte et traite vos données personnelles : finalités, durée de conservation, destinataires et exercice de vos droits.",
  },
]

/** Une entrée par réalisation, dérivée des données projet. */
const PROJECT_PAGES: PageSeo[] = projects.map((project) => ({
  path: project.route,
  title: `${project.title}, ${project.subtitle.toLowerCase()} | Réalisation Digitalz Dev`,
  // La description du projet est déjà rédigée pour être lue : on la reprend,
  // en la bornant à la longueur qu'un extrait Google affiche réellement.
  description: truncate(
    `${project.description} Un projet conçu et développé par Digitalz Dev, agence web pour avocats.`,
    158
  ),
}))

export const ALL_PAGES: PageSeo[] = [...STATIC_PAGES, ...PROJECT_PAGES]

const NOT_FOUND: PageSeo = {
  path: '/404',
  title: 'Page introuvable | Digitalz Dev',
  description: "Cette page n'existe pas ou plus. Retrouvez nos réalisations et nos services sur digitalzdev.com.",
}

/** Coupe au dernier mot entier avant la limite, sans laisser de ponctuation orpheline. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[ ,;:]$/, '') + '…'
}

export function seoForPath(pathname: string): PageSeo {
  const clean = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  return ALL_PAGES.find((page) => page.path === clean) ?? NOT_FOUND
}

/** URL canonique absolue d'une page. */
export const canonicalFor = (path: string) =>
  path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`

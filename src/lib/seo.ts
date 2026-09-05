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
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`

export interface PageSeo {
  path: string
  title: string
  description: string
}

/** Titre affiché dans l'onglet et en résultat de recherche. Viser 50 à 60 signes. */
const HOME: PageSeo = {
  path: '/',
  title: 'Agence web et création de site internet | Digitalz Dev',
  description:
    "Agence web en Île-de-France : création de site internet sur mesure, site vitrine, boutique Shopify et application métier. Devis sous 48 h.",
}

const STATIC_PAGES: PageSeo[] = [
  HOME,
  {
    path: '/contact',
    title: 'Devis gratuit pour votre projet de site internet | Digitalz Dev',
    description:
      "Décrivez votre projet de site internet en deux minutes : type de site, budget, délais. Réponse sous 24 à 48 h avec un devis adapté par notre agence web.",
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
    `${project.description} Un projet conçu et développé par Digitalz Dev, agence web.`,
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

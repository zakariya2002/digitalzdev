/**
 * Génère public/sitemap.xml et public/robots.txt.
 *
 * Le plan du site était maintenu à la main et avait déjà pris trois projets
 * de retard : le régénérer à chaque build supprime la classe de bug. Le
 * fichier robots suit le même chemin, pour que l'adresse du site ne soit
 * écrite qu'une fois et que les deux ne puissent pas diverger.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://digitalzdev.com'

const source = readFileSync(resolve(root, 'src/data/projects.ts'), 'utf8')

/**
 * Dates déjà écrites dans le plan du site précédent.
 *
 * Le dépôt est cloné en profondeur limitée sur la plateforme de
 * déploiement : `git log` peut n'avoir aucune trace d'un fichier qui n'a pas
 * bougé depuis longtemps, et renverrait alors une date vide pour les pages
 * les plus stables, c'est-à-dire justement celles dont la date est la plus
 * sûre. Le fichier précédent est versionné : il sert de mémoire.
 */
function datesConnues() {
  try {
    const precedent = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8')
    const paires = [
      ...precedent.matchAll(
        /<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g
      ),
    ]
    return new Map(paires.map((m) => [m[1], m[2]]))
  } catch {
    return new Map()
  }
}

const memoire = datesConnues()

// On lit les routes par expression régulière plutôt qu'en important le module :
// le script tourne sous node, sans passer par la chaîne TypeScript.
const routes = [...source.matchAll(/^\s*route:\s*'([^']+)',/gm)].map((m) => m[1])

if (routes.length === 0) {
  throw new Error("Aucune route projet trouvée dans src/data/projects.ts")
}

/**
 * Date du dernier commit ayant touché un fichier, au format ISO.
 *
 * Google se sert de `lastmod` quand il le trouve honnête, et l'ignore
 * durablement quand il le prend à mentir : une date du jour sur toutes les
 * pages à chaque déploiement est le moyen le plus sûr de perdre ce signal.
 * L'historique de git dit la vérité sans qu'on ait à la tenir.
 */
function derniereModification(fichier) {
  try {
    const sortie = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', fichier],
      // L'erreur de git est attendue hors dépôt : on la lit dans le code de
      // sortie, pas besoin de la déverser dans le journal de construction.
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim()
    return sortie ? sortie.slice(0, 10) : null
  } catch {
    // Construction hors dépôt, ou fichier jamais commité : pas de date, ce qui
    // vaut mieux qu'une date fausse.
    return null
  }
}

const pages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0', source: 'src/pages/Home.tsx' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.8', source: 'src/pages/Contact.tsx' },
  // Les pages projet sont toutes rendues par le même composant à partir du
  // même fichier de données : leur date de mise à jour est celle de ce couple.
  ...routes.map((loc) => ({
    loc,
    changefreq: 'monthly',
    priority: '0.7',
    source: 'src/data/projects.ts',
  })),
  {
    loc: '/mentions-legales',
    changefreq: 'yearly',
    priority: '0.3',
    source: 'src/pages/MentionsLegales.tsx',
  },
  {
    loc: '/politique-confidentialite',
    changefreq: 'yearly',
    priority: '0.3',
    source: 'src/pages/PolitiqueConfidentialite.tsx',
  },
].map((page) => ({
  ...page,
  lastmod:
    derniereModification(page.source) ?? memoire.get(`${ORIGIN}${page.loc}`) ?? null,
}))

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Généré par scripts/generate-sitemap.mjs, ne pas éditer à la main. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${ORIGIN}${page.loc}</loc>${page.lastmod ? `
    <lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

writeFileSync(resolve(root, 'public/sitemap.xml'), xml)

/**
 * Ce que les robots n'ont rien à explorer.
 *
 * L'espace client s'ouvre avec un jeton dans l'adresse. Un jeton indexé n'est
 * plus un secret : il suffit d'une recherche pour tomber sur le dossier de
 * quelqu'un d'autre. Le tableau de bord et la page de connexion n'ont pas cet
 * enjeu, mais ils n'apportent rien non plus à un moteur de recherche.
 *
 * Ce fichier n'est pas une sécurité, seulement une consigne que les robots
 * honnêtes respectent : ce qui protège vraiment l'espace client, c'est son
 * jeton, pas cette ligne.
 */
const robots = `User-agent: *
Allow: /
Disallow: /espace/
Disallow: /dashboard
Disallow: /login

Sitemap: ${ORIGIN}/sitemap.xml
`

writeFileSync(resolve(root, 'public/robots.txt'), robots)
console.log(
  `sitemap.xml : ${pages.length} URLs (${routes.length} projets), ` +
    `${pages.filter((p) => p.lastmod).length} datées`
)
console.log('robots.txt : 3 chemins privés écartés')

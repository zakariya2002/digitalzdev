/**
 * Génère public/sitemap.xml à partir des routes projets déclarées dans
 * src/data/projects.ts.
 *
 * Le fichier était maintenu à la main et avait déjà pris trois projets de
 * retard : le régénérer à chaque build supprime la classe de bug.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://digitalzdev.com'

const source = readFileSync(resolve(root, 'src/data/projects.ts'), 'utf8')

// On lit les routes par expression régulière plutôt qu'en important le module :
// le script tourne sous node, sans passer par la chaîne TypeScript.
const routes = [...source.matchAll(/^\s*route:\s*'([^']+)',/gm)].map((m) => m[1])

if (routes.length === 0) {
  throw new Error("Aucune route projet trouvée dans src/data/projects.ts")
}

const pages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
  ...routes.map((loc) => ({ loc, changefreq: 'monthly', priority: '0.7' })),
  { loc: '/mentions-legales', changefreq: 'yearly', priority: '0.3' },
  { loc: '/politique-confidentialite', changefreq: 'yearly', priority: '0.3' },
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Généré par scripts/generate-sitemap.mjs — ne pas éditer à la main. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${ORIGIN}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

writeFileSync(resolve(root, 'public/sitemap.xml'), xml)
console.log(`sitemap.xml : ${pages.length} URLs (${routes.length} projets)`)

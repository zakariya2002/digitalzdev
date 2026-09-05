/**
 * Écrit un fichier HTML par page dans dist/, avec ses propres balises de
 * référencement.
 *
 * Le site est une application monopage : sans ce passage, toutes les URL
 * renvoient le même index.html, donc le même titre et la même description
 * pour Google. Le JavaScript corrige bien le `<head>` une fois exécuté, mais
 * un robot qui ne rend pas le JavaScript, un aperçu de lien sur les réseaux
 * ou un partage par messagerie ne voient que le HTML brut.
 *
 * Vercel sert un fichier statique existant avant d'appliquer la réécriture
 * vers index.html : déposer dist/contact/index.html suffit à ce que /contact
 * réponde avec son propre HTML.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

if (!existsSync(join(dist, 'index.html'))) {
  throw new Error('dist/index.html absent : lancer le build avant le pré-rendu.')
}

// Les métadonnées vivent dans un module TypeScript consommé par l'application.
// Plutôt que d'ajouter une étape de compilation pour ce script, on relit les
// mêmes sources et on en extrait les valeurs.
const seoSource = readFileSync(join(root, 'src/lib/seo.ts'), 'utf8')
const projectsSource = readFileSync(join(root, 'src/data/projects.ts'), 'utf8')

const SITE_URL = 'https://digitalzdev.com'

/** Extrait les couples path / title / description des littéraux du module. */
function parseStaticPages(source) {
  const pages = []
  const blocks = source.matchAll(
    /path:\s*'([^']+)',\s*title:\s*'([^']*)',\s*description:\s*\n?\s*"([^"]*)"/g
  )
  for (const m of blocks) pages.push({ path: m[1], title: m[2], description: m[3] })
  return pages
}

function parseProjects(source) {
  const routes = [...source.matchAll(/route:\s*'([^']+)',/g)].map((m) => m[1])
  const titles = [...source.matchAll(/^\s{4}title:\s*'([^']+)',$/gm)].map((m) => m[1])
  const subtitles = [...source.matchAll(/^\s{4}subtitle:\s*'([^']+)',$/gm)].map((m) => m[1])
  const descriptions = [
    ...source.matchAll(/^\s{4}description:\n\s+["'](.+?)["'],$/gms),
  ].map((m) => m[1])

  return routes.map((route, i) => {
    const raw = `${descriptions[i] ?? ''} Un projet conçu et développé par Digitalz Dev, agence web.`
    return {
      path: route,
      title: `${titles[i]}, ${(subtitles[i] ?? '').toLowerCase()} | Réalisation Digitalz Dev`,
      description: truncate(raw.trim(), 158),
    }
  })
}

function truncate(text, max) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[ ,;:]$/, '') + '…'
}

const escape = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const pages = [...parseStaticPages(seoSource), ...parseProjects(projectsSource)]

if (pages.length < 5) {
  throw new Error(
    `Pré-rendu : seulement ${pages.length} pages extraites, l'analyse des sources a échoué.`
  )
}

const template = readFileSync(join(dist, 'index.html'), 'utf8')

for (const page of pages) {
  const url = page.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${page.path}`
  let html = template

  html = html.replace(/<title>.*?<\/title>/s, `<title>${escape(page.title)}</title>`)
  html = html.replace(
    /<meta name="description" content=".*?" \/>/s,
    `<meta name="description" content="${escape(page.description)}" />`
  )
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/s,
    `<link rel="canonical" href="${url}" />`
  )
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/s,
    `<meta property="og:title" content="${escape(page.title)}" />`
  )
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/s,
    `<meta property="og:description" content="${escape(page.description)}" />`
  )
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/s,
    `<meta property="og:url" content="${url}" />`
  )
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/s,
    `<meta name="twitter:title" content="${escape(page.title)}" />`
  )
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/s,
    `<meta name="twitter:description" content="${escape(page.description)}" />`
  )

  if (page.path === '/') {
    writeFileSync(join(dist, 'index.html'), html)
  } else {
    const dir = join(dist, page.path)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html)
  }
}

console.log(`pré-rendu : ${pages.length} pages écrites dans dist/`)

/**
 * Écrit un fichier HTML par page dans dist/, avec ses propres balises de
 * référencement et son contenu déjà rendu.
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
 *
 * Depuis le rendu serveur, le corps de la page est écrit lui aussi. Auparavant
 * seules les balises du `<head>` l'étaient, et le HTML servi ne contenait
 * qu'une cinquantaine de caractères de texte : Google n'avait rien à indexer
 * tant qu'il n'avait pas exécuté le JavaScript, ce qu'il fait tard et sans
 * garantie. Une seule page sur douze était indexée.
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

// Le paquet serveur est construit juste avant par `vite build --ssr`. Son
// absence n'interrompt pas le pré-rendu : on retombe sur l'ancien
// comportement, des balises correctes et un corps vide, plutôt que de casser
// la mise en ligne.
/** Longueur du texte visible d'un fragment HTML, balises retirées. */
function texteBrut(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Volume rendu par page, pour le contrôle de sortie. */
const mesures = []

let rendre = null
try {
  ;({ render: rendre } = await import(
    new URL('../dist-ssr/entry-server.js', import.meta.url).href
  ))
} catch (err) {
  console.warn(
    `pré-rendu : paquet serveur introuvable (${err.message}), le corps des pages restera vide.`
  )
}

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

  if (rendre) {
    const corps = rendre(page.path)
    mesures.push({ path: page.path, taille: texteBrut(corps).length })
    // On remplace le conteneur vide par le même conteneur, rempli. La chaîne
    // recherchée est celle qu'écrit Vite, sans espace : si elle changeait, le
    // contrôle plus bas s'en apercevrait.
    html = html.replace('<div id="root"></div>', `<div id="root">${corps}</div>`)
  }

  if (page.path === '/') {
    writeFileSync(join(dist, 'index.html'), html)
  } else {
    const dir = join(dist, page.path)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html)
  }
}

// Contrôle de sortie : une page dont le corps n'a pas été injecté est une
// régression silencieuse, exactement le défaut qu'on vient de corriger. On
// mesure pendant le rendu plutôt qu'en relisant le fichier.
if (rendre) {
  // La page d'erreur tient en trois lignes, c'est sa nature.
  const maigres = mesures.filter((m) => m.path !== '/404' && m.taille < 500)
  if (maigres.length > 0) {
    throw new Error(
      `Pré-rendu : ${maigres.length} page(s) rendues presque vides : ` +
        maigres.map((m) => `${m.path} (${m.taille} car.)`).join(', ')
    )
  }
  const total = mesures.reduce((n, m) => n + m.taille, 0)
  console.log(
    `pré-rendu : corps injecté sur ${mesures.length} pages, ${total} caractères au total`
  )
}

console.log(`pré-rendu : ${pages.length} pages écrites dans dist/`)

// Rend scripts/og-image.html en public/og-image.png (1200 × 675, 16:9, en 2x)
// avec Chrome sans interface. À relancer quand le haut de page change :
//   node scripts/generate-og-image.mjs
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const racine = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const gabarit = pathToFileURL(path.join(racine, 'scripts/og-image.html')).href
const sortie = path.join(racine, 'public/og-image.png')
const chrome =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

execFileSync(chrome, [
  '--headless=new',
  '--hide-scrollbars',
  '--allow-file-access-from-files',
  '--force-device-scale-factor=2',
  '--window-size=1200,675',
  '--virtual-time-budget=3000',
  `--screenshot=${sortie}`,
  gabarit,
], { stdio: 'inherit' })

console.log(`aperçu de lien : ${path.relative(racine, sortie)}`)

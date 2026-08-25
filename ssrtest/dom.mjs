import { JSDOM } from 'jsdom'
import { readFileSync } from 'fs'

const session = JSON.parse(readFileSync('/tmp/session.json', 'utf8'))
const REF = 'uipxlesrpdocqpblmrrr'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'https://www.digitalzdev.com/dashboard/messages',
  pretendToBeVisual: true,
})

// Session déposée comme le ferait une vraie connexion
const store = new Map()
store.set(`sb-${REF}-auth-token`, JSON.stringify({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
  expires_at: session.expires_at,
  expires_in: session.expires_in,
  token_type: 'bearer',
  user: session.user,
}))
const localStorageMock = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
  key: (i) => [...store.keys()][i] ?? null,
  get length() { return store.size },
}

global.window = dom.window
global.document = dom.window.document
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
global.HTMLElement = dom.window.HTMLElement
global.SVGElement = dom.window.SVGElement
global.SVGSVGElement = dom.window.SVGSVGElement
global.MutationObserver = dom.window.MutationObserver
global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window)
global.DOMRect = dom.window.DOMRect || class { }
global.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} }
dom.window.ResizeObserver = global.ResizeObserver
global.matchMedia = dom.window.matchMedia || (() => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }))
dom.window.matchMedia = global.matchMedia
global.AudioContext = class { constructor(){} createGain(){ return { connect(){}, gain:{} } } }
dom.window.AudioContext = global.AudioContext
global.Element = dom.window.Element
global.Node = dom.window.Node
Object.defineProperty(global, 'location', { value: dom.window.location, configurable: true })
global.history = dom.window.history
global.requestAnimationFrame = (cb) => setTimeout(cb, 0)
global.cancelAnimationFrame = clearTimeout
Object.defineProperty(dom.window, 'localStorage', { value: localStorageMock })
global.localStorage = localStorageMock
dom.window.scrollTo = () => {}
dom.window.HTMLElement.prototype.scrollIntoView = () => {}
global.fetch = fetch
global.WebSocket = class { constructor() { this.readyState = 0 } send() {} close() {} addEventListener() {} removeEventListener() {} }
dom.window.WebSocket = global.WebSocket

const errors = []
dom.window.addEventListener('error', (e) => errors.push('window error: ' + e.message))
const origError = console.error
console.error = (...a) => { errors.push('console.error: ' + a.map(String).join(' ').slice(0, 400)) }

const SCENARIO = process.env.SCENARIO
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/dashboard/messages']

/** Saisit une valeur dans un champ contrôlé par React */
function typeInto(el, value) {
  const proto = el.tagName === 'TEXTAREA'
    ? dom.window.HTMLTextAreaElement.prototype
    : dom.window.HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
  el.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
}

function click(el) {
  el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
}

const wait = (ms) => new Promise(r => setTimeout(r, ms))

function findByText(host, selector, text) {
  return [...host.querySelectorAll(selector)].find(e => e.textContent.includes(text))
}
const { mount } = await import('./out/app.js')

let failures = 0
for (const route of routes) {
  errors.length = 0
  dom.window.history.pushState({}, '', route)
  const host = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(host)
  const unmount = mount(host, errors)
  await new Promise(r => setTimeout(r, 3500))
  const text = host.textContent.replace(/\s+/g, ' ').trim()
  const crashed = errors.some(e => e.startsWith('REACT CRASH')) || text.includes('ERREUR CAPTUREE')
  const empty = text.length < 30
  const ok = !crashed && !empty
  if (!ok) failures++
  console.log(`${ok ? '  ✓' : '  ✗'} ${route}${ok ? '' : ' — ' + (crashed ? errors.find(e => e.startsWith('REACT CRASH')).split('\n')[0] : 'page vide')}`)
  if (ok) console.log(`      ${text.slice(0, 110)}…`)
  unmount?.()
  host.remove()
}

if (SCENARIO === 'print-document') {
  const route = process.env.DOC_ROUTE
  dom.window.history.pushState({}, '', route)
  const host = dom.window.document.createElement('div')
  host.id = 'root'
  dom.window.document.body.appendChild(host)
  mount(host, errors)
  await wait(4000)

  const step = (n, ok, d = '') => { console.log(`  ${ok ? '✓' : '✗'} ${n}${!ok && d ? ' — ' + d : ''}`); if (!ok) failures++ }

  const btn = findByText(host, 'button', 'Imprimer')
  step('le bouton d\'impression est présent', !!btn)
  if (btn) { click(btn); await wait(2500) }

  // L'aperçu est rendu hors du back-office, directement sous body
  const preview = dom.window.document.querySelector('.doc-root')
  step('l\'aperçu s\'ouvre hors du back-office', !!preview && !host.contains(preview))
  step('le back-office est marqué comme mis de côté', dom.window.document.body.classList.contains('doc-printing'))

  if (preview) {
    const t = preview.textContent.replace(/\s+/g, ' ')
    for (const [label, needle] of [
      ['le type de document', /DEVIS|FACTURE/],
      ['le numéro', /(DEVIS|FACT)-\d{4}-\d+/],
      ['l\'émetteur est nommé', /Zakariya|Digital|Anissa|BAN/],
      ['l\'en-tête du tableau', /Désignation|Libellé/],
      ['le total', /Total HT/],
      ['un montant en euros', /\d\s?€/],
    ]) step(label, needle.test(t), t.slice(0, 120))
    const lines = preview.querySelectorAll('.doc-row, .ag-table tbody tr').length
    step('les lignes de prestation sont présentes', lines > 0, `${lines} ligne(s)`)
    console.log('\n  --- début du document ---')
    console.log('  ' + preview.textContent.replace(/\s+/g, ' ').trim().slice(0, 1400))
  }
  dom.window.document.body.classList.remove('doc-printing')
}

if (SCENARIO === 'send-message') {
  errors.length = 0
  dom.window.history.pushState({}, '', '/dashboard/messages')
  const host = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(host)
  mount(host, errors)
  await wait(3500)

  const step = (n, ok, d = '') => { console.log(`  ${ok ? '✓' : '✗'} ${n}${!ok && d ? ' — ' + d : ''}`); if (!ok) failures++ }

  // 1. Ouvrir la conversation avec l'autre membre
  const target = findByText(host, 'button', 'Zakariya')
  step("le bouton d'ouverture de conversation est présent", !!target)
  if (target) { click(target); await wait(2500) }

  // 2. Le fil est ouvert et prêt à écrire
  const textarea = host.querySelector('textarea')
  step('le champ de saisie apparaît', !!textarea)

  // 3. Écrire
  const body = 'Test interface ' + process.env.STAMP
  if (textarea) { typeInto(textarea, body); await wait(300) }
  step('le texte est bien saisi', textarea?.value === body, `valeur : ${textarea?.value}`)

  // 4. Le bouton Envoyer doit s'activer
  const sendBtn = findByText(host, 'button', 'Envoyer')
  step("le bouton Envoyer s'active", !!sendBtn && !sendBtn.disabled)

  // 5. Envoyer
  if (sendBtn) { click(sendBtn); await wait(3000) }

  // 6. Le message apparaît dans le fil
  const shown = host.textContent.includes(body)
  step('le message apparaît dans la conversation', shown)

  // 7. Le champ est vidé
  const cleared = host.querySelector('textarea')?.value === ''
  step('le champ se vide après envoi', cleared)

  // 8. Aucune erreur
  const crashed = errors.some(e => e.startsWith('REACT CRASH'))
  step("aucune erreur d'affichage", !crashed, errors.find(e => e.startsWith('REACT CRASH'))?.split('\n')[0] || '')

  console.log('\n  --- ce que voit l\'écran ---')
  console.log('  ' + host.textContent.replace(/\s+/g, ' ').trim().slice(-260))
}

console.error = origError
console.log(failures === 0 ? '\n  Tout est passé.' : `\n  ${failures} échec(s).`)
process.exit(failures ? 1 : 0)

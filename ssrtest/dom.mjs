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

const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/dashboard/messages']
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

console.error = origError
console.log(failures === 0 ? '\n  Toutes les pages s\'affichent.' : `\n  ${failures} page(s) en échec.`)
process.exit(failures ? 1 : 0)

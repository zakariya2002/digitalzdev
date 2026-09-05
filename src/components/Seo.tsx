import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  canonicalFor,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  seoForPath,
} from '../lib/seo'

/** Crée la balise si elle manque, la met à jour sinon. */
function setMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Aligne le `<head>` sur la route affichée.
 *
 * Le pré-rendu écrit déjà les bonnes balises dans le HTML servi : ce
 * composant prend le relais pour la navigation côté client, où aucun
 * rechargement ne vient les rafraîchir.
 */
export default function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const page = seoForPath(pathname)
    const url = canonicalFor(page.path)

    document.title = page.title
    setMeta('meta[name="description"]', {
      name: 'description',
      content: page.description,
    })
    setLink('canonical', url)

    setMeta('meta[property="og:title"]', { property: 'og:title', content: page.title })
    setMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: page.description,
    })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: DEFAULT_OG_IMAGE })
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })

    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: page.title })
    setMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: page.description,
    })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: DEFAULT_OG_IMAGE })

    // Une page inconnue ne doit pas entrer dans l'index : elle n'a pas de
    // contenu propre et ferait doublon avec l'accueil.
    const isNotFound = page.path === '/404'
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: isNotFound ? 'noindex, follow' : 'index, follow',
    })
  }, [pathname])

  return null
}

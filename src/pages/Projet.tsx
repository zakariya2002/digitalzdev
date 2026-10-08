import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import TravauxStudio from '../components/studio/TravauxStudio'
import RechercheGoogle from '../components/studio/RechercheGoogle'
import FinalStudio from '../components/studio/FinalStudio'
import EquipeStudio from '../components/studio/EquipeStudio'
import Footer from '../components/Footer'

/**
 * Page d'atterrissage des publicités Meta : quatre questions, les
 * coordonnées, puis WhatsApp.
 *
 * Elle remplace le quiz de démo pour le trafic payant : une démo générée
 * passait pour le site final et décevait. Ici rien n'est promis d'autre
 * qu'un échange : le visiteur décrit son projet, la demande est enregistrée,
 * puis WhatsApp s'ouvre avec un message déjà rédigé qui résume ses réponses.
 */

const WHATSAPP = '33783259869'
const PIXEL_ID = '1770228247552236'
/** Enregistrement et conversion côté serveur, hébergés par le quiz. */
const API_LEAD = 'https://quiz.digitalzdev.com/api/lead-site'
const EASE = [0.22, 1, 0.36, 1] as const

interface Question {
  cle: 'metier' | 'besoin' | 'budget' | 'delai'
  titre: string
  options: string[]
}

const QUESTIONS: Question[] = [
  {
    cle: 'metier',
    titre: 'Quel est votre métier ?',
    options: ['Avocat ou cabinet', 'Architecte ou agence', 'Photographe ou vidéaste', 'Autre activité'],
  },
  {
    cle: 'besoin',
    titre: 'De quoi avez-vous besoin ?',
    options: ['Créer mon site', 'Refaire mon site actuel', 'Être plus visible sur Google', 'Un site et des publicités'],
  },
  {
    cle: 'budget',
    titre: 'Quel budget envisagez-vous ?',
    options: ['Moins de 1 500 €', '1 500 à 3 000 €', '3 000 à 6 000 €', 'Plus de 6 000 €', 'Je ne sais pas encore'],
  },
  {
    cle: 'delai',
    titre: 'Pour quand ?',
    options: ['Dès que possible', 'Dans 1 à 3 mois', 'Plus tard, je me renseigne'],
  },
]

type Reponses = Partial<Record<Question['cle'], string>>

/** Numéro au format international, ou null s'il est invalide ou manifestement inventé. */
function normaliserTelephone(brut: string): string | null {
  const chiffres = brut.replace(/[^\d+]/g, '')
  const n = chiffres.startsWith('00') ? `+${chiffres.slice(2)}` : chiffres
  const international = /^0[1-9]\d{8}$/.test(n)
    ? `+33${n.slice(1)}`
    : /^\+[1-9]\d{7,14}$/.test(n)
      ? n
      : null
  if (!international) return null
  if (international.startsWith('+33')) {
    const national = international.slice(3)
    if (new Set(national).size <= 2) return null
    if (/(012345|123456|234567|345678|456789|987654|876543|765432|654321|543210)/.test(national)) return null
  }
  return international
}

/** Charge le pixel Meta, sur cette page seulement. */
function chargerPixel() {
  const w = window as unknown as { fbq?: (...a: unknown[]) => void }
  if (w.fbq) return
  /* eslint-disable */
  ;(function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    })
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    const t = b.createElement(e) as HTMLScriptElement
    t.async = true
    t.src = v
    const s = b.getElementsByTagName(e)[0]
    s.parentNode!.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */
  const fbq = (window as unknown as { fbq: (...a: unknown[]) => void }).fbq
  fbq('init', PIXEL_ID)
  fbq('track', 'PageView')
}

function suivre(evenement: string, donnees?: Record<string, unknown>, options?: { eventID: string }) {
  const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq
  fbq?.('track', evenement, donnees ?? {}, options ?? {})
}

function lireCookie(nom: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${nom}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : undefined
}

/** Origine du visiteur, lue une fois à l'arrivée. */
function lireAttribution() {
  const q = new URLSearchParams(window.location.search)
  const v = (k: string) => q.get(k)?.slice(0, 200) || null
  return {
    utm_source: v('utm_source'),
    utm_medium: v('utm_medium'),
    utm_campaign: v('utm_campaign'),
    utm_content: v('utm_content'),
    fbclid: q.get('fbclid')?.slice(0, 300) || null,
    // Google Ads : gclid, ou gbraid / wbraid sur iOS.
    gclid: (q.get('gclid') || q.get('gbraid') || q.get('wbraid'))?.slice(0, 300) || null,
  }
}

export default function Projet() {
  const [etape, setEtape] = useState(0)
  const [reponses, setReponses] = useState<Reponses>({})
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [activite, setActivite] = useState('')
  const [message, setMessage] = useState('')
  const [touche, setTouche] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [lienWhatsapp, setLienWhatsapp] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    setMobile(window.matchMedia('(max-width: 767px)').matches)
  }, [])
  const attribution = useMemo(() => (typeof window === 'undefined' ? null : lireAttribution()), [])

  useEffect(() => {
    chargerPixel()
  }, [])

  const total = QUESTIONS.length + 1
  const question = QUESTIONS[etape]
  const telValide = normaliserTelephone(telephone)
  const peutEnvoyer = nom.trim().length >= 2 && !!telValide && !envoi

  const choisir = (valeur: string) => {
    setReponses((r) => ({ ...r, [question.cle]: valeur }))
    window.setTimeout(() => setEtape((e) => e + 1), 180)
  }

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouche(true)
    if (!peutEnvoyer || !telValide) return
    setEnvoi(true)

    const ligne = {
      metier: reponses.metier ?? '',
      besoin: reponses.besoin ?? '',
      budget: reponses.budget ?? '',
      delai: reponses.delai ?? '',
      nom: nom.trim().slice(0, 120),
      telephone: telValide,
      activite: activite.trim().slice(0, 160) || null,
      message: message.trim().slice(0, 1000) || null,
    }

    const texte = [
      'Bonjour Digitalz Dev, je viens de remplir le formulaire de votre site.',
      '',
      `• Métier : ${ligne.metier}`,
      `• Besoin : ${ligne.besoin}`,
      `• Budget : ${ligne.budget}`,
      `• Délai : ${ligne.delai}`,
      `• Nom : ${ligne.nom}`,
      ligne.activite ? `• Activité / site : ${ligne.activite}` : null,
      ligne.message ? `• Projet : ${ligne.message}` : null,
    ]
      .filter((l) => l !== null)
      .join('\n')
    const lien = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texte)}`

    // WhatsApp s'ouvre tout de suite, pendant le clic : ouvert après une
    // attente réseau, le navigateur le bloquerait. La page reste derrière,
    // avec la vidéo et les réalisations.
    window.open(lien, '_blank', 'noopener')
    setLienWhatsapp(lien)

    // Conversion : le pixel et le serveur partent avec le même identifiant,
    // Meta n'en compte qu'une.
    const evenementId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    suivre('Lead', { content_category: ligne.metier, content_name: ligne.besoin }, { eventID: evenementId })

    const fbclid = attribution?.fbclid ?? undefined
    try {
      const res = await fetch(API_LEAD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evenementId,
          ...ligne,
          activite: ligne.activite ?? undefined,
          message: ligne.message ?? undefined,
          url: window.location.href.slice(0, 500),
          fbp: lireCookie('_fbp'),
          fbc: lireCookie('_fbc') ?? (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined),
          attribution: {
            utmSource: attribution?.utm_source ?? undefined,
            utmMedium: attribution?.utm_medium ?? undefined,
            utmCampaign: attribution?.utm_campaign ?? undefined,
            utmContent: attribution?.utm_content ?? undefined,
            fbclid,
            gclid: attribution?.gclid ?? undefined,
            referent: document.referrer.slice(0, 300) || undefined,
          },
        }),
        keepalive: true,
      })
      if (!res.ok) throw new Error(String(res.status))
    } catch {
      // Serveur injoignable : on enregistre au moins la demande directement.
      try {
        await supabase.from('site_leads' as never).insert({ ...ligne, ...attribution } as never)
      } catch {
        /* rien */
      }
    }
    window.scrollTo(0, 0)
  }

  return (
    <main className="flex min-h-[100svh] flex-col overflow-x-clip bg-surface px-5 pt-6 md:px-10">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <Link to="/" className="flex min-h-[44px] items-center gap-2.5">
          <img src="/logo-studio.png" alt="" className="h-9 w-9 rounded-full" />
          <span className="text-[17px] font-medium tracking-tight text-text-primary">Digitalz Dev</span>
        </Link>
        <span className="text-sm text-text-muted">
          {Math.min(etape + 1, total)} / {total}
        </span>
      </header>

      <div className="mx-auto mt-4 h-1 w-full max-w-2xl overflow-hidden rounded-full bg-surface-card">
        <motion.div
          className="h-full rounded-full bg-pop"
          animate={{ width: `${((Math.min(etape, total - 1) + (lienWhatsapp ? 1 : 0)) / total) * 100}%` }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </div>

      <div className={`mx-auto mt-10 w-full md:mt-16 max-w-2xl ${lienWhatsapp ? "" : "flex-1 pb-10"}`}>
        <AnimatePresence mode="wait">
          {lienWhatsapp ? (
            <motion.div key="fin" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center">
                <h1 className="text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text-primary md:text-5xl">
                  Merci, on en parle sur <span className="text-[#25D366]">WhatsApp</span>
                </h1>
                <p className="mx-auto mt-4 max-w-md text-text-secondary">
                  Votre message est prêt dans WhatsApp : appuyez sur « Envoyer » et
                  nous revenons vers vous rapidement. Si l'application ne s'est pas
                  ouverte, utilisez le bouton ci-dessous.
                </p>
                <a
                  href={lienWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-[56px] items-center rounded-full bg-[#25D366] px-8 text-base font-semibold text-white transition-colors hover:bg-[#1ebe5a]"
                >
                  Ouvrir WhatsApp
                </a>
              </div>

            </motion.div>
          ) : question ? (
            <motion.div
              key={question.cle}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {etape === 0 && (
                <p className="mb-4 text-text-secondary">
                  Quatre questions sur votre projet, puis on en parle directement sur WhatsApp.
                </p>
              )}
              <h1 className="text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text-primary md:text-5xl">
                {question.titre}
              </h1>
              <div className="mt-8 grid gap-3">
                {question.options.map((o) => {
                  const actif = reponses[question.cle] === o
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => choisir(o)}
                      className={`flex min-h-[60px] items-center justify-between rounded-2xl px-5 text-left text-[17px] transition-colors ${
                        actif ? 'bg-[#1d1d1f] text-white' : 'bg-surface-card text-text-primary hover:bg-surface-border'
                      }`}
                    >
                      {o}
                      <span aria-hidden className="text-lg">→</span>
                    </button>
                  )
                })}
              </div>
              {etape > 0 && (
                <button
                  type="button"
                  onClick={() => setEtape((e) => e - 1)}
                  className="mt-6 min-h-[44px] text-sm text-text-muted hover:text-text-primary"
                >
                  ← Retour
                </button>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="contact"
              onSubmit={envoyer}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: EASE }}
              noValidate
            >
              <h1 className="text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text-primary md:text-5xl">
                Comment vous joindre ?
              </h1>
              <div className="mt-8 grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-sm text-text-secondary">Nom et prénom</span>
                  <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    autoComplete="name"
                    className="min-h-[56px] rounded-2xl bg-surface-card px-5 text-base text-text-primary outline-none focus:ring-2 focus:ring-pop"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm text-text-secondary">Téléphone (WhatsApp)</span>
                  <input
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="min-h-[56px] rounded-2xl bg-surface-card px-5 text-base text-text-primary outline-none focus:ring-2 focus:ring-pop"
                  />
                  {touche && !telValide && (
                    <span className="text-sm text-red-600">Indiquez un numéro valide pour qu'on puisse vous répondre.</span>
                  )}
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm text-text-secondary">Votre activité ou votre site actuel (facultatif)</span>
                  <input
                    value={activite}
                    onChange={(e) => setActivite(e.target.value)}
                    className="min-h-[56px] rounded-2xl bg-surface-card px-5 text-base text-text-primary outline-none focus:ring-2 focus:ring-pop"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm text-text-secondary">Votre projet en quelques mots (facultatif)</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="rounded-2xl bg-surface-card px-5 py-4 text-base text-text-primary outline-none focus:ring-2 focus:ring-pop"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={envoi}
                className="mt-8 inline-flex min-h-[60px] w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 text-base font-semibold text-white transition-colors hover:bg-[#1ebe5a] disabled:opacity-60"
              >
                {envoi ? 'Ouverture de WhatsApp…' : 'Envoyer sur WhatsApp'}
              </button>
              <p className="mt-3 text-center text-xs text-text-muted">
                Vos réponses servent uniquement à préparer notre échange.{' '}
                <Link to="/politique-confidentialite" className="underline">Confidentialité</Link>
              </p>
              <button
                type="button"
                onClick={() => setEtape((e) => e - 1)}
                className="mt-4 min-h-[44px] text-sm text-text-muted hover:text-text-primary"
              >
                ← Retour
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Après l'envoi : la même vitrine que la page d'accueil, pour patienter
          en découvrant l'agence. */}
      {lienWhatsapp && (
        <div className="-mx-5 mt-16 md:-mx-10">
          <div className="mx-auto max-w-5xl px-5 md:px-10">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-text-primary md:text-4xl">
              En attendant, découvrez Digitalz <span className="text-accent">Dev</span>
            </h2>
            <video
              className="mt-6 aspect-[9/16] w-full rounded-2xl bg-surface-card object-cover md:aspect-video"
              src={mobile ? '/videos/presentation-mobile.mp4' : '/videos/presentation.mp4'}
              poster={mobile ? '/videos/presentation-mobile-poster.jpg' : '/videos/presentation-poster.jpg'}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
            />
          </div>
          <TravauxStudio titre="Nos créations" />
          <RechercheGoogle />
          <FinalStudio />
          <EquipeStudio />
          <Footer />
        </div>
      )}
    </main>
  )
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'

type Etape = 'sonne' | 'decroche' | 'enligne'

const EASE = [0.22, 1, 0.36, 1] as const

/** Durée de chaque étape, en millisecondes. */
const DUREES = { sonne: 2600, decroche: 900 }

function Combine({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z" />
    </svg>
  )
}

/**
 * Un appel entrant qui décroche.
 *
 * Un iPhone dessiné en code reçoit l'appel d'un nouveau client : il vibre,
 * des ondes s'en échappent, le curseur vert glisse pour décrocher, puis
 * l'écran passe en communication avec un compteur qui tourne. La scène se
 * joue quand elle entre à l'écran et rejoue à chaque retour. Si l'appareil
 * demande moins d'animations, elle s'affiche directement en communication.
 */
export default function AppelEntrant() {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { amount: 0.6 })
  const [etape, setEtape] = useState<Etape>('sonne')
  const [secondes, setSecondes] = useState(0)
  // Course du bouton vert : largeur de la piste moins le bouton et ses marges.
  const pisteRef = useRef<HTMLDivElement>(null)
  const [course, setCourse] = useState(0)
  useLayoutEffect(() => {
    const piste = pisteRef.current
    if (!piste) return
    const mesurer = () => setCourse(piste.clientWidth - 56)
    mesurer()
    const obs = new ResizeObserver(mesurer)
    obs.observe(piste)
    return () => obs.disconnect()
  }, [etape])

  useEffect(() => {
    if (!visible) {
      setEtape('sonne')
      setSecondes(0)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEtape('enligne')
      return
    }
    const t1 = window.setTimeout(() => setEtape('decroche'), DUREES.sonne)
    const t2 = window.setTimeout(() => setEtape('enligne'), DUREES.sonne + DUREES.decroche)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [visible])

  useEffect(() => {
    if (etape !== 'enligne') return
    const t = window.setInterval(() => setSecondes((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [etape])

  const duree = `${String(Math.floor(secondes / 60)).padStart(2, '0')}:${String(secondes % 60).padStart(2, '0')}`
  const sonne = etape === 'sonne'

  return (
    <div ref={ref} className="relative mx-auto flex h-[30rem] w-full items-center justify-center md:h-[34rem]">
      {/* Les ondes de sonnerie : une animation CSS continue, jamais démontée.
          Chaque onde est décalée d'un tiers de cycle par un délai négatif,
          si bien qu'elles sont déjà réparties au premier affichage et ne
          repartent jamais de zéro. Quand le téléphone décroche, le groupe
          s'efface en fondu au lieu de disparaître d'un coup. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex"
        animate={{ opacity: sonne ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="onde-appel absolute h-64 w-64 rounded-full border-2 border-[#25D366]/50"
            style={{ animationDelay: `${-i * 0.9}s` }}
          />
        ))}
      </motion.div>

      {/* Le téléphone, qui vibre tant qu'il sonne */}
      <motion.div
        className="relative h-[27rem] w-[13.5rem] rounded-[2.6rem] bg-[#1d1d1f] p-[7px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)] md:h-[31rem] md:w-[15.5rem]"
        animate={
          sonne
            ? { rotate: [0, -3, 3, -3, 3, -2, 2, 0, 0, 0], x: [0, -2, 2, -2, 2, -1, 1, 0, 0, 0] }
            : { rotate: 0, x: 0, y: etape === 'decroche' ? -8 : 0 }
        }
        transition={
          sonne
            ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.5, ease: EASE }
        }
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.2rem] bg-gradient-to-b from-[#3a3d42] via-[#26282c] to-[#161718] px-5 pb-8 pt-12 text-white">
          {/* Encoche */}
          <span aria-hidden className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />

          <AnimatePresence mode="wait">
            {etape !== 'enligne' ? (
              <motion.div
                key="entrant"
                className="flex h-full flex-col items-center"
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-xs text-white/60">Appel entrant…</p>
                <span className="mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl">
                  NC
                </span>
                <p className="mt-3 text-xl">Nouveau client</p>
                <p className="text-sm text-white/60">via digitalzdev.com</p>

                {/* Glisser pour répondre */}
                <div className="mt-auto w-full">
                  <div ref={pisteRef} className="relative h-14 w-full overflow-hidden rounded-full bg-white/15">
                    <motion.p
                      className="absolute inset-0 flex items-center justify-center pl-12 text-[11px] text-white/70 md:text-xs"
                      animate={{ opacity: etape === 'decroche' ? 0 : [0.4, 1, 0.4] }}
                      transition={etape === 'decroche' ? { duration: 0.2 } : { duration: 1.8, repeat: Infinity }}
                    >
                      faire glisser pour répondre
                    </motion.p>
                    <motion.span
                      className="absolute left-1 top-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#34c759]"
                      animate={{ x: etape === 'decroche' ? course : 0 }}
                      transition={{ duration: 0.7, ease: EASE }}
                    >
                      <Combine className="h-5 w-5" />
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="enligne"
                className="flex h-full flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <p className="text-sm tabular-nums text-[#34c759]">{duree}</p>
                <span className="mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl">
                  NC
                </span>
                <p className="mt-3 text-xl">Nouveau client</p>
                <p className="text-sm text-white/60">« Bonjour, j'ai vu votre site… »</p>

                <div className="mt-auto grid w-full grid-cols-3 gap-3">
                  {['Silence', 'Clavier', 'HP'].map((l) => (
                    <span key={l} className="flex flex-col items-center gap-1 text-[10px] text-white/60">
                      <span className="h-11 w-11 rounded-full bg-white/15" />
                      {l}
                    </span>
                  ))}
                </div>
                <span className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff3b30]">
                  <Combine className="h-5 w-5 rotate-[135deg]" />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

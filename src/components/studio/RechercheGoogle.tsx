import { useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'

const REQUETE = 'avocat droit des affaires lyon'
const NOTE_DEBUT = 3
const NOTE_FIN = 5

/** Les concurrents, dans l'ordre où Google les classe au départ. */
const CONCURRENTS = [
  { titre: 'Cabinet Durand & Associés · Avocats Lyon', url: 'durand-avocats.fr', texte: 'Conseil et contentieux des entreprises. Prise de rendez-vous par téléphone.' },
  { titre: 'Avocat affaires Lyon : annuaire des cabinets', url: 'annuaire-juridique.com', texte: 'Comparez 240 avocats en droit des affaires à Lyon et dans le Rhône.' },
  { titre: 'Lefèvre Avocats · Droit commercial', url: 'lefevre-avocats.com', texte: 'Création de société, baux commerciaux, recouvrement de créances.' },
  { titre: 'Droit des affaires : trouver un avocat', url: 'forum-entrepreneurs.fr', texte: 'Discussion · 38 réponses · Quel avocat choisir pour une levée de fonds ?' },
]

const CLIENT = {
  titre: 'Martin Avocats · Droit des affaires à Lyon',
  url: 'martin-avocats.fr',
  texte: 'Cabinet dédié aux entreprises : création, contrats, levées de fonds. Premier rendez-vous sous 48 h.',
}

/** Hauteur d'une ligne de résultat, en pixels. */
const H = 96

function Etoiles({ note }: { note: number }) {
  return (
    <span className="relative inline-flex text-[#dadce0]" aria-label={`${note.toFixed(1)} sur 5`}>
      {'★★★★★'}
      <span className="absolute inset-0 overflow-hidden text-[#fbbc04]" style={{ width: `${(note / 5) * 100}%` }}>
        {'★★★★★'}
      </span>
    </span>
  )
}

function LogoGoogle({ className = '' }: { className?: string }) {
  return (
    <span className={`font-medium tracking-tight ${className}`} aria-label="Google">
      <span className="text-[#4285f4]">G</span>
      <span className="text-[#ea4335]">o</span>
      <span className="text-[#fbbc05]">o</span>
      <span className="text-[#4285f4]">g</span>
      <span className="text-[#34a853]">l</span>
      <span className="text-[#ea4335]">e</span>
    </span>
  )
}

/** Un résultat concurrent : il descend d'un cran quand le client le dépasse. */
function Ligne({
  i,
  position,
  r,
}: {
  i: number
  position: MotionValue<number>
  r: (typeof CONCURRENTS)[number]
}) {
  const y = useTransform(position, (p) => (i + Math.min(1, Math.max(0, i + 1 - p))) * H)
  return (
    <motion.div className="absolute inset-x-0 top-0 px-1" style={{ y }}>
      <Resultat {...r} />
    </motion.div>
  )
}

function Resultat({
  titre,
  url,
  texte,
  client = false,
  note,
  avis,
}: {
  titre: string
  url: string
  texte: string
  client?: boolean
  note?: number
  avis?: number
}) {
  return (
    <div className={`rounded-xl px-3 py-2.5 ${client ? 'bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5' : ''}`}>
      <p className="truncate text-xs text-[#4d5156]">{url}</p>
      <p className={`truncate text-[15px] leading-snug md:text-[17px] ${client ? 'text-[#1a0dab]' : 'text-[#1a0dab]/80'}`}>{titre}</p>
      {/* Sur mobile, la note de la fiche Google s'affiche dans le résultat. */}
      {note !== undefined && (
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#4d5156] md:hidden">
          <span className="tabular-nums text-[#202124]">{note.toFixed(1).replace('.', ',')}</span>
          <Etoiles note={note} />
          <span className="tabular-nums">({avis})</span>
        </p>
      )}
      <p className="line-clamp-2 text-xs text-[#4d5156] md:text-[13px]">{texte}</p>
    </div>
  )
}

/** Une étiquette qui flotte autour de la page et apparaît à son tour. */
function Badge({
  progression,
  debut,
  className,
  titre,
  detail,
}: {
  progression: MotionValue<number>
  debut: number
  className: string
  titre: string
  detail: string
}) {
  const opacite = useTransform(progression, [debut, debut + 0.08], [0, 1])
  const y = useTransform(progression, [debut, debut + 0.08], [24, 0])
  return (
    <motion.div
      className={`rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] ring-1 ring-black/5 ${className}`}
      style={{ opacity: opacite, y }}
    >
      <p className="text-sm font-medium text-text-primary">{titre}</p>
      <p className="text-xs text-text-secondary">{detail}</p>
    </motion.div>
  )
}

/**
 * Une recherche Google, rejouée au défilement.
 *
 * La requête se tape, puis le site du client remonte du bas de la page
 * jusqu'à la première place pendant que sa fiche Google passe de 3 à 5
 * étoiles. Autour, Google Ads, Meta Ads et l'optimisation SEO apparaissent
 * l'un après l'autre. La section reste fixée le temps de la scène, puis
 * libère le défilement.
 */
export default function RechercheGoogle() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const [lettres, setLettres] = useState(0)
  const [note, setNote] = useState(NOTE_DEBUT)
  const [avis, setAvis] = useState(12)

  useMotionValueEvent(p, 'change', (v) => {
    setLettres(Math.round(Math.min(1, Math.max(0, v / 0.18)) * REQUETE.length))
    const t = Math.min(1, Math.max(0, (v - 0.3) / 0.5))
    setNote(Math.round((NOTE_DEBUT + t * (NOTE_FIN - NOTE_DEBUT)) * 10) / 10)
    setAvis(Math.round(12 + t * 136))
  })

  // Position du client dans la liste : 4 (en bas) jusqu'à 0 (en tête).
  const position = useTransform(p, [0.2, 0.75], [CONCURRENTS.length, 0], { clamp: true })
  const yClient = useTransform(position, (v) => v * H)
  const resultatsOpacite = useTransform(p, [0.14, 0.22], [0, 1])
  const sponsorise = useTransform(p, [0.78, 0.86], [0, 1])

  return (
    <section ref={ref} className="relative h-[240vh] bg-surface md:h-[280vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-4 overflow-hidden px-4 pt-16 md:px-10 md:pt-0">
        {/* Étiquettes autour de la page, sur ordinateur */}
        <Badge progression={p} debut={0.3} className="absolute left-[4%] top-[22%] hidden lg:block" titre="Optimisation SEO" detail="Positions suivies chaque mois" />
        <Badge progression={p} debut={0.5} className="absolute right-[4%] top-[30%] hidden lg:block" titre="Google Ads" detail="+214 % de clics qualifiés" />
        <Badge progression={p} debut={0.66} className="absolute bottom-[16%] left-[6%] hidden lg:block" titre="Meta Ads" detail="Vos réalisations sur Instagram" />

        {/* La page de résultats */}
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-[0_40px_90px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
          <div className="flex items-center gap-1.5 bg-[#f1f3f4] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-[11px] text-[#5f6368]">google.fr/search</span>
          </div>

          <div className="px-4 pb-6 pt-4 md:px-8">
            <div className="flex items-center gap-4">
              <LogoGoogle className="hidden text-2xl md:inline" />
              <div className="flex min-h-[44px] flex-1 items-center rounded-full bg-white px-5 text-[15px] text-[#202124] shadow-[0_1px_6px_rgba(32,33,36,0.28)]">
                {REQUETE.slice(0, lettres)}
                <motion.span
                  aria-hidden
                  className="ml-0.5 inline-block h-5 w-px bg-[#202124]"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </div>

            <motion.div className="mt-5 grid gap-6 md:grid-cols-[1fr_15rem]" style={{ opacity: resultatsOpacite }}>
              {/* Résultats organiques */}
              <div className="relative" style={{ height: (CONCURRENTS.length + 1) * H }}>
                {CONCURRENTS.map((r, i) => (
                  <Ligne key={r.url} i={i} position={position} r={r} />
                ))}
                <motion.div className="absolute inset-x-0 top-0 z-10 px-1" style={{ y: yClient }}>
                  <div className="relative">
                    <motion.span
                      className="absolute -top-2 right-3 rounded-md bg-[#1a73e8] px-2 py-0.5 text-[10px] font-medium text-white"
                      style={{ opacity: sponsorise }}
                    >
                      Sponsorisé
                    </motion.span>
                    <Resultat {...CLIENT} client note={note} avis={avis} />
                  </div>
                </motion.div>
              </div>

              {/* Fiche Google de l'établissement */}
              <div className="hidden self-start rounded-xl p-4 ring-1 ring-black/10 md:block">
                <div className="h-24 rounded-lg bg-gradient-to-br from-[#e8eaed] to-[#c9ccd1]" />
                <p className="mt-3 text-[17px] text-[#202124]">Martin Avocats</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#4d5156]">
                  <span className="tabular-nums text-[#202124]">{note.toFixed(1).replace('.', ',')}</span>
                  <Etoiles note={note} />
                  <span className="tabular-nums">({avis})</span>
                </p>
                <p className="mt-1 text-xs text-[#4d5156]">Avocat · Lyon 2e · Ouvert</p>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[11px] text-[#1a73e8]">
                  <span className="rounded-full py-1.5 ring-1 ring-black/10">Itinéraire</span>
                  <span className="rounded-full py-1.5 ring-1 ring-black/10">Site</span>
                  <span className="rounded-full py-1.5 ring-1 ring-black/10">Appeler</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sur mobile, les trois leviers en pastilles sous la page */}
        <div className="flex flex-wrap justify-center gap-2 lg:hidden">
          {['Optimisation SEO', 'Google Ads', 'Meta Ads'].map((l, i) => (
            <Pastille key={l} progression={p} debut={0.3 + i * 0.18} libelle={l} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Pastille({ progression, debut, libelle }: { progression: MotionValue<number>; debut: number; libelle: string }) {
  const opacite = useTransform(progression, [debut, debut + 0.08], [0, 1])
  return (
    <motion.span className="rounded-full bg-white px-4 py-2 text-sm text-text-primary shadow-md ring-1 ring-black/5" style={{ opacity: opacite }}>
      {libelle}
    </motion.span>
  )
}

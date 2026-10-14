import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import ErrorBanner from '../../components/dashboard/ErrorBanner'

/**
 * Tunnel du quiz : jusqu'où va chaque visiteur.
 *
 * Les données viennent de quiz.digitalzdev.com : chaque écran affiché laisse
 * une trace anonyme dans `quiz_evenements`, et les fonctions `quiz_tunnel` et
 * `quiz_parcours` (voir digitalzdev-quiz/lib/supabase/schema.sql) les
 * regroupent par visiteur. Un visiteur qui a laissé son email est relié à son
 * lead, et donc à sa fiche client.
 */

interface Etape {
  rang: number
  etape: string
  visiteurs: number
}

interface Parcours {
  visiteur: string
  debut: string
  dernier: string
  rang_max: number | null
  dernier_ecran: string | null
  erreur: boolean
  campagne: string | null
  creation: string | null
  depuis_meta: boolean | null
  email: string | null
  telephone: string | null
  marque: string | null
  client_id: string | null
}

const PERIODES = [
  { label: "Aujourd'hui", jours: 0 },
  { label: '7 jours', jours: 7 },
  { label: '30 jours', jours: 30 },
]

/** Libellé de l'étape la plus avancée atteinte, dans les mots du parcours. */
const ETAPE_ATTEINTE: Record<number, string> = {
  1: "Parti sur l'accueil",
  2: 'Arrêté au type de site',
  3: 'Arrêté au secteur',
  4: 'Arrêté au nom de la marque',
  5: 'Arrêté aux coordonnées',
  6: 'Démo lancée, pas affichée',
  7: 'A vu sa démo',
  8: 'A regardé sa démo',
  9: 'A demandé un contact',
}

function couleurEtape(rang: number | null): string {
  if (!rang) return 'bg-gray-500/20 text-gray-400'
  if (rang >= 7) return 'bg-green-500/20 text-green-400'
  if (rang >= 5) return 'bg-yellow-500/20 text-yellow-400'
  return 'bg-red-500/15 text-red-300'
}

function debutPeriode(jours: number): string {
  const d = new Date()
  if (jours === 0) d.setHours(0, 0, 0, 0)
  else d.setDate(d.getDate() - jours)
  return d.toISOString()
}

export default function TunnelPage() {
  const [jours, setJours] = useState(7)
  const [metaSeulement, setMetaSeulement] = useState(false)
  const [etapes, setEtapes] = useState<Etape[]>([])
  const [parcours, setParcours] = useState<Parcours[]>([])
  const [chargement, setChargement] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const charger = useCallback(async () => {
    setChargement(true)
    const depuis = debutPeriode(jours)
    const [t, p] = await Promise.all([
      supabase.rpc('quiz_tunnel', { p_depuis: depuis, p_meta_seulement: metaSeulement }),
      supabase.rpc('quiz_parcours', { p_depuis: depuis }),
    ])
    if (t.error || p.error) {
      setError((t.error ?? p.error)?.message ?? 'Erreur de chargement')
    } else {
      setEtapes((t.data ?? []) as Etape[])
      const lignes = (p.data ?? []) as Parcours[]
      setParcours(metaSeulement ? lignes.filter((l) => l.depuis_meta) : lignes)
    }
    setChargement(false)
  }, [jours, metaSeulement])

  useEffect(() => {
    void charger()
  }, [charger])

  const arrivees = etapes[0]?.visiteurs ?? 0
  const pireFuite = useMemo(() => {
    let pire: { etape: string; perte: number } | null = null
    for (let i = 1; i < etapes.length; i++) {
      const avant = etapes[i - 1].visiteurs
      if (avant === 0) continue
      const perte = (avant - etapes[i].visiteurs) / avant
      if (!pire || perte > pire.perte) pire = { etape: etapes[i].etape, perte }
    }
    return pire
  }, [etapes])

  const leads = etapes.find((e) => e.rang === 6)?.visiteurs ?? 0

  return (
    <div className="p-4 sm:p-6">
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {PERIODES.map((p) => (
          <button
            key={p.jours}
            onClick={() => setJours(p.jours)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              jours === p.jours ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={metaSeulement}
            onChange={(e) => setMetaSeulement(e.target.checked)}
            className="accent-blue-600"
          />
          Venus des pubs Meta seulement
        </label>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Visiteurs</p>
          <p className="text-2xl font-bold text-white">{arrivees}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Démos lancées</p>
          <p className="text-2xl font-bold text-blue-400">{leads}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Taux de conversion</p>
          <p className="text-2xl font-bold text-green-400">
            {arrivees ? Math.round((leads / arrivees) * 100) : 0}%
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plus grosse fuite</p>
          <p className="text-sm font-semibold text-red-300 leading-snug">
            {pireFuite && pireFuite.perte > 0
              ? `${pireFuite.etape} : −${Math.round(pireFuite.perte * 100)}%`
              : '—'}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Jusqu'où vont les visiteurs</h2>
        <div className="space-y-3">
          {etapes.map((e, i) => {
            const pct = arrivees ? (e.visiteurs / arrivees) * 100 : 0
            const avant = i > 0 ? etapes[i - 1].visiteurs : 0
            const perdus = i > 0 ? avant - e.visiteurs : 0
            return (
              <div key={e.rang}>
                <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
                  <span className="text-gray-300">{e.etape}</span>
                  <span className="text-gray-400 tabular-nums whitespace-nowrap">
                    <span className="text-white font-semibold">{e.visiteurs}</span>
                    {arrivees ? ` · ${Math.round(pct)}%` : ''}
                    {perdus > 0 ? <span className="text-red-300"> · −{perdus}</span> : null}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          {!chargement && arrivees === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun visiteur sur la période. Le suivi écran par écran a démarré le 14 octobre 2026.
            </p>
          ) : null}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <h2 className="text-sm font-semibold text-white px-4 pt-4 pb-2">Chaque visiteur</h2>
        <table className="w-full min-w-[720px]">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quand</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Arrêté à</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prospect</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Origine</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Durée</th>
            </tr>
          </thead>
          <tbody>
            {parcours.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  {chargement ? 'Chargement…' : 'Aucun visiteur sur la période'}
                </td>
              </tr>
            ) : (
              parcours.map((p, i) => {
                const duree = Math.max(0, (new Date(p.dernier).getTime() - new Date(p.debut).getTime()) / 1000)
                return (
                  <tr key={p.visiteur} className={i % 2 === 0 ? 'bg-gray-950/40' : ''}>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(p.debut), { addSuffix: true, locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${couleurEtape(p.rang_max)}`}>
                        {p.rang_max ? ETAPE_ATTEINTE[p.rang_max] : 'Inconnu'}
                      </span>
                      {p.erreur ? <span className="ml-2 text-xs text-red-400">erreur de génération</span> : null}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {p.email ? (
                        p.client_id ? (
                          <Link to={`/dashboard/clients/${p.client_id}`} className="text-blue-400 hover:underline">
                            {p.marque ?? p.email}
                          </Link>
                        ) : (
                          <span className="text-white">{p.marque ?? p.email}</span>
                        )
                      ) : (
                        <span className="text-gray-500">Anonyme</span>
                      )}
                      {p.email ? <p className="text-xs text-gray-500">{p.email}{p.telephone ? ` · ${p.telephone}` : ''}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">
                      {p.depuis_meta ? (
                        <>
                          <span className="text-indigo-400">Meta</span>
                          {p.creation ? <p className="text-xs text-gray-500">{p.creation}</p> : null}
                        </>
                      ) : (
                        'Direct / organique'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 tabular-nums hidden lg:table-cell">
                      {duree < 60 ? `${Math.round(duree)} s` : `${Math.round(duree / 60)} min`}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

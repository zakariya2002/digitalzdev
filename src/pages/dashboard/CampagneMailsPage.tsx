import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import ErrorBanner from '../../components/dashboard/ErrorBanner'

/**
 * Suivi des campagnes de mails (avocats, syndics) — table campagne_mails.
 *
 * Les lignes sont créées et mises à jour par annuaire-avocats/mail/envoi.py :
 * état d'envoi et dernier événement Resend (délivré, ouvert, rebond, plainte).
 * Ici on suit l'avancement et on note la suite commerciale : réponse, RDV,
 * pas intéressé, STOP (un STOP empêche tout renvoi par le script).
 */

const CAMPAGNES = [
  { id: 'seo-avocats-nov-2026', titre: 'avocats' },
  { id: 'seo-syndics-nov-2026', titre: 'syndics' },
] as const
type CampagneId = (typeof CAMPAGNES)[number]['id']

type Etat = 'a_envoyer' | 'envoye' | 'erreur'
type Statut = 'aucune_reponse' | 'repondu' | 'rdv' | 'pas_interesse' | 'stop'

interface Ligne {
  id: string
  email: string
  nom: string | null
  cabinet: string | null
  ville: string | null
  site: string | null
  objet: string | null
  defauts: string[] | null
  etat: Etat
  envoye_le: string | null
  dernier_evenement: string | null
  evenement_le: string | null
  ouvert_le: string | null
  statut: Statut
  notes: string | null
}

const db = supabase as unknown as SupabaseClient

const STATUTS: { valeur: Statut; label: string }[] = [
  { valeur: 'aucune_reponse', label: 'Pas de réponse' },
  { valeur: 'repondu', label: 'A répondu' },
  { valeur: 'rdv', label: 'RDV pris' },
  { valeur: 'pas_interesse', label: 'Pas intéressé' },
  { valeur: 'stop', label: 'STOP' },
]

const EVENEMENTS: Record<string, { label: string; style: string }> = {
  sent: { label: 'Envoyé', style: 'bg-gray-700 text-gray-200' },
  delivered: { label: 'Délivré', style: 'bg-sky-900/60 text-sky-300' },
  delivery_delayed: { label: 'Retardé', style: 'bg-yellow-900/60 text-yellow-300' },
  opened: { label: 'Ouvert', style: 'bg-green-900/60 text-green-300' },
  clicked: { label: 'Lien cliqué', style: 'bg-emerald-800/70 text-emerald-200' },
  bounced: { label: 'Rebond', style: 'bg-red-900/60 text-red-300' },
  complained: { label: 'Signalé spam', style: 'bg-red-800/80 text-red-100' },
}

type Filtre = 'tous' | 'a_envoyer' | 'envoyes' | 'ouverts' | 'reponses' | 'rdv' | 'problemes' | 'stop'

const FILTRES: { valeur: Filtre; label: string }[] = [
  { valeur: 'tous', label: 'Tous' },
  { valeur: 'a_envoyer', label: 'À envoyer' },
  { valeur: 'envoyes', label: 'Envoyés' },
  { valeur: 'ouverts', label: 'Ouverts' },
  { valeur: 'reponses', label: 'Réponses' },
  { valeur: 'rdv', label: 'RDV' },
  { valeur: 'problemes', label: 'Rebonds et erreurs' },
  { valeur: 'stop', label: 'STOP' },
]

const ouvert = (l: Ligne) => Boolean(l.ouvert_le) || l.dernier_evenement === 'opened' || l.dernier_evenement === 'clicked'
const probleme = (l: Ligne) => l.etat === 'erreur' || l.dernier_evenement === 'bounced' || l.dernier_evenement === 'complained'

function garde(l: Ligne, f: Filtre) {
  switch (f) {
    case 'a_envoyer': return l.etat === 'a_envoyer'
    case 'envoyes': return l.etat === 'envoye'
    case 'ouverts': return ouvert(l)
    case 'reponses': return l.statut === 'repondu' || l.statut === 'rdv' || l.statut === 'pas_interesse'
    case 'rdv': return l.statut === 'rdv'
    case 'problemes': return probleme(l)
    case 'stop': return l.statut === 'stop'
    default: return true
  }
}

function dateCourte(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function pourcent(n: number, total: number) {
  return total ? `${Math.round((n / total) * 100)} %` : '—'
}

export default function CampagneMailsPage() {
  const [lignes, setLignes] = useState<Ligne[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('envoyes')
  const [recherche, setRecherche] = useState('')
  const [ouverte, setOuverte] = useState<string | null>(null)
  const [majLe, setMajLe] = useState<Date | null>(null)
  const [campagne, setCampagne] = useState<CampagneId>(CAMPAGNES[0].id)

  const charger = useCallback(async () => {
    const { data, error } = await db
      .from('campagne_mails')
      .select('id,email,nom,cabinet,ville,site,objet,defauts,etat,envoye_le,dernier_evenement,evenement_le,ouvert_le,statut,notes')
      .eq('campagne', campagne)
      .order('envoye_le', { ascending: false, nullsFirst: false })
      .limit(5000)
    if (error) setErreur(`Chargement impossible : ${error.message}`)
    else { setLignes((data ?? []) as Ligne[]); setMajLe(new Date()) }
    setChargement(false)
  }, [campagne])

  useEffect(() => {
    void charger()
    const t = setInterval(() => void charger(), 30_000)
    return () => clearInterval(t)
  }, [charger])

  async function maj(id: string, champs: Partial<Pick<Ligne, 'statut' | 'notes'>>) {
    setLignes((ls) => ls.map((l) => (l.id === id ? { ...l, ...champs } : l)))
    const { error } = await db.from('campagne_mails').update(champs).eq('id', id)
    if (error) { setErreur(`Enregistrement impossible : ${error.message}`); void charger() }
  }

  const stats = useMemo(() => {
    const envoyes = lignes.filter((l) => l.etat === 'envoye')
    return {
      prevus: lignes.length,
      envoyes: envoyes.length,
      delivres: envoyes.filter((l) => l.dernier_evenement && !['sent', 'bounced', 'delivery_delayed'].includes(l.dernier_evenement)).length,
      ouverts: envoyes.filter(ouvert).length,
      rebonds: lignes.filter((l) => l.dernier_evenement === 'bounced' || l.etat === 'erreur').length,
      spam: lignes.filter((l) => l.dernier_evenement === 'complained').length,
      reponses: lignes.filter((l) => ['repondu', 'rdv', 'pas_interesse'].includes(l.statut)).length,
      rdv: lignes.filter((l) => l.statut === 'rdv').length,
      stop: lignes.filter((l) => l.statut === 'stop').length,
      dernierEnvoi: envoyes[0]?.envoye_le ?? null,
    }
  }, [lignes])

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    return lignes.filter((l) => garde(l, filtre) && (!q ||
      [l.email, l.nom, l.cabinet, l.ville, l.site].some((x) => x?.toLowerCase().includes(q))))
  }, [lignes, filtre, recherche])

  const tuiles: { label: string; valeur: number; detail?: string; ton?: string }[] = [
    { label: 'Envoyés', valeur: stats.envoyes, detail: `sur ${stats.prevus} prévus` },
    { label: 'Délivrés', valeur: stats.delivres, detail: pourcent(stats.delivres, stats.envoyes) },
    { label: 'Ouverts', valeur: stats.ouverts, detail: pourcent(stats.ouverts, stats.envoyes), ton: 'text-green-400' },
    { label: 'Réponses', valeur: stats.reponses, detail: pourcent(stats.reponses, stats.envoyes), ton: 'text-sky-300' },
    { label: 'RDV pris', valeur: stats.rdv, ton: 'text-emerald-300' },
    { label: 'Rebonds', valeur: stats.rebonds, ton: stats.rebonds ? 'text-red-400' : undefined },
    { label: 'Signalés spam', valeur: stats.spam, ton: stats.spam ? 'text-red-400' : undefined },
    { label: 'STOP', valeur: stats.stop },
  ]

  return (
    <div className="p-4 lg:p-8 max-w-7xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Campagne mails {CAMPAGNES.find((c) => c.id === campagne)?.titre}</h1>
          <div className="mt-3 flex gap-2">
            {CAMPAGNES.map((c) => (
              <button key={c.id} onClick={() => { setCampagne(c.id); setChargement(true); setLignes([]) }}
                className={`rounded-full px-3 py-1 text-sm capitalize ${campagne === c.id ? 'bg-white text-gray-950' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                {c.titre}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Audit SEO du site et première page refaite · envoi depuis zakariya.nebbache@digitalzdev.com
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>Dernier envoi : {dateCourte(stats.dernierEnvoi)}</div>
          <div>Actualisé à {majLe ? majLe.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '…'} · toutes les 30 s</div>
        </div>
      </div>

      <ErrorBanner message={erreur} onDismiss={() => setErreur(null)} />

      <div className="mb-3 h-2 w-full rounded-full bg-gray-800 overflow-hidden">
        <div className="h-full bg-green-500 transition-all" style={{ width: stats.prevus ? `${(stats.envoyes / stats.prevus) * 100}%` : '0%' }} />
      </div>
      <p className="mb-6 text-xs text-gray-500">
        {stats.envoyes} envoyés sur {stats.prevus} · {stats.prevus - stats.envoyes} restent à envoyer
      </p>

      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {tuiles.map((t) => (
          <div key={t.label} className="rounded-xl bg-gray-900 px-4 py-3">
            <div className="text-xs text-gray-400">{t.label}</div>
            <div className={`text-2xl font-semibold mt-1 ${t.ton ?? 'text-white'}`}>{t.valeur}</div>
            {t.detail && <div className="text-xs text-gray-500 mt-0.5">{t.detail}</div>}
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTRES.map((f) => {
          const n = lignes.filter((l) => garde(l, f.valeur)).length
          return (
            <button
              key={f.valeur}
              onClick={() => setFiltre(f.valeur)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${filtre === f.valeur ? 'bg-white text-gray-950' : 'bg-gray-900 text-gray-300 hover:bg-gray-800'}`}
            >
              {f.label} <span className="opacity-60">{n}</span>
            </button>
          )
        })}
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un cabinet, un nom, une ville…"
          className="ml-auto w-full sm:w-72 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600"
        />
      </div>

      {chargement ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : visibles.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun mail dans cette vue.</p>
      ) : (
        <div className="space-y-2">
          {visibles.map((l) => {
            const ev = l.etat === 'erreur' ? { label: 'Erreur d\'envoi', style: 'bg-red-900/60 text-red-300' }
              : l.etat === 'a_envoyer' ? { label: 'À envoyer', style: 'bg-gray-800 text-gray-400' }
              : EVENEMENTS[l.dernier_evenement ?? 'sent'] ?? { label: l.dernier_evenement ?? '', style: 'bg-gray-700 text-gray-200' }
            return (
              <div key={l.id} className="rounded-xl bg-gray-900 hover:bg-gray-900/80">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_7rem_8rem_10rem] items-center gap-3 px-4 py-3">
                  <button className="min-w-0 text-left" onClick={() => setOuverte(ouverte === l.id ? null : l.id)}>
                    <div className="truncate font-medium text-white">
                      {l.cabinet || (l.nom ? `Maître ${l.nom}` : l.email)}
                    </div>
                    <div className="truncate text-xs text-gray-400">
                      {l.nom ? `Maître ${l.nom} · ` : ''}{l.email}{l.ville ? ` · ${l.ville}` : ''}
                    </div>
                  </button>
                  <div className="min-w-0 truncate text-sm">
                    {l.site ? (
                      <a href={`https://${l.site}`} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white underline-offset-2 hover:underline">
                        {l.site}
                      </a>
                    ) : '—'}
                  </div>
                  <div className="text-xs text-gray-400">{dateCourte(l.envoye_le)}</div>
                  <div>
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs ${ev.style}`}>{ev.label}</span>
                  </div>
                  <select
                    value={l.statut}
                    onChange={(e) => void maj(l.id, { statut: e.target.value as Statut })}
                    className={`rounded-lg bg-gray-800 px-2 py-1.5 text-sm outline-none ${l.statut === 'rdv' ? 'text-emerald-300' : l.statut === 'repondu' ? 'text-sky-300' : l.statut === 'stop' ? 'text-red-300' : 'text-gray-200'}`}
                  >
                    {STATUTS.map((s) => <option key={s.valeur} value={s.valeur}>{s.label}</option>)}
                  </select>
                </div>
                {ouverte === l.id && (
                  <div className="px-4 pb-4 pt-1 space-y-3 text-sm">
                    {l.objet && <div><span className="text-gray-500">Objet : </span><span className="text-gray-200">{l.objet}</span></div>}
                    {l.defauts && l.defauts.length > 0 && (
                      <div>
                        <div className="text-gray-500 mb-1">Défauts relevés sur le site :</div>
                        <ul className="space-y-0.5 text-gray-300">
                          {l.defauts.map((d) => <li key={d}>- {d}</li>)}
                        </ul>
                      </div>
                    )}
                    {l.ouvert_le && <div className="text-gray-400">Ouvert pour la première fois vers le {dateCourte(l.ouvert_le)}</div>}
                    <textarea
                      defaultValue={l.notes ?? ''}
                      onBlur={(e) => { if (e.target.value !== (l.notes ?? '')) void maj(l.id, { notes: e.target.value }) }}
                      placeholder="Notes (réponse reçue, date de rappel…)"
                      rows={2}
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

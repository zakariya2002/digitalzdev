import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useTwilio } from '../../contexts/TwilioContext'
import { formatPhone } from '../../lib/phone'
import ErrorBanner from '../../components/dashboard/ErrorBanner'
import ScriptAppel from '../../components/dashboard/ScriptAppel'

/**
 * Appels à la chaîne vers les avocats de la table prospects_avocats.
 *
 * Chaque appel part du téléphone du navigateur (Twilio) : il y a toujours
 * quelqu'un au bout, aucun message enregistré n'est diffusé, et ces appels
 * ne sont pas enregistrés (paramètre Prospection, lu par le webhook voix).
 * Après chaque appel on note le résultat, puis le numéro suivant part seul.
 */

type Statut =
  | 'a_appeler' | 'pas_de_reponse' | 'repondeur' | 'rappeler' | 'interesse'
  | 'pas_interesse' | 'ne_plus_appeler' | 'faux_numero'

interface Prospect {
  id: string
  telephone: string
  mobile: boolean
  email: string | null
  site: string | null
  cabinet: string | null
  avocats: string | null
  nb_avocats: number
  ville: string | null
  code_postal: string | null
  barreau: string | null
  specialites: string | null
  annee_serment: number | null
  derniere_maj: string | null
  annee_site: number | null
  site_pas_a_jour: boolean
  note_seo: number | null
  a_corriger_seo: string | null
  techno: string | null
  position_google: number | null
  recherche_google: string | null
  position_verifiee_le: string | null
  statut: Statut
  nb_appels: number
  dernier_appel: string | null
  notes: string | null
}

const RESULTATS: { statut: Statut; label: string; style: string }[] = [
  { statut: 'pas_de_reponse', label: 'Pas de réponse', style: 'bg-gray-700 hover:bg-gray-600 text-white' },
  { statut: 'repondeur', label: 'Répondeur', style: 'bg-gray-700 hover:bg-gray-600 text-white' },
  { statut: 'rappeler', label: 'À rappeler', style: 'bg-yellow-600 hover:bg-yellow-500 text-white' },
  { statut: 'interesse', label: 'Intéressé', style: 'bg-green-600 hover:bg-green-500 text-white' },
  { statut: 'pas_interesse', label: 'Pas intéressé', style: 'bg-gray-700 hover:bg-gray-600 text-white' },
  { statut: 'ne_plus_appeler', label: 'Ne plus appeler', style: 'bg-red-700 hover:bg-red-600 text-white' },
  { statut: 'faux_numero', label: 'Faux numéro', style: 'bg-gray-700 hover:bg-gray-600 text-white' },
]

const LIBELLES: Record<Statut, string> = {
  a_appeler: 'À appeler', pas_de_reponse: 'Pas de réponse', repondeur: 'Répondeur', rappeler: 'À rappeler',
  interesse: 'Intéressés', pas_interesse: 'Pas intéressés', ne_plus_appeler: 'Ne plus appeler', faux_numero: 'Faux numéros',
}

const PAR_PAGE = 50

const COULEURS: Record<Statut, string> = {
  a_appeler: 'text-gray-300', pas_de_reponse: 'text-gray-400', repondeur: 'text-gray-400', rappeler: 'text-yellow-400',
  interesse: 'text-green-400', pas_interesse: 'text-gray-500', ne_plus_appeler: 'text-red-400', faux_numero: 'text-gray-500',
}

function libellePosition(p: Prospect) {
  if (!p.position_verifiee_le) return null
  if (!p.position_google) return 'Absent des 20 premiers'
  return p.position_google <= 10 ? `${p.position_google}e, première page` : `${p.position_google}e, deuxième page`
}

function couleurPosition(p: Prospect) {
  if (!p.position_google) return 'text-red-400'
  return p.position_google <= 3 ? 'text-green-400' : p.position_google <= 10 ? 'text-gray-200' : 'text-yellow-400'
}

function demainDixHeures() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(10, 0, 0, 0)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function heureOuvree() {
  const d = new Date()
  const jour = d.getDay()
  const h = d.getHours() + d.getMinutes() / 60
  return jour >= 1 && jour <= 5 && h >= 9 && h < 19
}

export default function ProspectionPage() {
  const { status, makeCall, hangup, callDuration, error: erreurTwilio } = useTwilio()

  const [mobiles, setMobiles] = useState(false)
  const [pasAJour, setPasAJour] = useState(false)
  const [noteMax, setNoteMax] = useState('')
  const [recherche, setRecherche] = useState('')
  const [position, setPosition] = useState('')
  const [noindex, setNoindex] = useState(false)
  const [defautsOuverts, setDefautsOuverts] = useState<string | null>(null)

  const [session, setSession] = useState(false)
  const [pause, setPause] = useState(false)
  const [phase, setPhase] = useState<'attente' | 'appel' | 'resultat'>('attente')
  const [courant, setCourant] = useState<Prospect | null>(null)
  const [notes, setNotes] = useState('')
  const [rappelerLe, setRappelerLe] = useState(demainDixHeures())
  const [compteur, setCompteur] = useState<number | null>(null)
  const [appelsSession, setAppelsSession] = useState(0)
  const [stats, setStats] = useState<Partial<Record<Statut, number>>>({})
  const [fileVide, setFileVide] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [voirScript, setVoirScript] = useState(false)

  const [liste, setListe] = useState<Prospect[]>([])
  const [nbListe, setNbListe] = useState(0)
  const [page, setPage] = useState(0)
  const [statutListe, setStatutListe] = useState<Statut | ''>('a_appeler')

  const vus = useRef<string[]>([])
  const statutPrecedent = useRef(status)

  const chargerStats = useCallback(async () => {
    const entrees = await Promise.all(
      (Object.keys(LIBELLES) as Statut[]).map(async s => {
        const { count } = await supabase.from('prospects_avocats').select('id', { count: 'exact', head: true }).eq('statut', s)
        return [s, count ?? 0] as const
      })
    )
    setStats(Object.fromEntries(entrees))
  }, [])

  useEffect(() => { chargerStats() }, [chargerStats])

  // La liste suit les mêmes filtres que la file d'appels.
  const chargerListe = useCallback(async () => {
    let q = supabase.from('prospects_avocats').select('*', { count: 'exact' })
    if (statutListe) q = q.eq('statut', statutListe)
    if (mobiles) q = q.eq('mobile', true)
    if (pasAJour) q = q.eq('site_pas_a_jour', true)
    if (noteMax) q = q.lte('note_seo', Number(noteMax))
    if (noindex) q = q.ilike('a_corriger_seo', '%noindex%')
    if (position === 'absent') q = q.not('position_verifiee_le', 'is', null).is('position_google', null)
    if (position === 'hors_p1') q = q.not('position_verifiee_le', 'is', null).or('position_google.is.null,position_google.gt.10')
    if (position === 'p2') q = q.gt('position_google', 10)
    if (position === 'p1') q = q.lte('position_google', 10)
    if (position === 'top3') q = q.lte('position_google', 3)
    const r = recherche.trim().replace(/[,()%*]/g, ' ').trim()
    if (r) {
      q = q.or(['ville', 'specialites', 'barreau', 'cabinet', 'avocats'].map(c => `${c}.ilike.%${r}%`)
        .concat(`code_postal.like.${r}%`).join(','))
    }
    const { data, count, error } = await q
      .order('site_pas_a_jour', { ascending: false })
      .order('note_seo', { ascending: true, nullsFirst: false })
      .order('id')
      .range(page * PAR_PAGE, page * PAR_PAGE + PAR_PAGE - 1)
    if (error) {
      setErreur('Impossible de charger la liste des numéros.')
      return
    }
    setListe((data ?? []) as Prospect[])
    setNbListe(count ?? 0)
  }, [statutListe, mobiles, pasAJour, noteMax, position, noindex, recherche, page])

  useEffect(() => {
    const t = setTimeout(chargerListe, 300)
    return () => clearTimeout(t)
  }, [chargerListe])

  useEffect(() => { setPage(0) }, [statutListe, mobiles, pasAJour, noteMax, position, noindex, recherche])

  const appeler = useCallback(async (p: Prospect) => {
    vus.current.push(p.id)
    setCourant(p)
    setNotes(p.notes ?? '')
    setRappelerLe(demainDixHeures())
    setPhase('appel')
    setAppelsSession(n => n + 1)
    await supabase.from('prospects_avocats')
      .update({ nb_appels: p.nb_appels + 1, dernier_appel: new Date().toISOString() })
      .eq('id', p.id)
    await makeCall(p.telephone, { Prospection: '1', prospectId: p.id })
  }, [makeCall])

  const appelerSuivant = useCallback(async () => {
    setCompteur(null)
    setFileVide(false)
    const { data, error } = await supabase.rpc('prochain_prospect', {
      p_mobiles: mobiles,
      p_pas_a_jour: pasAJour,
      p_note_max: noteMax ? Number(noteMax) : undefined,
      p_recherche: recherche.trim() || undefined,
      p_exclure: vus.current,
      p_position: position || undefined,
      p_noindex: noindex,
    })
    if (error) {
      setErreur('Impossible de charger le prochain numéro.')
      setSession(false)
      return
    }
    const p = (data as Prospect[] | null)?.[0]
    if (!p) {
      setFileVide(true)
      setSession(false)
      setCourant(null)
      setPhase('attente')
      return
    }
    await appeler(p)
  }, [mobiles, pasAJour, noteMax, position, noindex, recherche, appeler])

  // Fin d'appel : le softphone repasse au repos, on demande le résultat.
  useEffect(() => {
    const avant = statutPrecedent.current
    statutPrecedent.current = status
    if (phase === 'appel' && (avant === 'calling' || avant === 'in-call') && status === 'idle') {
      setPhase('resultat')
    }
  }, [status, phase])

  // Décompte avant l'appel suivant, annulable par « Pause ».
  useEffect(() => {
    if (compteur === null || pause) return
    if (compteur <= 0) {
      appelerSuivant()
      return
    }
    const t = setTimeout(() => setCompteur(c => (c === null ? null : c - 1)), 1000)
    return () => clearTimeout(t)
  }, [compteur, pause, appelerSuivant])

  const enregistrer = async (statut: Statut) => {
    if (!courant) return
    const maj: Record<string, unknown> = {
      statut,
      notes: notes.trim() || null,
      verrou_jusqua: null,
      rappeler_le: statut === 'rappeler' && rappelerLe ? new Date(rappelerLe).toISOString() : null,
    }
    if (statut === 'interesse') {
      const { data: client, error } = await supabase.from('clients').insert({
        name: courant.cabinet || courant.avocats || formatPhone(courant.telephone),
        contact_name: courant.avocats,
        phone: courant.telephone,
        email: courant.email,
        source: 'other',
        status: 'contacted',
        last_contacted_at: new Date().toISOString(),
        notes: [
          'Prospection avocats.',
          courant.site && `Site : ${courant.site}`,
          courant.note_seo !== null && `Note SEO : ${courant.note_seo}/100`,
          courant.a_corriger_seo && `À corriger : ${courant.a_corriger_seo}`,
          notes.trim(),
        ].filter(Boolean).join('\n'),
      }).select('id').single()
      if (error) setErreur("Le prospect est noté intéressé, mais la fiche client n'a pas pu être créée.")
      else maj.client_id = client.id
    }
    const { error } = await supabase.from('prospects_avocats').update(maj).eq('id', courant.id)
    if (error) {
      setErreur("Le résultat n'a pas pu être enregistré.")
      return
    }
    chargerStats()
    chargerListe()
    setPhase('attente')
    setCourant(null)
    if (session && !pause) setCompteur(3)
  }

  const lancer = () => {
    setErreur(null)
    setSession(true)
    setPause(false)
    vus.current = []
    setAppelsSession(0)
    appelerSuivant()
  }

  // Appel d'un numéro choisi dans la liste ; la suite de la file s'enchaîne ensuite.
  const appelerDepuisListe = async (p: Prospect) => {
    setErreur(null)
    const { data, error } = await supabase.from('prospects_avocats')
      .update({ verrou_jusqua: new Date(Date.now() + 10 * 60000).toISOString() })
      .eq('id', p.id)
      .or(`verrou_jusqua.is.null,verrou_jusqua.lt.${new Date().toISOString()}`)
      .select('*')
    if (error || !data?.length) {
      setErreur('Ce numéro est déjà en cours d\'appel.')
      return
    }
    setSession(true)
    setPause(false)
    vus.current = []
    setAppelsSession(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    await appeler(data[0] as Prospect)
  }

  const arreter = () => {
    setSession(false)
    setCompteur(null)
    if (phase === 'appel') hangup()
  }

  const minutes = Math.floor(callDuration / 60).toString().padStart(2, '0')
  const secondes = (callDuration % 60).toString().padStart(2, '0')
  const total = Object.values(stats).reduce((a, b) => a + (b ?? 0), 0)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Prospection avocats</h1>
        <p className="text-sm text-gray-400">
          {total.toLocaleString('fr-FR')} numéros. Les appels partent de ce navigateur, l'un après l'autre, et ne sont pas enregistrés.
        </p>
      </div>

      {(erreur || erreurTwilio) && <ErrorBanner message={erreur || erreurTwilio || ''} onDismiss={() => setErreur(null)} />}

      <div className="flex flex-wrap gap-2">
        {(Object.keys(LIBELLES) as Statut[]).map(s => (
          <div key={s} className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="text-xs text-gray-500">{LIBELLES[s]}</div>
            <div className="text-lg font-semibold text-white">{(stats[s] ?? 0).toLocaleString('fr-FR')}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={mobiles} onChange={e => setMobiles(e.target.checked)} disabled={session} />
          Portables seulement
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={pasAJour} onChange={e => setPasAJour(e.target.checked)} disabled={session} />
          Site pas à jour depuis 2024
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={noindex} onChange={e => setNoindex(e.target.checked)} disabled={session} />
          Site invisible sur Google (noindex)
        </label>
        <select
          value={noteMax}
          onChange={e => setNoteMax(e.target.value)}
          disabled={session}
          className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
        >
          <option value="">Toutes les notes SEO</option>
          <option value="50">Note SEO jusqu'à 50</option>
          <option value="70">Note SEO jusqu'à 70</option>
        </select>
        <select
          value={position}
          onChange={e => setPosition(e.target.value)}
          disabled={session}
          className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
        >
          <option value="">Toutes les positions Google</option>
          <option value="absent">Absents des 20 premiers</option>
          <option value="hors_p1">Pas en première page</option>
          <option value="p2">Deuxième page</option>
          <option value="p1">Première page</option>
          <option value="top3">Dans les 3 premiers</option>
        </select>
        <input
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          disabled={session}
          placeholder="Nom, cabinet, ville, code postal, barreau ou spécialité"
          className="flex-1 min-w-[220px] px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
        />
        <button
          onClick={() => setVoirScript(v => !v)}
          className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          {voirScript ? 'Masquer le script' : 'Voir le script'}
        </button>
        {!session ? (
          <button onClick={lancer} className="px-5 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg">
            Lancer les appels
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setPause(p => !p)}
              className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              {pause ? 'Reprendre' : 'Pause'}
            </button>
            <button onClick={arreter} className="px-4 py-2 text-sm font-medium bg-red-700 hover:bg-red-600 text-white rounded-lg">
              Arrêter
            </button>
          </div>
        )}
      </div>

      {!heureOuvree() && (
        <p className="text-sm text-yellow-400">
          Les cabinets sont joignables du lundi au vendredi, de 9 h à 19 h. En dehors, mieux vaut ne pas appeler.
        </p>
      )}
      {fileVide && <p className="text-sm text-gray-400">Plus aucun numéro à appeler avec ces filtres.</p>}
      {session && (
        <p className="text-sm text-gray-400">
          {appelsSession} appel{appelsSession > 1 ? 's' : ''} dans cette session.
          {compteur !== null && !pause && ` Appel suivant dans ${compteur} s.`}
          {pause && ' En pause.'}
        </p>
      )}

      {voirScript && !courant && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <ScriptAppel prospect={null} />
        </div>
      )}

      {courant && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xl font-bold text-white">{courant.cabinet || courant.avocats}</div>
                <div className="text-sm text-gray-400">
                  {[courant.ville, courant.code_postal, courant.barreau && `barreau de ${courant.barreau}`].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono text-white">{formatPhone(courant.telephone)}</div>
                <div className="text-sm text-gray-400">
                  {phase === 'appel' ? (status === 'in-call' ? `En ligne ${minutes}:${secondes}` : 'Appel en cours…') : 'Appel terminé'}
                  {courant.nb_appels > 0 && ` · déjà appelé ${courant.nb_appels} fois`}
                </div>
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-gray-500">Avocats ({courant.nb_avocats})</dt>
                <dd className="text-gray-200">{courant.avocats}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Spécialités</dt>
                <dd className="text-gray-200">{courant.specialites || 'Non renseignées'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Site</dt>
                <dd>
                  {courant.site
                    ? <a href={courant.site} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{courant.site}</a>
                    : <span className="text-gray-200">Aucun</span>}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Dernière mise à jour du site</dt>
                <dd className={courant.site_pas_a_jour ? 'text-yellow-400' : 'text-gray-200'}>
                  {courant.derniere_maj ? new Date(courant.derniere_maj).toLocaleDateString('fr-FR') : courant.annee_site ?? 'Inconnue'}
                  {courant.techno && ` · ${courant.techno}`}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Note SEO</dt>
                <dd className="text-gray-200">{courant.note_seo !== null ? `${courant.note_seo}/100` : 'Non notée'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Position Google</dt>
                <dd className={courant.position_verifiee_le ? couleurPosition(courant) : 'text-gray-200'}>
                  {libellePosition(courant) ?? 'Pas encore vérifiée'}
                  {courant.recherche_google && <span className="text-gray-500"> sur « {courant.recherche_google} »</span>}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Courriel</dt>
                <dd className="text-gray-200 break-all">{courant.email || 'Aucun'}</dd>
              </div>
              {courant.annee_serment && (
                <div>
                  <dt className="text-gray-500">Avocat depuis</dt>
                  <dd className="text-gray-200">{courant.annee_serment}</dd>
                </div>
              )}
            </dl>

            {courant.a_corriger_seo && (
              <div className="rounded-lg bg-gray-800 p-3 text-sm">
                <div className="text-gray-500 mb-1">À dire sur son site</div>
                <ul className="list-disc pl-5 text-gray-200 space-y-0.5">
                  {courant.a_corriger_seo.split(' ; ').map(m => <li key={m}>{m}</li>)}
                </ul>
              </div>
            )}

            <div className="pt-2">
              <div className="text-lg font-semibold text-white mb-3">Script</div>
              <ScriptAppel prospect={courant} />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            {phase === 'appel' && (
              <button onClick={hangup} className="w-full py-3 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg">
                Raccrocher
              </button>
            )}
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="Notes de l'appel"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 resize-none"
            />
            <label className="block text-xs text-gray-500">
              Rappeler le
              <input
                type="datetime-local"
                value={rappelerLe}
                onChange={e => setRappelerLe(e.target.value)}
                className="mt-1 w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RESULTATS.map(r => (
                <button
                  key={r.statut}
                  onClick={() => enregistrer(r.statut)}
                  disabled={phase === 'appel'}
                  className={`py-2 text-sm font-medium rounded-lg disabled:opacity-40 ${r.style}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              « Intéressé » crée sa fiche dans Leads & Clients. « Ne plus appeler » le retire définitivement de la file.
            </p>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="text-sm text-gray-400">
            {nbListe.toLocaleString('fr-FR')} numéro{nbListe > 1 ? 's' : ''} avec ces filtres
          </div>
          <select
            value={statutListe}
            onChange={e => setStatutListe(e.target.value as Statut | '')}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
          >
            <option value="">Tous les statuts</option>
            {(Object.keys(LIBELLES) as Statut[]).map(s => <option key={s} value={s}>{LIBELLES[s]}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="px-4 py-2 font-medium">Cabinet et avocats</th>
                <th className="px-4 py-2 font-medium">Ville</th>
                <th className="px-4 py-2 font-medium">Téléphone</th>
                <th className="px-4 py-2 font-medium">Site</th>
                <th className="px-4 py-2 font-medium">Google</th>
                <th className="px-4 py-2 font-medium">SEO</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {liste.map((p, i) => (
                <tr key={p.id} className={i % 2 ? '' : 'bg-gray-800/30'}>
                  <td className="px-4 py-2 max-w-xs">
                    <div className="text-white truncate">{p.cabinet || p.avocats}</div>
                    {p.cabinet && <div className="text-xs text-gray-500 truncate">{p.avocats}</div>}
                    {p.specialites && <div className="text-xs text-gray-500 truncate">{p.specialites}</div>}
                  </td>
                  <td className="px-4 py-2 text-gray-300 whitespace-nowrap">{p.ville}</td>
                  <td className="px-4 py-2 font-mono text-gray-200 whitespace-nowrap">{formatPhone(p.telephone)}</td>
                  <td className="px-4 py-2 max-w-[220px]">
                    {p.site && (
                      <a href={p.site} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate block">
                        {p.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </a>
                    )}
                    <div className={`text-xs ${p.site_pas_a_jour ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {p.annee_site ? `à jour en ${p.annee_site}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-2 max-w-[180px]">
                    <div className={`whitespace-nowrap ${couleurPosition(p)}`}>{libellePosition(p)}</div>
                    {p.recherche_google && <div className="text-xs text-gray-500">{p.recherche_google}</div>}
                  </td>
                  <td className="px-4 py-2 max-w-xs">
                    {p.note_seo !== null && (
                      p.a_corriger_seo ? (
                        <button
                          onClick={() => setDefautsOuverts(o => (o === p.id ? null : p.id))}
                          className="text-blue-400 hover:underline whitespace-nowrap"
                          title="Voir les défauts SEO"
                        >
                          {p.note_seo}/100 {defautsOuverts === p.id ? '▴' : '▾'}
                        </button>
                      ) : (
                        <span className="text-gray-300 whitespace-nowrap">{p.note_seo}/100</span>
                      )
                    )}
                    {defautsOuverts === p.id && p.a_corriger_seo && (
                      <ul className="mt-1 text-xs text-gray-400 space-y-0.5 min-w-[200px]">
                        {p.a_corriger_seo.split(' ; ').map(m => <li key={m}>{m}</li>)}
                      </ul>
                    )}
                  </td>
                  <td className={`px-4 py-2 whitespace-nowrap ${COULEURS[p.statut]}`}>
                    {LIBELLES[p.statut]}
                    {p.nb_appels > 0 && <span className="text-xs text-gray-500"> · {p.nb_appels} appel{p.nb_appels > 1 ? 's' : ''}</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => appelerDepuisListe(p)}
                      disabled={phase !== 'attente' || p.statut === 'ne_plus_appeler'}
                      className="px-3 py-1 text-xs font-medium bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-30"
                    >
                      Appeler
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {nbListe > PAR_PAGE && (
          <div className="flex items-center justify-end gap-3 p-4 text-sm text-gray-400">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="px-3 py-1 bg-gray-800 rounded-lg disabled:opacity-30">
              Précédents
            </button>
            Page {page + 1} sur {Math.ceil(nbListe / PAR_PAGE)}
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * PAR_PAGE >= nbListe}
              className="px-3 py-1 bg-gray-800 rounded-lg disabled:opacity-30"
            >
              Suivants
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

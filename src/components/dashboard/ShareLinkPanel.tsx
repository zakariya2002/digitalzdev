import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'

interface ShareLink {
  id: string
  token: string
  entity_type: string
  entity_id: string
  label: string | null
  allow_accept: boolean
  expires_at: string | null
  revoked_at: string | null
  first_viewed_at: string | null
  last_viewed_at: string | null
  view_count: number
  responded_at: string | null
  response: 'accepted' | 'rejected' | null
  response_name: string | null
  created_at: string
}

interface ShareLinkPanelProps {
  entityType: 'quote' | 'invoice' | 'project'
  entityId: string
  /** Un projet se partage pour information, un devis pour décision */
  defaultAllowAccept?: boolean
  /** Adresse du client, pré-remplie dans le formulaire d'envoi */
  defaultEmail?: string | null
}

/** Génère le lien que le client ouvre sans compte, et montre ce qu'il en a fait. */
export default function ShareLinkPanel({ entityType, entityId, defaultAllowAccept = true, defaultEmail }: ShareLinkPanelProps) {
  const { profile } = useTeam()
  const [links, setLinks] = useState<ShareLink[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [email, setEmail] = useState(defaultEmail || '')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const fetchLinks = useCallback(async () => {
    const { data, error: e } = await supabase
      .from('share_links').select('*')
      .eq('entity_type', entityType).eq('entity_id', entityId)
      .order('created_at', { ascending: false })
    if (e) { setError('Impossible de charger les liens de partage.'); return }
    setLinks((data || []) as ShareLink[])
  }, [entityType, entityId])

  useEffect(() => { fetchLinks() }, [fetchLinks])
  useEffect(() => { if (defaultEmail) setEmail(defaultEmail) }, [defaultEmail])

  // L'envoi crée son propre lien : on sait ensuite qui a ouvert quel message
  const sendByEmail = async () => {
    if (!email.includes('@')) { setError('Adresse e-mail invalide.'); return }
    setSending(true)
    setError(null)
    const { data: session } = await supabase.auth.getSession()
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ entityType, entityId, to: email.trim(), message }),
      })
      const payload = await res.json()
      if (!res.ok) {
        setError(payload.error || "L'envoi a échoué.")
      } else {
        setSent(true)
        setMessage('')
        fetchLinks()
      }
    } catch {
      setError("L'envoi a échoué. Vérifie ta connexion.")
    }
    setSending(false)
  }

  const publicUrl = (token: string) => `${window.location.origin}/espace/${token}`

  const create = async () => {
    setCreating(true)
    const { error: e } = await supabase.from('share_links').insert({
      entity_type: entityType,
      entity_id: entityId,
      allow_accept: defaultAllowAccept,
      created_by: profile?.id ?? null,
    })
    setCreating(false)
    if (e) { setError("Le lien n'a pas pu être créé."); return }
    setError(null)
    fetchLinks()
  }

  const revoke = async (id: string) => {
    const { error: e } = await supabase.from('share_links')
      .update({ revoked_at: new Date().toISOString() }).eq('id', id)
    if (e) { setError("Le lien n'a pas pu être désactivé."); return }
    fetchLinks()
  }

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(publicUrl(token))
      setCopied(token)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setError("La copie a échoué. Sélectionne le lien à la main.")
    }
  }

  const active = links.filter(l => !l.revoked_at)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 print:hidden">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-white">Espace client</h3>
          <p className="text-xs text-gray-500">
            {defaultAllowAccept
              ? 'Un lien à envoyer au client pour consulter et valider sans créer de compte.'
              : "Un lien de suivi : le client voit l'avancement, sans rien pouvoir modifier."}
          </p>
        </div>
        <button
          onClick={create}
          disabled={creating}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {creating ? 'Création…' : 'Créer un lien'}
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      {entityType !== 'project' && (
        <div className="mb-4 pb-4 border-b border-gray-800">
          <p className="text-xs font-medium text-gray-300 mb-2">Envoyer par e-mail</p>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSent(false) }}
              placeholder="client@exemple.com"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendByEmail}
              disabled={sending || !email.includes('@')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {sending ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Mot d'accompagnement (optionnel)"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
          {sent && <p className="text-xs text-green-400 mt-2">Envoyé. Le document est marqué comme envoyé.</p>}
        </div>
      )}

      {active.length === 0 ? (
        <p className="text-xs text-gray-500">Aucun lien actif.</p>
      ) : (
        <div className="space-y-3">
          {active.map(link => (
            <div key={link.id} className="p-3 bg-gray-800/60 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <input
                  readOnly
                  value={publicUrl(link.token)}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 min-w-0 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 font-mono"
                />
                <button
                  onClick={() => copy(link.token)}
                  className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded transition-colors flex-shrink-0"
                >
                  {copied === link.token ? 'Copié' : 'Copier'}
                </button>
                <button
                  onClick={() => revoke(link.id)}
                  className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  Désactiver
                </button>
              </div>

              <div className="flex items-center gap-3 text-[11px] flex-wrap">
                {link.responded_at ? (
                  <span className={link.response === 'accepted' ? 'text-green-400' : 'text-red-400'}>
                    {link.response === 'accepted' ? 'Accepté' : 'Refusé'} par {link.response_name || 'le client'}
                    {' · '}
                    {formatDistanceToNow(parseISO(link.responded_at), { addSuffix: true, locale: fr })}
                  </span>
                ) : link.view_count > 0 ? (
                  <span className="text-amber-400">
                    Consulté {link.view_count} fois · dernière vue{' '}
                    {link.last_viewed_at && formatDistanceToNow(parseISO(link.last_viewed_at), { addSuffix: true, locale: fr })}
                  </span>
                ) : (
                  <span className="text-gray-500">Jamais ouvert</span>
                )}
                {link.expires_at && (
                  <span className="text-gray-600">
                    Expire le {format(parseISO(link.expires_at), 'd MMM yyyy', { locale: fr })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

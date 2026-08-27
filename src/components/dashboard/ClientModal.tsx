import { useState, useEffect, type FormEvent } from 'react'
import Modal from './Modal'
import { toE164, isValidPhone } from '../../lib/phone'
import type { Client, ClientStatus, ClientSource, Project } from '../../types/database'

/** Ce que le formulaire client renvoie, y compris les mentions légales. */
export interface ClientFormData {
    name: string
    email: string | null
    phone: string | null
    phone_secondary?: string | null
    source: ClientSource
    status: ClientStatus
    notes: string | null
    project_id: string | null
    next_follow_up_at?: string | null
    address?: string | null
    trade_name?: string | null
    rcs?: string | null
    vat_number?: string | null
    contact_name?: string | null
    siren?: string | null
    legal_form?: string | null
    share_capital?: string | null
    representative?: string | null
  }

interface ClientModalProps {
  open: boolean
  onClose: () => void
  client: Client | null
  projects: Project[]
  onSave: (data: ClientFormData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const STATUSES: { value: ClientStatus; label: string }[] = [
  { value: 'new_lead', label: 'Nouveau lead' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'qualified', label: 'Qualifié' },
  { value: 'active', label: 'Client actif' },
  { value: 'completed', label: 'Terminé' },
]

const SOURCES: { value: ClientSource; label: string }[] = [
  { value: 'facebook', label: 'Facebook Ads' },
  { value: 'website', label: 'Site web' },
  { value: 'referral', label: 'Recommandation' },
  { value: 'manual', label: 'Ajout manuel' },
  { value: 'other', label: 'Autre' },
]

export default function ClientModal({ open, onClose, client, projects, onSave, onDelete }: ClientModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneSecondary, setPhoneSecondary] = useState('')
  const [source, setSource] = useState<ClientSource>('manual')
  const [status, setStatus] = useState<ClientStatus>('new_lead')
  const [notes, setNotes] = useState('')
  const [projectId, setProjectId] = useState('')
  const [nextFollowUp, setNextFollowUp] = useState('')
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  // Mentions reprises sur les devis et factures
  const [address, setAddress] = useState('')
  const [siren, setSiren] = useState('')
  const [legalForm, setLegalForm] = useState('')
  const [shareCapital, setShareCapital] = useState('')
  const [representative, setRepresentative] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [rcs, setRcs] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [contactName, setContactName] = useState('')

  useEffect(() => {
    if (client) {
      setName(client.name)
      setEmail(client.email || '')
      setPhone(client.phone || '')
      setPhoneSecondary(client.phone_secondary || '')
      setSource(client.source)
      setStatus(client.status)
      setNotes(client.notes || '')
      setProjectId(client.project_id || '')
      setNextFollowUp(client.next_follow_up_at ? client.next_follow_up_at.slice(0, 16) : '')
      setAddress(client.address || '')
      setSiren(client.siren || '')
      setLegalForm(client.legal_form || '')
      setShareCapital(client.share_capital || '')
      setRepresentative(client.representative || '')
      setTradeName(client.trade_name || '')
      setRcs(client.rcs || '')
      setVatNumber(client.vat_number || '')
      setContactName(client.contact_name || '')
    } else {
      setName('')
      setEmail('')
      setPhone('')
      setPhoneSecondary('')
      setSource('manual')
      setStatus('new_lead')
      setNotes('')
      setProjectId('')
      setNextFollowUp('')
      setAddress('')
      setSiren('')
      setLegalForm('')
      setShareCapital('')
      setRepresentative('')
      setTradeName('')
      setRcs('')
      setVatNumber('')
      setContactName('')
    }
    setPhoneError('')
  }, [client, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    // Validation téléphone : accepte tout format international
    const trimmedPhone = phone.trim()
    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      setPhoneError('Numéro de téléphone invalide')
      return
    }
    const trimmedPhone2 = phoneSecondary.trim()
    if (trimmedPhone2 && !isValidPhone(trimmedPhone2)) {
      setPhoneError('Numéro secondaire invalide')
      return
    }

    setPhoneError('')
    setLoading(true)
    await onSave({
      name: name.trim(),
      address: address.trim() || null,
      siren: siren.trim() || null,
      legal_form: legalForm.trim() || null,
      share_capital: shareCapital.trim() || null,
      representative: representative.trim() || null,
      trade_name: tradeName.trim() || null,
      rcs: rcs.trim() || null,
      vat_number: vatNumber.trim() || null,
      contact_name: contactName.trim() || null,
      email: email.trim() || null,
      phone: trimmedPhone ? toE164(trimmedPhone) : null,
      phone_secondary: trimmedPhone2 ? toE164(trimmedPhone2) : null,
      source,
      status,
      notes: notes.trim() || null,
      project_id: projectId || null,
      next_follow_up_at: nextFollowUp || null,
    })
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={client ? 'Modifier' : 'Nouveau lead / client'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Nom complet"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="client@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="06 12 34 56 78"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Téléphone secondaire</label>
            <input
              type="tel"
              value={phoneSecondary}
              onChange={(e) => setPhoneSecondary(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="07 98 76 54 32"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Prochaine relance</label>
            <input
              type="datetime-local"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {phoneError && (
          <p className="text-sm text-red-400">{phoneError}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ClientSource)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Projet associé</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Aucun</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Mentions reprises telles quelles sur les devis et factures */}
        <details className="border border-gray-800 rounded-lg">
          <summary className="px-3 py-2 text-sm text-gray-300 cursor-pointer hover:text-white select-none">
            Mentions pour les devis et factures
          </summary>
          <div className="p-3 pt-1 space-y-3">
            <p className="text-xs text-gray-500">
              Ces informations figurent sur les documents adressés à ce client. Laisse vide ce qui ne s'applique pas.
            </p>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Adresse</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                placeholder={"50 rue Marcelin Berthelot\n93700 Drancy, France"}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Enseigne</label>
                <input type="text" value={tradeName} onChange={(e) => setTradeName(e.target.value)}
                       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="Nom commercial, affiché entre parenthèses" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">SIREN ou SIRET</label>
                <input type="text" value={siren} onChange={(e) => setSiren(e.target.value)}
                       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="999 147 937" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Forme juridique</label>
                <input type="text" value={legalForm} onChange={(e) => setLegalForm(e.target.value)}
                       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="SARL, SAS, association…" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Capital social</label>
                <input type="text" value={shareCapital} onChange={(e) => setShareCapital(e.target.value)}
                       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="1 000 €" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">RCS</label>
                <input type="text" value={rcs} onChange={(e) => setRcs(e.target.value)}
                       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="RCS Paris 884 345 828" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">TVA intracommunautaire</label>
                <input type="text" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)}
                       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="FR12345678901" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Interlocuteur</label>
                <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="S'il diffère du représentant" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Représenté par</label>
                <input type="text" value={representative} onChange={(e) => setRepresentative(e.target.value)}
                       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="Prénom Nom" />
              </div>
            </div>
          </div>
        </details>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Notes..."
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Enregistrement...' : client ? 'Modifier' : 'Créer'}
          </button>
          {client && onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(client.id); onClose() }}
              className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-lg transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}

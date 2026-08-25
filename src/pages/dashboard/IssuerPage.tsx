import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import ErrorBanner from '../../components/dashboard/ErrorBanner'
import Avatar from '../../components/dashboard/Avatar'

const TEMPLATES = [
  {
    value: 'classic' as const,
    label: 'Sobre',
    hint: 'Fond crème, bandeaux noirs, blocs émetteur et client. Convient à un document signé à la main.',
  },
  {
    value: 'agency' as const,
    label: 'Agence',
    hint: 'Bandeau de marque en tête, tableau détaillé avec unité et TVA, pied de page répété.',
  },
]

const ACCENTS = ['#5a5a5a', '#1c1c1a', '#1f5fd0', '#16724d', '#8a3a3a', '#5b3a8a']

/** Chaque membre facture sous sa propre entité, avec sa propre présentation. */
export default function IssuerPage() {
  const { profile, refresh } = useTeam()
  const [form, setForm] = useState({
    issuer_name: '', issuer_brand: '', issuer_legal_form: '', issuer_siret: '',
    issuer_rm: '', issuer_address: '', issuer_email: '', issuer_phone: '',
    issuer_logo_url: '', iban: '', bic: '', bank_name: '',
    document_template: 'classic' as 'classic' | 'agency',
    document_accent: '#5a5a5a',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    setForm({
      issuer_name: profile.issuer_name || profile.full_name || '',
      issuer_brand: profile.issuer_brand || '',
      issuer_legal_form: profile.issuer_legal_form || '',
      issuer_siret: profile.issuer_siret || '',
      issuer_rm: profile.issuer_rm || '',
      issuer_address: profile.issuer_address || '',
      issuer_email: profile.issuer_email || profile.email || '',
      issuer_phone: profile.issuer_phone || '',
      issuer_logo_url: profile.issuer_logo_url || '',
      iban: profile.iban || '',
      bic: profile.bic || '',
      bank_name: profile.bank_name || '',
      document_template: profile.document_template || 'classic',
      document_accent: profile.document_accent || '#5a5a5a',
    })
  }, [profile])

  const save = async () => {
    if (!profile) return
    setSaving(true); setError(null)
    const { error: e } = await supabase.from('profiles').update({
      ...form,
      // L'IBAN se saisit comme on veut, il se range par groupes de quatre
      iban: form.iban.replace(/\s+/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim() || null,
      bic: form.bic.replace(/\s+/g, '').toUpperCase() || null,
      issuer_brand: form.issuer_brand || null,
      issuer_legal_form: form.issuer_legal_form || null,
      issuer_siret: form.issuer_siret || null,
      issuer_rm: form.issuer_rm || null,
      issuer_address: form.issuer_address || null,
      issuer_phone: form.issuer_phone || null,
      issuer_logo_url: form.issuer_logo_url || null,
      bank_name: form.bank_name || null,
    }).eq('id', profile.id)
    setSaving(false)
    if (e) { setError("Ton identité d'émission n'a pas pu être enregistrée."); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    refresh()
  }

  const uploadLogo = async (file: File) => {
    if (!profile) return
    setError(null)
    const path = `logos/${profile.id}-${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`
    const { error: e } = await supabase.storage.from('project-files').upload(path, file, { upsert: true })
    if (e) { setError("Le logo n'a pas pu être envoyé."); return }
    const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 60 * 60 * 24 * 365 * 5)
    if (data?.signedUrl) setForm(f => ({ ...f, issuer_logo_url: data.signedUrl }))
  }

  const input = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500'

  if (!profile) return <div className="p-6 text-sm text-gray-500">Chargement…</div>

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-1">
          <Avatar profile={profile} size="md" />
          <div>
            <h2 className="text-sm font-semibold text-white">Mes devis et factures</h2>
            <p className="text-xs text-gray-500">
              Les documents que tu crées portent cette identité et cette présentation.
              Chacun a la sienne.
            </p>
          </div>
        </div>
      </div>

      {/* Présentation */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Présentation du document</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {TEMPLATES.map(t => (
            <button
              key={t.value}
              onClick={() => setForm(f => ({ ...f, document_template: t.value }))}
              className={`text-left p-4 rounded-lg border transition-colors ${
                form.document_template === t.value
                  ? 'border-blue-600 bg-blue-600/10'
                  : 'border-gray-800 bg-gray-800/40 hover:border-gray-700'
              }`}
            >
              <p className="text-sm font-medium text-white">{t.label}</p>
              <p className="text-xs text-gray-500 mt-1">{t.hint}</p>
            </button>
          ))}
        </div>

        <label className="block text-xs text-gray-400 mb-2">Couleur des bandeaux</label>
        <div className="flex items-center gap-2 flex-wrap">
          {ACCENTS.map(c => (
            <button
              key={c}
              onClick={() => setForm(f => ({ ...f, document_accent: c }))}
              className={`w-8 h-8 rounded-full transition-transform ${
                form.document_accent === c ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Couleur ${c}`}
            />
          ))}
          <input
            type="color" value={form.document_accent}
            onChange={(e) => setForm(f => ({ ...f, document_accent: e.target.value }))}
            className="w-8 h-8 rounded bg-transparent border border-gray-700 cursor-pointer"
            aria-label="Couleur personnalisée"
          />
        </div>
      </div>

      {/* Identité */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Identité qui figure sur le document</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nom</label>
            <input type="text" value={form.issuer_name}
                   onChange={(e) => setForm(f => ({ ...f, issuer_name: e.target.value }))}
                   placeholder="Prénom Nom" className={input} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Marque</label>
            <input type="text" value={form.issuer_brand}
                   onChange={(e) => setForm(f => ({ ...f, issuer_brand: e.target.value }))}
                   placeholder="Nom commercial affiché en tête" className={input} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Forme juridique</label>
            <input type="text" value={form.issuer_legal_form}
                   onChange={(e) => setForm(f => ({ ...f, issuer_legal_form: e.target.value }))}
                   placeholder="Entrepreneur individuel" className={input} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">SIRET</label>
            <input type="text" value={form.issuer_siret}
                   onChange={(e) => setForm(f => ({ ...f, issuer_siret: e.target.value }))}
                   className={input} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Répertoire des métiers</label>
            <input type="text" value={form.issuer_rm}
                   onChange={(e) => setForm(f => ({ ...f, issuer_rm: e.target.value }))}
                   placeholder="Si applicable" className={input} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Adresse électronique</label>
            <input type="email" value={form.issuer_email}
                   onChange={(e) => setForm(f => ({ ...f, issuer_email: e.target.value }))}
                   className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Adresse postale</label>
            <textarea value={form.issuer_address} rows={2}
                      onChange={(e) => setForm(f => ({ ...f, issuer_address: e.target.value }))}
                      placeholder={'1 rue Exemple\n75000 Paris, France'}
                      className={`${input} resize-none`} />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs text-gray-400 mb-1">Logo</label>
          <div className="flex items-center gap-4 flex-wrap">
            {form.issuer_logo_url && (
              <img src={form.issuer_logo_url} alt="" className="h-12 max-w-[10rem] object-contain bg-gray-800 rounded p-1" />
            )}
            <input type="file" accept="image/*"
                   onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }}
                   className="text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 file:cursor-pointer" />
            {form.issuer_logo_url && (
              <button onClick={() => setForm(f => ({ ...f, issuer_logo_url: '' }))}
                      className="text-xs text-gray-500 hover:text-red-400">Retirer</button>
            )}
          </div>
        </div>
      </div>

      {/* Banque */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Coordonnées bancaires</h3>
        <p className="text-xs text-gray-500 mb-3">Elles figurent sur tes factures, jamais sur tes devis.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">IBAN</label>
            <input type="text" value={form.iban}
                   onChange={(e) => setForm(f => ({ ...f, iban: e.target.value }))}
                   className={`${input} font-mono`} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">BIC</label>
            <input type="text" value={form.bic}
                   onChange={(e) => setForm(f => ({ ...f, bic: e.target.value }))}
                   className={`${input} font-mono`} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Banque</label>
            <input type="text" value={form.bank_name}
                   onChange={(e) => setForm(f => ({ ...f, bank_name: e.target.value }))}
                   className={input} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {saved && <span className="text-sm text-green-400">Enregistré</span>}
      </div>
    </div>
  )
}

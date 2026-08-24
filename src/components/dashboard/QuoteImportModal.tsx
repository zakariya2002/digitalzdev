import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/business'
import { parseQuoteFile, parseQuoteText, type ParsedQuote, type ParsedItem } from '../../lib/quoteImport'
import type { Client, Project } from '../../types/database'

interface QuoteImportModalProps {
  open: boolean
  onClose: () => void
  clients: Client[]
  projects: Project[]
  onImported: () => void
}

/** Reprend un devis existant (PDF, tableur ou texte collé) et le transforme en devis du CRM. */
export default function QuoteImportModal({ open, onClose, clients, projects, onImported }: QuoteImportModalProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<'source' | 'review'>('source')
  const [pasted, setPasted] = useState('')
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParsedQuote | null>(null)
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [title, setTitle] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [items, setItems] = useState<ParsedItem[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep('source'); setPasted(''); setParsed(null); setItems([])
    setTitle(''); setValidUntil(''); setClientId(''); setProjectId(''); setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const applyParsed = (result: ParsedQuote) => {
    setParsed(result)
    setItems(result.items)
    setTitle(result.title || '')
    setValidUntil(result.validUntil || '')

    // Rapprochement avec un client déjà connu, par e-mail puis par nom
    const byEmail = result.clientEmail
      ? clients.find(c => c.email?.toLowerCase() === result.clientEmail!.toLowerCase())
      : undefined
    const byName = !byEmail && result.clientName
      ? clients.find(c => c.name.toLowerCase().includes(result.clientName!.toLowerCase())
          || result.clientName!.toLowerCase().includes(c.name.toLowerCase()))
      : undefined
    if (byEmail || byName) setClientId((byEmail || byName)!.id)

    setStep('review')
  }

  const handleFile = async (file: File) => {
    setParsing(true); setError(null)
    try {
      applyParsed(await parseQuoteFile(file))
    } catch {
      setError("Ce fichier n'a pas pu être lu. Copie son contenu et colle-le ci-dessous.")
    }
    setParsing(false)
  }

  const handlePaste = () => {
    if (!pasted.trim()) return
    setParsing(true); setError(null)
    try {
      applyParsed(parseQuoteText(pasted))
    } catch {
      setError("Le texte n'a pas pu être analysé.")
    }
    setParsing(false)
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  const updateItem = (index: number, patch: Partial<ParsedItem>) =>
    setItems(prev => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  const save = async () => {
    if (!title.trim() || items.length === 0) {
      setError('Il faut au moins un intitulé et une ligne de prestation.')
      return
    }
    setSaving(true); setError(null)

    const { data: number, error: seqError } = await supabase.rpc('next_sequence_number', { seq_id: 'quote' })
    if (seqError || !number) {
      setError("Le numéro de devis n'a pas pu être généré."); setSaving(false); return
    }

    const { data: quote, error: quoteError } = await supabase.from('quotes').insert({
      quote_number: number,
      title: title.trim(),
      client_id: clientId || null,
      project_id: projectId || null,
      valid_until: validUntil || null,
      total_amount: total,
      status: 'draft',
      description: parsed?.number ? `Repris du devis ${parsed.number}` : null,
    }).select('id').single()

    if (quoteError || !quote) {
      setError("Le devis n'a pas pu être créé."); setSaving(false); return
    }

    const { error: itemsError } = await supabase.from('quote_items').insert(
      items.map((item, index) => ({
        quote_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        position: index,
      }))
    )
    setSaving(false)
    if (itemsError) { setError('Les lignes n\'ont pas pu être enregistrées.'); return }

    onImported()
    reset()
    onClose()
    navigate(`/dashboard/quotes/${quote.id}`)
  }

  const inputClass = 'px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500'

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose() }}
      title={step === 'source' ? 'Importer un devis' : 'Vérifier avant d\'enregistrer'}
      maxWidth="max-w-3xl"
    >
      {step === 'source' ? (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-300 mb-1">Depuis un fichier</p>
            <p className="text-xs text-gray-500 mb-3">
              PDF, tableur exporté en CSV, ou fichier texte. Le contenu est lu dans ton navigateur,
              rien n'est envoyé ailleurs.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.csv,.tsv,.txt,text/plain,application/pdf"
              disabled={parsing}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              className="text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
            />
          </div>

          <div className="border-t border-gray-800 pt-5">
            <p className="text-sm text-gray-300 mb-1">Ou colle le contenu</p>
            <p className="text-xs text-gray-500 mb-3">
              Copie les lignes du devis depuis un mail, un PDF ou un tableur, puis colle ici.
            </p>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={7}
              placeholder={'Création du site vitrine   1   1 200,00\nIntégration des contenus   1   300,00\nTotal   1 500,00'}
              className={`${inputClass} w-full resize-none font-mono text-xs`}
            />
            <button
              onClick={handlePaste}
              disabled={parsing || !pasted.trim()}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {parsing ? 'Analyse…' : 'Analyser'}
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              {items.length} ligne{items.length > 1 ? 's' : ''} reconnue{items.length > 1 ? 's' : ''}
              {parsed?.number ? ` · devis d'origine ${parsed.number}` : ''}
              {parsed?.total && Math.abs(parsed.total - total) > 0.5
                ? ` · le total lu était ${formatCurrency(parsed.total)}, vérifie les lignes`
                : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Intitulé</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Valable jusqu'au</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Client{parsed?.clientName ? ` (lu : ${parsed.clientName})` : ''}
              </label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={`${inputClass} w-full`}>
                <option value="">Aucun client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Projet</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={`${inputClass} w-full`}>
                <option value="">Aucun projet</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">Lignes</label>
              <button
                onClick={() => setItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0 }])}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                + Ajouter une ligne
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <input
                    type="text" value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    placeholder="Prestation"
                    className={`${inputClass} flex-1 min-w-[10rem]`}
                  />
                  <input
                    type="number" step="0.01" value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                    className={`${inputClass} w-20`} title="Quantité"
                  />
                  <input
                    type="number" step="0.01" value={item.unit_price}
                    onChange={(e) => updateItem(index, { unit_price: parseFloat(e.target.value) || 0 })}
                    className={`${inputClass} w-28`} title="Prix unitaire"
                  />
                  <span className="text-sm text-gray-400 w-24 text-right tabular-nums">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </span>
                  <button
                    onClick={() => setItems(prev => prev.filter((_, i) => i !== index))}
                    className="text-gray-600 hover:text-red-400 px-1"
                    aria-label="Retirer la ligne"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {parsed && parsed.leftovers.length > 0 && (
            <details className="text-xs">
              <summary className="text-gray-500 cursor-pointer hover:text-gray-300">
                {parsed.leftovers.length} ligne{parsed.leftovers.length > 1 ? 's' : ''} non interprétée{parsed.leftovers.length > 1 ? 's' : ''}
              </summary>
              <div className="mt-2 p-2 bg-gray-800 rounded-lg max-h-32 overflow-y-auto">
                {parsed.leftovers.map((line, i) => (
                  <p key={i} className="text-gray-500 font-mono text-[11px] break-words">{line}</p>
                ))}
              </div>
            </details>
          )}

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-800 flex-wrap">
            <span className="text-sm text-gray-400">
              Total du devis : <span className="text-lg font-bold text-white tabular-nums">{formatCurrency(total)}</span>
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('source')} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Reprendre
              </button>
              <button
                onClick={save}
                disabled={saving || items.length === 0 || !title.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Enregistrement…' : 'Créer le devis'}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}
    </Modal>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { formatCurrency, BUSINESS, PRICING_GRID } from '../../lib/business'
import type { Quote, QuoteItem, Client, Project, QuoteStatus } from '../../types/database'

const STATUS_BADGE: Record<QuoteStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Brouillon', bg: 'bg-gray-500/20', text: 'text-gray-400' },
  sent: { label: 'Envoy\u00e9', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  accepted: { label: 'Accept\u00e9', bg: 'bg-green-500/20', text: 'text-green-400' },
  rejected: { label: 'Refus\u00e9', bg: 'bg-red-500/20', text: 'text-red-400' },
  expired: { label: 'Expir\u00e9', bg: 'bg-amber-500/20', text: 'text-amber-400' },
}

const inputClass = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500'

interface LineItem {
  id?: string
  description: string
  quantity: number
  unit_price: number
  position: number
}

export default function QuoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  // Quote fields
  const [quoteNumber, setQuoteNumber] = useState('')
  const [clientId, setClientId] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<QuoteStatus>('draft')
  const [validUntil, setValidUntil] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
  const [terms, setTerms] = useState(BUSINESS.defaultPaymentTerms)
  const [notes, setNotes] = useState('')

  // Items (line items)
  const [items, setItems] = useState<LineItem[]>([])

  // Reference data
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [saving, setSaving] = useState(false)

  // Fetch quote data (for edit mode)
  const fetchQuote = useCallback(async () => {
    if (isNew || !id) return
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      console.error('Fetch quote error:', error)
      return
    }
    if (data) {
      const q = data as Quote
      setQuoteNumber(q.quote_number)
      setClientId(q.client_id)
      setProjectId(q.project_id)
      setTitle(q.title)
      setDescription(q.description || '')
      setStatus(q.status)
      setValidUntil(q.valid_until || '')
      setTerms(q.terms || '')
      setNotes(q.notes || '')
    }

    // Fetch items
    const { data: itemsData, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', id)
      .order('position', { ascending: true })
    if (itemsError) console.error('Fetch items error:', itemsError)
    if (itemsData) {
      setItems(
        itemsData.map((i: QuoteItem) => ({
          id: i.id,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          position: i.position,
        }))
      )
    }
  }, [id, isNew])

  // Fetch reference data (clients + projects)
  const fetchReferenceData = useCallback(async () => {
    const [clientsRes, projectsRes] = await Promise.all([
      supabase.from('clients').select('*').order('name'),
      supabase.from('projects').select('*').order('name'),
    ])
    if (clientsRes.data) setClients(clientsRes.data as Client[])
    if (projectsRes.data) setProjects(projectsRes.data as Project[])
  }, [])

  // Generate quote number for new quotes
  const generateQuoteNumber = useCallback(async () => {
    const { data, error } = await supabase.rpc('next_sequence_number', { seq_id: 'quote' })
    if (error) console.error('Generate quote number error:', error)
    if (data) setQuoteNumber(data)
  }, [])

  useEffect(() => {
    fetchReferenceData()
    if (isNew) {
      generateQuoteNumber()
    } else {
      fetchQuote()
    }
  }, [isNew, fetchQuote, fetchReferenceData, generateQuoteNumber])

  // Item management helpers
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, position: items.length }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const addFromGrid = (gridItem: typeof PRICING_GRID[0]) => {
    setItems([
      ...items,
      {
        description: gridItem.label + ' \u2014 ' + gridItem.description,
        quantity: 1,
        unit_price: Math.round((gridItem.min + gridItem.max) / 2),
        position: items.length,
      },
    ])
  }

  // Total calculation
  const totalHT = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  // Save logic
  const handleSave = async (newStatus?: QuoteStatus) => {
    setSaving(true)
    const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

    const quoteData: Record<string, unknown> = {
      quote_number: quoteNumber,
      client_id: clientId,
      project_id: projectId,
      title,
      description: description || null,
      status: newStatus || status,
      valid_until: validUntil || null,
      terms: terms || null,
      notes: notes || null,
      total_amount: total,
    }

    if (newStatus === 'sent') {
      quoteData.sent_at = new Date().toISOString()
    }
    if (newStatus === 'accepted') {
      quoteData.accepted_at = new Date().toISOString()
    }

    let quoteId = id

    if (isNew) {
      const { data, error } = await supabase.from('quotes').insert(quoteData).select().single()
      if (error) {
        console.error('Insert quote error:', error)
        setSaving(false)
        return
      }
      quoteId = data.id
    } else {
      const { error } = await supabase.from('quotes').update(quoteData).eq('id', id)
      if (error) {
        console.error('Update quote error:', error)
        setSaving(false)
        return
      }
      // Delete old items and re-insert
      await supabase.from('quote_items').delete().eq('quote_id', id)
    }

    // Insert items
    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('quote_items').insert(
        items.map((item, index) => ({
          quote_id: quoteId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          position: index,
        }))
      )
      if (itemsError) console.error('Insert items error:', itemsError)
    }

    if (newStatus) setStatus(newStatus)
    setSaving(false)

    if (isNew) {
      navigate(`/dashboard/quotes/${quoteId}`, { replace: true })
    } else {
      fetchQuote()
    }
  }

  // Convert to invoice handler
  const handleConvertToInvoice = async () => {
    const { data: quoteItems } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', id)
    const { data: invoiceNumber } = await supabase.rpc('next_sequence_number', { seq_id: 'invoice' })
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        quote_id: id,
        client_id: clientId,
        project_id: projectId,
        title,
        description: description || null,
        terms: terms || null,
        total_amount: totalHT,
        due_date: dueDate.toISOString().slice(0, 10),
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Create invoice error:', error)
      return
    }

    if (invoice && quoteItems) {
      await supabase.from('invoice_items').insert(
        quoteItems.map((i: QuoteItem) => ({
          invoice_id: invoice.id,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          position: i.position,
        }))
      )
    }

    if (invoice) navigate(`/dashboard/invoices/${invoice.id}`)
  }

  const badge = STATUS_BADGE[status]

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/quotes')}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">
            {isNew ? 'Nouveau devis' : quoteNumber}
          </h1>
          {!isNew && (
            <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {status === 'draft' && (
            <button
              onClick={() => handleSave('sent')}
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Marquer comme envoy\u00e9
            </button>
          )}
          {status === 'sent' && (
            <button
              onClick={() => handleSave('accepted')}
              disabled={saving}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Marquer comme accept\u00e9
            </button>
          )}
          {status === 'accepted' && (
            <button
              onClick={handleConvertToInvoice}
              disabled={saving}
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Convertir en facture
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Imprimer / PDF
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2">
          {/* Client & Project section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Client & Projet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Client</label>
                <select
                  value={clientId || ''}
                  onChange={(e) => setClientId(e.target.value || null)}
                  className={inputClass}
                >
                  <option value="">-- S\u00e9lectionner un client --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Projet</label>
                <select
                  value={projectId || ''}
                  onChange={(e) => setProjectId(e.target.value || null)}
                  className={inputClass}
                >
                  <option value="">-- Aucun projet --</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Titre & Description</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Titre *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre du devis"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description optionnelle..."
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Lignes du devis</h2>
              <select
                value=""
                onChange={(e) => {
                  const idx = parseInt(e.target.value)
                  if (!isNaN(idx)) addFromGrid(PRICING_GRID[idx])
                }}
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">Ajouter depuis la grille tarifaire</option>
                {PRICING_GRID.map((item, index) => (
                  <option key={item.type} value={index}>
                    {item.label} ({formatCurrency(item.min)} - {formatCurrency(item.max)})
                  </option>
                ))}
              </select>
            </div>

            {/* Items table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Quantit\u00e9</th>
                    <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Prix unitaire</th>
                    <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Total</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Description de la ligne..."
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          min={1}
                          step={1}
                          className={`${inputClass} w-20`}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          min={0}
                          step={0.01}
                          className={`${inputClass} w-28`}
                        />
                      </td>
                      <td className="py-2 pr-2 text-right text-sm font-medium text-white whitespace-nowrap">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                          title="Supprimer la ligne"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">
                Aucune ligne. Ajoutez des lignes au devis.
              </div>
            )}

            {/* Add line button */}
            <button
              onClick={addItem}
              className="mt-4 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-dashed border-gray-700 hover:border-blue-500 rounded-lg transition-colors w-full"
            >
              + Ajouter une ligne
            </button>

            {/* Total section */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Total HT</span>
                <span className="text-lg font-bold text-white">{formatCurrency(totalHT)}</span>
              </div>
              <p className="mt-1 text-xs italic text-gray-500">
                TVA non applicable, article 293 B du CGI
              </p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1">
          {/* Validity */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Validit\u00e9</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Valable jusqu'au</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Conditions</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Conditions de paiement</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={4}
                className={inputClass}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Notes</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes internes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes visibles sur le devis..."
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons at bottom */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-5 py-2.5 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
        {(status === 'draft' || isNew) && (
          <button
            onClick={() => handleSave('sent')}
            disabled={saving}
            className="px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Marquer comme envoy\u00e9
          </button>
        )}
        {status === 'sent' && (
          <button
            onClick={() => handleSave('accepted')}
            disabled={saving}
            className="px-5 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Marquer comme accept\u00e9
          </button>
        )}
        {status === 'accepted' && (
          <button
            onClick={handleConvertToInvoice}
            disabled={saving}
            className="px-5 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Convertir en facture
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          Imprimer / PDF
        </button>
      </div>
    </div>
  )
}

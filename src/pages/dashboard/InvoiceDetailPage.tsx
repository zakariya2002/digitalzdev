import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { formatCurrency, BUSINESS, PRICING_GRID, calculateCharges } from '../../lib/business'
import Modal from '../../components/dashboard/Modal'
import type { Invoice, InvoiceItem, InvoiceStatus, Payment, PaymentMethod, Client, Project } from '../../types/database'

const STATUS_BADGE: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Brouillon', bg: 'bg-gray-500/20', text: 'text-gray-400' },
  sent: { label: 'Envoyée', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  paid: { label: 'Payée', bg: 'bg-green-500/20', text: 'text-green-400' },
  partial: { label: 'Partiel', bg: 'bg-amber-500/20', text: 'text-amber-400' },
  overdue: { label: 'En retard', bg: 'bg-red-500/20', text: 'text-red-400' },
  cancelled: { label: 'Annulée', bg: 'bg-red-500/20', text: 'text-red-400' },
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  virement: 'Virement',
  carte: 'Carte bancaire',
  paypal: 'PayPal',
  especes: 'Espèces',
  cheque: 'Chèque',
  autre: 'Autre',
}

const inputClass = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500'

interface LineItem {
  id?: string
  description: string
  quantity: number
  unit_price: number
  position: number
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  // Invoice fields
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [clientId, setClientId] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<InvoiceStatus>('draft')
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
  const [terms, setTerms] = useState(BUSINESS.defaultPaymentTerms)
  const [notes, setNotes] = useState('')
  const [paidAmount, setPaidAmount] = useState(0)

  // Items
  const [items, setItems] = useState<LineItem[]>([])

  // Payments
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('virement')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Reference data
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [saving, setSaving] = useState(false)

  // Fetch invoice data (for edit mode)
  const fetchInvoice = useCallback(async () => {
    if (isNew || !id) return
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      console.error('Fetch invoice error:', error)
      return
    }
    if (data) {
      const inv = data as Invoice
      setInvoiceNumber(inv.invoice_number)
      setClientId(inv.client_id)
      setProjectId(inv.project_id)
      setTitle(inv.title)
      setDescription(inv.description || '')
      setStatus(inv.status)
      setIssueDate(inv.issue_date || format(new Date(), 'yyyy-MM-dd'))
      setDueDate(inv.due_date || '')
      setTerms(inv.terms || '')
      setNotes(inv.notes || '')
      setPaidAmount(inv.paid_amount || 0)
    }

    // Fetch items
    const { data: itemsData, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('position', { ascending: true })
    if (itemsError) console.error('Fetch items error:', itemsError)
    if (itemsData) {
      setItems(
        itemsData.map((i: InvoiceItem) => ({
          id: i.id,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          position: i.position,
        }))
      )
    }

    // Fetch payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', id)
      .order('paid_at', { ascending: false })
    if (paymentsError) console.error('Fetch payments error:', paymentsError)
    if (paymentsData) {
      setPayments(paymentsData as Payment[])
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

  // Generate invoice number for new invoices
  const generateInvoiceNumber = useCallback(async () => {
    const { data, error } = await supabase.rpc('next_sequence_number', { seq_id: 'invoice' })
    if (error) console.error('Generate invoice number error:', error)
    if (data) setInvoiceNumber(data)
  }, [])

  useEffect(() => {
    fetchReferenceData()
    if (isNew) {
      generateInvoiceNumber()
    } else {
      fetchInvoice()
    }
  }, [isNew, fetchInvoice, fetchReferenceData, generateInvoiceNumber])

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
  const resteDu = totalHT - paidAmount
  const charges = calculateCharges(totalHT)

  // Save logic
  const handleSave = async (newStatus?: InvoiceStatus) => {
    setSaving(true)
    const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

    const invoiceData: Record<string, unknown> = {
      invoice_number: invoiceNumber,
      client_id: clientId,
      project_id: projectId,
      title,
      description: description || null,
      status: newStatus || status,
      issue_date: issueDate,
      due_date: dueDate || null,
      terms: terms || null,
      notes: notes || null,
      total_amount: total,
      paid_amount: paidAmount,
    }

    if (newStatus === 'sent') {
      invoiceData.sent_at = new Date().toISOString()
    }
    if (newStatus === 'paid') {
      invoiceData.paid_at = new Date().toISOString()
      invoiceData.paid_amount = total
    }

    let invoiceId = id

    if (isNew) {
      const { data, error } = await supabase.from('invoices').insert(invoiceData).select().single()
      if (error) {
        console.error('Insert invoice error:', error)
        setSaving(false)
        return
      }
      invoiceId = data.id
    } else {
      const { error } = await supabase.from('invoices').update(invoiceData).eq('id', id)
      if (error) {
        console.error('Update invoice error:', error)
        setSaving(false)
        return
      }
      // Delete old items and re-insert
      await supabase.from('invoice_items').delete().eq('invoice_id', id)
    }

    // Insert items
    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('invoice_items').insert(
        items.map((item, index) => ({
          invoice_id: invoiceId,
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
      navigate(`/dashboard/invoices/${invoiceId}`, { replace: true })
    } else {
      fetchInvoice()
    }
  }

  // Save payment
  const handleSavePayment = async () => {
    const amount = parseFloat(paymentAmount)
    if (!amount || !id) return

    await supabase.from('payments').insert({
      invoice_id: id,
      amount,
      method: paymentMethod,
      reference: paymentReference || null,
      paid_at: new Date(paymentDate).toISOString(),
    })

    const newPaidAmount = paidAmount + amount
    const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    const newStatus = newPaidAmount >= total ? 'paid' : 'partial'

    await supabase.from('invoices').update({
      paid_amount: newPaidAmount,
      status: newStatus,
      ...(newStatus === 'paid' ? { paid_at: new Date().toISOString() } : {}),
    }).eq('id', id)

    setPaymentModalOpen(false)
    setPaymentAmount('')
    setPaymentReference('')
    fetchInvoice()
  }

  const badge = STATUS_BADGE[status]

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/invoices')}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">
            {isNew ? 'Nouvelle facture' : invoiceNumber}
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
              Marquer comme envoyée
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
                  <option value="">-- Sélectionner un client --</option>
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
                  placeholder="Titre de la facture"
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
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Lignes de la facture</h2>
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
                    <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Quantité</th>
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
                Aucune ligne. Ajoutez des lignes à la facture.
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
          {/* Dates */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Dates</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date d'émission</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date d'échéance</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
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
                placeholder="Notes visibles sur la facture..."
                rows={3}
                className={inputClass}
              />
            </div>
          </div>

          {/* Payments section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Paiements reçus</h2>

            {payments.length > 0 ? (
              <div className="space-y-3 mb-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-start justify-between bg-gray-800 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-white">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-400">
                        {METHOD_LABELS[payment.method]} &middot; {format(new Date(payment.paid_at), 'dd MMM yyyy', { locale: fr })}
                      </p>
                      {payment.reference && (
                        <p className="text-xs text-gray-500 mt-0.5">Réf: {payment.reference}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Aucun paiement enregistré.</p>
            )}

            {/* Payment totals */}
            <div className="space-y-2 pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total facturé</span>
                <span className="text-sm font-medium text-white">{formatCurrency(totalHT)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total payé</span>
                <span className="text-sm font-medium text-white">{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-sm font-medium text-gray-300">Reste dû</span>
                <span className={`text-sm font-bold ${resteDu > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {formatCurrency(resteDu)}
                </span>
              </div>
            </div>

            {/* Add payment button */}
            {!isNew && (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="mt-4 w-full px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                + Enregistrer un paiement
              </button>
            )}
          </div>

          {/* Rentabilité section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Rentabilité</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Montant facturé</span>
                <span className="text-sm font-medium text-white">{formatCurrency(totalHT)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Charges URSSAF (21,1%)</span>
                <span className="text-sm font-medium text-red-400">-{formatCurrency(charges.urssaf)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">CFP (0,1%)</span>
                <span className="text-sm font-medium text-red-400">-{formatCurrency(charges.cfp)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                <span className="text-sm font-medium text-gray-300">Net après charges</span>
                <span className="text-sm font-bold text-green-400">{formatCurrency(charges.net)}</span>
              </div>
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
            Marquer comme envoyée
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          Imprimer / PDF
        </button>
      </div>

      {/* Payment modal */}
      <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Enregistrer un paiement">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Montant *</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0.00"
              min={0}
              step={0.01}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Méthode de paiement</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className={inputClass}
            >
              {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((method) => (
                <option key={method} value={method}>
                  {METHOD_LABELS[method]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Référence</label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Numéro de transaction, chèque..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date du paiement</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSavePayment}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

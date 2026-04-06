import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/business'
import type { Quote, QuoteStatus } from '../../types/database'

const STATUS_BADGE: Record<QuoteStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Brouillon', bg: 'bg-gray-500/20', text: 'text-gray-400' },
  sent: { label: 'Envoyé', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  accepted: { label: 'Accepté', bg: 'bg-green-500/20', text: 'text-green-400' },
  rejected: { label: 'Refusé', bg: 'bg-red-500/20', text: 'text-red-400' },
  expired: { label: 'Expiré', bg: 'bg-amber-500/20', text: 'text-amber-400' },
}

export default function QuotesPage() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, client:clients(id, name)')
      .order('created_at', { ascending: false })
    if (error) console.error('Fetch quotes error:', error)
    if (data) setQuotes(data as Quote[])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Filtered quotes
  const filtered = quotes
    .filter(q => !filterStatus || q.status === filterStatus)
    .filter(q => {
      if (!searchQuery) return true
      const clientName = q.client?.name?.toLowerCase() ?? ''
      return clientName.includes(searchQuery.toLowerCase())
    })

  // KPIs
  const pendingCount = quotes.filter(q => q.status === 'sent').length
  const pendingAmount = quotes.filter(q => q.status === 'sent').reduce((sum, q) => sum + q.total_amount, 0)

  const decided = quotes.filter(q => ['accepted', 'rejected', 'sent'].includes(q.status))
  const acceptedCount = quotes.filter(q => q.status === 'accepted').length
  const acceptanceRate = decided.length > 0 ? Math.round((acceptedCount / decided.length) * 100) : 0

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
  const acceptedThisMonth = quotes
    .filter(q => q.status === 'accepted' && q.created_at >= currentMonthStart && q.created_at <= currentMonthEnd)
    .reduce((sum, q) => sum + q.total_amount, 0)

  // Handlers
  const handleDuplicate = async (quote: Quote) => {
    const { data: items } = await supabase.from('quote_items').select('*').eq('quote_id', quote.id)
    const { data: number } = await supabase.rpc('next_sequence_number', { seq_id: 'quote' })
    const { data: newQuote, error } = await supabase.from('quotes').insert({
      quote_number: number,
      client_id: quote.client_id,
      project_id: quote.project_id,
      title: quote.title + ' (copie)',
      description: quote.description,
      terms: quote.terms,
      total_amount: quote.total_amount,
      valid_until: null,
      status: 'draft',
    }).select().single()
    if (error) console.error('Duplicate quote error:', error)
    if (newQuote && items) {
      await supabase.from('quote_items').insert(items.map((i: any) => ({
        quote_id: newQuote.id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        position: i.position,
      })))
    }
    fetchAll()
  }

  const handleConvertToInvoice = async (quote: Quote) => {
    const { data: items } = await supabase.from('quote_items').select('*').eq('quote_id', quote.id)
    const { data: invoiceNumber } = await supabase.rpc('next_sequence_number', { seq_id: 'invoice' })
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    const { data: invoice } = await supabase.from('invoices').insert({
      invoice_number: invoiceNumber,
      quote_id: quote.id,
      client_id: quote.client_id,
      project_id: quote.project_id,
      title: quote.title,
      description: quote.description,
      terms: quote.terms,
      total_amount: quote.total_amount,
      due_date: dueDate.toISOString().slice(0, 10),
      status: 'draft',
    }).select().single()
    if (invoice && items) {
      await supabase.from('invoice_items').insert(items.map((i: any) => ({
        invoice_id: invoice.id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        position: i.position,
      })))
    }
    if (invoice) navigate(`/dashboard/invoices/${invoice.id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce devis ?')) return
    await supabase.from('quotes').delete().eq('id', id)
    fetchAll()
  }

  return (
    <div className="p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Devis en attente</p>
          <p className="text-2xl font-bold text-blue-400">{pendingCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Montant en attente</p>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(pendingAmount)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Taux d'acceptation</p>
          <p className="text-2xl font-bold text-green-400">{acceptanceRate}%</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CA devis acceptés du mois</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(acceptedThisMonth)}</p>
        </div>
      </div>

      {/* Filters + New button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as QuoteStatus | '')}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyé</option>
            <option value="accepted">Accepté</option>
            <option value="rejected">Refusé</option>
            <option value="expired">Expiré</option>
          </select>
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => navigate('/dashboard/quotes/new')}
          className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Nouveau devis
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Aucun devis
                </td>
              </tr>
            ) : (
              filtered.map((quote) => {
                const badge = STATUS_BADGE[quote.status]
                return (
                  <tr
                    key={quote.id}
                    className="hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/quotes/${quote.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-300">
                      {quote.quote_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {quote.client?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 truncate max-w-xs">
                      {quote.title}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {formatCurrency(quote.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/dashboard/quotes/${quote.id}`)}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(quote)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10"
                          title="Dupliquer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                        </button>
                        {/* Convert to invoice (only if accepted) */}
                        {quote.status === 'accepted' && (
                          <button
                            onClick={() => handleConvertToInvoice(quote)}
                            className="p-1.5 text-gray-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10"
                            title="Convertir en facture"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </button>
                        )}
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(quote.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
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

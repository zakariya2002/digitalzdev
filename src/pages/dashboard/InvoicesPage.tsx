import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, isPast, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { formatCurrency, calculateCharges } from '../../lib/business'
import type { Invoice, InvoiceStatus } from '../../types/database'

const STATUS_BADGE: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Brouillon', bg: 'bg-gray-500/20', text: 'text-gray-400' },
  sent: { label: 'Envoyée', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  paid: { label: 'Payée', bg: 'bg-green-500/20', text: 'text-green-400' },
  partial: { label: 'Partielle', bg: 'bg-amber-500/20', text: 'text-amber-400' },
  overdue: { label: 'En retard', bg: 'bg-red-500/20', text: 'text-red-400' },
  cancelled: { label: 'Annulée', bg: 'bg-gray-500/20', text: 'text-gray-400' },
}

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, client:clients(id, name)')
      .order('created_at', { ascending: false })
    if (error) console.error('Fetch invoices error:', error)
    if (data) setInvoices(data as Invoice[])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Filtered invoices
  const filtered = invoices
    .filter(inv => !filterStatus || inv.status === filterStatus)
    .filter(inv => {
      if (!searchQuery) return true
      const clientName = inv.client?.name?.toLowerCase() ?? ''
      return clientName.includes(searchQuery.toLowerCase())
    })

  // KPIs
  const unpaidStatuses: InvoiceStatus[] = ['sent', 'partial', 'overdue']
  const unpaidInvoices = invoices.filter(inv => unpaidStatuses.includes(inv.status))
  const unpaidCount = unpaidInvoices.length
  const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0)

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
  const caEncaisse = invoices
    .filter(inv => inv.paid_at && inv.paid_at >= currentMonthStart && inv.paid_at <= currentMonthEnd)
    .reduce((sum, inv) => sum + inv.paid_amount, 0)
  const charges = calculateCharges(caEncaisse)

  // Helpers
  const isOverdue = (inv: Invoice) =>
    inv.due_date && isPast(parseISO(inv.due_date)) && inv.status !== 'paid' && inv.status !== 'cancelled'

  // Handlers
  const handleMarkPaid = async (invoice: Invoice) => {
    await supabase.from('invoices').update({
      status: 'paid',
      paid_amount: invoice.total_amount,
      paid_at: new Date().toISOString(),
    }).eq('id', invoice.id)
    fetchAll()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette facture ?')) return
    await supabase.from('invoices').delete().eq('id', id)
    fetchAll()
  }

  return (
    <div className="p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Factures impayées</p>
          <p className="text-2xl font-bold text-red-400">{unpaidCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Montant impayé</p>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(unpaidAmount)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CA encaissé du mois</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(caEncaisse)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Charges URSSAF estimées</p>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(charges.totalCharges)}</p>
        </div>
      </div>

      {/* Filters + New button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as InvoiceStatus | '')}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">Toutes</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="paid">Payée</option>
            <option value="partial">Partielle</option>
            <option value="overdue">En retard</option>
            <option value="cancelled">Annulée</option>
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
          onClick={() => navigate('/dashboard/invoices/new')}
          className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Nouvelle facture
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
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payé</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reste dû</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                  Aucune facture
                </td>
              </tr>
            ) : (
              filtered.map((invoice) => {
                const badge = STATUS_BADGE[invoice.status]
                const resteDu = invoice.total_amount - invoice.paid_amount
                const overdue = isOverdue(invoice)
                return (
                  <tr
                    key={invoice.id}
                    className={`hover:bg-gray-800/50 transition-colors cursor-pointer ${overdue ? 'bg-red-500/5' : ''}`}
                    onClick={() => navigate(`/dashboard/invoices/${invoice.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-300">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {invoice.client?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 truncate max-w-xs">
                      {invoice.title}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-400">
                      {formatCurrency(invoice.paid_amount)}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${resteDu > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {formatCurrency(resteDu)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {invoice.due_date
                        ? format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/dashboard/invoices/${invoice.id}`)}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        {/* Mark as paid */}
                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                          <button
                            onClick={() => handleMarkPaid(invoice)}
                            className="p-1.5 text-gray-400 hover:text-green-400 transition-colors rounded-lg hover:bg-green-500/10"
                            title="Marquer payée"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(invoice.id)}
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

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/business'
import type { Proposal, ProposalStatus } from '../../types/database'

const STATUS_BADGE: Record<ProposalStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Brouillon', bg: 'bg-gray-500/20', text: 'text-gray-400' },
  sent: { label: 'Envoyé', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  accepted: { label: 'Accepté', bg: 'bg-green-500/20', text: 'text-green-400' },
  rejected: { label: 'Refusé', bg: 'bg-red-500/20', text: 'text-red-400' },
}

const TYPE_LABELS: Record<string, string> = {
  landing: 'Landing page',
  vitrine: 'Site vitrine',
  ecommerce: 'E-commerce',
  custom: 'Sur mesure',
  mobile: 'Mobile',
  maintenance: 'Maintenance',
  audit: 'Audit',
  other: 'Autre',
}

export default function ProposalsPage() {
  const navigate = useNavigate()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | ''>('')

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, client:clients(id, name)')
      .order('created_at', { ascending: false })
    if (error) console.error('Fetch proposals error:', error)
    if (data) setProposals(data as Proposal[])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Filtered proposals
  const filtered = proposals
    .filter(p => !filterStatus || p.status === filterStatus)

  // Handlers
  const handleDuplicate = async (proposal: Proposal) => {
    const { error } = await supabase.from('proposals').insert({
      client_id: proposal.client_id,
      title: proposal.title + ' (copie)',
      project_type: proposal.project_type,
      status: 'draft' as ProposalStatus,
      client_company: proposal.client_company,
      client_contact: proposal.client_contact,
      client_email: proposal.client_email,
      client_phone: proposal.client_phone,
      project_description: proposal.project_description,
      objectives: proposal.objectives,
      target_audience: proposal.target_audience,
      features: proposal.features,
      design_preferences: proposal.design_preferences,
      inspirations: proposal.inspirations,
      seo_requirements: proposal.seo_requirements,
      hosting_needs: proposal.hosting_needs,
      content_provided: proposal.content_provided,
      timeline: proposal.timeline,
      budget_range: proposal.budget_range,
      additional_notes: proposal.additional_notes,
      estimated_amount: proposal.estimated_amount,
    })
    if (error) console.error('Duplicate proposal error:', error)
    fetchAll()
  }

  const handleConvertToQuote = async (proposal: Proposal) => {
    const { data: quoteNumber } = await supabase.rpc('next_sequence_number', { seq_id: 'quote' })
    const { data: quote } = await supabase.from('quotes').insert({
      quote_number: quoteNumber,
      client_id: proposal.client_id,
      title: proposal.title,
      description: proposal.project_description,
      total_amount: proposal.estimated_amount || 0,
      status: 'draft',
    }).select().single()
    if (quote) {
      // Update proposal with quote_id reference
      await supabase.from('proposals').update({ quote_id: quote.id }).eq('id', proposal.id)
      // Insert a single line item with the estimated amount
      if (proposal.estimated_amount) {
        await supabase.from('quote_items').insert({
          quote_id: quote.id,
          description: proposal.title + (proposal.project_type ? ' — ' + TYPE_LABELS[proposal.project_type] : ''),
          quantity: 1,
          unit_price: proposal.estimated_amount,
          position: 0,
        })
      }
      navigate(`/dashboard/quotes/${quote.id}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette proposition ?')) return
    await supabase.from('proposals').delete().eq('id', id)
    fetchAll()
  }

  return (
    <div className="p-6">
      {/* Filters + New button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProposalStatus | '')}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyé</option>
            <option value="accepted">Accepté</option>
            <option value="rejected">Refusé</option>
          </select>
        </div>

        <button
          onClick={() => navigate('/dashboard/proposals/new')}
          className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Nouvelle proposition
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Montant estimé</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Aucune proposition
                </td>
              </tr>
            ) : (
              filtered.map((proposal) => {
                const badge = STATUS_BADGE[proposal.status]
                return (
                  <tr
                    key={proposal.id}
                    className="hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/proposals/${proposal.id}`)}
                  >
                    <td className="px-4 py-3 text-sm text-white truncate max-w-xs">
                      {proposal.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {proposal.client?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {proposal.project_type ? TYPE_LABELS[proposal.project_type] ?? proposal.project_type : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {proposal.estimated_amount != null ? formatCurrency(proposal.estimated_amount) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/dashboard/proposals/${proposal.id}`)}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(proposal)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10"
                          title="Dupliquer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                        </button>
                        {/* Convert to quote (only if accepted) */}
                        {proposal.status === 'accepted' && (
                          <button
                            onClick={() => handleConvertToQuote(proposal)}
                            className="p-1.5 text-gray-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10"
                            title="Convertir en devis"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </button>
                        )}
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(proposal.id)}
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

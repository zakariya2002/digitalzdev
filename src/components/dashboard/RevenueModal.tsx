import { useState, useEffect, type FormEvent } from 'react'
import { format } from 'date-fns'
import Modal from './Modal'
import type { Revenue, Project } from '../../types/database'

interface RevenueModalProps {
  open: boolean
  onClose: () => void
  revenue: Revenue | null
  projects: Project[]
  onSave: (data: {
    amount: number
    description: string | null
    month: string
    project_id: string | null
  }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export default function RevenueModal({ open, onClose, revenue, projects, onSave, onDelete }: RevenueModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (revenue) {
      setAmount(String(revenue.amount))
      setDescription(revenue.description || '')
      setMonth(revenue.month.slice(0, 7))
      setProjectId(revenue.project_id || '')
    } else {
      setAmount('')
      setDescription('')
      setMonth(format(new Date(), 'yyyy-MM'))
      setProjectId('')
    }
  }, [revenue, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) return
    setLoading(true)
    await onSave({
      amount: num,
      description: description.trim() || null,
      month: month + '-01',
      project_id: projectId || null,
    })
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={revenue ? 'Modifier le revenu' : 'Nouveau revenu'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Montant (EUR)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="1500.00"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mois</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Projet</label>
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
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Prestation site web..."
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Enregistrement...' : revenue ? 'Modifier' : 'Créer'}
          </button>
          {revenue && onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(revenue.id); onClose() }}
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

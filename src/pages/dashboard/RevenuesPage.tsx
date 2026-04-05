import { useState, useEffect, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import RevenueModal from '../../components/dashboard/RevenueModal'
import RevenueChart from '../../components/dashboard/RevenueChart'
import type { Revenue, Project } from '../../types/database'

export default function RevenuesPage() {
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null)

  const fetchAll = useCallback(async () => {
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from('revenues').select('*').order('month', { ascending: false }),
      supabase.from('projects').select('*').eq('is_archived', false).order('name'),
    ])
    if (r) setRevenues(r as Revenue[])
    if (p) setProjects(p as Project[])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async (data: {
    amount: number
    description: string | null
    month: string
    project_id: string | null
  }) => {
    if (editingRevenue) {
      const { error } = await supabase.from('revenues').update(data).eq('id', editingRevenue.id)
      if (error) console.error('Update revenue error:', error)
    } else {
      const { error } = await supabase.from('revenues').insert(data)
      if (error) console.error('Insert revenue error:', error)
    }
    setEditingRevenue(null)
    fetchAll()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('revenues').delete().eq('id', id)
    if (error) console.error('Delete revenue error:', error)
    setEditingRevenue(null)
    fetchAll()
  }

  // Stats
  const currentYear = new Date().getFullYear()
  const currentMonth = format(new Date(), 'yyyy-MM')
  const yearTotal = revenues
    .filter(r => r.month.startsWith(String(currentYear)))
    .reduce((sum, r) => sum + Number(r.amount), 0)
  const monthTotal = revenues
    .filter(r => r.month.startsWith(currentMonth))
    .reduce((sum, r) => sum + Number(r.amount), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Revenu du mois</p>
          <p className="text-2xl font-bold text-white">{monthTotal.toLocaleString('fr-FR')} €</p>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">{format(new Date(), 'MMMM yyyy', { locale: fr })}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total {currentYear}</p>
          <p className="text-2xl font-bold text-green-400">{yearTotal.toLocaleString('fr-FR')} €</p>
          <p className="text-xs text-gray-500 mt-0.5">{revenues.filter(r => r.month.startsWith(String(currentYear))).length} entrées</p>
        </div>
      </div>

      {/* Chart */}
      <RevenueChart revenues={revenues} projects={projects} />

      {/* Header + button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Historique des revenus</h3>
        <button
          onClick={() => { setEditingRevenue(null); setModalOpen(true) }}
          className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Nouveau revenu
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {revenues.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  Aucun revenu enregistré
                </td>
              </tr>
            ) : (
              revenues.map((rev) => {
                const project = projects.find(p => p.id === rev.project_id)
                return (
                  <tr key={rev.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300 capitalize">
                      {format(parseISO(rev.month), 'MMMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      {project ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                          <span className="text-sm text-gray-300">{project.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{rev.description || '—'}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-white">
                      {Number(rev.amount).toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setEditingRevenue(rev); setModalOpen(true) }}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <RevenueModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingRevenue(null) }}
        revenue={editingRevenue}
        projects={projects}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}

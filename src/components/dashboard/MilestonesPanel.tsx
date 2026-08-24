import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import type { Milestone, MilestoneStatus } from '../../types/database'

const STATUS_META: Record<MilestoneStatus, { label: string; badge: string; dot: string }> = {
  planned: { label: 'Prévu', badge: 'bg-blue-500/20 text-blue-400', dot: 'bg-blue-500' },
  at_risk: { label: 'À risque', badge: 'bg-amber-500/20 text-amber-400', dot: 'bg-amber-500' },
  reached: { label: 'Atteint', badge: 'bg-green-500/20 text-green-400', dot: 'bg-green-500' },
  missed: { label: 'Manqué', badge: 'bg-red-500/20 text-red-400', dot: 'bg-red-500' },
}

interface MilestonesPanelProps {
  projectId: string
}

/** Dates engagées auprès du client : livraison maquette, recette, mise en ligne. */
export default function MilestonesPanel({ projectId }: MilestonesPanelProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isCommitment, setIsCommitment] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMilestones = useCallback(async () => {
    const { data, error: e } = await supabase
      .from('milestones').select('*').eq('project_id', projectId).order('due_date')
    if (e) { setError('Impossible de charger les jalons.'); return }
    setMilestones((data || []) as Milestone[])
  }, [projectId])

  useEffect(() => { fetchMilestones() }, [fetchMilestones])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate) return
    const position = milestones.length
    const { error: err } = await supabase.from('milestones').insert({
      project_id: projectId,
      title: title.trim(),
      due_date: dueDate,
      is_client_commitment: isCommitment,
      position,
    })
    if (err) { setError("Le jalon n'a pas pu être créé."); return }
    setTitle(''); setDueDate(''); setError(null)
    fetchMilestones()
  }

  const setStatus = async (milestone: Milestone, status: MilestoneStatus) => {
    setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, status } : m))
    const { error: err } = await supabase.from('milestones').update({
      status,
      reached_at: status === 'reached' ? new Date().toISOString() : null,
    }).eq('id', milestone.id)
    if (err) { setError('La mise à jour a échoué.'); fetchMilestones() }
  }

  const remove = async (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
    await supabase.from('milestones').delete().eq('id', id)
  }

  const inputClass = 'px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Jalons</h3>
        <span className="text-xs text-gray-500">
          {milestones.filter(m => m.status === 'reached').length}/{milestones.length} atteints
        </span>
      </div>

      {milestones.length === 0 ? (
        <p className="text-xs text-gray-500 mb-4">
          Aucun jalon. Pose ici les dates que tu engages auprès du client — elles remontent dans le calendrier et déclenchent une alerte à l'approche.
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {milestones.map(milestone => {
            const days = differenceInCalendarDays(parseISO(milestone.due_date), new Date())
            const open = milestone.status === 'planned' || milestone.status === 'at_risk'
            const meta = STATUS_META[milestone.status]
            return (
              <div key={milestone.id} className="flex items-start gap-3 p-3 bg-gray-800/60 rounded-lg group">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${meta.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white">{milestone.title}</p>
                    <span className={`px-1.5 py-0.5 text-[10px] rounded ${meta.badge}`}>{meta.label}</span>
                    {milestone.is_client_commitment && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-700 text-gray-300">Engagement client</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {format(parseISO(milestone.due_date), 'd MMMM yyyy', { locale: fr })}
                    {open && (
                      <span className={days < 0 ? ' text-red-400' : days <= 3 ? ' text-amber-400' : ''}>
                        {days < 0 ? ` — dépassé de ${Math.abs(days)} j` : days === 0 ? " — c'est aujourd'hui" : ` — dans ${days} j`}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {open && (
                    <>
                      <button
                        onClick={() => setStatus(milestone, 'reached')}
                        className="text-[11px] px-2 py-1 rounded bg-green-600/10 text-green-400 hover:bg-green-600/20 transition-colors"
                      >
                        Atteint
                      </button>
                      {milestone.status !== 'at_risk' && (
                        <button
                          onClick={() => setStatus(milestone, 'at_risk')}
                          className="text-[11px] px-2 py-1 rounded bg-amber-600/10 text-amber-400 hover:bg-amber-600/20 transition-colors"
                        >
                          À risque
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => remove(milestone.id)}
                    className="text-[11px] px-2 py-1 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Livraison des maquettes" className={`${inputClass} flex-1`}
        />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
        <label className="flex items-center gap-2 text-xs text-gray-400 px-1">
          <input type="checkbox" checked={isCommitment} onChange={(e) => setIsCommitment(e.target.checked)} className="accent-blue-600" />
          Engagement client
        </label>
        <button
          type="submit" disabled={!title.trim() || !dueDate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Ajouter
        </button>
      </form>
    </div>
  )
}

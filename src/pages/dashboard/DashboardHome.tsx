import { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import KPIWidgets from '../../components/dashboard/KPIWidgets'
import RevenueChart from '../../components/dashboard/RevenueChart'
import TaskStats from '../../components/dashboard/TaskStats'
import type { Task, Project, Revenue, Client } from '../../types/database'

export default function DashboardHome() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const [callsToday, setCallsToday] = useState(0)
  const [pendingFollowUps, setPendingFollowUps] = useState(0)

  const fetchAll = useCallback(async () => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [{ data: p }, { data: t }, { data: r }, { data: c }, { count: callCount }] = await Promise.all([
      supabase.from('projects').select('*').eq('is_archived', false),
      supabase.from('tasks').select('*'),
      supabase.from('revenues').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('calls').select('id', { count: 'exact', head: true })
        .gte('called_at', todayStart.toISOString())
        .lte('called_at', todayEnd.toISOString()),
    ])
    if (p) setProjects(p as Project[])
    if (t) setTasks(t as Task[])
    if (r) setRevenues(r as Revenue[])
    if (c) {
      setClients(c as Client[])
      // Compter les relances en attente
      const now = new Date().toISOString()
      const followUps = (c as Client[]).filter(
        (cl) => cl.next_follow_up_at && cl.next_follow_up_at <= now
      ).length
      setPendingFollowUps(followUps)
    }
    setCallsToday(callCount || 0)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const currentMonth = format(now, 'yyyy-MM')
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  // KPIs
  const monthRevenue = revenues
    .filter(r => r.month.startsWith(currentMonth))
    .reduce((sum, r) => sum + Number(r.amount), 0)

  const activeClients = clients.filter(c => c.status === 'active').length
  const newLeads = clients.filter(c => c.status === 'new_lead').length

  const doneThisWeek = tasks.filter(t => {
    if (t.status !== 'done' || !t.completed_at) return false
    const d = new Date(t.completed_at)
    return d >= weekStart && d <= weekEnd
  }).length

  const overdueTasks = tasks.filter(t =>
    t.deadline && t.deadline < today && t.status !== 'done'
  ).length

  // Next deadline
  const upcomingTasks = tasks
    .filter(t => t.deadline && t.deadline >= today && t.status !== 'done')
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
  const nextDeadline = upcomingTasks[0]
  const nextDeadlineStr = nextDeadline
    ? format(parseISO(nextDeadline.deadline!), 'd MMM', { locale: fr })
    : '—'

  const widgets = [
    {
      label: 'Revenu du mois',
      value: `${monthRevenue.toLocaleString('fr-FR')} €`,
      sub: format(now, 'MMMM yyyy', { locale: fr }),
      color: 'bg-green-500/20',
      icon: <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: 'Clients actifs',
      value: activeClients,
      sub: `${newLeads} leads, ${clients.length} total`,
      color: 'bg-blue-500/20',
      icon: <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    },
    {
      label: 'Terminées (semaine)',
      value: doneThisWeek,
      color: 'bg-purple-500/20',
      icon: <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: 'En retard',
      value: overdueTasks,
      color: overdueTasks > 0 ? 'bg-red-500/20' : 'bg-gray-800',
      icon: <svg className={`w-4 h-4 ${overdueTasks > 0 ? 'text-red-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
    },
    {
      label: 'Prochaine deadline',
      value: nextDeadlineStr,
      sub: nextDeadline?.title,
      color: 'bg-orange-500/20',
      icon: <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
    },
    {
      label: "Appels aujourd'hui",
      value: callsToday,
      color: 'bg-cyan-500/20',
      icon: <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
    },
    {
      label: 'Relances en attente',
      value: pendingFollowUps,
      color: pendingFollowUps > 0 ? 'bg-amber-500/20' : 'bg-gray-800',
      icon: <svg className={`w-4 h-4 ${pendingFollowUps > 0 ? 'text-amber-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <KPIWidgets widgets={widgets} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart revenues={revenues} projects={projects} />
        </div>
        <div>
          <TaskStats tasks={tasks} projects={projects} />
        </div>
      </div>
    </div>
  )
}

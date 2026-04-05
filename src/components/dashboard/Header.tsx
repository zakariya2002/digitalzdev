import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/kanban': 'Kanban',
  '/dashboard/calendar': 'Calendrier',
  '/dashboard/clients': 'Leads & Clients',
  '/dashboard/revenues': 'Revenus',
}

export default function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-30">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm text-gray-500 capitalize">{dateStr}</p>
    </header>
  )
}

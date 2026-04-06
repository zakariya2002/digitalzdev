import { useLocation } from 'react-router-dom'
import NotificationCenter from './NotificationCenter'
import { useAutomation } from '../../hooks/useAutomation'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/kanban': 'Kanban',
  '/dashboard/calendar': 'Calendrier',
  '/dashboard/clients': 'Leads & Clients',
  '/dashboard/revenues': 'Revenus',
  '/dashboard/sms-templates': 'Templates SMS',
  '/dashboard/quotes': 'Devis',
  '/dashboard/quotes/new': 'Nouveau devis',
  '/dashboard/invoices': 'Factures',
  '/dashboard/invoices/new': 'Nouvelle facture',
  '/dashboard/finances': 'Finances',
  '/dashboard/proposals': 'Propositions',
  '/dashboard/proposals/new': 'Nouvelle proposition',
  '/dashboard/automation': 'Automatisation',
}

export default function Header() {
  const location = useLocation()
  const { notifications, unreadCount, dismissNotification, markAllRead } = useAutomation()

  const title = pageTitles[location.pathname]
    || (location.pathname.startsWith('/dashboard/clients/') ? 'Fiche client' : '')
    || (location.pathname.startsWith('/dashboard/quotes/') ? 'D\u00e9tail devis' : '')
    || (location.pathname.startsWith('/dashboard/invoices/') ? 'D\u00e9tail facture' : '')
    || (location.pathname.startsWith('/dashboard/proposals/') ? 'D\u00e9tail proposition' : '')
    || (location.pathname.startsWith('/dashboard/projects/') ? 'D\u00e9tail projet' : '')
    || 'Dashboard'

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
      <div className="flex items-center gap-4">
        <NotificationCenter
          notifications={notifications}
          unreadCount={unreadCount}
          onDismiss={dismissNotification}
          onMarkAllRead={markAllRead}
        />
        <p className="text-sm text-gray-500 capitalize">{dateStr}</p>
      </div>
    </header>
  )
}

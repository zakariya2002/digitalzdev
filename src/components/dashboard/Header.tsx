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

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
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
    <header className="h-16 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Hamburger menu - mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationCenter
          notifications={notifications}
          unreadCount={unreadCount}
          onDismiss={dismissNotification}
          onMarkAllRead={markAllRead}
        />
        <p className="text-sm text-gray-500 capitalize hidden sm:block">{dateStr}</p>
      </div>
    </header>
  )
}

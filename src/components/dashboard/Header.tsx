import { useLocation } from 'react-router-dom'
import NotificationCenter, { type FeedItem } from './NotificationCenter'
import PunchButton from './PunchButton'
import { useAutomation } from '../../hooks/useAutomation'
import { useNotifications } from '../../hooks/useNotifications'
import { useTeam } from '../../contexts/TeamContext'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/projects': 'Projets',
  '/dashboard/kanban': 'Kanban',
  '/dashboard/calendar': 'Calendrier',
  '/dashboard/clients': 'Leads & Clients',
  '/dashboard/sms-templates': 'Templates SMS',
  '/dashboard/quotes': 'Devis',
  '/dashboard/quotes/new': 'Nouveau devis',
  '/dashboard/invoices': 'Factures',
  '/dashboard/invoices/new': 'Nouvelle facture',
  '/dashboard/finances': 'Finances',
  '/dashboard/comptabilite': 'Simulateur de statut',
  '/dashboard/messages': 'Messagerie',
  '/dashboard/pointage': 'Temps de travail',
  '/dashboard/proposals': 'Propositions',
  '/dashboard/proposals/new': 'Nouvelle proposition',
  '/dashboard/automation': 'Automatisation',
}

const ENTITY_PATH: Record<string, (id: string) => string> = {
  client: (id) => `/dashboard/clients/${id}`,
  quote: (id) => `/dashboard/quotes/${id}`,
  invoice: (id) => `/dashboard/invoices/${id}`,
  project: (id) => `/dashboard/projects/${id}`,
  task: () => '/dashboard/kanban',
}

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const { memberById } = useTeam()
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications()
  const alerts = useAutomation()

  // Messages d'équipe et relances commerciales arrivent dans la même cloche
  const teamItems: FeedItem[] = notifications.map(n => ({
    id: n.id,
    kind: 'team',
    title: n.title,
    body: n.body,
    link: n.link || '/dashboard',
    createdAt: n.created_at,
    read: !!n.read_at,
    actor: memberById(n.actor_id),
    badge: n.type === 'activity' ? undefined : n.type,
  }))

  const alertItems: FeedItem[] = alerts.notifications.map(a => ({
    id: a.id,
    kind: 'alert',
    title: a.message,
    link: (ENTITY_PATH[a.entityType] || (() => '/dashboard'))(a.entityId),
    createdAt: a.createdAt,
    read: a.read,
  }))

  const items = [...teamItems, ...alertItems]

  const title = pageTitles[location.pathname]
    || (location.pathname.startsWith('/dashboard/clients/') ? 'Fiche client' : '')
    || (location.pathname.startsWith('/dashboard/quotes/') ? 'Détail devis' : '')
    || (location.pathname.startsWith('/dashboard/invoices/') ? 'Détail facture' : '')
    || (location.pathname.startsWith('/dashboard/proposals/') ? 'Détail proposition' : '')
    || (location.pathname.startsWith('/dashboard/messages/') ? 'Messagerie' : '')
    || (location.pathname.startsWith('/dashboard/projects/') ? 'Détail projet' : '')
    || 'Dashboard'

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Ouvrir le menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <PunchButton />
        <NotificationCenter
          items={items}
          unreadCount={unreadCount + alerts.unreadCount}
          onOpen={(item) => { if (item.kind === 'team') markRead(item.id) }}
          onDismiss={(item) => {
            if (item.kind === 'team') dismiss(item.id)
            else alerts.dismissNotification(item.id)
          }}
          onMarkAllRead={() => { markAllRead(); alerts.markAllRead() }}
        />
        <p className="text-sm text-gray-500 capitalize hidden xl:block">{dateStr}</p>
      </div>
    </header>
  )
}

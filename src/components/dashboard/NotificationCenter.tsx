import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Avatar from './Avatar'
import type { Profile } from '../../types/database'

/** Élément unifié de la cloche : message d'équipe ou alerte commerciale automatique. */
export interface FeedItem {
  id: string
  /** `team` = quelqu'un t'a écrit ou assigné quelque chose ; `alert` = règle de relance */
  kind: 'team' | 'alert'
  title: string
  body?: string | null
  link: string
  createdAt: string
  read: boolean
  actor?: Profile
  badge?: 'mention' | 'assignment' | 'comment'
}

interface NotificationCenterProps {
  items: FeedItem[]
  unreadCount: number
  onOpen: (item: FeedItem) => void
  onDismiss: (item: FeedItem) => void
  onMarkAllRead: () => void
}

const BADGE_LABEL: Record<string, string> = {
  mention: 'Mention',
  assignment: 'Assignée',
  comment: 'Message',
}

export default function NotificationCenter({
  items,
  unreadCount,
  onOpen,
  onDismiss,
  onMarkAllRead,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'team' | 'alert'>('team')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const teamItems = items.filter(i => i.kind === 'team')
  const alertItems = items.filter(i => i.kind === 'alert')
  const teamUnread = teamItems.filter(i => !i.read).length
  const visible = tab === 'team' ? teamItems : alertItems

  function handleView(item: FeedItem) {
    onOpen(item)
    navigate(item.link)
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 max-h-[28rem] overflow-hidden flex flex-col">
          {/* Onglets */}
          <div className="flex items-center gap-1 px-3 pt-3 flex-shrink-0">
            <button
              onClick={() => setTab('team')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                tab === 'team' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Équipe
              {teamUnread > 0 && (
                <span className="px-1.5 bg-red-500 text-white text-[10px] rounded-full">{teamUnread}</span>
              )}
            </button>
            <button
              onClick={() => setTab('alert')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                tab === 'alert' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Relances
              {alertItems.length > 0 && (
                <span className="px-1.5 bg-gray-700 text-gray-300 text-[10px] rounded-full">{alertItems.length}</span>
              )}
            </button>
            {teamUnread > 0 && tab === 'team' && (
              <button
                onClick={onMarkAllRead}
                className="ml-auto text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Tout lire
              </button>
            )}
          </div>

          <div className="mt-2 border-t border-gray-800 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                {tab === 'team'
                  ? 'Rien de nouveau. Les mentions et les tâches qu’on t’assigne arrivent ici.'
                  : 'Aucune relance en attente.'}
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {visible.map((item) => (
                  <div
                    key={item.id}
                    className={`px-4 py-3 flex items-start gap-3 ${!item.read ? 'bg-blue-500/5' : ''}`}
                  >
                    {item.kind === 'team' ? (
                      <Avatar profile={item.actor} size="md" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                      </span>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.badge && (
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                            item.badge === 'mention'
                              ? 'bg-blue-500/20 text-blue-400'
                              : item.badge === 'assignment'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-gray-700 text-gray-300'
                          }`}>
                            {BADGE_LABEL[item.badge]}
                          </span>
                        )}
                        <p className="text-sm text-white leading-snug">{item.title}</p>
                      </div>
                      {item.body && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.body}</p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleView(item)}
                        className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                      >
                        Ouvrir
                      </button>
                      <button
                        onClick={() => onDismiss(item)}
                        className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                      >
                        Ignorer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

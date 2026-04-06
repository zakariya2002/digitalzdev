import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { AutomationRule, AutomationLog } from '../types/database'

export interface Notification {
  id: string
  ruleId: string
  entityType: 'client' | 'quote' | 'invoice' | 'project'
  entityId: string
  message: string
  createdAt: string
  read: boolean
}

export function useAutomation() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const checkRules = useCallback(async () => {
    setLoading(true)
    const newNotifications: Notification[] = []

    // Fetch active rules
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)

    if (!rules) { setLoading(false); return }

    // Fetch recent logs (last 24h) to avoid re-triggering
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const { data: recentLogs } = await supabase
      .from('automation_logs')
      .select('rule_id, entity_id')
      .gte('executed_at', yesterday.toISOString())

    const loggedSet = new Set(
      (recentLogs || []).map(l => `${l.rule_id}:${l.entity_id}`)
    )

    for (const rule of rules) {
      const alreadyLogged = (entityId: string) => loggedSet.has(`${rule.id}:${entityId}`)

      if (rule.trigger_type === 'lead_no_activity') {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - rule.trigger_delay_days)
        const { data: leads } = await supabase
          .from('clients')
          .select('id, name, last_contacted_at')
          .in('status', ['new_lead', 'contacted'])
          .or(`last_contacted_at.is.null,last_contacted_at.lt.${cutoff.toISOString()}`)

        for (const lead of leads || []) {
          if (alreadyLogged(lead.id)) continue
          const message = (rule.action_template || '')
            .replace(/\{\{name\}\}/g, lead.name)
          newNotifications.push({
            id: `${rule.id}-${lead.id}`,
            ruleId: rule.id,
            entityType: 'client',
            entityId: lead.id,
            message,
            createdAt: new Date().toISOString(),
            read: false,
          })
        }
      }

      if (rule.trigger_type === 'quote_no_response') {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - rule.trigger_delay_days)
        const { data: quotes } = await supabase
          .from('quotes')
          .select('id, quote_number, client_id, sent_at, client:clients(name)')
          .eq('status', 'sent')
          .lt('sent_at', cutoff.toISOString())

        for (const quote of quotes || []) {
          if (alreadyLogged(quote.id)) continue
          const clientName = (quote as any).client?.name || ''
          const message = (rule.action_template || '')
            .replace(/\{\{quote_number\}\}/g, quote.quote_number)
            .replace(/\{\{client_name\}\}/g, clientName)
          newNotifications.push({
            id: `${rule.id}-${quote.id}`,
            ruleId: rule.id,
            entityType: 'quote',
            entityId: quote.id,
            message,
            createdAt: new Date().toISOString(),
            read: false,
          })
        }
      }

      if (rule.trigger_type === 'invoice_overdue') {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - rule.trigger_delay_days)
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, invoice_number, client_id, due_date, client:clients(name)')
          .in('status', ['sent', 'partial'])
          .lt('due_date', cutoff.toISOString().slice(0, 10))

        for (const inv of invoices || []) {
          if (alreadyLogged(inv.id)) continue
          const clientName = (inv as any).client?.name || ''
          const message = (rule.action_template || '')
            .replace(/\{\{invoice_number\}\}/g, inv.invoice_number)
            .replace(/\{\{client_name\}\}/g, clientName)
          newNotifications.push({
            id: `${rule.id}-${inv.id}`,
            ruleId: rule.id,
            entityType: 'invoice',
            entityId: inv.id,
            message,
            createdAt: new Date().toISOString(),
            read: false,
          })
        }
      }

      if (rule.trigger_type === 'follow_up_due') {
        const today = new Date().toISOString().slice(0, 10)
        const { data: clients } = await supabase
          .from('clients')
          .select('id, name, next_follow_up_at')
          .lte('next_follow_up_at', today + 'T23:59:59')
          .not('next_follow_up_at', 'is', null)

        for (const client of clients || []) {
          if (alreadyLogged(client.id)) continue
          const message = (rule.action_template || '')
            .replace(/\{\{name\}\}/g, client.name)
          newNotifications.push({
            id: `${rule.id}-${client.id}`,
            ruleId: rule.id,
            entityType: 'client',
            entityId: client.id,
            message,
            createdAt: new Date().toISOString(),
            read: false,
          })
        }
      }
    }

    // Log new notifications to automation_logs
    if (newNotifications.length > 0) {
      await supabase.from('automation_logs').insert(
        newNotifications.map(n => ({
          rule_id: n.ruleId,
          entity_type: n.entityType,
          entity_id: n.entityId,
          action_taken: n.message,
          success: true,
        }))
      )
    }

    setNotifications(newNotifications)
    setLoading(false)
  }, [])

  useEffect(() => { checkRules() }, [checkRules])

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, unreadCount, dismissNotification, markAllRead, loading }
}

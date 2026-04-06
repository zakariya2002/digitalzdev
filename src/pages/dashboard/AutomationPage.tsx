import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/dashboard/Modal'
import type { AutomationRule, AutomationLog, TriggerType, ActionType } from '../../types/database'

const TRIGGER_LABELS: Record<TriggerType, string> = {
  lead_no_activity: 'Lead sans activité',
  quote_no_response: 'Devis sans réponse',
  invoice_overdue: 'Facture impayée',
  follow_up_due: 'Rappel follow-up',
  project_milestone: 'Jalon de projet',
}

const ACTION_LABELS: Record<ActionType, string> = {
  sms: 'SMS',
  email: 'Email',
  notification: 'Notification',
  status_change: 'Changement de statut',
}

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Form fields
  const [ruleName, setRuleName] = useState('')
  const [triggerType, setTriggerType] = useState<TriggerType>('lead_no_activity')
  const [triggerDelay, setTriggerDelay] = useState('2')
  const [actionType, setActionType] = useState<ActionType>('notification')
  const [actionTemplate, setActionTemplate] = useState('')

  const fetchAll = useCallback(async () => {
    const [{ data: r }, { data: l }] = await Promise.all([
      supabase.from('automation_rules').select('*').order('created_at'),
      supabase.from('automation_logs').select('*').order('executed_at', { ascending: false }).limit(50),
    ])
    if (r) setRules(r)
    if (l) setLogs(l)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleToggle = async (rule: AutomationRule) => {
    await supabase.from('automation_rules').update({ is_active: !rule.is_active }).eq('id', rule.id)
    fetchAll()
  }

  const handleSaveRule = async () => {
    const data = {
      name: ruleName,
      trigger_type: triggerType,
      trigger_delay_days: parseInt(triggerDelay),
      action_type: actionType,
      action_template: actionTemplate || null,
    }
    if (editingRule) {
      await supabase.from('automation_rules').update(data).eq('id', editingRule.id)
    } else {
      await supabase.from('automation_rules').insert(data)
    }
    setModalOpen(false)
    setEditingRule(null)
    fetchAll()
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Supprimer cette règle ?')) return
    await supabase.from('automation_rules').delete().eq('id', id)
    fetchAll()
  }

  const openEdit = (rule: AutomationRule) => {
    setEditingRule(rule)
    setRuleName(rule.name)
    setTriggerType(rule.trigger_type)
    setTriggerDelay(String(rule.trigger_delay_days))
    setActionType(rule.action_type)
    setActionTemplate(rule.action_template || '')
    setModalOpen(true)
  }

  const openNew = () => {
    setEditingRule(null)
    setRuleName('')
    setTriggerType('lead_no_activity')
    setTriggerDelay('2')
    setActionType('notification')
    setActionTemplate('')
    setModalOpen(true)
  }

  const inputClass =
    'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500'

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Title + button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-white">Règles d'automatisation</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nouvelle règle
        </button>
      </div>

      {/* Rules table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Nom</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Déclencheur</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Délai</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Action</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium">Actif</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Aucune règle configurée
                  </td>
                </tr>
              )}
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{rule.name}</td>
                  <td className="px-4 py-3 text-gray-300">{TRIGGER_LABELS[rule.trigger_type]}</td>
                  <td className="px-4 py-3 text-gray-300">{rule.trigger_delay_days} jour{rule.trigger_delay_days > 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 text-gray-300">{ACTION_LABELS[rule.action_type]}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(rule)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        rule.is_active ? 'bg-blue-600' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          rule.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(rule)}
                        className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent logs section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Historique récent</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Action</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Entité</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    Aucun log récent
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                    {format(new Date(log.executed_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-xs truncate" title={log.action_taken}>
                    {log.action_taken}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                      {log.entity_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {log.success ? (
                      <svg className="w-5 h-5 text-green-400 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-400 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for creating/editing rule */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingRule(null) }}
        title={editingRule ? 'Modifier la règle' : 'Nouvelle règle'}
      >
        <div className="space-y-4">
          {/* Rule name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom de la règle</label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Ex: Relance lead inactif"
              className={inputClass}
            />
          </div>

          {/* Trigger type */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Déclencheur</label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as TriggerType)}
              className={inputClass}
            >
              {(Object.entries(TRIGGER_LABELS) as [TriggerType, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Delay days */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Délai (jours)</label>
            <input
              type="number"
              min="0"
              value={triggerDelay}
              onChange={(e) => setTriggerDelay(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Action type */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type d'action</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as ActionType)}
              className={inputClass}
            >
              {(Object.entries(ACTION_LABELS) as [ActionType, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Template textarea */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Template du message</label>
            <textarea
              value={actionTemplate}
              onChange={(e) => setActionTemplate(e.target.value)}
              rows={4}
              placeholder="Bonjour {{name}}, votre devis {{quote_number}} est en attente..."
              className={inputClass}
            />
            <p className="text-xs text-gray-500 mt-1">
              Variables disponibles : {'{{name}}'}, {'{{quote_number}}'}, {'{{client_name}}'}, {'{{invoice_number}}'}
            </p>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveRule}
              disabled={!ruleName.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {editingRule ? 'Enregistrer' : 'Créer la règle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

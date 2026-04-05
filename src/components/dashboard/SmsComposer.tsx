import { useState, useEffect } from 'react'
import Modal from './Modal'
import { supabase } from '../../lib/supabase'
import { sendSms, parseTemplate } from '../../lib/twilio'
import type { Client, SmsTemplate } from '../../types/database'

interface SmsComposerProps {
  open: boolean
  onClose: () => void
  client: Client
  onSent: () => void
}

export default function SmsComposer({ open, onClose, client, onSent }: SmsComposerProps) {
  const [mode, setMode] = useState<'template' | 'libre'>('template')
  const [templates, setTemplates] = useState<SmsTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [freeText, setFreeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      supabase
        .from('sms_templates')
        .select('*')
        .eq('is_active', true)
        .then(({ data }) => {
          if (data) setTemplates(data as SmsTemplate[])
        })
      setError('')
      setFreeText('')
      setSelectedTemplateId('')
    }
  }, [open])

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)
  const prenom = client.name?.split(' ')[0] || ''
  const variables: Record<string, string> = { prenom, entreprise: '' }
  const preview = selectedTemplate ? parseTemplate(selectedTemplate.body, variables) : ''

  const charCount = mode === 'libre' ? freeText.length : preview.length
  const smsSegments = Math.ceil(charCount / 160) || 1

  const handleSend = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'template' && selectedTemplateId) {
        await sendSms({ clientId: client.id, templateId: selectedTemplateId })
      } else if (mode === 'libre' && freeText.trim()) {
        await sendSms({ clientId: client.id, body: freeText.trim() })
      } else {
        setError('Veuillez écrire un message ou sélectionner un template.')
        setLoading(false)
        return
      }
      setLoading(false)
      onSent()
      onClose()
    } catch (e) {
      setLoading(false)
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'envoi')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`SMS — ${client.name}`}>
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setMode('template')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'template' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Template
          </button>
          <button
            onClick={() => setMode('libre')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'libre' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Message libre
          </button>
        </div>

        {mode === 'template' ? (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Choisir un template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Sélectionner...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>
            {selectedTemplate && (
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Prévisualisation</p>
                <p className="text-sm text-gray-200">{preview}</p>
              </div>
            )}
          </>
        ) : (
          <div>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Votre message..."
            />
          </div>
        )}

        {/* Compteur */}
        <p className="text-xs text-gray-500">
          {charCount} caractères — {smsSegments} segment{smsSegments > 1 ? 's' : ''} SMS
        </p>

        {/* Destinataire */}
        <p className="text-xs text-gray-500">
          Destinataire : <span className="text-gray-300">{client.phone || 'Pas de numéro'}</span>
        </p>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleSend}
          disabled={loading || !client.phone}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer le SMS'}
        </button>
      </div>
    </Modal>
  )
}

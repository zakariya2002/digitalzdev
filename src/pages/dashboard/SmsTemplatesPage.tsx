import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/dashboard/Modal'
import type { SmsTemplate, SmsTemplateCategory } from '../../types/database'

const CATEGORIES: { value: SmsTemplateCategory; label: string }[] = [
  { value: 'relance', label: 'Relance' },
  { value: 'confirmation', label: 'Confirmation' },
  { value: 'custom', label: 'Personnalisé' },
]

export default function SmsTemplatesPage() {
  const [templates, setTemplates] = useState<SmsTemplate[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SmsTemplate | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<SmsTemplateCategory>('relance')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchTemplates = useCallback(async () => {
    const { data, error } = await supabase
      .from('sms_templates')
      .select('*')
      .order('category')
      .order('name')
    if (error) console.error('Fetch templates error:', error)
    if (data) setTemplates(data as SmsTemplate[])
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const openNew = () => {
    setEditing(null)
    setName('')
    setBody('')
    setCategory('relance')
    setIsActive(true)
    setModalOpen(true)
  }

  const openEdit = (t: SmsTemplate) => {
    setEditing(t)
    setName(t.name)
    setBody(t.body)
    setCategory(t.category)
    setIsActive(t.is_active)
    setModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !body.trim()) return
    setSaving(true)

    const data = {
      name: name.trim(),
      body: body.trim(),
      category,
      is_active: isActive,
    }

    if (editing) {
      const { error } = await supabase.from('sms_templates').update(data).eq('id', editing.id)
      if (error) console.error('Update template error:', error)
    } else {
      const { error } = await supabase.from('sms_templates').insert(data)
      if (error) console.error('Insert template error:', error)
    }

    setSaving(false)
    setModalOpen(false)
    fetchTemplates()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('sms_templates').delete().eq('id', id)
    if (error) console.error('Delete template error:', error)
    fetchTemplates()
  }

  const toggleActive = async (t: SmsTemplate) => {
    const { error } = await supabase
      .from('sms_templates')
      .update({ is_active: !t.is_active })
      .eq('id', t.id)
    if (error) console.error('Toggle template error:', error)
    fetchTemplates()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Templates SMS</h2>
        <button
          onClick={openNew}
          className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Nouveau template
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
        <p className="text-xs text-gray-400">
          Variables disponibles : <code className="text-blue-400">{'{{prenom}}'}</code>, <code className="text-blue-400">{'{{entreprise}}'}</code>, <code className="text-blue-400">{'{{date}}'}</code>, <code className="text-blue-400">{'{{heure}}'}</code>
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Aperçu</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actif</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {templates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  Aucun template
                </td>
              </tr>
            ) : (
              templates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-700 text-gray-300 capitalize">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{t.body}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(t)}
                      className={`w-8 h-4 rounded-full transition-colors relative ${
                        t.is_active ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                          t.is_active ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le template' : 'Nouveau template'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="relance_j0"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SmsTemplateCategory)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Contenu du SMS</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Bonjour {{prenom}}, ..."
            />
            <p className="text-xs text-gray-500 mt-1">{body.length} caractères</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              id="templateActive"
              className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="templateActive" className="text-sm text-gray-400">Actif</label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

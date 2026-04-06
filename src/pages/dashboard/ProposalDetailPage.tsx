import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PRICING_GRID, formatCurrency } from '../../lib/business'
import type { Proposal, Client, ProjectType } from '../../types/database'

const TYPE_LABELS: Record<string, string> = {
  landing: 'Landing page',
  vitrine: 'Site vitrine',
  ecommerce: 'E-commerce Shopify',
  custom: 'Site sur mesure React/Next.js',
  mobile: 'Application mobile',
  maintenance: 'Maintenance mensuelle',
  audit: 'Audit SEO / technique',
  other: 'Autre',
}

const FEATURE_CATEGORIES = [
  {
    name: 'Pages',
    items: ['Page d\'accueil', 'A propos', 'Services', 'Contact', 'Blog', 'Portfolio', 'FAQ', 'Mentions legales'],
  },
  {
    name: 'E-commerce',
    items: ['Catalogue produits', 'Panier', 'Paiement en ligne', 'Gestion des commandes', 'Comptes clients'],
  },
  {
    name: 'Fonctionnalites',
    items: ['Formulaire de contact', 'Newsletter', 'Espace membre', 'Chat en ligne', 'Booking/RDV', 'Multi-langue'],
  },
  {
    name: 'Technique',
    items: ['SEO optimise', 'Responsive mobile', 'Hebergement inclus', 'Nom de domaine', 'SSL/HTTPS', 'Analytics'],
  },
]

const BUDGET_RANGES = ['< 500\u20ac', '500-1000\u20ac', '1000-2000\u20ac', '2000-3000\u20ac', '3000-5000\u20ac', '5000\u20ac+', 'A definir']

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Brouillon', bg: 'bg-gray-500/20', text: 'text-gray-400' },
  sent: { label: 'Envoye', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  accepted: { label: 'Accepte', bg: 'bg-green-500/20', text: 'text-green-400' },
  rejected: { label: 'Refuse', bg: 'bg-red-500/20', text: 'text-red-400' },
}

const inputClass =
  'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

export default function ProposalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [clientId, setClientId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [projectType, setProjectType] = useState<string>('')
  const [status, setStatus] = useState<string>('draft')

  // Client info (manual entry or from client)
  const [clientCompany, setClientCompany] = useState('')
  const [clientContact, setClientContact] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  // Cahier des charges
  const [projectDescription, setProjectDescription] = useState('')
  const [objectives, setObjectives] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [customFeatures, setCustomFeatures] = useState('')
  const [designPreferences, setDesignPreferences] = useState('')
  const [inspirations, setInspirations] = useState('')
  const [contentProvided, setContentProvided] = useState(false)
  const [seoRequirements, setSeoRequirements] = useState('')
  const [hostingNeeds, setHostingNeeds] = useState('')
  const [timeline, setTimeline] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [estimatedAmount, setEstimatedAmount] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)

  // Sections open/closed state (accordions)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    client: true,
    project: true,
    features: true,
    design: true,
    constraints: true,
    estimation: true,
  })

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleFeature = (feature: string) => {
    setFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    )
  }

  // Fetch clients list
  const fetchClients = useCallback(async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true })
    if (data) setClients(data as Client[])
  }, [])

  // Fetch existing proposal
  const fetchProposal = useCallback(async () => {
    if (isNew) return
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      console.error('Fetch proposal error:', error)
      return
    }
    if (data) {
      const p = data as Proposal
      setClientId(p.client_id)
      setTitle(p.title)
      setProjectType(p.project_type || '')
      setStatus(p.status)
      setClientCompany(p.client_company || '')
      setClientContact(p.client_contact || '')
      setClientEmail(p.client_email || '')
      setClientPhone(p.client_phone || '')
      setProjectDescription(p.project_description || '')
      setObjectives(p.objectives || '')
      setTargetAudience(p.target_audience || '')
      setFeatures(p.features || [])
      setDesignPreferences(p.design_preferences || '')
      setInspirations(p.inspirations || '')
      setContentProvided(p.content_provided)
      setSeoRequirements(p.seo_requirements || '')
      setHostingNeeds(p.hosting_needs || '')
      setTimeline(p.timeline || '')
      setBudgetRange(p.budget_range || '')
      setEstimatedAmount(p.estimated_amount != null ? String(p.estimated_amount) : '')
      setAdditionalNotes(p.additional_notes || '')
    }
  }, [id, isNew])

  useEffect(() => {
    fetchClients()
    fetchProposal()
  }, [fetchClients, fetchProposal])

  // When client selected from dropdown: auto-fill fields
  const handleClientChange = (selectedClientId: string) => {
    if (!selectedClientId) {
      setClientId(null)
      return
    }
    setClientId(selectedClientId)
    const client = clients.find((c) => c.id === selectedClientId)
    if (client) {
      setClientContact(client.name || '')
      setClientEmail(client.email || '')
      setClientPhone(client.phone || '')
    }
  }

  // When projectType changes: auto-fill estimatedAmount with mid-range from PRICING_GRID
  useEffect(() => {
    if (!projectType) return
    const pricing = PRICING_GRID.find((p) => p.type === projectType)
    if (pricing) {
      const mid = Math.round((pricing.min + pricing.max) / 2)
      setEstimatedAmount(String(mid))
    }
  }, [projectType])

  // Save handler
  const handleSave = async (newStatus?: string) => {
    setSaving(true)
    // Merge custom features into features array
    const allFeatures = [...features]
    if (customFeatures.trim()) {
      allFeatures.push(...customFeatures.split('\n').filter((f) => f.trim()))
    }

    const data = {
      client_id: clientId,
      title: title || 'Proposition sans titre',
      project_type: projectType || null,
      status: newStatus || status,
      client_company: clientCompany || null,
      client_contact: clientContact || null,
      client_email: clientEmail || null,
      client_phone: clientPhone || null,
      project_description: projectDescription || null,
      objectives: objectives || null,
      target_audience: targetAudience || null,
      features: allFeatures,
      design_preferences: designPreferences || null,
      inspirations: inspirations || null,
      seo_requirements: seoRequirements || null,
      hosting_needs: hostingNeeds || null,
      content_provided: contentProvided,
      timeline: timeline || null,
      budget_range: budgetRange || null,
      estimated_amount: estimatedAmount ? parseFloat(estimatedAmount) : null,
      additional_notes: additionalNotes || null,
      ...(newStatus === 'sent' ? { sent_at: new Date().toISOString() } : {}),
      ...(newStatus === 'accepted' ? { accepted_at: new Date().toISOString() } : {}),
    }

    if (isNew) {
      const { data: created, error } = await supabase
        .from('proposals')
        .insert(data)
        .select()
        .single()
      if (created) navigate(`/dashboard/proposals/${created.id}`, { replace: true })
      if (error) console.error(error)
    } else {
      await supabase.from('proposals').update(data).eq('id', id)
    }
    setSaving(false)
  }

  // Convert to quote handler
  const handleConvertToQuote = async () => {
    const { data: quoteNumber } = await supabase.rpc('next_sequence_number', {
      seq_id: 'quote',
    })
    const featuresDesc =
      features.length > 0 ? '\n\nFonctionnalites :\n- ' + features.join('\n- ') : ''
    const { data: quote } = await supabase
      .from('quotes')
      .insert({
        quote_number: quoteNumber,
        client_id: clientId,
        title: title,
        description: (projectDescription || '') + featuresDesc,
        total_amount: estimatedAmount ? parseFloat(estimatedAmount) : 0,
        status: 'draft',
      })
      .select()
      .single()
    if (quote) {
      await supabase.from('proposals').update({ quote_id: quote.id }).eq('id', id)
      if (estimatedAmount) {
        await supabase.from('quote_items').insert({
          quote_id: quote.id,
          description:
            title + (projectType ? ' \u2014 ' + TYPE_LABELS[projectType] : ''),
          quantity: 1,
          unit_price: parseFloat(estimatedAmount),
          position: 0,
        })
      }
      navigate(`/dashboard/quotes/${quote.id}`)
    }
  }

  const badge = STATUS_BADGE[status] || STATUS_BADGE.draft

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/proposals')}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">
            {isNew ? 'Nouvelle proposition' : title || 'Proposition sans titre'}
          </h1>
        </div>
        <span
          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Section 1: Informations client */}
      <div className="bg-gray-900 rounded-xl mb-4 border border-gray-800">
        <button
          type="button"
          onClick={() => toggleSection('client')}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="text-lg font-semibold text-white">Informations client</span>
          <ChevronIcon open={openSections.client} />
        </button>
        {openSections.client && (
          <div className="px-5 pb-5 space-y-4">
            {/* Client dropdown */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Selectionner un client existant
              </label>
              <select
                value={clientId || ''}
                onChange={(e) => handleClientChange(e.target.value)}
                className={inputClass}
              >
                <option value="">-- Saisie manuelle --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Entreprise</label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className={inputClass}
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contact</label>
                <input
                  type="text"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  className={inputClass}
                  placeholder="Nom du contact"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className={inputClass}
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Telephone</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className={inputClass}
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Le projet */}
      <div className="bg-gray-900 rounded-xl mb-4 border border-gray-800">
        <button
          type="button"
          onClick={() => toggleSection('project')}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="text-lg font-semibold text-white">Le projet</span>
          <ChevronIcon open={openSections.project} />
        </button>
        {openSections.project && (
          <div className="px-5 pb-5 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="Titre de la proposition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type de projet</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className={inputClass}
              >
                <option value="">-- Choisir un type --</option>
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Description du projet
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className={inputClass}
                rows={4}
                placeholder="Decrivez le projet en detail..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Objectifs</label>
              <textarea
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Quels sont les objectifs du projet ?"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Public cible</label>
              <textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Qui est le public cible ?"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Fonctionnalites */}
      <div className="bg-gray-900 rounded-xl mb-4 border border-gray-800">
        <button
          type="button"
          onClick={() => toggleSection('features')}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="text-lg font-semibold text-white">Fonctionnalites</span>
          <ChevronIcon open={openSections.features} />
        </button>
        {openSections.features && (
          <div className="px-5 pb-5 space-y-5">
            {FEATURE_CATEGORIES.map((category) => (
              <div key={category.name}>
                <p className="text-sm font-medium text-gray-300 mb-2">{category.name}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {category.items.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={features.includes(item)}
                        onChange={() => toggleFeature(item)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Autres fonctionnalites
              </label>
              <textarea
                value={customFeatures}
                onChange={(e) => setCustomFeatures(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Une fonctionnalite par ligne..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Design & contenu */}
      <div className="bg-gray-900 rounded-xl mb-4 border border-gray-800">
        <button
          type="button"
          onClick={() => toggleSection('design')}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="text-lg font-semibold text-white">Design & contenu</span>
          <ChevronIcon open={openSections.design} />
        </button>
        {openSections.design && (
          <div className="px-5 pb-5 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Preferences de design
              </label>
              <textarea
                value={designPreferences}
                onChange={(e) => setDesignPreferences(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Couleurs, style, ambiance souhaitee..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Sites d'inspiration
              </label>
              <textarea
                value={inspirations}
                onChange={(e) => setInspirations(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="URLs de sites qui vous inspirent..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setContentProvided(!contentProvided)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  contentProvided ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    contentProvided ? 'translate-x-5' : ''
                  }`}
                />
              </button>
              <span className="text-sm text-gray-300">
                Le client fournit le contenu (textes, images)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Section 5: Contraintes */}
      <div className="bg-gray-900 rounded-xl mb-4 border border-gray-800">
        <button
          type="button"
          onClick={() => toggleSection('constraints')}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="text-lg font-semibold text-white">Contraintes</span>
          <ChevronIcon open={openSections.constraints} />
        </button>
        {openSections.constraints && (
          <div className="px-5 pb-5 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Exigences SEO
              </label>
              <textarea
                value={seoRequirements}
                onChange={(e) => setSeoRequirements(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Mots-cles cibles, positionnement souhaite..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Besoins d'hebergement
              </label>
              <textarea
                value={hostingNeeds}
                onChange={(e) => setHostingNeeds(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Hebergement actuel, domaine existant..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Delai souhaite</label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className={inputClass}
                placeholder="Ex: 2 semaines, 1 mois..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Fourchette de budget
              </label>
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className={inputClass}
              >
                <option value="">-- Selectionner --</option>
                {BUDGET_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Section 6: Estimation */}
      <div className="bg-gray-900 rounded-xl mb-4 border border-gray-800">
        <button
          type="button"
          onClick={() => toggleSection('estimation')}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="text-lg font-semibold text-white">Estimation</span>
          <ChevronIcon open={openSections.estimation} />
        </button>
        {openSections.estimation && (
          <div className="px-5 pb-5 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Montant estime (&euro;)
              </label>
              <input
                type="number"
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(e.target.value)}
                className={inputClass}
                placeholder="0"
                min="0"
                step="50"
              />
              {estimatedAmount && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(parseFloat(estimatedAmount))}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Notes additionnelles
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className={inputClass}
                rows={4}
                placeholder="Remarques, conditions particulieres..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-end mt-6">
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>

        {status === 'draft' && (
          <button
            onClick={() => handleSave('sent')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Marquer comme envoye
          </button>
        )}

        {status === 'accepted' && !isNew && (
          <button
            onClick={handleConvertToQuote}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Convertir en devis
          </button>
        )}

        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Imprimer / PDF
        </button>
      </div>
    </div>
  )
}

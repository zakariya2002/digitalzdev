import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

const PROJECT_TYPES = [
  'Site vitrine',
  'E-commerce',
  'Application web',
  'Dashboard / SaaS',
  'Refonte de site',
  'Autre',
]

const BUDGETS = [
  'Moins de 1 500 €',
  '1 500 € – 3 000 €',
  '3 000 € – 5 000 €',
  '5 000 € – 10 000 €',
  'Plus de 10 000 €',
  'À définir',
]

const TIMELINES = [
  'Moins de 1 mois',
  '1 – 2 mois',
  '2 – 3 mois',
  '3+ mois',
  'Pas de deadline',
]

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    projectType: '',
    projectTypeOther: '',
    budget: '',
    timeline: '',
    hasDesign: '',
    description: '',
    url: '',
  })

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Build mailto with form data
    const subject = encodeURIComponent(
      `Demande de devis – ${form.projectType || 'Nouveau projet'}`
    )
    const body = encodeURIComponent(
      `Nom : ${form.name}\nEntreprise : ${form.company || '–'}\nEmail : ${form.email}\nTéléphone : ${form.phone || '–'}\n\nType de projet : ${form.projectType === 'Autre' ? `Autre – ${form.projectTypeOther}` : form.projectType}\nBudget : ${form.budget}\nDélai : ${form.timeline}\nDesign existant : ${form.hasDesign || '–'}\nSite actuel : ${form.url || '–'}\n\nDescription :\n${form.description}`
    )
    window.open(
      `mailto:zdigitalzdev@gmail.com?subject=${subject}&body=${body}`,
      '_self'
    )
    setSubmitted(true)
  }

  return (
    <main className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm mb-8"
            >
              <span>←</span> Retour à l'accueil
            </Link>
          </motion.div>

          <motion.span
            className="text-accent font-display font-semibold text-sm tracking-[0.2em] uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Contact
          </motion.span>
          <motion.h1
            className="font-display font-black text-5xl md:text-8xl lg:text-9xl text-text-primary mt-4 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Parlons de votre projet
          </motion.h1>
          <motion.p
            className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Remplissez ce formulaire pour nous aider à préparer un devis adapté
            à vos besoins.
          </motion.p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Infos personnelles */}
                <fieldset className="space-y-5">
                  <legend className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    Vos coordonnées
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5 font-display">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        className="w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5 font-display">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => update('company', e.target.value)}
                        className="w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                        placeholder="Nom de l'entreprise"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5 font-display">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        className="w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                        placeholder="jean@entreprise.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5 font-display">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className="w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Type de projet */}
                <fieldset className="space-y-4">
                  <legend className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    Votre projet
                  </legend>
                  <div>
                    <label className="block text-sm text-text-secondary mb-2 font-display">
                      Type de projet *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => update('projectType', type)}
                          className={`px-4 py-2 rounded-full text-sm font-display transition-all border ${
                            form.projectType === type
                              ? 'bg-text-primary text-surface border-text-primary'
                              : 'bg-surface-card text-text-secondary border-surface-border hover:border-accent/30'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {form.projectType === 'Autre' && (
                      <input
                        type="text"
                        value={form.projectTypeOther}
                        onChange={(e) => update('projectTypeOther', e.target.value)}
                        className="mt-3 w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                        placeholder="Précisez le type de projet..."
                        autoFocus
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5 font-display">
                      Site web actuel (si refonte)
                    </label>
                    <input
                      type="url"
                      value={form.url}
                      onChange={(e) => update('url', e.target.value)}
                      className="w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                      placeholder="https://monsite.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-2 font-display">
                      Avez-vous déjà un design / maquette ?
                    </label>
                    <div className="flex gap-3">
                      {['Oui', 'Non', 'En cours'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => update('hasDesign', opt)}
                          className={`px-4 py-2 rounded-full text-sm font-display transition-all border ${
                            form.hasDesign === opt
                              ? 'bg-text-primary text-surface border-text-primary'
                              : 'bg-surface-card text-text-secondary border-surface-border hover:border-accent/30'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </fieldset>

                {/* Budget & Délai */}
                <fieldset className="space-y-4">
                  <legend className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    Budget & délai
                  </legend>
                  <div>
                    <label className="block text-sm text-text-secondary mb-2 font-display">
                      Budget estimé *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BUDGETS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => update('budget', b)}
                          className={`px-4 py-2 rounded-full text-sm font-display transition-all border ${
                            form.budget === b
                              ? 'bg-text-primary text-surface border-text-primary'
                              : 'bg-surface-card text-text-secondary border-surface-border hover:border-accent/30'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-2 font-display">
                      Délai souhaité
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TIMELINES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => update('timeline', t)}
                          className={`px-4 py-2 rounded-full text-sm font-display transition-all border ${
                            form.timeline === t
                              ? 'bg-text-primary text-surface border-text-primary'
                              : 'bg-surface-card text-text-secondary border-surface-border hover:border-accent/30'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </fieldset>

                {/* Description */}
                <fieldset className="space-y-4">
                  <legend className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    Décrivez votre projet
                  </legend>
                  <textarea
                    required
                    rows={6}
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
                    placeholder="Décrivez votre projet, vos objectifs, votre cible, les fonctionnalités souhaitées, des sites de référence que vous aimez..."
                  />
                </fieldset>

                {/* Submit */}
                <motion.button
                  type="submit"
                  className="w-full py-4 bg-text-primary text-surface font-display font-semibold tracking-wider rounded-lg hover:opacity-90 transition-all text-lg"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ENVOYER LA DEMANDE
                </motion.button>

                <p className="text-text-muted text-xs text-center">
                  Nous revenons vers vous sous 24–48h avec une proposition
                  adaptée.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-8">
                  <svg
                    className="w-10 h-10 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="font-display font-bold text-3xl text-text-primary mb-3">
                  Demande envoyée !
                </h2>
                <p className="text-text-secondary text-lg mb-8">
                  Nous analysons votre projet et revenons vers vous sous 24–48h.
                </p>
                <Link
                  to="/"
                  className="px-8 py-3 bg-text-primary text-surface rounded-full font-display font-semibold inline-block hover:opacity-90 transition-all"
                >
                  Retour à l'accueil
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </main>
  )
}

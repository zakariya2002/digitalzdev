import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { BUSINESS } from '../../lib/business'
import { useTeam } from '../../contexts/TeamContext'
import DocumentAgency from './DocumentAgency'
import type { DocumentData, DocumentIssuer } from './documentTypes'

interface Party {
  name: string
  email?: string | null
  phone?: string | null
  legal_form?: string | null
  share_capital?: string | null
  siren?: string | null
  representative?: string | null
  address?: string | null
}

interface DocumentPDFProps {
  type: 'quote' | 'invoice'
  number: string
  date: string
  validUntil?: string | null
  dueDate?: string | null
  title?: string | null
  description?: string | null
  durationNote?: string | null
  client: Party | null
  items: Array<{ description: string; quantity: number; unit_price: number }>
  total: number
  terms: string | null
  notes: string | null
  paidAmount?: number
  projectName?: string | null
  /** Membre au nom duquel le document est émis */
  createdBy?: string | null
  onClose: () => void
}

interface Company {
  legal_name: string | null
  trade_name: string | null
  legal_form: string | null
  siret: string | null
  email: string | null
  phone: string | null
  address: string | null
  vat_number: string | null
  logo_url: string | null
  vat_applicable: boolean
  vat_rate: number
  validity_days: number
  iban: string | null
  bic: string | null
  bank_name: string | null
  account_holder: string | null
  payment_reference_note: string | null
  payment_terms: string | null
  late_penalty_terms: string | null
  ip_terms: string | null
}

/** Montant sans décimales quand elles sont nulles, comme sur un devis imprimé. */
function money(amount: number) {
  const rounded = Math.round(amount * 100) / 100
  const hasCents = rounded % 1 !== 0
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rounded) + ' €'
}

/**
 * Une ligne peut porter un titre, une phrase d'accroche et des puces :
 * la première ligne est le titre, les lignes commençant par un tiret ou une
 * puce deviennent des points, le reste forme l'accroche.
 */
function splitDescription(raw: string) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return { title: '', lead: null as string | null, bullets: [] as string[] }
  const [title, ...rest] = lines
  const bullets = rest.filter(l => /^[-•*·]/.test(l)).map(l => l.replace(/^[-•*·]\s*/, ''))
  const lead = rest.filter(l => !/^[-•*·]/.test(l)).join(' ') || null
  return { title, lead, bullets }
}

export default function DocumentPDF({
  type, number, date, validUntil, dueDate, title, description, durationNote,
  client, items, total, terms, notes, paidAmount, projectName, createdBy, onClose,
}: DocumentPDFProps) {
  const { profile, memberById } = useTeam()
  const [company, setCompany] = useState<Company | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Le document s'imprime seul : le back-office est écarté de la page papier.
  useEffect(() => {
    document.body.classList.add('doc-printing')
    return () => { document.body.classList.remove('doc-printing') }
  }, [])

  useEffect(() => {
    supabase.from('company_settings').select('*').maybeSingle()
      .then(({ data }) => setCompany((data || null) as unknown as Company | null))
  }, [])

  const isQuote = type === 'quote'
  const docTitle = isQuote ? 'DEVIS' : 'FACTURE'

  // Le document porte l'identité de son émetteur, pas celle du lecteur
  const author = memberById(createdBy) ?? profile ?? null
  const issuer: DocumentIssuer = {
    name: author?.issuer_name || company?.legal_name || BUSINESS.name,
    brand: author?.issuer_brand || company?.trade_name || BUSINESS.tradeName,
    legalForm: author?.issuer_legal_form || company?.legal_form || null,
    siret: author?.issuer_siret || company?.siret || BUSINESS.siret,
    rm: author?.issuer_rm || null,
    address: author?.issuer_address || company?.address || null,
    email: author?.issuer_email || company?.email || BUSINESS.email,
    phone: author?.issuer_phone || company?.phone || null,
    logoUrl: author?.issuer_logo_url || company?.logo_url || null,
    iban: author?.iban || company?.iban || null,
    bic: author?.bic || company?.bic || null,
    bankName: author?.bank_name || company?.bank_name || null,
    accountHolder: company?.account_holder || null,
    accent: author?.document_accent || null,
    template: (author?.document_template as 'classic' | 'agency') || 'classic',
  }

  const emitterName = company?.legal_name || BUSINESS.name
  const emitterTrade = company?.trade_name || BUSINESS.tradeName
  const emitterSiret = company?.siret || BUSINESS.siret
  const emitterEmail = company?.email || BUSINESS.email
  const vatApplicable = company?.vat_applicable ?? false
  const vatRate = Number(company?.vat_rate ?? 0.2)
  const validityDays = company?.validity_days ?? 30

  const vat = vatApplicable ? total * vatRate : 0
  const totalTtc = total + vat
  const remaining = !isQuote && paidAmount !== undefined ? total - paidAmount : 0

  const conditions = [
    { label: 'Règlement', text: company?.payment_terms || terms },
    { label: 'Pénalités', text: company?.late_penalty_terms },
    { label: 'Propriété intellectuelle', text: company?.ip_terms },
  ].filter(c => c.text)

  return createPortal(
    <div className="doc-root" id="print-area" tabIndex={-1}>
      <div className="no-print doc-toolbar">
        <button onClick={() => window.print()} className="doc-btn doc-btn-primary">Imprimer</button>
        <button onClick={onClose} className="doc-btn">Fermer</button>
        <span className="doc-hint">Dans la fenêtre d'impression, décoche « En-têtes et pieds de page » et coche « Graphiques d'arrière-plan ».</span>
      </div>

      {issuer.template === 'agency' ? (
        <div className="doc-page doc-page-agency">
          <DocumentAgency doc={{
            isQuote, number, date, validUntil, dueDate, title, description, durationNote,
            projectName, client, issuer, items, total,
            vatApplicable, vatRate, paidAmount,
            terms: company?.payment_terms || terms,
            penaltyTerms: company?.late_penalty_terms ?? null,
            ipTerms: company?.ip_terms ?? null,
            notes,
          } as DocumentData} />
        </div>
      ) : (
      <div className="doc-page">
        {/* En-tête */}
        <header className="doc-head">
          <div className="doc-head-left">
            <img src={issuer.logoUrl || '/logo.png'} alt="" className="doc-logo" />
          </div>
          <div className="doc-head-right">
            <h1 className="doc-title">{docTitle}</h1>
            <p className="doc-meta">N° {number}</p>
            <p className="doc-meta">Date : {format(parseISO(date), 'd MMMM yyyy', { locale: fr })}</p>
            {isQuote && (
              <p className="doc-meta">
                {validUntil
                  ? `Valable jusqu'au ${format(parseISO(validUntil), 'd MMMM yyyy', { locale: fr })}`
                  : `Validité : ${validityDays} jours`}
              </p>
            )}
            {!isQuote && dueDate && (
              <p className="doc-meta">Échéance : {format(parseISO(dueDate), 'd MMMM yyyy', { locale: fr })}</p>
            )}
          </div>
        </header>

        {/* Parties */}
        <section className="doc-parties">
          <p className="doc-label">Émetteur</p>
          <p className="doc-line doc-line-strong">
            {issuer.name}{issuer.brand ? ` / ${issuer.brand}` : ''}
          </p>
          {issuer.legalForm && <p className="doc-line">{issuer.legalForm}</p>}
          {issuer.address && <p className="doc-line">{issuer.address}</p>}
          {issuer.siret && <p className="doc-line">SIRET : {issuer.siret}</p>}
          {company?.vat_number && <p className="doc-line">TVA : {company.vat_number}</p>}
          {issuer.email && <p className="doc-line">{issuer.email}</p>}

          {client && (
            <>
              <p className="doc-label doc-label-spaced">Client</p>
              <p className="doc-line doc-line-strong">{client.name}</p>
              {(client.legal_form || client.share_capital) && (
                <p className="doc-line">
                  {[client.legal_form, client.share_capital ? `au capital de ${client.share_capital}` : null]
                    .filter(Boolean).join(' ')}
                </p>
              )}
              {client.address && <p className="doc-line">{client.address}</p>}
              {client.siren && <p className="doc-line">SIREN : {client.siren}</p>}
              {client.representative && <p className="doc-line">Représentée par {client.representative}</p>}
              {client.email && <p className="doc-line">{client.email}</p>}
            </>
          )}
        </section>

        <hr className="doc-rule" />

        {/* Objet */}
        {(title || description) && (
          <section className="doc-object">
            <p className="doc-label">Objet</p>
            {title && <h2 className="doc-object-title">{title}</h2>}
            {description && <p className="doc-object-text">{description}</p>}
            {durationNote && <p className="doc-object-duration">{durationNote}</p>}
          </section>
        )}

        {/* Lignes */}
        <table className="doc-table">
          <thead>
            <tr>
              <th className="doc-th">Désignation</th>
              <th className="doc-th doc-th-right">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const { title: lineTitle, lead, bullets } = splitDescription(item.description)
              return (
                <tr key={index} className={index % 2 === 1 ? 'doc-row doc-row-alt' : 'doc-row'}>
                  <td className="doc-td">
                    <p className="doc-item-title">
                      {items.length > 1 ? `${index + 1}. ` : ''}{lineTitle}
                      {item.quantity !== 1 && (
                        <span className="doc-item-qty"> · {item.quantity} × {money(item.unit_price)}</span>
                      )}
                    </p>
                    {lead && <p className="doc-item-lead">{lead}</p>}
                    {bullets.length > 0 && (
                      <ul className="doc-bullets">
                        {bullets.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    )}
                  </td>
                  <td className="doc-td doc-td-amount">{money(item.quantity * item.unit_price)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Total */}
        <div className="doc-total">
          <span className="doc-total-label">Total HT</span>
          <span className="doc-total-value">{money(total)} HT</span>
        </div>

        {vatApplicable ? (
          <p className="doc-total-note">
            TVA ({Math.round(vatRate * 100)} %) : {money(vat)} · Total TTC : {money(totalTtc)}
          </p>
        ) : (
          <p className="doc-total-note">{BUSINESS.tvaMessage}</p>
        )}

        {!isQuote && paidAmount !== undefined && paidAmount > 0 && (
          <p className="doc-total-note">
            Déjà réglé : {money(paidAmount)} · Reste à régler : {money(remaining)}
          </p>
        )}

        {!isQuote && (issuer.iban || issuer.bic) && (
          <section className="doc-bank">
            <p className="doc-label">Coordonnées bancaires</p>
            <div className="doc-bank-grid">
              {(company?.account_holder || emitterName) && (
                <>
                  <span className="doc-bank-key">Titulaire</span>
                  <span className="doc-bank-value">{issuer.accountHolder || issuer.name}</span>
                </>
              )}
              {issuer.bankName && (
                <>
                  <span className="doc-bank-key">Banque</span>
                  <span className="doc-bank-value">{issuer.bankName}</span>
                </>
              )}
              {issuer.iban && (
                <>
                  <span className="doc-bank-key">IBAN</span>
                  <span className="doc-bank-value doc-bank-iban">{issuer.iban}</span>
                </>
              )}
              {issuer.bic && (
                <>
                  <span className="doc-bank-key">BIC</span>
                  <span className="doc-bank-value doc-bank-iban">{issuer.bic}</span>
                </>
              )}
            </div>
            {company?.payment_reference_note && (
              <p className="doc-bank-note">{company.payment_reference_note}</p>
            )}
          </section>
        )}

        {notes && (
          <section className="doc-block">
            <h3 className="doc-block-title">Notes</h3>
            <p className="doc-block-text">{notes}</p>
          </section>
        )}

        {/* Conditions */}
        {conditions.length > 0 && (
          <section className="doc-terms">
            <h3 className="doc-block-title">Termes et conditions</h3>
            {conditions.map(c => (
              <div key={c.label} className="doc-term">
                <p className="doc-term-label">{c.label}</p>
                <p className="doc-term-text">{c.text}</p>
              </div>
            ))}
          </section>
        )}

        {/* Signatures */}
        {isQuote && (
          <>
            <hr className="doc-rule doc-rule-signature" />
            <section className="doc-signatures">
              <div className="doc-sign">
                <p className="doc-sign-title">Le prestataire</p>
                <p className="doc-line doc-line-strong">
                  {issuer.name}{issuer.brand ? ` / ${issuer.brand}` : ''}
                </p>
                <p className="doc-sign-hint">Date et signature :</p>
              </div>
              <div className="doc-sign">
                <p className="doc-sign-title">Le client</p>
                <p className="doc-sign-hint">Précédé de la mention « Bon pour accord »</p>
                <p className="doc-sign-hint doc-sign-hint-spaced">Date et signature :</p>
              </div>
            </section>
          </>
        )}
      </div>
      )}
    </div>,
    document.body,
  )
}

import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { DocumentData } from './documentTypes'

/** Montant avec deux décimales, comme sur un document commercial. */
function money(amount: number) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' €'
}

/**
 * Une ligne peut détailler des sous-points : la première ligne est l'intitulé,
 * les lignes de la forme « 1.1 Titre : texte » deviennent des points détaillés.
 */
function splitDetail(raw: string) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return { heading: '', details: [] as { label: string; text: string }[] }
  const [heading, ...rest] = lines
  const details = rest.map(line => {
    const cleaned = line.replace(/^[-•*·]\s*/, '')
    const match = cleaned.match(/^([\d.]+\s+[^:]{2,60}:)\s*(.*)$/)
    return match ? { label: match[1], text: match[2] } : { label: '', text: cleaned }
  })
  return { heading, details }
}

/** Gabarit « agence » : bandeau de marque, tableau détaillé, pied de page répété. */
export default function DocumentAgency({ doc }: { doc: DocumentData }) {
  const { issuer, client, items, total, isQuote, number, date, validUntil, dueDate,
          title, description, durationNote, vatApplicable, vatRate, paidAmount, terms } = doc

  const vat = vatApplicable ? total * vatRate : 0
  const label = isQuote ? 'Devis' : 'Facture'
  const accent = issuer.accent || '#5a5a5a'

  const footer = (
    <div className="ag-footer">
      <div className="ag-footer-col">
        <p className="ag-footer-strong">{issuer.name}</p>
        {issuer.legalForm && <p className="ag-footer-strong">{issuer.legalForm}</p>}
        {issuer.siret && <p>SIRET : {issuer.siret}</p>}
        {issuer.rm && <p>RM : {issuer.rm}</p>}
      </div>
      <div className="ag-footer-col">
        <p className="ag-footer-title">Mode de paiement</p>
        {issuer.iban && <p>IBAN : {issuer.iban}</p>}
        {issuer.bic && <p>BIC : {issuer.bic}</p>}
      </div>
      <div className="ag-footer-ref">{label} {number}</div>
    </div>
  )

  return (
    <div className="ag-doc" style={{ ['--ag-accent' as string]: accent }}>
      {/* Bandeau de marque */}
      <header className="ag-brand">
        {issuer.logoUrl
          ? <img src={issuer.logoUrl} alt="" className="ag-brand-logo" />
          : <span className="ag-brand-name">{issuer.brand || issuer.name}</span>}
      </header>

      <div className="ag-body">
        {/* Parties */}
        <section className="ag-parties">
          <div className="ag-party">
            <p className="ag-party-name">{issuer.name}</p>
            {issuer.address?.split('\n').map((l, i) => <p key={i} className="ag-party-line">{l}</p>)}
            {issuer.email && <p className="ag-party-line ag-party-mail">{issuer.email}</p>}
          </div>
          <div className="ag-party ag-party-right">
            {client && (
              <>
                <p className="ag-party-name">{client.name}</p>
                {client.address?.split('\n').map((l, i) => <p key={i} className="ag-party-line">{l}</p>)}
                {client.siren && (
                  <>
                    <p className="ag-party-label">SIRET</p>
                    <p className="ag-party-line">{client.siren}</p>
                  </>
                )}
                {!client.siren && client.email && <p className="ag-party-line">{client.email}</p>}
              </>
            )}
          </div>
        </section>

        {/* Titre */}
        <h1 className="ag-title">{label} {number}</h1>
        <div className="ag-subhead">
          <span className="ag-project">{doc.projectName ? `Projet ${doc.projectName}` : ''}</span>
          <span className="ag-dates">
            <span>Émis le {format(parseISO(date), 'dd/MM/yyyy')}</span>
            {isQuote && validUntil && <span>Valide jusqu'au {format(parseISO(validUntil), 'dd/MM/yyyy')}</span>}
            {!isQuote && dueDate && <span>Échéance le {format(parseISO(dueDate), 'dd/MM/yyyy')}</span>}
          </span>
        </div>

        {title && <p className="ag-object">Objet du projet : {title}</p>}
        {description && <p className="ag-object">{description}</p>}
        {durationNote && <p className="ag-object">{durationNote}</p>}

        {/* Tableau */}
        <table className="ag-table">
          <thead>
            <tr>
              <th className="ag-th">Libellé</th>
              <th className="ag-th ag-th-c">Unité</th>
              <th className="ag-th ag-th-r">Quantité</th>
              <th className="ag-th ag-th-r">Prix u. HT</th>
              <th className="ag-th ag-th-r">TVA</th>
              <th className="ag-th ag-th-r">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const { heading, details } = splitDetail(item.description)
              return (
                <tr key={index}>
                  <td className="ag-td">
                    <p className="ag-item-heading">{heading}</p>
                    {details.length > 0 && (
                      <div className="ag-item-details">
                        {details.map((d, i) => (
                          <p key={i} className="ag-item-detail">
                            {d.label && <span className="ag-item-detail-label">{d.label} </span>}
                            {d.text}
                          </p>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="ag-td ag-td-c">{item.unit || ''}</td>
                  <td className="ag-td ag-td-r">{item.quantity}</td>
                  <td className="ag-td ag-td-r">{money(item.unit_price)}</td>
                  <td className="ag-td ag-td-r">{vatApplicable ? `${(vatRate * 100).toFixed(2)} %` : '0,00 %'}</td>
                  <td className="ag-td ag-td-r">{money(item.quantity * item.unit_price)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Échéance et totaux */}
        <section className="ag-closing">
          <div className="ag-payment">
            <div className="ag-payment-head">Échéance de paiement</div>
            <p className="ag-payment-text">
              {isQuote
                ? '30 jours à compter de la date d\'émission de la facture.'
                : dueDate
                  ? `Règlement attendu au ${format(parseISO(dueDate), 'dd/MM/yyyy')}.`
                  : '30 jours à compter de la date d\'émission.'}
            </p>
          </div>
          <div className="ag-totals">
            <div className="ag-total-row">
              <span>Total HT</span><span>{money(total)}</span>
            </div>
            <div className="ag-total-row">
              <span>TVA</span><span>{money(vat)}</span>
            </div>
            <div className="ag-total-row ag-total-row-strong">
              <span>Total TTC</span><span>{money(total + vat)}</span>
            </div>
            {!isQuote && paidAmount !== undefined && paidAmount > 0 && (
              <div className="ag-total-row">
                <span>Reste à régler</span><span>{money(total + vat - paidAmount)}</span>
              </div>
            )}
          </div>
        </section>

        {isQuote && (
          <section className="ag-accord">
            <p className="ag-accord-title">Bon pour accord</p>
            <p className="ag-accord-line">Signé le :</p>
          </section>
        )}

        {/* Conditions */}
        <section className="ag-terms">
          <p className="ag-terms-title">Termes et conditions</p>
          {!vatApplicable && <p className="ag-terms-line">TVA non applicable, article 293 B du CGI</p>}
          {terms?.split('\n').filter(Boolean).map((line, i) => (
            <p key={i} className="ag-terms-line">{line}</p>
          ))}
          {doc.penaltyTerms && <p className="ag-terms-line ag-terms-spaced">{doc.penaltyTerms}</p>}
          {doc.ipTerms && <p className="ag-terms-line ag-terms-spaced">{doc.ipTerms}</p>}
        </section>
      </div>

      {footer}
    </div>
  )
}

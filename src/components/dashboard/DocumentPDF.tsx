import { useEffect } from 'react'
import { BUSINESS, formatCurrency } from '../../lib/business'

interface DocumentPDFProps {
  type: 'quote' | 'invoice'
  number: string
  date: string
  validUntil?: string | null
  dueDate?: string | null
  client: { name: string; email?: string | null; phone?: string | null } | null
  items: Array<{ description: string; quantity: number; unit_price: number }>
  total: number
  terms: string | null
  notes: string | null
  paidAmount?: number
  onClose: () => void
}

export default function DocumentPDF({
  type,
  number,
  date,
  validUntil,
  dueDate,
  client,
  items,
  total,
  terms,
  notes,
  paidAmount,
  onClose,
}: DocumentPDFProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const el = document.getElementById('print-area')
    if (el) el.focus()
  }, [])

  const docTitle = type === 'quote' ? 'DEVIS' : 'FACTURE'
  const remaining = type === 'invoice' && paidAmount !== undefined ? total - paidAmount : 0

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-auto" id="print-area" tabIndex={-1}>
      {/* Top bar - hidden when printing */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Imprimer
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Fermer
          </button>
        </div>
        <p className="text-sm text-gray-500">{docTitle} {number}</p>
      </div>

      {/* Document */}
      <div className="max-w-[210mm] mx-auto p-8 bg-white text-black" style={{ minHeight: '297mm' }}>
        {/* Header */}
        <div className="flex justify-between items-start">
          {/* Left - Business info */}
          <div>
            <p className="text-xl font-bold text-black">{BUSINESS.tradeName}</p>
            <div className="mt-1 text-sm text-gray-600 space-y-0.5">
              <p>{BUSINESS.name}</p>
              <p>SIRET : {BUSINESS.siret}</p>
              {BUSINESS.address && <p>{BUSINESS.address}</p>}
              <p>{BUSINESS.email}</p>
              <p>{BUSINESS.phone}</p>
              <p>{BUSINESS.website}</p>
            </div>
          </div>

          {/* Right - Document info */}
          <div className="text-right">
            <p className="text-3xl font-bold text-black">{docTitle}</p>
            <div className="mt-2 text-sm text-gray-600 space-y-0.5">
              <p>N° {number}</p>
              <p>Date : {date}</p>
              {type === 'quote' && validUntil && (
                <p>Valide jusqu'au : {validUntil}</p>
              )}
              {type === 'invoice' && dueDate && (
                <p>Échéance : {dueDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Client block */}
        <div className="mt-8 bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Client</p>
          {client ? (
            <div>
              <p className="font-bold text-black">{client.name}</p>
              {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
              {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Client non renseigné</p>
          )}
        </div>

        {/* Items table */}
        <div className="mt-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-4 py-2 text-sm font-semibold text-black border border-gray-300">Description</th>
                <th className="text-center px-4 py-2 text-sm font-semibold text-black border border-gray-300 w-20">Qté</th>
                <th className="text-right px-4 py-2 text-sm font-semibold text-black border border-gray-300 w-32">Prix unitaire</th>
                <th className="text-right px-4 py-2 text-sm font-semibold text-black border border-gray-300 w-32">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 text-sm text-black border border-gray-300">{item.description}</td>
                  <td className="text-center px-4 py-2 text-sm text-black border border-gray-300">{item.quantity}</td>
                  <td className="text-right px-4 py-2 text-sm text-black border border-gray-300">{formatCurrency(item.unit_price)}</td>
                  <td className="text-right px-4 py-2 text-sm text-black border border-gray-300">{formatCurrency(item.quantity * item.unit_price)}</td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-gray-100">
                <td colSpan={3} className="px-4 py-2 text-sm font-bold text-black border border-gray-300 text-right">
                  Total HT
                </td>
                <td className="px-4 py-2 text-sm font-bold text-black border border-gray-300 text-right">
                  {formatCurrency(total)}
                </td>
              </tr>
              {type === 'invoice' && paidAmount !== undefined && paidAmount > 0 && (
                <>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-sm text-black border border-gray-300 text-right">
                      Montant payé
                    </td>
                    <td className="px-4 py-2 text-sm text-black border border-gray-300 text-right">
                      {formatCurrency(paidAmount)}
                    </td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td colSpan={3} className="px-4 py-2 text-sm font-bold text-black border border-gray-300 text-right">
                      Reste à payer
                    </td>
                    <td className="px-4 py-2 text-sm font-bold text-black border border-gray-300 text-right">
                      {formatCurrency(remaining)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-gray-500 italic">{BUSINESS.tvaMessage}</p>
        </div>

        {/* Footer section */}
        <div className="mt-8 space-y-4">
          {/* Bank details for invoices */}
          {type === 'invoice' && (BUSINESS.iban || BUSINESS.bic) && (
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm font-semibold text-black mb-1">Coordonnées bancaires</p>
              {BUSINESS.bankName && <p className="text-sm text-gray-600">Banque : {BUSINESS.bankName}</p>}
              {BUSINESS.iban && <p className="text-sm text-gray-600">IBAN : {BUSINESS.iban}</p>}
              {BUSINESS.bic && <p className="text-sm text-gray-600">BIC : {BUSINESS.bic}</p>}
            </div>
          )}

          {/* Payment terms */}
          {terms && (
            <div>
              <p className="text-sm font-semibold text-black mb-1">Conditions de paiement</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{terms}</p>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div>
              <p className="text-sm font-semibold text-black mb-1">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{notes}</p>
            </div>
          )}

          {/* Signature block for quotes */}
          {type === 'quote' && (
            <div className="mt-8">
              <p className="text-sm text-black">Bon pour accord — Signature du client :</p>
              <div className="h-16 border-b border-gray-400 mt-2" />
            </div>
          )}
        </div>

        {/* Legal footer */}
        <div className="mt-12 pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-400 text-center">
            {BUSINESS.tradeName} — {BUSINESS.name} — Auto-entrepreneur — SIRET : {BUSINESS.siret}
          </p>
        </div>
      </div>
    </div>
  )
}

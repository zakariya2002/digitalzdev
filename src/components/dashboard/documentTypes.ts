/** Données communes aux gabarits de document, quelle que soit leur présentation. */

export interface DocumentParty {
  name: string
  email?: string | null
  address?: string | null
  legal_form?: string | null
  share_capital?: string | null
  siren?: string | null
  representative?: string | null
}

export interface DocumentIssuer {
  name: string
  brand?: string | null
  legalForm?: string | null
  siret?: string | null
  rm?: string | null
  address?: string | null
  email?: string | null
  phone?: string | null
  logoUrl?: string | null
  iban?: string | null
  bic?: string | null
  bankName?: string | null
  accountHolder?: string | null
  accent?: string | null
  template: 'classic' | 'agency'
}

export interface DocumentLine {
  description: string
  quantity: number
  unit_price: number
  unit?: string | null
}

export interface DocumentData {
  isQuote: boolean
  number: string
  date: string
  validUntil?: string | null
  dueDate?: string | null
  title?: string | null
  description?: string | null
  durationNote?: string | null
  projectName?: string | null
  client: DocumentParty | null
  issuer: DocumentIssuer
  items: DocumentLine[]
  total: number
  vatApplicable: boolean
  vatRate: number
  paidAmount?: number
  terms?: string | null
  penaltyTerms?: string | null
  ipTerms?: string | null
  notes?: string | null
  paymentNote?: string | null
}

/** Le libellé suit le numéro : neuf chiffres pour un SIREN, quatorze pour un SIRET. */
export function companyIdLabel(value: string | null | undefined) {
  const digits = (value ?? '').replace(/\D/g, '')
  return digits.length >= 14 ? 'SIRET' : 'SIREN'
}

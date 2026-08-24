/**
 * Moteur de simulation fiscale.
 *
 * Les barèmes ne sont pas dans ce fichier : ils viennent de la table `tax_regimes`,
 * modifiable depuis l'application. Ici on ne trouve que la mécanique de calcul,
 * qui elle ne change pas d'une année sur l'autre.
 *
 * Ces calculs sont des estimations destinées à décider d'un tarif.
 * Ils ne remplacent pas un expert-comptable.
 */

export type RegimeKind = 'micro' | 'corporate'

export interface MicroParams {
  kind: 'micro'
  social_rate: number
  training_rate: number
  liberatory_tax_rate: number
  income_allowance: number
  revenue_ceiling: number
  min_social_base?: number
  vat_franchise_ceiling: number | null
  vat_rate: number
}

export interface CorporateParams {
  kind: 'corporate'
  employer_rate: number
  employee_rate: number
  corporate_tax_reduced: number
  corporate_tax_threshold: number
  corporate_tax_standard: number
  dividend_flat_tax: number
  default_salary_share: number
  accounting_cost: number
  vat_rate: number
}

export type RegimeParams = MicroParams | CorporateParams

export interface TaxRegime {
  id: string
  label: string
  country: string
  currency: string
  fiscal_year: number
  params: RegimeParams
  notes: string | null
  source_note: string | null
  is_active: boolean
  position: number
}

export interface SimulationInput {
  /** Chiffre d'affaires hors taxes, dans la monnaie du régime */
  revenue: number
  /** Charges réellement supportées : abonnements, matériel, sous-traitance */
  expenses?: number
  /** Part du résultat versée en rémunération, pour les sociétés (0 à 1) */
  salaryShare?: number
  /** Option du versement libératoire de l'impôt sur le revenu */
  liberatoryTax?: boolean
  /** Taux marginal d'imposition du foyer, quand le libératoire ne s'applique pas */
  marginalRate?: number
  /** Chiffre d'affaires déjà réalisé sur l'année, pour situer les seuils */
  revenueToDate?: number
  /** Le montant représente une année entière, et non une seule facture.
   *  Les frais de structure annuels ne sont comptés que dans ce cas. */
  annual?: boolean
}

export interface SimulationLine {
  label: string
  amount: number
  hint?: string
  kind: 'charge' | 'tax' | 'net' | 'info'
}

export interface SimulationResult {
  regime: TaxRegime
  currency: string
  revenue: number
  lines: SimulationLine[]
  totalCharges: number
  net: number
  /** Part du chiffre d'affaires réellement conservée */
  netRate: number
  warnings: string[]
}

export function isMicro(params: RegimeParams): params is MicroParams {
  return params.kind === 'micro'
}

const round = (n: number) => Math.round(n * 100) / 100

/** Simule ce qu'il reste réellement d'un chiffre d'affaires sous un régime donné. */
export function simulate(regime: TaxRegime, input: SimulationInput): SimulationResult {
  const revenue = Math.max(0, input.revenue || 0)
  const expenses = Math.max(0, input.expenses || 0)
  const lines: SimulationLine[] = []
  const warnings: string[] = []
  const p = regime.params

  if (isMicro(p)) {
    // Les cotisations portent sur le chiffre d'affaires, sans déduction des charges
    const base = p.min_social_base ? Math.max(revenue, p.min_social_base) : revenue
    const social = base * p.social_rate
    const training = revenue * p.training_rate

    lines.push({
      kind: 'charge',
      label: p.min_social_base ? 'Cotisation sociale' : 'Cotisations sociales',
      amount: round(social),
      hint: p.min_social_base && revenue < p.min_social_base
        ? `Assise sur la base minimale de ${p.min_social_base.toLocaleString('fr-FR')}`
        : `${(p.social_rate * 100).toFixed(1)} % du chiffre d'affaires`,
    })

    if (training > 0) {
      lines.push({
        kind: 'charge',
        label: 'Formation professionnelle',
        amount: round(training),
        hint: `${(p.training_rate * 100).toFixed(2)} % du chiffre d'affaires`,
      })
    }

    let tax = 0
    if (input.liberatoryTax) {
      tax = revenue * p.liberatory_tax_rate
      lines.push({
        kind: 'tax',
        label: 'Impôt (versement libératoire)',
        amount: round(tax),
        hint: `${(p.liberatory_tax_rate * 100).toFixed(1)} % du chiffre d'affaires`,
      })
    } else if (input.marginalRate) {
      const taxable = revenue * (1 - p.income_allowance)
      tax = taxable * input.marginalRate
      lines.push({
        kind: 'tax',
        label: 'Impôt sur le revenu (estimation)',
        amount: round(tax),
        hint: p.income_allowance > 0
          ? `${(input.marginalRate * 100).toFixed(0)} % sur une base abattue de ${(p.income_allowance * 100).toFixed(0)} %`
          : `${(input.marginalRate * 100).toFixed(0)} % du revenu déclaré`,
      })
    }

    if (expenses > 0) {
      lines.push({
        kind: 'charge',
        label: 'Charges réelles',
        amount: round(expenses),
        hint: 'Non déductibles sous ce régime : elles pèsent sur le net',
      })
    }

    const totalCharges = social + training + tax + expenses
    const net = revenue - totalCharges

    // Seuils : on prévient avant de les franchir, pas après
    const yearTotal = (input.revenueToDate || 0) + revenue
    if (yearTotal > p.revenue_ceiling) {
      warnings.push(
        `Le plafond du régime (${p.revenue_ceiling.toLocaleString('fr-FR')} ${regime.currency}) serait dépassé : ${Math.round(yearTotal).toLocaleString('fr-FR')} sur l'année.`
      )
    } else if (yearTotal > p.revenue_ceiling * 0.85) {
      warnings.push(
        `Vous approchez du plafond : ${Math.round(yearTotal).toLocaleString('fr-FR')} sur ${p.revenue_ceiling.toLocaleString('fr-FR')} ${regime.currency}.`
      )
    }
    if (p.vat_franchise_ceiling && yearTotal > p.vat_franchise_ceiling) {
      warnings.push(
        `Le seuil de franchise de TVA (${p.vat_franchise_ceiling.toLocaleString('fr-FR')} ${regime.currency}) serait franchi : il faudrait facturer la TVA à ${(p.vat_rate * 100).toFixed(0)} %.`
      )
    }

    return {
      regime, currency: regime.currency, revenue, lines,
      totalCharges: round(totalCharges), net: round(net),
      netRate: revenue > 0 ? net / revenue : 0, warnings,
    }
  }

  // --- Société : les charges sont déductibles, les cotisations ne portent que sur la rémunération ---
  // Les frais annuels ne se déduisent pas d'une facture isolée : ils fausseraient le résultat
  const accounting = input.annual ? (p.accounting_cost || 0) : 0
  const share = input.salaryShare ?? p.default_salary_share
  const available = Math.max(0, revenue - expenses - accounting)

  // L'enveloppe consacrée à la rémunération couvre le brut et les cotisations patronales
  const envelope = available * share
  const gross = envelope / (1 + p.employer_rate)
  const employer = gross * p.employer_rate
  const employee = gross * p.employee_rate
  const netSalary = gross - employee

  const profitBeforeTax = available - envelope
  const reducedPart = Math.min(Math.max(profitBeforeTax, 0), p.corporate_tax_threshold)
  const standardPart = Math.max(profitBeforeTax - p.corporate_tax_threshold, 0)
  const corporateTax = reducedPart * p.corporate_tax_reduced + standardPart * p.corporate_tax_standard
  const distributable = Math.max(profitBeforeTax - corporateTax, 0)
  const dividendTax = distributable * p.dividend_flat_tax
  const netDividends = distributable - dividendTax

  if (expenses > 0) {
    lines.push({ kind: 'info', label: 'Charges réelles déduites', amount: round(expenses), hint: 'Déductibles du résultat' })
  }
  if (accounting > 0) {
    lines.push({ kind: 'charge', label: 'Comptabilité et frais de structure', amount: round(accounting), hint: 'Estimation annuelle, à répartir' })
  }
  lines.push({ kind: 'charge', label: 'Cotisations patronales', amount: round(employer), hint: `${(p.employer_rate * 100).toFixed(0)} % du brut` })
  lines.push({ kind: 'charge', label: 'Cotisations salariales', amount: round(employee), hint: `${(p.employee_rate * 100).toFixed(0)} % du brut` })
  lines.push({ kind: 'tax', label: 'Impôt sur les sociétés', amount: round(corporateTax), hint: `${(p.corporate_tax_reduced * 100).toFixed(0)} % jusqu'à ${p.corporate_tax_threshold.toLocaleString('fr-FR')} €, puis ${(p.corporate_tax_standard * 100).toFixed(0)} %` })
  lines.push({ kind: 'tax', label: 'Imposition des dividendes', amount: round(dividendTax), hint: `Prélèvement forfaitaire de ${(p.dividend_flat_tax * 100).toFixed(0)} %` })
  lines.push({ kind: 'net', label: 'Rémunération nette', amount: round(netSalary), hint: 'Avant impôt sur le revenu' })
  lines.push({ kind: 'net', label: 'Dividendes nets', amount: round(netDividends), hint: 'Après impôt sur les sociétés et prélèvement forfaitaire' })

  const net = netSalary + netDividends
  const totalCharges = revenue - expenses - net - (expenses > 0 ? 0 : 0)

  warnings.push("La rémunération nette reste soumise à l'impôt sur le revenu du foyer, non compté ici.")
  if (!input.annual) {
    warnings.push(
      `Sur une facture isolée, les frais annuels de la société (comptabilité, dépôt des comptes : environ ${(p.accounting_cost || 0).toLocaleString('fr-FR')} €) ne sont pas déduits. Passez en vue annuelle pour les intégrer.`
    )
  } else if (revenue - expenses < (p.accounting_cost || 0) * 3) {
    warnings.push("À ce niveau d'activité, les frais de structure d'une société pèsent lourd face à une micro-entreprise.")
  }

  return {
    regime, currency: regime.currency, revenue, lines,
    totalCharges: round(revenue - expenses - net), net: round(net),
    netRate: revenue > 0 ? net / revenue : 0, warnings,
  }
}

/** Met un montant en forme dans la monnaie du régime. */
export function formatAmount(amount: number, currency: string) {
  if (currency === 'DZD') {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' DA'
  }
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

/** Convertit un montant en euros vers la monnaie d'un régime étranger. */
export function convertFromEur(amount: number, currency: string, eurToDzd: number) {
  return currency === 'DZD' ? amount * eurToDzd : amount
}

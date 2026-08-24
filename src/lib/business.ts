// Constantes auto-entrepreneur France 2026
export const BUSINESS = {
  name: 'Zakariya Nebbache',
  tradeName: 'Z Digital Dev',
  siret: '994 397 735 00014',
  ape: '6312Z',
  address: '',
  email: 'zdigitalzdev@gmail.com',
  phone: '+33 7 83 25 98 69',
  website: 'https://digitalzdev.com',

  // Fiscal
  tvaExempt: true,
  tvaMessage: 'TVA non applicable, article 293 B du Code Général des Impôts',
  // Les taux et plafonds sont désormais des données modifiables : voir la table
  // tax_regimes et l'écran Simulateur. Ces valeurs ne servent que de repli.
  urssafRate: 0.256,
  cfpRate: 0.001,
  caPlafond: 77700,

  // Paiement
  defaultPaymentTerms: 'Paiement à réception de facture. Tout retard de paiement entraînera des pénalités de retard au taux de 3 fois le taux d\'intérêt légal, ainsi qu\'une indemnité forfaitaire pour frais de recouvrement de 40€.',
  defaultValidityDays: 30,
  defaultPaymentDueDays: 30,

  // Coordonnées bancaires
  iban: '',
  bic: '',
  bankName: '',
}

// Grille tarifaire
export const PRICING_GRID = [
  { type: 'landing', label: 'Landing page', min: 500, max: 500, description: 'Page unique optimisée conversion' },
  { type: 'vitrine', label: 'Site vitrine', min: 800, max: 1500, description: 'Site de présentation multi-pages' },
  { type: 'ecommerce', label: 'E-commerce Shopify', min: 1500, max: 3000, description: 'Boutique en ligne complète' },
  { type: 'custom', label: 'Site sur mesure React/Next.js', min: 2500, max: 5000, description: 'Application web custom' },
  { type: 'mobile', label: 'Application mobile', min: 3000, max: 8000, description: 'App iOS/Android' },
  { type: 'maintenance', label: 'Maintenance mensuelle', min: 50, max: 150, description: 'Suivi technique et mises à jour' },
  { type: 'audit', label: 'Audit SEO / technique', min: 200, max: 500, description: 'Analyse et recommandations' },
]

// Les taux vivent en base, dans tax_regimes : voir useTaxRegimes et lib/tax.
// Ce repli ne sert que si aucun barème n'a pu être chargé.

// Formatage monétaire
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

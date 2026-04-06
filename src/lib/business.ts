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
  tvaMessage: 'TVA non applicable, article 293 B du Code G\u00e9n\u00e9ral des Imp\u00f4ts',
  urssafRate: 0.211,
  cfpRate: 0.001,
  caPlafond: 77700,

  // Paiement
  defaultPaymentTerms: 'Paiement \u00e0 r\u00e9ception de facture. Tout retard de paiement entra\u00eenera des p\u00e9nalit\u00e9s de retard au taux de 3 fois le taux d\'int\u00e9r\u00eat l\u00e9gal, ainsi qu\'une indemnit\u00e9 forfaitaire pour frais de recouvrement de 40\u20ac.',
  defaultValidityDays: 30,
  defaultPaymentDueDays: 30,

  // Coordonn\u00e9es bancaires
  iban: '',
  bic: '',
  bankName: '',
}

// Grille tarifaire
export const PRICING_GRID = [
  { type: 'landing', label: 'Landing page', min: 500, max: 500, description: 'Page unique optimis\u00e9e conversion' },
  { type: 'vitrine', label: 'Site vitrine', min: 800, max: 1500, description: 'Site de pr\u00e9sentation multi-pages' },
  { type: 'ecommerce', label: 'E-commerce Shopify', min: 1500, max: 3000, description: 'Boutique en ligne compl\u00e8te' },
  { type: 'custom', label: 'Site sur mesure React/Next.js', min: 2500, max: 5000, description: 'Application web custom' },
  { type: 'mobile', label: 'Application mobile', min: 3000, max: 8000, description: 'App iOS/Android' },
  { type: 'maintenance', label: 'Maintenance mensuelle', min: 50, max: 150, description: 'Suivi technique et mises \u00e0 jour' },
  { type: 'audit', label: 'Audit SEO / technique', min: 200, max: 500, description: 'Analyse et recommandations' },
]

// Calcul des charges auto-entrepreneur
export function calculateCharges(amount: number) {
  const urssaf = amount * BUSINESS.urssafRate
  const cfp = amount * BUSINESS.cfpRate
  const totalCharges = urssaf + cfp
  const net = amount - totalCharges
  return { urssaf, cfp, totalCharges, net, rate: BUSINESS.urssafRate + BUSINESS.cfpRate }
}

// Formatage mon\u00e9taire
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

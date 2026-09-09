const BUSINESS = {
  name: "Zakariya Nebbache",
  tradeName: "Z Digital Dev",
  siret: "994 397 735 00014",
  email: "zdigitalzdev@gmail.com",
  website: "https://digitalzdev.com",
  tvaMessage: "TVA non applicable, article 293 B du Code Général des Impôts",
  // Paiement
  defaultPaymentTerms: "Paiement à réception de facture. Tout retard de paiement entraînera des pénalités de retard au taux de 3 fois le taux d'intérêt légal, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40€."
};
const PRICING_GRID = [
  { type: "landing", label: "Landing page", min: 500, max: 500, description: "Page unique optimisée conversion" },
  { type: "vitrine", label: "Site vitrine", min: 800, max: 1500, description: "Site de présentation multi-pages" },
  { type: "ecommerce", label: "E-commerce Shopify", min: 1500, max: 3e3, description: "Boutique en ligne complète" },
  { type: "custom", label: "Site sur mesure React/Next.js", min: 2500, max: 5e3, description: "Application web custom" },
  { type: "mobile", label: "Application mobile", min: 3e3, max: 8e3, description: "App iOS/Android" },
  { type: "maintenance", label: "Maintenance mensuelle", min: 50, max: 150, description: "Suivi technique et mises à jour" },
  { type: "audit", label: "Audit SEO / technique", min: 200, max: 500, description: "Analyse et recommandations" }
];
function formatCurrency(amount) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}
export {
  BUSINESS as B,
  PRICING_GRID as P,
  formatCurrency as f
};

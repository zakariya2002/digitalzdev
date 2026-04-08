// Convertit un numéro en E.164 (format international avec + devant)
// Accepte les numéros français (auto-préfixe +33) et tout autre numéro international
export function toE164(phone: string): string {
  const cleaned = phone.replace(/[\s.\-()]/g, '')
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2)
  // Format français : 0XXXXXXXXX → +33XXXXXXXXX
  if (cleaned.startsWith('0') && cleaned.length === 10) return '+33' + cleaned.slice(1)
  return cleaned
}

// Formate un numéro E.164 pour l'affichage
export function formatPhone(phone: string | null): string {
  if (!phone) return '—'
  // Format français lisible
  const matchFr = phone.match(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (matchFr) return `0${matchFr[1]} ${matchFr[2]} ${matchFr[3]} ${matchFr[4]} ${matchFr[5]}`
  return phone
}

// Vérifie si un numéro est valide (format E.164 international)
// Accepte tout numéro entre 8 et 15 chiffres précédé éventuellement d'un +
export function isValidPhone(phone: string): boolean {
  const e164 = toE164(phone)
  return /^\+\d{8,15}$/.test(e164)
}

// Conservé pour compatibilité — équivalent à isValidPhone maintenant
export function isValidFrenchPhone(phone: string): boolean {
  return isValidPhone(phone)
}

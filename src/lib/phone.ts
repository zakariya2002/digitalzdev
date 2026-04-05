// Formate un numéro français en E.164
export function toE164(phone: string): string {
  const cleaned = phone.replace(/[\s.\-()]/g, '')
  if (cleaned.startsWith('+33')) return cleaned
  if (cleaned.startsWith('0033')) return '+33' + cleaned.slice(4)
  if (cleaned.startsWith('0') && cleaned.length === 10) return '+33' + cleaned.slice(1)
  return cleaned
}

// Formate un numéro E.164 pour l'affichage
export function formatPhone(phone: string | null): string {
  if (!phone) return '—'
  const match = phone.match(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (match) return `0${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`
  return phone
}

// Vérifie si un numéro est valide (format français)
export function isValidFrenchPhone(phone: string): boolean {
  const e164 = toE164(phone)
  return /^\+33[1-9]\d{8}$/.test(e164)
}

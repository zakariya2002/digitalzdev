/**
 * Lecture d'un devis existant : PDF, tableur ou texte collé.
 *
 * L'analyse est volontairement conservatrice : elle propose ce qu'elle a reconnu,
 * l'utilisateur corrige avant d'enregistrer. Mieux vaut un champ laissé vide
 * qu'un montant inventé.
 */

export interface ParsedItem {
  description: string
  quantity: number
  unit_price: number
}

export interface ParsedQuote {
  number: string | null
  title: string | null
  clientName: string | null
  clientEmail: string | null
  validUntil: string | null
  items: ParsedItem[]
  total: number | null
  /** Ce que l'analyse n'a pas su interpréter, pour que rien ne se perde */
  leftovers: string[]
}

/** Reconnaît « 1 234,56 », « 1.234,56 », « 1,234.56 » et « 1234.56 ». */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[€$\s ]/g, '').trim()
  if (!cleaned || !/\d/.test(cleaned)) return null

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  let normalised = cleaned

  if (lastComma > -1 && lastDot > -1) {
    // Le séparateur décimal est le dernier des deux
    normalised = lastComma > lastDot
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '')
  } else if (lastComma > -1) {
    const decimals = cleaned.length - lastComma - 1
    normalised = decimals <= 2 ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '')
  } else if (lastDot > -1) {
    // Un point suivi d'exactement trois chiffres sépare les milliers : « 1.500 » vaut 1500
    if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) normalised = cleaned.replace(/\./g, '')
  }

  const value = Number(normalised)
  return Number.isFinite(value) ? value : null
}

const AMOUNT = /(\d[\d\s .,]*\d|\d)\s*(?:€|EUR)?/g

/** Tous les montants d'une ligne, dans l'ordre. */
function amountsIn(line: string): number[] {
  const found: number[] = []
  for (const match of line.matchAll(AMOUNT)) {
    const value = parseAmount(match[1])
    if (value !== null) found.push(value)
  }
  return found
}

const IGNORED = /^(devis|facture|date|siret|siren|tva|n°|numero|numéro|page|conditions|mentions|iban|bic|adresse|tél|tel|email|e-mail|client|destinataire|émetteur|emetteur|total|sous-total|net|acompte|signature|bon pour accord|valable|validit[ée]|valide|échéance|echeance|objet|intitul[ée])\b/i

/** Une date ne doit jamais être prise pour un montant. */
const DATE_LIKE = /\b\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b/g

/** Découpe une ligne en colonnes quand elles sont alignées par des espaces ou des tabulations. */
function splitColumns(line: string): string[] | null {
  const cells = line.split(/\t+|\s{2,}/).map(c => c.trim()).filter(Boolean)
  return cells.length >= 2 ? cells : null
}

const TOTAL_LINE = /\b(total|montant\s+total|net\s+à\s+payer|total\s+ttc|total\s+ht)\b/i

/** Analyse un devis fourni sous forme de texte brut. */
export function parseQuoteText(raw: string): ParsedQuote {
  const lines = raw
    .split(/\r?\n/)
    .map(l => l.replace(/ /g, ' ').trim())
    .filter(Boolean)

  const result: ParsedQuote = {
    number: null, title: null, clientName: null, clientEmail: null,
    validUntil: null, items: [], total: null, leftovers: [],
  }

  // Numéro de devis
  const numberMatch = raw.match(/\b((?:DEVIS|DEV|QUO)[-\s]?\d{2,4}[-\s]?\d{1,5})\b/i)
    || raw.match(/devis\s*(?:n[°o]?\.?)\s*[:\s]\s*([A-Z0-9][A-Z0-9\-/]{2,20})/i)
  if (numberMatch) result.number = numberMatch[1].trim()

  // Adresse électronique du destinataire
  const emailMatch = raw.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/)
  if (emailMatch) result.clientEmail = emailMatch[0]

  // Nom du client, annoncé par un mot-clé
  const clientMatch = raw.match(/(?:client|destinataire|à l['’]attention de|adressé à)\s*[:\-]?\s*([^\n]{2,60})/i)
  if (clientMatch) {
    const candidate = clientMatch[1].trim().replace(/[.,;]$/, '')
    if (candidate && !/^[\d\s]+$/.test(candidate)) result.clientName = candidate
  }

  // Date de validité
  const validMatch = raw.match(/(?:valable|validit[ée]|valide)\s*(?:jusqu['’]au|jusqu['’]à|:)?\s*(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/i)
  if (validMatch) {
    const [, d, m, y] = validMatch
    const year = y.length === 2 ? `20${y}` : y
    result.validUntil = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // Objet du devis
  const titleMatch = raw.match(/(?:objet|intitul[ée]|prestation|projet)\s*[:\-]\s*([^\n]{3,90})/i)
  if (titleMatch) result.title = titleMatch[1].trim()

  // Lignes de prestation et total
  for (const line of lines) {
    if (TOTAL_LINE.test(line)) {
      const values = amountsIn(line)
      if (values.length > 0) {
        const candidate = Math.max(...values)
        if (result.total === null || candidate > result.total) result.total = candidate
      }
      continue
    }
    if (IGNORED.test(line)) continue

    const withoutDates = line.replace(DATE_LIKE, ' ')

    let description: string
    let values: number[]

    const columns = splitColumns(withoutDates)
    if (columns) {
      // Colonnes alignées : la première porte le libellé, les suivantes les chiffres
      description = columns[0]
      values = columns.slice(1).map(parseAmount).filter((n): n is number => n !== null)
    } else {
      values = amountsIn(withoutDates)
      description = withoutDates.slice(0, withoutDates.search(/\d/)).trim().replace(/[·|;:\-\s]+$/, '')
    }

    if (values.length === 0) continue
    description = description.replace(/[·|;:\-\s]+$/, '').trim()
    if (description.length < 3) { result.leftovers.push(line); continue }

    // Trois nombres : quantité, prix unitaire, total. Deux : quantité et prix.
    // Un seul : c'est le prix, pour une unité.
    let quantity = 1
    let unitPrice = values[values.length - 1]

    if (values.length >= 3) {
      quantity = values[0]
      unitPrice = values[1]
    } else if (values.length === 2) {
      const [first, second] = values
      if (Number.isInteger(first) && first > 0 && first <= 999 && second >= first) {
        quantity = first
        unitPrice = second
      } else {
        unitPrice = second
      }
    }

    if (unitPrice <= 0) { result.leftovers.push(line); continue }
    result.items.push({ description, quantity: quantity || 1, unit_price: unitPrice })
  }

  // Une seule ligne dont le montant égale le total : c'est le total, pas une prestation
  if (result.items.length === 0 && result.total !== null) {
    result.items.push({ description: result.title || 'Prestation', quantity: 1, unit_price: result.total })
  }

  if (!result.title && result.items.length > 0) result.title = result.items[0].description

  return result
}

/** Analyse un tableau collé ou un fichier séparé par des virgules, points-virgules ou tabulations. */
export function parseQuoteTable(raw: string): ParsedQuote {
  const rows = raw.split(/\r?\n/).map(r => r.trim()).filter(Boolean)
  const separator = rows[0]?.includes('\t') ? '\t' : rows[0]?.includes(';') ? ';' : ','

  const items: ParsedItem[] = []
  const leftovers: string[] = []

  for (const row of rows) {
    const cells = row.split(separator).map(c => c.trim().replace(/^"|"$/g, ''))
    if (cells.length < 2) { leftovers.push(row); continue }
    if (/^(description|d[ée]signation|prestation|libell[ée])/i.test(cells[0])) continue

    const description = cells[0]
    const numbers = cells.slice(1).map(parseAmount).filter((n): n is number => n !== null)
    if (!description || numbers.length === 0) { leftovers.push(row); continue }

    const quantity = numbers.length >= 2 ? numbers[0] : 1
    const unitPrice = numbers.length >= 2 ? numbers[1] : numbers[0]
    if (unitPrice > 0) items.push({ description, quantity: quantity || 1, unit_price: unitPrice })
  }

  return {
    number: null, title: items[0]?.description ?? null, clientName: null, clientEmail: null,
    validUntil: null, items,
    total: items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0) || null,
    leftovers,
  }
}

/** Extrait le texte d'un PDF. La bibliothèque n'est chargée qu'à ce moment. */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

  const buffer = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buffer }).promise
  const pages: string[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()

    // On regroupe par ligne : le PDF ne connaît que des positions
    const byLine = new Map<number, { x: number; text: string }[]>()
    for (const item of content.items as { str: string; transform: number[] }[]) {
      if (!item.str.trim()) continue
      const y = Math.round(item.transform[5])
      const bucket = [...byLine.keys()].find(k => Math.abs(k - y) <= 3) ?? y
      if (!byLine.has(bucket)) byLine.set(bucket, [])
      byLine.get(bucket)!.push({ x: item.transform[4], text: item.str })
    }

    const lines = [...byLine.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, parts]) => parts.sort((a, b) => a.x - b.x).map(p => p.text).join(' ').replace(/\s+/g, ' ').trim())

    pages.push(lines.join('\n'))
  }

  return pages.join('\n')
}

/** Point d'entrée : reconnaît le type de fichier et applique la bonne lecture. */
export async function parseQuoteFile(file: File): Promise<ParsedQuote> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return parseQuoteText(await extractPdfText(file))
  const text = await file.text()
  if (name.endsWith('.csv') || name.endsWith('.tsv')) return parseQuoteTable(text)
  return parseQuoteText(text)
}

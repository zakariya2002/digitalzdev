import { readFileSync, mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { execSync } from 'child_process'

const dir = mkdtempSync(join(tmpdir(), 'qi-'))
let src = readFileSync('src/lib/quoteImport.ts', 'utf8')
// La lecture PDF dépend du navigateur : on n'exerce ici que l'analyse de texte
src = src.split('/** Extrait le texte')[0]
writeFileSync(join(dir, 'q.ts'), src)
execSync(`npx tsc ${join(dir,'q.ts')} --module esnext --target es2020 --moduleResolution bundler --outDir ${dir}`, { stdio: 'pipe' })
const { parseQuoteText, parseQuoteTable, parseAmount } = await import(join(dir, 'q.js'))

let ok = 0, ko = 0
const check = (n, c, d = '') => { console.log(`  ${c ? '✓' : '✗'} ${n}${!c && d ? ' — ' + d : ''}`); c ? ok++ : ko++ }

console.log('Lecture des montants')
check('format français « 1 234,56 »', parseAmount('1 234,56') === 1234.56, String(parseAmount('1 234,56')))
check('format anglais « 1,234.56 »', parseAmount('1,234.56') === 1234.56, String(parseAmount('1,234.56')))
check('milliers à points « 1.500 »', parseAmount('1.500') === 1500, String(parseAmount('1.500')))
check('avec symbole « 1 500,00 € »', parseAmount('1 500,00 €') === 1500, String(parseAmount('1 500,00 €')))

console.log('\nDevis français classique')
const devis = `
DEVIS N° DEVIS-2026-014
Date : 12/03/2026
Client : Boulangerie Martin
contact@boulangerie-martin.fr
Objet : Refonte du site vitrine

Désignation                          Qté   PU HT      Total HT
Création du site vitrine 5 pages      1    1 200,00   1 200,00
Intégration des contenus              1      300,00     300,00
Formation à l'administration          2      150,00     300,00

Total HT                                              1 800,00
TVA non applicable, article 293 B du CGI
Valable jusqu'au 12/04/2026
`
const r = parseQuoteText(devis)
check('numéro du devis reconnu', r.number === 'DEVIS-2026-014', String(r.number))
check('client reconnu', r.clientName === 'Boulangerie Martin', String(r.clientName))
check('adresse électronique reconnue', r.clientEmail === 'contact@boulangerie-martin.fr', String(r.clientEmail))
check('objet reconnu', r.title === 'Refonte du site vitrine', String(r.title))
check('validité reconnue', r.validUntil === '2026-04-12', String(r.validUntil))
check('trois lignes de prestation', r.items.length === 3, JSON.stringify(r.items))
check('quantité et prix de la ligne formation', r.items[2]?.quantity === 2 && r.items[2]?.unit_price === 150, JSON.stringify(r.items[2]))
check('total reconnu', r.total === 1800, String(r.total))
const sum = r.items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
check('la somme des lignes égale le total', Math.abs(sum - 1800) < 0.01, String(sum))
check('les mentions légales ne deviennent pas des lignes', !r.items.some(i => /TVA|article/i.test(i.description)))

console.log('\nDevis minimal, une seule prestation')
const simple = parseQuoteText('Création logo\nTotal : 450 €')
check('la prestation est retenue', simple.items.length >= 1, JSON.stringify(simple.items))
check('le montant est repris', simple.total === 450, String(simple.total))

console.log('\nTableur exporté')
const csv = `Description;Quantité;Prix unitaire
Maquettes;3;250,00
Développement;1;1800,00
Hébergement annuel;1;120,00`
const t = parseQuoteTable(csv)
check('l\'en-tête est ignoré', t.items.length === 3, JSON.stringify(t.items))
check('quantités lues', t.items[0].quantity === 3 && t.items[0].unit_price === 250, JSON.stringify(t.items[0]))
check('total calculé', t.total === 3 * 250 + 1800 + 120, String(t.total))

console.log('\nRésistance')
const vide = parseQuoteText('')
check('un texte vide ne casse pas', vide.items.length === 0 && vide.total === null)
const bruit = parseQuoteText('SIRET 994 397 735 00014\nIBAN FR76 3000 4000 0100 0000 0000 123\nPage 1 sur 2')
check('les identifiants ne deviennent pas des prestations', bruit.items.length === 0, JSON.stringify(bruit.items))

console.log(`\n${'='.repeat(48)}\n  ${ok}/${ok+ko} contrôles d'analyse réussis\n${'='.repeat(48)}`)
process.exit(ko ? 1 : 0)

/**
 * Avis Google de la fiche Digitalz Dev.
 *
 * À recopier tels qu'ils apparaissent sur Google : auteur, note, texte et
 * date. Ne jamais rédiger un avis à la place d'un client. Tant que la liste
 * est vide, la section ne s'affiche pas sur le site en ligne.
 */

export interface AvisGoogle {
  auteur: string
  /** Note de 1 à 5, comme sur Google. */
  note: number
  texte: string
  /** Date affichée, par exemple « septembre 2026 ». */
  date: string
}

export const avisGoogle: AvisGoogle[] = []

/** Note moyenne et nombre d'avis de la fiche, et lien vers celle-ci. */
export const ficheGoogle: {
  note: number | null
  total: number | null
  lien: string | null
} = {
  note: null,
  total: null,
  lien: null,
}

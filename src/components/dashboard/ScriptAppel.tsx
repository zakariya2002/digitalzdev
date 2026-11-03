import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * Script d'appel aux cabinets d'avocats, complété avec la fiche du prospect
 * (nom, domaine, ville, défaut relevé sur son site). Sans prospect, les
 * passages à compléter restent entre crochets.
 *
 * Le texte est un modèle unique, enregistré dans la table script_appel :
 * le modifier ici le modifie pour toutes les fiches. Les variables entre
 * accolades ({maitre}, {google}…) sont remplacées pour chaque prospect.
 */

export interface ProspectScript {
  avocats: string | null
  specialites: string | null
  ville: string | null
  site: string | null
  site_pas_a_jour: boolean
  annee_site: number | null
  a_corriger_seo: string | null
  position_google?: number | null
  recherche_google?: string | null
  position_verifiee_le?: string | null
}

export interface BlocScript {
  titre: string
  /** Une réplique par paragraphe (séparés par une ligne vide). */
  texte: string
  conseil?: string
  /** Rangé sous « Voir les objections ». */
  objection?: boolean
}

export const VARIABLES: [string, string][] = [
  ['{maitre}', 'Nom de famille de l’avocat (« Lanquette »)'],
  ['{domaine}', 'Premier domaine d’intervention, en minuscules'],
  ['{ville}', 'Ville du cabinet'],
  ['{recherche}', 'Recherche Google testée (« avocat Villemomble »)'],
  ['{expertise}', '« Votre expertise en … est solide »'],
  ['{exemple}', '« Par exemple, … » avec le premier défaut relevé sur son site (vide s’il n’y en a pas)'],
  ['{google}', 'La phrase sur sa position Google, adaptée à sa place réelle'],
  ['{urgence}', 'La phrase sur l’urgence (retirée s’il est déjà dans le top 3)'],
  ['{note_position}', 'Le conseil sur la position (vérifiée ou à vérifier)'],
]

export const SCRIPT_ORIGINE: BlocScript[] = [
  {
    titre: 'Accroche',
    texte:
      'Bonjour, je suis bien avec Maître {maitre} ?\n\nBonjour Maître, Zakariya Nebbache, de Digital Z Dev. Je préfère être direct avec vous : il s’agit d’un appel commercial. Je ne sais pas si vous allez avoir envie de me raccrocher au nez, mais si vous m’accordez juste 30 secondes, je vous explique exactement la raison de mon appel aujourd’hui.',
  },
  {
    titre: 'Pourquoi lui',
    texte:
      'Merci. Je dirige une agence web, et on travaille en ce moment sur la présence en ligne de cabinets d’avocats. J’ai regardé votre site avant de vous appeler. {expertise}, mais le site ne la met pas autant en valeur qu’il le pourrait. {exemple} {google} {urgence}',
    conseil: '{note_position}',
  },
  {
    titre: 'Ce que tu proposes',
    texte:
      'D’accord. Ce qu’on fait est simple : on refait votre site pour qu’il inspire confiance dès la première visite, qu’il présente clairement vos domaines d’intervention et qu’il permette de prendre rendez-vous en ligne. On travaille le référencement pour que vous sortiez sur les recherches locales liées à vos domaines, et si vous voulez aller plus vite, on gère vos campagnes Google Ads. Le tout dans le respect des règles de communication de la profession.',
  },
  {
    titre: 'Ce que tu as déjà préparé',
    texte:
      'Et pour ne pas vous faire perdre votre temps inutilement, j’ai pris de mon temps afin de vous préparer une nouvelle page d’accueil pour votre cabinet. J’ai aussi préparé une projection chiffrée du retour sur investissement potentiel pour votre activité et de ce que ça peut représenter en nouveaux dossiers.',
  },
  {
    titre: 'Prise de rendez-vous',
    texte:
      'Mon objectif n’est pas de vous retenir plus longtemps aujourd’hui. Est-ce qu’on peut se fixer 15 minutes la semaine prochaine, mardi ou jeudi, pour que je vous montre ce qu’on a préparé ?',
  },
  {
    titre: 'La secrétaire décroche',
    texte:
      'Bonjour, Zakariya Nebbache, je souhaiterais parler à Maître {maitre}, c’est au sujet de son site internet. Il est disponible ?',
    conseil: 'Ton calme et assuré, sans te justifier.',
  },
  {
    titre: '« Je n’ai pas le temps. »',
    objection: true,
    texte:
      'Je comprends, c’est pour ça que je vous appelle pour 15 minutes, pas maintenant. Mardi ou jeudi, qu’est-ce qui vous arrange le mieux ?',
  },
  {
    titre: '« Envoyez-moi un mail. »',
    objection: true,
    texte:
      'Avec plaisir. Mais la maquette est faite pour votre cabinet, et elle se comprend beaucoup mieux en 10 minutes avec moi que dans un mail. On cale un créneau court, et je vous envoie le lien juste après ?',
  },
  {
    titre: '« On a déjà un prestataire. »',
    objection: true,
    texte:
      'Très bien, et ça ne m’empêche pas de vous montrer ce que j’ai préparé. Au pire, vous aurez un deuxième regard gratuit sur votre site. Ça vous dérange de jeter un œil ?',
  },
  {
    titre: '« On a assez de clients avec le bouche-à-oreille. »',
    objection: true,
    texte:
      'C’est une excellente nouvelle. La question n’est pas d’avoir plus de clients, c’est d’avoir les dossiers que vous voulez vraiment traiter. Un bon site vous permet de choisir vos dossiers au lieu de les subir. Et les gens qui vous sont recommandés vont quand même voir votre site avant d’appeler.',
    conseil: 'C’est l’objection que tu entendras le plus.',
  },
  {
    titre: '« La publicité, ce n’est pas pour notre profession. »',
    objection: true,
    texte:
      'Je comprends, c’est une question qu’on me pose souvent. Depuis 2014, les avocats ont le droit de communiquer et de faire de la publicité, dans le cadre du règlement intérieur national. On construit justement votre site et vos annonces en respectant ces règles : aucune mention comparative ou trompeuse, et le titre de spécialiste seulement si vous avez le certificat du CNB. Je vous montre ce que ça donne en 15 minutes ?',
  },
  {
    titre: '« Combien ça coûte ? »',
    objection: true,
    texte:
      'Ça dépend de ce dont vous avez besoin, et je préfère ne pas vous donner un chiffre au hasard. C’est justement ce qu’on verra pendant les 15 minutes, avec l’estimation de ce que ça peut vous rapporter en face.',
  },
]

// Les manques relevés sur le site, dits comme on les dit au téléphone.
const A_DIRE: Record<string, (ville: string) => string> = {
  "page d'accueil interdite à Google (noindex)": () =>
    "votre site est réglé pour ne pas apparaître sur Google : il porte une consigne qui demande à Google de ne pas l'afficher, sans doute oubliée à la mise en ligne",
  'pas adapté au mobile': () =>
    "votre site ne s'affiche pas correctement sur un téléphone, alors que la plupart des gens cherchent un avocat depuis leur mobile",
  "la ville n'apparaît ni dans le titre ni dans la description": v =>
    `le nom de ${v || 'votre ville'} n'apparaît pas là où Google le lit, donc vous ressortez mal quand quelqu'un cherche un avocat ${v ? `à ${v}` : 'près de chez lui'}`,
  'site non sécurisé (pas de https)': () =>
    "votre site s'affiche comme « non sécurisé » dans le navigateur, ce qui fait fuir une partie des visiteurs",
  'pas de description pour Google': () =>
    "Google n'a aucune description de votre cabinet à afficher sous votre nom dans les résultats",
  'titre de page absent ou mal calibré': () => 'le titre que Google affiche pour votre site est mal renseigné',
  'pas de données structurées (fiche cabinet)': () =>
    'Google ne trouve pas sur votre site les informations de votre cabinet : adresse, domaines, horaires',
  'moins de 10 pages indexables': () =>
    "le site a très peu de pages, donc peu de chances de sortir sur chacun de vos domaines d'intervention",
  'pas de titre principal (h1)': () => "votre page d'accueil n'a pas de titre principal que Google puisse lire",
  'pas de plan du site pour Google': () => "il n'y a pas de plan du site pour aider Google à parcourir vos pages",
}

function enClair(s: string) {
  return s.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase())
}

function nomMaitre(avocats: string | null) {
  const premier = avocats?.split(',')[0]?.trim()
  if (!premier) return '[Nom]'
  // Le registre écrit le nom de famille en capitales : « Thierry DAVID ».
  const nom = premier.split(' ').filter(m => m.length > 1 && m === m.toUpperCase()).join(' ')
  return enClair(nom || premier.split(' ').slice(-1)[0])
}

/** Valeur de chaque variable pour ce prospect. */
function valeurs(prospect: ProspectScript | null): Record<string, string> {
  const domaine = prospect?.specialites?.split(' ; ')[0]?.toLowerCase() || (prospect ? '' : '[domaine]')
  const ville = prospect?.ville ? enClair(prospect.ville.replace(/\s+cedex.*$/i, '').trim()) : prospect ? '' : '[ville]'
  const recherche = prospect?.recherche_google || ['avocat', domaine, ville].filter(Boolean).join(' ')
  const pos = prospect?.position_google
  const verifiee = Boolean(prospect?.position_verifiee_le)
  const google = !verifiee
    ? `Et quand je tape « ${recherche} » sur Google, vous n'apparaissez pas dans les premiers résultats.`
    : !pos
      ? `Et quand je tape « ${recherche} » sur Google, vous n'apparaissez même pas dans les 20 premiers résultats.`
      : pos > 10
        ? `Et quand je tape « ${recherche} » sur Google, vous sortez en ${pos}e position, en deuxième page. Presque personne ne va jusque-là.`
        : pos > 3
          ? `Et quand je tape « ${recherche} » sur Google, vous sortez en ${pos}e position, derrière ${pos - 1} autres résultats.`
          : `Quand je tape « ${recherche} » sur Google, vous sortez en ${pos}e position, c'est une vraie base. Mais une fois sur votre site, il faut que le visiteur ait envie d'appeler.`

  const defauts = (prospect?.a_corriger_seo?.split(' ; ') ?? []).map(m => A_DIRE[m]?.(ville)).filter(Boolean) as string[]
  if (prospect?.site_pas_a_jour && prospect.annee_site) {
    defauts.unshift(`votre site n'a pas été mis à jour depuis ${prospect.annee_site}`)
  }

  return {
    maitre: prospect ? nomMaitre(prospect.avocats) : '[Nom]',
    domaine,
    ville,
    recherche,
    expertise: domaine ? `Votre expertise en ${domaine} est solide` : 'Votre expertise est solide',
    exemple: defauts[0] ? `Par exemple, ${defauts[0]}.` : '',
    google,
    urgence:
      verifiee && pos && pos <= 3
        ? ''
        : "Or quelqu'un qui a un problème juridique cherche souvent dans l'urgence, et il appelle l'un des premiers cabinets qu'il trouve.",
    note_position: prospect
      ? verifiee
        ? 'Position relevée sur Google France. Les autres points relevés sur son site sont dans la fiche.'
        : 'Position pas encore vérifiée : fais la recherche sur Google avant de le dire.'
      : 'Remplace par le point précis que tu as noté sur sa fiche.',
  }
}

function remplir(modele: string, v: Record<string, string>) {
  return modele
    .replace(/\{(\w+)\}/g, (tout, cle) => (cle in v ? v[cle] : tout))
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

// Le modèle est chargé une fois et partagé par tous les scripts affichés.
let cache: BlocScript[] | null = null
const abonnes = new Set<(b: BlocScript[]) => void>()
function publier(b: BlocScript[]) {
  cache = b
  abonnes.forEach(f => f(b))
}

function useModele() {
  const [blocs, setBlocs] = useState<BlocScript[]>(cache ?? SCRIPT_ORIGINE)
  useEffect(() => {
    abonnes.add(setBlocs)
    if (!cache) {
      supabase
        .from('script_appel')
        .select('blocs')
        .eq('id', 'principal')
        .maybeSingle()
        .then(({ data }) => {
          if (data?.blocs) publier(data.blocs as unknown as BlocScript[])
        })
    }
    return () => {
      abonnes.delete(setBlocs)
    }
  }, [])
  return blocs
}

function Moi({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-gray-800/60 px-3 py-2 text-gray-200">
      <span className="font-semibold text-blue-400">Moi : </span>
      {children}
    </p>
  )
}

function Conseil({ children }: { children: React.ReactNode }) {
  return <p className="text-xs italic text-gray-500">{children}</p>
}

function Bloc({ bloc, v }: { bloc: BlocScript; v: Record<string, string> }) {
  const repliques = bloc.texte.split(/\n\s*\n/).map(t => remplir(t, v)).filter(Boolean)
  const conseil = bloc.conseil ? remplir(bloc.conseil, v) : ''
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-white">{bloc.titre}</div>
      {repliques.map((r, i) => (
        <Moi key={i}>{r}</Moi>
      ))}
      {conseil && <Conseil>{conseil}</Conseil>}
    </div>
  )
}

const champ = 'w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none'

function Editeur({ initial, fermer }: { initial: BlocScript[]; fermer: () => void }) {
  const [blocs, setBlocs] = useState<BlocScript[]>(() => initial.map(b => ({ ...b })))
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  const maj = (i: number, p: Partial<BlocScript>) => setBlocs(bs => bs.map((b, j) => (j === i ? { ...b, ...p } : b)))
  const deplacer = (i: number, d: number) =>
    setBlocs(bs => {
      const j = i + d
      if (j < 0 || j >= bs.length) return bs
      const n = [...bs]
      ;[n[i], n[j]] = [n[j], n[i]]
      return n
    })

  async function enregistrer() {
    setEnCours(true)
    setErreur('')
    const propres = blocs.filter(b => b.titre.trim() || b.texte.trim())
    const { error } = await supabase
      .from('script_appel')
      .upsert({ id: 'principal', blocs: propres as never, modifie_le: new Date().toISOString() })
    setEnCours(false)
    if (error) return setErreur(error.message)
    publier(propres)
    fermer()
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg bg-gray-800/60 p-3 text-xs text-gray-400">
        <div className="mb-1 font-semibold text-gray-300">Variables remplacées pour chaque avocat</div>
        {VARIABLES.map(([cle, sens]) => (
          <div key={cle}>
            <code className="text-blue-300">{cle}</code> {sens}
          </div>
        ))}
        <div className="mt-1">Une ligne vide sépare deux répliques « Moi ».</div>
      </div>

      {blocs.map((b, i) => (
        <div key={i} className="space-y-2 rounded-lg bg-gray-800/40 p-3">
          <div className="flex items-center gap-2">
            <input className={champ} value={b.titre} placeholder="Titre du passage" onChange={e => maj(i, { titre: e.target.value })} />
            <button onClick={() => deplacer(i, -1)} className="rounded px-2 py-1 text-gray-400 hover:bg-gray-700" title="Monter">↑</button>
            <button onClick={() => deplacer(i, 1)} className="rounded px-2 py-1 text-gray-400 hover:bg-gray-700" title="Descendre">↓</button>
            <button
              onClick={() => setBlocs(bs => bs.filter((_, j) => j !== i))}
              className="rounded px-2 py-1 text-red-400 hover:bg-gray-700"
              title="Supprimer ce passage"
            >
              ✕
            </button>
          </div>
          <textarea
            className={`${champ} min-h-[110px]`}
            value={b.texte}
            rows={Math.max(4, Math.ceil(b.texte.length / 90) + b.texte.split('\n').length)}
            onChange={e => maj(i, { texte: e.target.value })}
          />
          <input
            className={champ}
            value={b.conseil ?? ''}
            placeholder="Conseil affiché en petit sous le passage (facultatif)"
            onChange={e => maj(i, { conseil: e.target.value })}
          />
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input type="checkbox" checked={Boolean(b.objection)} onChange={e => maj(i, { objection: e.target.checked })} />
            Objection (rangée sous « Voir les objections »)
          </label>
        </div>
      ))}

      <button
        onClick={() => setBlocs(bs => [...bs, { titre: '', texte: '' }])}
        className="text-sm font-semibold text-blue-400 hover:text-blue-300"
      >
        Ajouter un passage
      </button>

      {erreur && <p className="text-sm text-red-400">{erreur}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={enregistrer}
          disabled={enCours}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {enCours ? 'Enregistrement…' : 'Enregistrer pour toutes les fiches'}
        </button>
        <button onClick={fermer} className="rounded-lg bg-gray-800 px-4 py-2 text-gray-300 hover:bg-gray-700">
          Annuler
        </button>
        <button
          onClick={() => confirm('Remettre le script d’origine dans l’éditeur ?') && setBlocs(SCRIPT_ORIGINE.map(b => ({ ...b })))}
          className="ml-auto rounded-lg px-4 py-2 text-gray-500 hover:text-gray-300"
        >
          Revenir au script d’origine
        </button>
      </div>
    </div>
  )
}

export default function ScriptAppel({ prospect }: { prospect: ProspectScript | null }) {
  const blocs = useModele()
  const [objections, setObjections] = useState(false)
  const [edition, setEdition] = useState(false)

  if (edition) return <Editeur initial={blocs} fermer={() => setEdition(false)} />

  const v = valeurs(prospect)
  const principaux = blocs.filter(b => !b.objection)
  const objs = blocs.filter(b => b.objection)

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <div className="flex justify-end">
        <button onClick={() => setEdition(true)} className="text-xs font-semibold text-gray-400 hover:text-white">
          Modifier le script
        </button>
      </div>

      {principaux.map((b, i) => (
        <Bloc key={i} bloc={b} v={v} />
      ))}

      {objs.length > 0 && (
        <button
          onClick={() => setObjections(o => !o)}
          className="text-sm font-semibold text-blue-400 hover:text-blue-300"
        >
          {objections ? 'Masquer les objections' : 'Voir les objections'}
        </button>
      )}

      {objections && (
        <div className="space-y-4">
          {objs.map((b, i) => (
            <Bloc key={i} bloc={b} v={v} />
          ))}
        </div>
      )}
    </div>
  )
}

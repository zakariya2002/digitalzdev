import { useState } from 'react'

/**
 * Script d'appel aux cabinets d'avocats, complété avec la fiche du prospect
 * (nom, domaine, ville, défaut relevé sur son site). Sans prospect, les
 * passages à compléter restent entre crochets.
 */

export interface ProspectScript {
  avocats: string | null
  specialites: string | null
  ville: string | null
  site: string | null
  site_pas_a_jour: boolean
  annee_site: number | null
  a_corriger_seo: string | null
}

// Les manques relevés sur le site, dits comme on les dit au téléphone.
const A_DIRE: Record<string, (ville: string) => string> = {
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

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-white">{titre}</div>
      {children}
    </div>
  )
}

export default function ScriptAppel({ prospect }: { prospect: ProspectScript | null }) {
  const [objections, setObjections] = useState(false)

  const nom = prospect ? nomMaitre(prospect.avocats) : '[Nom]'
  const domaine = prospect?.specialites?.split(' ; ')[0]?.toLowerCase() || (prospect ? '' : '[domaine]')
  const ville = prospect?.ville ? enClair(prospect.ville.replace(/\s+cedex.*$/i, '').trim()) : prospect ? '' : '[ville]'
  const recherche = ['avocat', domaine, ville].filter(Boolean).join(' ')

  const defauts = (prospect?.a_corriger_seo?.split(' ; ') ?? []).map(m => A_DIRE[m]?.(ville)).filter(Boolean) as string[]
  if (prospect?.site_pas_a_jour && prospect.annee_site) {
    defauts.unshift(`votre site n'a pas été mis à jour depuis ${prospect.annee_site}`)
  }
  const defaut = defauts[0]

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <Bloc titre="Accroche">
        <Moi>Bonjour, je suis bien avec Maître {nom} ?</Moi>
        <Moi>
          Bonjour Maître, Zakariya Nebbache, de Digital Z Dev. Je préfère être direct avec vous : il s'agit d'un appel
          commercial. Je ne sais pas si vous allez avoir envie de me raccrocher au nez, mais si vous m'accordez juste 30
          secondes, je vous explique exactement la raison de mon appel aujourd'hui.
        </Moi>
      </Bloc>

      <Bloc titre="Pourquoi lui">
        <Moi>
          Merci. Je dirige une agence web, et on travaille en ce moment sur la présence en ligne de cabinets d'avocats.
          J'ai regardé votre site avant de vous appeler.{' '}
          {domaine ? `Votre expertise en ${domaine} est solide` : 'Votre expertise est solide'}, mais le site ne la met pas
          autant en valeur qu'il le pourrait.{' '}
          {defaut
            ? `Par exemple, ${defaut}. `
            : ''}
          Et quand je tape « {recherche} » sur Google, vous n'apparaissez pas dans les premiers résultats. Or quelqu'un
          qui a un problème juridique cherche souvent dans l'urgence, et il appelle l'un des premiers cabinets qu'il
          trouve.
        </Moi>
        <Conseil>
          {prospect
            ? 'Vérifie la recherche sur Google avant de le dire. Les autres points relevés sur son site sont dans la fiche.'
            : 'Remplace par le point précis que tu as noté sur sa fiche.'}
        </Conseil>
      </Bloc>

      <Bloc titre="Ce que tu proposes">
        <Moi>
          D'accord. Ce qu'on fait est simple : on refait votre site pour qu'il inspire confiance dès la première visite,
          qu'il présente clairement vos domaines d'intervention et qu'il permette de prendre rendez-vous en ligne. On
          travaille le référencement pour que vous sortiez sur les recherches locales liées à vos domaines, et si vous
          voulez aller plus vite, on gère vos campagnes Google Ads. Le tout dans le respect des règles de communication
          de la profession.
        </Moi>
      </Bloc>

      <Bloc titre="Ce que tu as déjà préparé">
        <Moi>
          Et pour ne pas vous faire perdre votre temps inutilement, j'ai pris de mon temps afin de vous préparer une
          nouvelle page d'accueil pour votre cabinet. J'ai aussi préparé une projection chiffrée du retour sur
          investissement potentiel pour votre activité et de ce que ça peut représenter en nouveaux dossiers.
        </Moi>
      </Bloc>

      <Bloc titre="Prise de rendez-vous">
        <Moi>
          Mon objectif n'est pas de vous retenir plus longtemps aujourd'hui. Est-ce qu'on peut se fixer 15 minutes la
          semaine prochaine, mardi ou jeudi, pour que je vous montre ce qu'on a préparé ?
        </Moi>
      </Bloc>

      <Bloc titre="La secrétaire décroche">
        <Moi>
          Bonjour, Zakariya Nebbache, je souhaiterais parler à Maître {nom}, c'est au sujet de son site internet. Il est
          disponible ?
        </Moi>
        <Conseil>Ton calme et assuré, sans te justifier.</Conseil>
      </Bloc>

      <button
        onClick={() => setObjections(o => !o)}
        className="text-sm font-semibold text-blue-400 hover:text-blue-300"
      >
        {objections ? 'Masquer les objections' : 'Voir les objections'}
      </button>

      {objections && (
        <div className="space-y-4">
          <Bloc titre="« Je n'ai pas le temps. »">
            <Moi>
              Je comprends, c'est pour ça que je vous appelle pour 15 minutes, pas maintenant. Mardi ou jeudi, qu'est-ce
              qui vous arrange le mieux ?
            </Moi>
          </Bloc>
          <Bloc titre="« Envoyez-moi un mail. »">
            <Moi>
              Avec plaisir. Mais la maquette est faite pour votre cabinet, et elle se comprend beaucoup mieux en 10
              minutes avec moi que dans un mail. On cale un créneau court, et je vous envoie le lien juste après ?
            </Moi>
          </Bloc>
          <Bloc titre="« On a déjà un prestataire. »">
            <Moi>
              Très bien, et ça ne m'empêche pas de vous montrer ce que j'ai préparé. Au pire, vous aurez un deuxième
              regard gratuit sur votre site. Ça vous dérange de jeter un œil ?
            </Moi>
          </Bloc>
          <Bloc titre="« On a assez de clients avec le bouche-à-oreille. »">
            <Moi>
              C'est une excellente nouvelle. La question n'est pas d'avoir plus de clients, c'est d'avoir les dossiers
              que vous voulez vraiment traiter. Un bon site vous permet de choisir vos dossiers au lieu de les subir. Et
              les gens qui vous sont recommandés vont quand même voir votre site avant d'appeler.
            </Moi>
            <Conseil>C'est l'objection que tu entendras le plus.</Conseil>
          </Bloc>
          <Bloc titre="« La publicité, ce n'est pas pour notre profession. »">
            <Moi>
              Je comprends, c'est une question qu'on me pose souvent. Depuis 2014, les avocats ont le droit de
              communiquer et de faire de la publicité, dans le cadre du règlement intérieur national. On construit
              justement votre site et vos annonces en respectant ces règles : aucune mention comparative ou trompeuse,
              et le titre de spécialiste seulement si vous avez le certificat du CNB. Je vous montre ce que ça donne en
              15 minutes ?
            </Moi>
          </Bloc>
          <Bloc titre="« Combien ça coûte ? »">
            <Moi>
              Ça dépend de ce dont vous avez besoin, et je préfère ne pas vous donner un chiffre au hasard. C'est
              justement ce qu'on verra pendant les 15 minutes, avec l'estimation de ce que ça peut vous rapporter en
              face.
            </Moi>
          </Bloc>
        </div>
      )}
    </div>
  )
}

export interface ProjectMockup {
  title: string
  gradient: string
  content: string
  image: string
}

export interface ProjectMetric {
  value: string
  label: string
}

export interface Project {
  id: string
  title: string
  subtitle: string
  /** Année de mise en ligne, affichée dans l'index des réalisations */
  year: string
  /** Étiquettes courtes affichées sous le titre dans l'index */
  tags: string[]
  /** Technologies principales, affichées sur la page projet */
  stack: string[]
  description: string
  url: string
  /** Renseigné quand le site n'est pas librement accessible (accès réservé) */
  access?: string
  route: string
  color: string
  gradient: string
  heroImage: string
  brief: string
  solution: string
  features: string[]
  metrics: ProjectMetric[]
  mockups: ProjectMockup[]
}

export const projects: Project[] = [
  {
    id: 'nouvelle-garde',
    title: 'lanouvellegarde.com',
    subtitle: 'Groupe de brasseries',
    year: '2026',
    tags: ['Site vitrine', 'Bilingue', 'Restauration'],
    stack: ['WordPress', 'Elementor', 'PHP', 'SEO technique'],
    description:
      "Vitrine bilingue de la Nouvelle Garde, douze brasseries et un bar entre Paris, la province et Londres. Une page d'accueil en grille d'objets, une adresse par page, et sa propre couleur à chacune.",
    url: 'https://lanouvellegarde.com/fr/',
    route: '/la-nouvelle-garde',
    color: '#C8961F',
    gradient: 'from-[#FBF8F1] via-[#C8961F] to-[#3F5D33]',
    heroImage: '/screenshots/nouvelle-garde-hero.webp',
    brief:
      "La Nouvelle Garde tient douze brasseries et un bar, de la Gare du Nord à Sloane Square, en passant par Lille, Marseille, Lyon, Bordeaux et Neuilly. Un groupe de cette taille a un problème que n'ont pas les autres restaurants : chaque adresse a sa salle, sa carte, sa clientèle et son caractère, et pourtant elles appartiennent toutes à la même maison. Un site unique aplatit les différences, douze sites séparés dissolvent le groupe. Il fallait tenir les deux.",
    solution:
      "La page d'accueil ne liste rien : elle pose douze objets sur du blanc, une assiette, une chaise de terrasse, un moulin à poivre, un pichet en forme de coq, chacun portant le nom d'une brasserie en lettrage dessiné. On choisit une adresse comme on choisirait une table. Derrière, chaque brasserie a sa page et sa couleur, son logo, son quartier, son équipe en photo. La réservation se sépare de la privatisation au seuil de vingt-cinq couverts, là où le métier change vraiment, et les capacités assises et cocktail sont annoncées adresse par adresse. Le tout en français et en anglais.",
    features: [
      "Page d'accueil en grille d'objets, une par adresse",
      'Une page par brasserie, avec sa couleur et son lettrage',
      'Réservation et privatisation séparées au seuil de 25 couverts',
      'Capacités assises et cocktail, devis et brochure par adresse',
      'Site intégralement bilingue français et anglais',
      'FAQ, charte maison et lettre d’information',
    ],
    metrics: [
      { value: '12', label: 'brasseries et un bar' },
      { value: '2', label: 'pays, France et Royaume-Uni' },
      { value: 'FR / EN', label: 'entièrement bilingue' },
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#FBF8F1] to-[#F2E9D6]',
        content: 'Douze objets sur fond blanc, une par adresse',
        image: '/screenshots/nouvelle-garde-hero.webp',
      },
      {
        title: 'Une brasserie',
        gradient: 'from-[#F2E9D6] to-[#C8961F]',
        content: 'Son lettrage, son adresse, sa couleur',
        image: '/screenshots/nouvelle-garde-2.webp',
      },
      {
        title: 'Réserver ou privatiser',
        gradient: 'from-[#C8961F] to-[#6F7F4A]',
        content: "L'équipe en photo, et le choix à 25 couverts",
        image: '/screenshots/nouvelle-garde-3.webp',
      },
      {
        title: 'Groupes et privatisation',
        gradient: 'from-[#6F7F4A] to-[#3F5D33]',
        content: 'Capacités, devis et brochure par adresse',
        image: '/screenshots/nouvelle-garde-4.webp',
      },
    ],
  },
  {
    id: 'st-agni',
    title: 'st-agni.com',
    subtitle: 'Minimalisme premium',
    year: '2025',
    tags: ['E-commerce', 'Luxe', 'Headless'],
    stack: ['Shopify Plus', 'Headless CMS', 'React'],
    description:
      "Boutique en ligne luxe minimaliste pour la marque St. Agni. Focus sur l'expérience produit avec une navigation épurée et des visuels immersifs.",
    url: 'https://st-agni.com',
    route: '/st-agni',
    color: '#8A8580',
    gradient: 'from-[#E8E3DC] via-[#D8D3CC] to-[#C8C3BC]',
    heroImage: '/screenshots/st-agni-hero.webp',
    brief:
      "St. Agni recherchait un écrin digital à la hauteur de son positionnement luxe. La marque souhaitait une expérience immersive où le produit est roi, avec un minimalisme radical qui laisse respirer les visuels. L'enjeu : traduire le toucher et la qualité des matières à travers un écran.",
    solution:
      'Une approche "content-first" avec des visuels plein écran, des transitions cinématiques et une architecture headless pour des performances maximales. Chaque interaction a été pensée pour renforcer le positionnement premium.',
    features: [
      'Architecture headless CMS',
      'Transitions de page cinématiques',
      'Galerie produits plein écran',
      'Navigation gestuelle mobile',
      'Lazy loading intelligent des images',
      'Intégration Shopify Plus',
    ],
    metrics: [
      { value: '360°', label: 'vue produit' },
      { value: 'Plus', label: 'Shopify Plus' },
      { value: '100%', label: 'headless' },
    ],
    mockups: [
      {
        title: 'Homepage',
        gradient: 'from-[#F0EDE8] to-[#E0DDD8]',
        content: 'Diaporama plein écran haute couture',
        image: '/screenshots/st-agni-hero.webp',
      },
      {
        title: 'Collection',
        gradient: 'from-[#E0DDD8] to-[#D0CDC8]',
        content: 'Grille asymétrique, visuels lifestyle',
        image: '/screenshots/stagni-2.webp',
      },
      {
        title: 'Produit',
        gradient: 'from-[#D0CDC8] to-[#C0BDB8]',
        content: 'Vue 360° + zoom matière',
        image: '/screenshots/stagni-3.webp',
      },
      {
        title: 'Panier',
        gradient: 'from-[#C0BDB8] to-[#B0ADA8]',
        content: 'Slide-over cart minimaliste',
        image: '/screenshots/stagni-4.webp',
      },
    ],
  },
  {
    id: 'soeur',
    title: 'soeur.fr',
    subtitle: 'Prêt-à-porter parisien',
    year: '2026',
    tags: ['E-commerce', 'Mode', 'Shopify'],
    stack: ['Shopify', 'Liquid', 'JavaScript'],
    description:
      "Boutique en ligne de la maison parisienne Soeur : prêt-à-porter femme et enfant, sacs, chaussures, seconde main et archives, dans un univers éditorial sobre.",
    url: 'https://www.soeur.fr',
    route: '/soeur',
    color: '#8C7A62',
    gradient: 'from-[#EDE8E0] via-[#DDD6CB] to-[#C9C0B2]',
    heroImage: '/screenshots/soeur-hero.webp',
    brief:
      "Soeur avait besoin d'une boutique à la hauteur de ses campagnes : des collections présentées comme dans un lookbook, un catalogue large (prêt-à-porter, enfant, sacs, chaussures) facile à parcourir, et des rubriques à part pour la seconde main et les archives.",
    solution:
      "Une boutique Shopify où l'image domine : visuels de campagne plein écran, grilles produits aérées sur fond neutre, navigation par familles et par catégories, et un parcours d'achat court sur mobile comme sur ordinateur.",
    features: [
      'Visuels de campagne plein écran',
      'Grilles produits épurées par catégorie',
      'Rubriques seconde main et archives',
      'Navigation par familles et sous-catégories',
      'Parcours d’achat optimisé mobile',
      'Thème Shopify sur mesure',
    ],
    metrics: [
      { value: 'Shopify', label: 'boutique sur mesure' },
      { value: '2', label: 'univers : femme et enfant' },
      { value: '100%', label: 'responsive' },
    ],
    mockups: [
      {
        title: 'Accueil',
        gradient: 'from-[#EDE8E0] to-[#DDD6CB]',
        content: 'Campagne plein écran',
        image: '/screenshots/soeur-hero.webp',
      },
      {
        title: 'Collection',
        gradient: 'from-[#DDD6CB] to-[#CFC7BA]',
        content: 'Grille produits sur fond neutre',
        image: '/screenshots/soeur-2.webp',
      },
      {
        title: 'Catalogue',
        gradient: 'from-[#CFC7BA] to-[#C1B8AA]',
        content: 'Familles et sous-catégories',
        image: '/screenshots/soeur-3.webp',
      },
      {
        title: 'Nouveautés',
        gradient: 'from-[#C1B8AA] to-[#B3A99A]',
        content: 'Parcours fluide jusqu’au panier',
        image: '/screenshots/soeur-4.webp',
      },
    ],
  },
  {
    id: 'neurocare',
    title: 'neuro-care.fr',
    subtitle: 'Santé & neurodéveloppement',
    year: '2026',
    tags: ['Plateforme', 'Annuaire vérifié', 'Communauté'],
    stack: ['Next.js', 'React', 'PostgreSQL', 'RGPD'],
    description:
      "Plateforme d'orientation pour les familles concernées par les troubles du neurodéveloppement : annuaire de professionnels vérifiés, forum d'entraide, simulateur d'aides et carte des lieux adaptés. Gratuit, sans inscription.",
    url: 'https://neuro-care.fr',
    route: '/neurocare',
    color: '#5BA89D',
    gradient: 'from-[#5BA89D] via-[#2C7A70] to-[#134B45]',
    heroImage: '/screenshots/neurocare-hero.webp',
    brief:
      "Trouver un orthophoniste, un psychomotricien ou un éducateur formé aux TND relève souvent du parcours du combattant : listes obsolètes, diplômes invérifiables, délais à rallonge. NeuroCare devait répondre à trois besoins d'un coup : trouver le bon professionnel, comprendre à quelles aides on a droit, et ne pas rester seul dans les démarches. Le tout gratuitement pour les familles, et conforme au RGPD sur des données de santé.",
    solution:
      "La plateforme s'est élargie bien au-delà de l'annuaire initial. Chaque professionnel passe désormais une vérification en quatre étapes, avec croisement du numéro RPPS / ADELI contre l'Annuaire Santé avant d'obtenir le badge « Vérifié ». Autour, nous avons ouvert un forum modéré, un simulateur d'aides financières (AEEH, PCH, CESU), une carte des lieux adaptés, un espace structures pour les cabinets et associations, un blog et des annonces. Hébergement en France, échanges chiffrés.",
    features: [
      'Vérification en 4 étapes, RPPS / ADELI contrôlés',
      'Recherche par spécialité, trouble ou ville',
      'Forum communautaire modéré, lecture libre',
      'Simulateur d’aides : AEEH, PCH, CESU',
      'Carte des lieux adaptés et annonces familles',
      'Espace structures : cabinets et associations',
      'Espace pro avec agenda et demandes de RDV',
      'Hébergé en France, RGPD, échanges chiffrés',
    ],
    metrics: [
      { value: '100%', label: 'gratuit pour les familles' },
      { value: '4', label: 'étapes de vérification' },
      { value: '30+', label: 'villes couvertes' },
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#134B45] to-[#2C7A70]',
        content: 'Recherche en trois étapes, sans inscription',
        image: '/screenshots/neurocare-hero.webp',
      },
      {
        title: 'Recherche',
        gradient: 'from-[#2C7A70] to-[#5BA89D]',
        content: 'Filtres par spécialité, trouble et ville',
        image: '/screenshots/neurocare-2.webp',
      },
      {
        title: 'Forum',
        gradient: 'from-[#5BA89D] to-[#2C7A70]',
        content: 'Conseils, témoignages, questions, ressources',
        image: '/screenshots/neurocare-3.webp',
      },
      {
        title: 'Simulateur d’aides',
        gradient: 'from-[#2C7A70] to-[#134B45]',
        content: 'AEEH, PCH et CESU en deux minutes',
        image: '/screenshots/neurocare-4.webp',
      },
    ],
  },
  {
    id: 'copaine',
    title: 'copaine.com',
    subtitle: 'Mode parisienne en précommande',
    year: '2026',
    tags: ['E-commerce', 'Shopify', 'Mode responsable'],
    stack: ['Shopify', 'Liquid', 'JavaScript', 'Klaviyo'],
    description:
      "Boutique Shopify de la maison parisienne Copain.e : des capsules en série limitée, taillées dans des stocks dormants de maisons de luxe et vendues uniquement en précommande.",
    url: 'https://copaine.com',
    route: '/copaine',
    color: '#B8463A',
    gradient: 'from-[#F4F1EC] via-[#B8463A] to-[#1A1A1A]',
    heroImage: '/screenshots/copaine-hero.webp',
    brief:
      "Copain.e fabrique à Paris, en série limitée, à partir de tissus dormants de maisons de luxe : des matières déjà tissées, en quantité finie, qui dessinent la pièce au lieu de l'inverse. Le modèle impose sa contrainte au site : rien n'est en stock, tout se vend en précommande, et la livraison arrive quatre à huit semaines après la clôture de la campagne. Il fallait donc un site capable de faire payer 390 € un corset qui n'existe pas encore, sans que l'attente passe pour un défaut.",
    solution:
      "Nous avons fait de la précommande l'argument plutôt que la réserve. Le thème Shopify est construit sur une grille éditoriale, titres en serif et photographie plein cadre, et chaque fiche produit annonce ce qu'un site classique cache : le nombre de pièces restantes, la date de livraison, le remboursement en cas de changement d'avis, avec une FAQ dédiée à la mécanique. La page d'accueil rend les visuels achetables directement, et la boutique sert cinq pays en deux langues depuis une seule administration.",
    features: [
      'Thème Shopify sur mesure, direction artistique éditoriale',
      'Précommande : pièces restantes et date de livraison annoncées',
      'FAQ dédiée et remboursement garanti avant production',
      'Images shoppables, ajout au panier depuis le visuel',
      'Boutique bilingue FR / EN, cinq pays et leurs devises',
      'Capture e-mail Klaviyo et avantages réservés aux membres',
    ],
    metrics: [
      { value: '100%', label: 'vendu en précommande' },
      { value: '5', label: 'pièces en série limitée' },
      { value: '5', label: 'pays livrés, FR et EN' },
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#F4F1EC] to-[#E2DCD3]',
        content: 'Hero éditorial, « Revenir à soi »',
        image: '/screenshots/copaine-hero.webp',
      },
      {
        title: 'Capsule',
        gradient: 'from-[#E2DCD3] to-[#CFC4B6]',
        content: 'La collection complète et ses prix',
        image: '/screenshots/copaine-2.webp',
      },
      {
        title: 'Fiche produit',
        gradient: 'from-[#CFC4B6] to-[#B8463A]',
        content: 'Précommande, pièces restantes, livraison',
        image: '/screenshots/copaine-3.webp',
      },
      {
        title: 'Images shoppables',
        gradient: 'from-[#B8463A] to-[#1A1A1A]',
        content: 'Achat depuis le visuel et réassurance',
        image: '/screenshots/copaine-4.webp',
      },
    ],
  },
  {
    id: 'drive',
    title: 'DRIVE',
    subtitle: 'Portail B2B franchisés',
    year: '2026',
    tags: ['E-commerce B2B', 'Shopify', 'Réseau'],
    stack: ['Shopify', 'Liquid', 'Thème sur mesure'],
    description:
      "Portail d'équipement réservé aux franchisés du réseau DRIVE. Un catalogue cadré par la centrale : chaque agence s'équipe au standard de la marque, en une commande.",
    url: 'https://drive-12398.myshopify.com/',
    access: 'Accès réservé aux franchisés',
    route: '/drive',
    color: '#8A93A0',
    gradient: 'from-[#101214] via-[#1C1F24] to-[#05070A]',
    heroImage: '/screenshots/drive-hero.webp',
    brief:
      "Quand une agence DRIVE ouvre, le franchisé doit équiper son point de vente à l'identique du reste du réseau : informatique, mobilier, signalétique, matériel de détailing. Jusqu'ici, chacun négociait dans son coin, avec des écarts de prix, de délais et de standard. La centrale voulait un catalogue fermé, réservé au réseau, où tout est déjà validé, chiffré et livrable.",
    solution:
      "Une boutique Shopify privée, protégée par mot de passe, pensée comme un outil interne plus que comme un site marchand. Un « kit d'ouverture » regroupe tout ce qu'il faut pour démarrer une agence en une seule commande ; le reste du catalogue est rangé par zone du point de vente : surface de vente, back office, bureaux, détailing, informatique. Direction artistique sombre et sobre, alignée sur l'identité DRIVE, avec bascule jour / nuit.",
    features: [
      'Boutique privée, accès réservé au réseau',
      "Kit d'ouverture : une agence équipée en une commande",
      'Catalogue rangé par zone du point de vente',
      'Tarifs cadrés HT validés par la centrale',
      'Livraison directe fournisseur, suivi consolidé',
      'Thème sombre avec bascule jour / nuit',
    ],
    metrics: [
      { value: '10', label: 'agences du réseau' },
      { value: '7', label: 'catégories catalogue' },
      { value: '1', label: 'commande pour ouvrir' },
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#05070A] to-[#101214]',
        content: 'Promesse réseau et double entrée catalogue',
        image: '/screenshots/drive-hero.webp',
      },
      {
        title: "Kit d'ouverture",
        gradient: 'from-[#101214] to-[#1C1F24]',
        content: "Tout l'équipement d'une nouvelle agence",
        image: '/screenshots/drive-2.webp',
      },
      {
        title: 'Catalogue informatique',
        gradient: 'from-[#1C1F24] to-[#101214]',
        content: 'Matériel validé, tarifs cadrés HT',
        image: '/screenshots/drive-3.webp',
      },
      {
        title: 'Le réseau',
        gradient: 'from-[#101214] to-[#05070A]',
        content: 'Standard de marque et implantations',
        image: '/screenshots/drive-4.webp',
      },
    ],
  },
  {
    id: 'kalira',
    title: 'kaliracare.com',
    subtitle: 'Soins capillaires premium',
    year: '2026',
    tags: ['E-commerce', 'Shopify', 'Direction artistique'],
    stack: ['Shopify', 'Liquid', 'JavaScript', 'Klaviyo'],
    description:
      "Boutique Shopify pour la marque de soins capillaires Kalira. Un rituel en trois temps (Clean, Care, Protect), servi par une direction artistique éditoriale et un tunnel d'achat taillé pour la conversion.",
    url: 'https://kaliracare.com',
    route: '/kalira',
    color: '#7A6A55',
    gradient: 'from-[#F5F0E8] via-[#D8CEC0] to-[#7A6A55]',
    heroImage: '/screenshots/kalira-hero.webp',
    brief:
      "Kalira est née de plusieurs années passées derrière un fauteuil de coiffure : des centaines de femmes, des cheveux et des attentes toutes différentes. La marque arrivait avec une gamme construite (kératine, acide hyaluronique, collagène) mais sans vitrine à sa hauteur. Il fallait un site qui rende lisible un rituel en trois étapes, qui donne envie de toucher le produit à travers l'écran, et qui transforme une visite Instagram en commande.",
    solution:
      "Nous avons bâti un thème Shopify sur mesure autour d'une grille éditoriale : hero plein écran en diptyque, numérotation romaine des trois soins (I-Clean, II-Care, III-Protect) qui structure toute la navigation, et une section « Scroll & Shop » qui rejoue les codes du feed social directement dans la page. Le tunnel est réduit au strict nécessaire, la roue de fidélisation capte l'e-mail dès la première visite et Klaviyo prend le relais.",
    features: [
      'Thème Shopify sur mesure, typographie éditoriale',
      'Rituel en 3 temps comme colonne vertébrale du site',
      'Section « Scroll & Shop » inspirée du feed social',
      'Packs et duos avec prix barrés et upsell panier',
      'Capture e-mail gamifiée et scénarios Klaviyo',
      'Paiement Shop Pay, PayPal, Klarna et CB',
    ],
    metrics: [
      { value: '3', label: 'soins, un rituel' },
      { value: '5', label: 'références en ligne' },
      { value: '100%', label: 'mobile-first' },
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#F5F0E8] to-[#D8CEC0]',
        content: 'Hero diptyque égérie / packshot',
        image: '/screenshots/kalira-hero.webp',
      },
      {
        title: 'Collection',
        gradient: 'from-[#D8CEC0] to-[#C4B8A6]',
        content: 'Toute la gamme, packs en tête',
        image: '/screenshots/kalira-2.webp',
      },
      {
        title: 'Fiche produit',
        gradient: 'from-[#C4B8A6] to-[#A89880]',
        content: 'Pack hair-care, bénéfices et ajout panier',
        image: '/screenshots/kalira-3.webp',
      },
      {
        title: 'Univers de marque',
        gradient: 'from-[#A89880] to-[#7A6A55]',
        content: 'Actifs, formulation et Scroll & Shop',
        image: '/screenshots/kalira-4.webp',
      },
    ],
  },
  {
    id: 'angele',
    title: 'angele.store',
    subtitle: 'Merch artiste Shopify',
    year: '2025',
    tags: ['E-commerce', 'Shopify', 'Musique'],
    stack: ['Shopify', 'Liquid', 'GTM', 'Meta Pixel'],
    description:
      "Boutique e-commerce Shopify pour l'artiste belge Angèle. Merchandising officiel : T-shirts, hoodies, vinyles et accessoires, dans un univers pop assumé.",
    url: 'https://angele.store',
    route: '/angele',
    color: '#7ECDB5',
    gradient: 'from-[#7ECDB5] via-[#A8E6CF] to-[#C5F0DC]',
    heroImage: '/screenshots/angele-hero.webp',
    brief:
      "L'artiste belge Angèle avait besoin d'une boutique en ligne officielle pour sa ligne de merchandising : vêtements, vinyles et accessoires. Le site devait refléter son univers pop et coloré tout en offrant une expérience d'achat fluide et rapide pour ses fans à travers l'Europe.",
    solution:
      "Nous avons développé une boutique Shopify sur mesure avec un thème personnalisé. Navigation par catégories (T-shirts, Sweatshirts, CD & Vinyles, Accessoires), fiches produit détaillées avec sélecteur de taille, galerie d'images et gestion des stocks. Le tout optimisé pour le mobile et intégré aux outils marketing (newsletter, Facebook Pixel, Google Analytics).",
    features: [
      'Thème Shopify entièrement personnalisé',
      'Catalogue multi-catégories avec carrousel',
      'Fiches produit avec sélecteur taille et galerie',
      'Panier et checkout Shopify optimisés',
      'Intégration newsletter et marketing (Pixel, GTM)',
      'Design responsive mobile-first',
    ],
    metrics: [
      { value: '4', label: 'univers produits' },
      { value: 'EU', label: 'livraison européenne' },
      { value: '100%', label: 'mobile-first' },
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#7ECDB5] to-[#A8E6CF]',
        content: 'Catalogue T-shirts avec carrousel par catégorie',
        image: '/screenshots/angele-hero.webp',
      },
      {
        title: 'Sweatshirts & Joggings',
        gradient: 'from-[#A8E6CF] to-[#7ECDB5]',
        content: 'Grille produits hoodies, crewnecks et joggings',
        image: '/screenshots/angele-2.webp',
      },
      {
        title: 'Fiche produit',
        gradient: 'from-[#7ECDB5] to-[#C5F0DC]',
        content: 'Galerie photos, sélecteur taille et ajout panier',
        image: '/screenshots/angele-3.webp',
      },
      {
        title: 'CD & Vinyles',
        gradient: 'from-[#C5F0DC] to-[#7ECDB5]',
        content: 'Collection vinyles et CD album Nonante-Cinq',
        image: '/screenshots/angele-4.webp',
      },
    ],
  },
]

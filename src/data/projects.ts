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
    id: 'kalira',
    title: 'kaliracare.com',
    subtitle: 'Soins capillaires premium',
    year: '2026',
    tags: ['E-commerce', 'Shopify', 'Direction artistique'],
    stack: ['Shopify', 'Liquid', 'JavaScript', 'Klaviyo'],
    description:
      "Boutique Shopify pour la marque de soins capillaires Kalira. Un rituel en trois temps — Clean, Care, Protect — servi par une direction artistique éditoriale et un tunnel d'achat taillé pour la conversion.",
    url: 'https://kaliracare.com',
    route: '/kalira',
    color: '#7A6A55',
    gradient: 'from-[#F5F0E8] via-[#D8CEC0] to-[#7A6A55]',
    heroImage: '/screenshots/kalira-hero.webp',
    brief:
      "Kalira est née de plusieurs années passées derrière un fauteuil de coiffure : des centaines de femmes, des cheveux et des attentes toutes différentes. La marque arrivait avec une gamme construite — kératine, acide hyaluronique, collagène — mais sans vitrine à sa hauteur. Il fallait un site qui rende lisible un rituel en trois étapes, qui donne envie de toucher le produit à travers l'écran, et qui transforme une visite Instagram en commande.",
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
    id: 'sourcing',
    title: 'the-sourcing.com',
    subtitle: 'Sourcing & production',
    year: '2026',
    tags: ['Site vitrine', 'Bilingue', 'B2B'],
    stack: ['Next.js', 'React', 'TypeScript', 'i18n'],
    description:
      "Vitrine bilingue d'un cabinet de sourcing entre la France et la Chine. Noir et blanc, typographie massive, et une méthode en six temps rendue lisible d'un seul scroll.",
    url: 'https://www.the-sourcing.com/fr',
    route: '/the-sourcing',
    color: '#B8B8B8',
    gradient: 'from-[#1A1A1A] via-[#2E2E2E] to-[#0A0A0A]',
    heroImage: '/screenshots/sourcing-hero.webp',
    brief:
      "The Sourcing accompagne des entrepreneurs et des marques dans la recherche de fabricants, le développement produit et la logistique internationale. Un métier de confiance, difficile à vendre en ligne : le visiteur doit comprendre en trente secondes ce qui est pris en charge, à quel moment il décide, et pourquoi il ne se retrouvera pas seul face à une usine à 9 000 km. Le tout en français et en anglais, sans dupliquer le travail.",
    solution:
      "Un parti pris graphique radical : noir profond, photographie d'entrepôt en pleine page, typographie condensée à très grande échelle. La méthode devient un parcours numéroté en six étapes — Présenter, Étudier, Proposer, Rechercher, Sélectionner, Produire — révélé progressivement au scroll. L'architecture Next.js sert les deux langues depuis un même arbre de routes, avec des pages dédiées au sourcing en Chine et à la logistique.",
    features: [
      'Architecture Next.js bilingue FR / EN',
      'Méthode en 6 étapes révélée au scroll',
      'Sept pôles de services détaillés',
      'Pages dédiées sourcing Chine et logistique',
      'Direction artistique noir et blanc, typo condensée',
      'Formulaire de qualification de projet',
    ],
    metrics: [
      { value: '2', label: 'langues servies' },
      { value: '6', label: 'étapes de méthode' },
      { value: '7', label: 'pôles de services' },
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#0A0A0A] to-[#1A1A1A]',
        content: 'Hero entrepôt et promesse en trois lignes',
        image: '/screenshots/sourcing-hero.webp',
      },
      {
        title: 'Services',
        gradient: 'from-[#1A1A1A] to-[#2E2E2E]',
        content: 'Les sept pôles d\'accompagnement',
        image: '/screenshots/sourcing-2.webp',
      },
      {
        title: 'Sourcing Chine',
        gradient: 'from-[#2E2E2E] to-[#1A1A1A]',
        content: 'Voyages, salons et visites d\'usines',
        image: '/screenshots/sourcing-3.webp',
      },
      {
        title: 'Logistique',
        gradient: 'from-[#1A1A1A] to-[#0A0A0A]',
        content: 'Aérien, maritime, routier et ferroviaire',
        image: '/screenshots/sourcing-4.webp',
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
      "Une boutique Shopify privée, protégée par mot de passe, pensée comme un outil interne plus que comme un site marchand. Un « kit d'ouverture » regroupe tout ce qu'il faut pour démarrer une agence en une seule commande ; le reste du catalogue est rangé par zone du point de vente — surface de vente, back office, bureaux, détailing, informatique. Direction artistique sombre et sobre, alignée sur l'identité DRIVE, avec bascule jour / nuit.",
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
      "Trouver un orthophoniste, un psychomotricien ou un éducateur formé aux TND relève souvent du parcours du combattant : listes obsolètes, diplômes invérifiables, délais à rallonge. NeuroCare devait répondre à trois besoins d'un coup — trouver le bon professionnel, comprendre à quelles aides on a droit, et ne pas rester seul dans les démarches. Le tout gratuitement pour les familles, et conforme au RGPD sur des données de santé.",
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
    id: 'lissage',
    title: 'lissage-sur-mesure.com',
    subtitle: 'Beauté & soins capillaires',
    year: '2025',
    tags: ['Site vitrine', 'Dark luxe', 'SEO local'],
    stack: ['Next.js', 'Framer Motion', 'Lenis', 'Schema.org'],
    description:
      'Site vitrine haut de gamme pour un salon spécialisé en lissage sur mesure. Dark luxe, animations immersives et parcours guidé jusqu’à la prise de rendez-vous.',
    url: 'https://www.lissage-sur-mesure.com',
    route: '/lissage',
    color: '#5B1A3A',
    gradient: 'from-[#5B1A3A] via-[#7A2A4A] to-[#3D1228]',
    heroImage: '/screenshots/lissage-hero.webp',
    brief:
      "Lissage sur Mesure avait besoin d'un site vitrine à la hauteur de son positionnement premium. Le défi : traduire l'expertise capillaire et le savoir-faire artisanal en une expérience digitale élégante. Le site devait présenter la formule unique, les services de lissage personnalisé et la formation professionnelle certifiante, tout en véhiculant confiance et luxe.",
    solution:
      "Nous avons conçu un site vitrine immersif avec une esthétique dark luxe, des animations scroll fluides et une typographie serif élégante. L'architecture Next.js assure des performances optimales, tandis que Framer Motion apporte des transitions cinématiques. Chaque section guide le visiteur de la découverte de la formule jusqu'à la prise de rendez-vous.",
    features: [
      'Design dark luxe immersif',
      'Animations scroll avec Framer Motion',
      'Smooth scroll avec Lenis',
      'Optimisation SEO avec Schema.org',
      'Architecture Next.js performante',
      'Responsive mobile-first',
    ],
    metrics: [
      { value: '3', label: 'piliers de savoir-faire' },
      { value: '1', label: 'formule signature' },
      { value: '<1.5s', label: 'temps de chargement' },
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#5B1A3A] to-[#3D1228]',
        content: 'Hero plein écran avec vidéo capillaire',
        image: '/screenshots/lissage-hero.webp',
      },
      {
        title: 'Savoir-faire',
        gradient: 'from-[#3D1228] to-[#5B1A3A]',
        content: 'Trois piliers : Produits, Lissages, Formation',
        image: '/screenshots/lissage-2.webp',
      },
      {
        title: 'La Formule',
        gradient: 'from-[#5B1A3A] to-[#7A2A4A]',
        content: 'Philosophie et formule unique sans compromis',
        image: '/screenshots/lissage-3.webp',
      },
      {
        title: 'Actifs & Contact',
        gradient: 'from-[#7A2A4A] to-[#5B1A3A]',
        content: 'Composition des actifs et localisation salon',
        image: '/screenshots/lissage-4.webp',
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
  {
    id: 'reuni',
    title: 'reuni.com',
    subtitle: 'Mode éthique française',
    year: '2025',
    tags: ['E-commerce', 'Mode', 'Éco-responsable'],
    stack: ['React', 'Design system', 'Headless'],
    description:
      "Plateforme e-commerce pour une marque de mode éthique et responsable. Design épuré à la française avec une expérience d'achat premium.",
    url: 'https://reuni.com',
    route: '/reuni',
    color: '#C4A882',
    gradient: 'from-[#C4A882] via-[#D4B892] to-[#E8D5B8]',
    heroImage: '/screenshots/reuni-hero.webp',
    brief:
      "Reuni avait besoin d'une plateforme e-commerce qui reflète ses valeurs : éthique, transparence et élégance. Le challenge était de créer une expérience d'achat haut de gamme tout en mettant en avant l'engagement éco-responsable de la marque. Chaque détail devait respirer l'authenticité et le savoir-faire français.",
    solution:
      "Nous avons conçu une architecture front-end performante avec un design system sur mesure. L'accent a été mis sur la vitesse de chargement, l'expérience mobile et les micro-interactions qui guident l'utilisateur vers la conversion.",
    features: [
      'Design responsive mobile-first',
      'Temps de chargement < 1.5s',
      'Catalogue produits avec filtres dynamiques',
      'Panier et checkout optimisés conversion',
      'Animations scroll fluides',
      'Score Lighthouse 98/100',
    ],
    metrics: [
      { value: '98', label: 'score Lighthouse' },
      { value: '<1.5s', label: 'temps de chargement' },
      { value: '100%', label: 'mobile-first' },
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#F5EDE3] to-[#E8D5B8]',
        content: 'Hero immersif avec vidéo de la collection',
        image: '/screenshots/reuni-hero.webp',
      },
      {
        title: 'Catalogue produits',
        gradient: 'from-[#E8D5B8] to-[#D4C4A8]',
        content: 'Grille produits avec filtres latéraux',
        image: '/screenshots/reuni-2.webp',
      },
      {
        title: 'Fiche produit',
        gradient: 'from-[#D4C4A8] to-[#C4B498]',
        content: 'Galerie zoom + sélecteur taille/couleur',
        image: '/screenshots/reuni-3.webp',
      },
      {
        title: 'Checkout',
        gradient: 'from-[#C4B498] to-[#B4A488]',
        content: "Tunnel d'achat en 3 étapes",
        image: '/screenshots/reuni-4.webp',
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
]

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

// Portfolio centré sur les avocats : le cabinet Fidal en tête, puis des
// sites institutionnels sobres et une boutique.
export const projects: Project[] = [
  {
    id: 'fidal',
    title: 'Fidal Montpellier',
    subtitle: 'Cabinet d’avocats d’affaires',
    year: '2026',
    tags: ['Avocats', 'Site institutionnel', 'Référencement local'],
    stack: ['CMS', 'SEO local', 'Cartographie'],
    description:
      "Page du bureau montpelliérain de Fidal, cabinet d'avocats d'affaires : présentation du bureau, expertises, équipe et coordonnées, pensée pour le référencement local.",
    url: 'https://www.fidal.com/nos-implantations/mediterranee/montpellier',
    route: '/fidal',
    color: '#1B2A41',
    gradient: 'from-[#E6E9EE] via-[#C9D0DA] to-[#1B2A41]',
    heroImage: '/screenshots/fidal-hero.webp',
    brief:
      "Fidal souhaitait que chacun de ses bureaux régionaux existe en ligne à part entière : une page qui présente le bureau de Montpellier, ses expertises et ses avocats, et qui ressorte sur les recherches locales d'avocat d'affaires.",
    solution:
      "Une page de bureau structurée pour la recherche locale : présentation et domaines d'intervention, coordonnées et carte, équipe avec fonctions et secteurs, liens vers les autres implantations.",
    features: [
      'Page de bureau dédiée à Montpellier',
      'Présentation des expertises du bureau',
      'Équipe avec fonctions et secteurs',
      'Coordonnées, carte et accès',
      'Maillage vers les autres implantations',
      'Référencement local avocat d’affaires',
    ],
    metrics: [
      { value: '1', label: 'bureau régional dédié' },
      { value: '100%', label: 'référencement local' },
      { value: 'FR / EN', label: 'cabinet international' },
    ],
    mockups: [
      {
        title: 'Bureau',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Présentation du bureau de Montpellier',
        image: '/screenshots/fidal-hero.webp',
      },
      {
        title: 'Contact',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Coordonnées et carte',
        image: '/screenshots/fidal-2.webp',
      },
      {
        title: 'Équipe',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Avocats et directeur de bureau',
        image: '/screenshots/fidal-3.webp',
      },
      {
        title: 'Réseau',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Les autres implantations',
        image: '/screenshots/fidal-4.webp',
      },
    ],
  },
  {
    id: 'gensler',
    title: 'gensler.com',
    subtitle: 'Agence d’architecture et de design',
    year: '2026',
    tags: ['Architecte', 'Site institutionnel', 'Contenus'],
    stack: ['Site institutionnel', 'Blog', 'Recherche'],
    description:
      "Site de Gensler, agence mondiale d'architecture, de design et d'urbanisme : recherches, projets, expertises et actualités, avec une forte place aux contenus éditoriaux.",
    url: 'https://www.gensler.com',
    route: '/gensler',
    color: '#E2401C',
    gradient: 'from-[#F4F1EE] via-[#E7D9D2] to-[#E2401C]',
    heroImage: '/screenshots/gensler-hero.webp',
    brief:
      "Gensler publie énormément : recherches, blog, études de cas. Le site devait mettre ces contenus en avant sans perdre l'accès aux projets, aux expertises et aux bureaux.",
    solution:
      "Un site éditorial clair : recherches et articles mis en avant avec de grands visuels, carrousels d'actualités, accès direct aux expertises, aux projets et aux bureaux.",
    features: [
      'Recherches et articles mis en avant',
      'Carrousels d’actualités',
      'Accès aux expertises et projets',
      'Pages des bureaux dans le monde',
      'Mise en page éditoriale claire',
      'Responsive et accessible',
    ],
    metrics: [
      { value: '58', label: 'bureaux dans le monde' },
      { value: '6 000+', label: 'professionnels' },
      { value: '100%', label: 'responsive' },
    ],
    mockups: [
      {
        title: 'Recherche',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Articles mis en avant',
        image: '/screenshots/gensler-hero.webp',
      },
      {
        title: 'Actualités',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Carrousel de contenus',
        image: '/screenshots/gensler-2.webp',
      },
      {
        title: 'À propos',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Mission de l’agence',
        image: '/screenshots/gensler-3.webp',
      },
    ],
  },
  {
    id: 'celsi',
    title: 'oliviercelsi.com',
    subtitle: 'Maison d’architecture à Bordeaux',
    year: '2026',
    tags: ['Architecte', 'Portfolio', 'Site vitrine'],
    stack: ['Site vitrine', 'Galerie projets', 'SEO'],
    description:
      "Site d'Olivier Celsi Maison d'Architecture (OCMA), à Bordeaux : construction et rénovation de maisons, appartements et commerces, présentés par de grandes images.",
    url: 'https://www.oliviercelsi.com',
    route: '/olivier-celsi',
    color: '#6B4E3D',
    gradient: 'from-[#F2ECE6] via-[#DCCFC4] to-[#B59C88]',
    heroImage: '/screenshots/celsi-hero.webp',
    brief:
      "OCMA voulait un site à l'image de son architecture : chaleureux, lumineux, où les réalisations parlent d'elles-mêmes, et qui donne envie aux particuliers de confier leur projet de vie à l'agence.",
    solution:
      "Un site vitrine où l'image domine : intérieurs et extérieurs en plein écran, une présentation de la maison et de sa démarche, des actualités et une galerie de projets, sur une mise en page sobre et aérée.",
    features: [
      'Visuels de réalisations plein écran',
      'Présentation de la maison et de sa démarche',
      'Galerie de projets',
      'Rubrique actualités',
      'Mise en page sobre et aérée',
      'Référencement architecte à Bordeaux',
    ],
    metrics: [
      { value: 'OCMA', label: 'maison d’architecture' },
      { value: '3', label: 'types de projets' },
      { value: '100%', label: 'responsive' },
    ],
    mockups: [
      {
        title: 'Accueil',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Intérieur en plein écran',
        image: '/screenshots/celsi-hero.webp',
      },
      {
        title: 'La Maison',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Présentation de l’agence',
        image: '/screenshots/celsi-2.webp',
      },
      {
        title: 'Projets',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Galerie de réalisations',
        image: '/screenshots/celsi-3.webp',
      },
    ],
  },
  {
    id: 'foster',
    title: 'fosterandpartners.com',
    subtitle: 'Studio d’architecture international',
    year: '2026',
    tags: ['Architecte', 'Site institutionnel', 'International'],
    stack: ['Site institutionnel', 'Galerie projets', 'Multilingue'],
    description:
      "Site de Foster + Partners, studio international d'architecture, d'urbanisme, d'ingénierie et de design fondé par Norman Foster en 1967 : projets, studio, expertises et actualités.",
    url: 'https://www.fosterandpartners.com',
    route: '/foster-and-partners',
    color: '#1A1A1A',
    gradient: 'from-[#E9E9E9] via-[#BDBDBD] to-[#1A1A1A]',
    heroImage: '/screenshots/foster-hero.webp',
    brief:
      "Un studio présent dans le monde entier, des centaines de projets et des métiers très variés : le site devait rester lisible, mettre l'architecture en grand et donner accès rapidement aux projets, aux expertises et à la vie du studio.",
    solution:
      "Une interface sombre et éditoriale où l'image domine : grandes vignettes de projets, rubriques studio, architecture et expertises, citations du fondateur et actualités, dans une navigation sobre.",
    features: [
      'Interface sombre et éditoriale',
      'Grandes vignettes de projets',
      'Rubriques studio, architecture, expertises',
      'Actualités et vie du studio',
      'Pages carrières et diversité',
      'Navigation sobre et rapide',
    ],
    metrics: [
      { value: '1967', label: 'studio fondé' },
      { value: '6', label: 'expertises' },
      { value: '100%', label: 'responsive' },
    ],
    mockups: [
      {
        title: 'Accueil',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Projet à la une',
        image: '/screenshots/foster-hero.webp',
      },
      {
        title: 'Studio',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Vie et valeurs du studio',
        image: '/screenshots/foster-2.webp',
      },
      {
        title: 'Architecture',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Projets et citations',
        image: '/screenshots/foster-3.webp',
      },
      {
        title: 'Expertises',
        gradient: 'from-[#EEE] to-[#DDD]',
        content: 'Ingénierie, intérieurs, urbanisme',
        image: '/screenshots/foster-4.webp',
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

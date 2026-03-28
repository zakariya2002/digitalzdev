export interface ProjectMockup {
  title: string
  gradient: string
  content: string
  image: string
}

export interface Project {
  id: string
  title: string
  subtitle: string
  description: string
  url: string
  route: string
  color: string
  gradient: string
  heroImage: string
  brief: string
  solution: string
  features: string[]
  mockups: ProjectMockup[]
}

export const projects: Project[] = [
  {
    id: 'reuni',
    title: 'reuni.com',
    subtitle: 'Mode éthique française',
    description:
      "Plateforme e-commerce pour une marque de mode éthique et responsable. Design épuré à la française avec une expérience d'achat premium.",
    url: 'https://reuni.com',
    route: '/reuni',
    color: '#C4A882',
    gradient: 'from-[#C4A882] via-[#D4B892] to-[#E8D5B8]',
    heroImage: '/screenshots/reuni-hero.png',
    brief: "Reuni avait besoin d'une plateforme e-commerce qui reflète ses valeurs : éthique, transparence et élégance. Le challenge était de créer une expérience d'achat haut de gamme tout en mettant en avant l'engagement éco-responsable de la marque. Chaque détail devait respirer l'authenticité et le savoir-faire français.",
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
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#F5EDE3] to-[#E8D5B8]',
        content: 'Hero immersif avec vidéo de la collection',
        image: '/screenshots/reuni-hero.png',
      },
      {
        title: 'Catalogue produits',
        gradient: 'from-[#E8D5B8] to-[#D4C4A8]',
        content: 'Grille produits avec filtres latéraux',
        image: '/screenshots/reuni-2.png',
      },
      {
        title: 'Fiche produit',
        gradient: 'from-[#D4C4A8] to-[#C4B498]',
        content: 'Galerie zoom + sélecteur taille/couleur',
        image: '/screenshots/reuni-3.png',
      },
      {
        title: 'Checkout',
        gradient: 'from-[#C4B498] to-[#B4A488]',
        content: "Tunnel d'achat en 3 étapes",
        image: '/screenshots/reuni-4.png',
      },
    ],
  },
  {
    id: 'st-agni',
    title: 'st-agni.com',
    subtitle: 'Minimalisme premium',
    description:
      "Boutique en ligne luxe minimaliste pour la marque St. Agni. Focus sur l'expérience produit avec une navigation épurée et des visuels immersifs.",
    url: 'https://st-agni.com',
    route: '/st-agni',
    color: '#8A8580',
    gradient: 'from-[#E8E3DC] via-[#D8D3CC] to-[#C8C3BC]',
    heroImage: '/screenshots/st-agni-hero.png',
    brief: "St. Agni recherchait un écrin digital à la hauteur de son positionnement luxe. La marque souhaitait une expérience immersive où le produit est roi, avec un minimalisme radical qui laisse respirer les visuels. L'enjeu : traduire le toucher et la qualité des matières à travers un écran.",
    solution:
      "Une approche \"content-first\" avec des visuels plein écran, des transitions cinématiques et une architecture headless pour des performances maximales. Chaque interaction a été pensée pour renforcer le positionnement premium.",
    features: [
      'Architecture headless CMS',
      'Transitions de page cinématiques',
      'Galerie produits plein écran',
      'Navigation gestuelle mobile',
      'Lazy loading intelligent des images',
      'Intégration Shopify Plus',
    ],
    mockups: [
      {
        title: 'Homepage',
        gradient: 'from-[#F0EDE8] to-[#E0DDD8]',
        content: 'Diaporama plein écran haute couture',
        image: '/screenshots/st-agni-hero.png',
      },
      {
        title: 'Collection',
        gradient: 'from-[#E0DDD8] to-[#D0CDC8]',
        content: 'Grille asymétrique, visuels lifestyle',
        image: '/screenshots/stagni-2.png',
      },
      {
        title: 'Produit',
        gradient: 'from-[#D0CDC8] to-[#C0BDB8]',
        content: 'Vue 360° + zoom matière',
        image: '/screenshots/stagni-3.png',
      },
      {
        title: 'Panier',
        gradient: 'from-[#C0BDB8] to-[#B0ADA8]',
        content: 'Slide-over cart minimaliste',
        image: '/screenshots/stagni-4.png',
      },
    ],
  },
  {
    id: 'neurocare',
    title: 'neuro-care.fr',
    subtitle: 'Santé neurodéveloppement',
    description:
      'Plateforme pour trouver des professionnels qualifiés et vérifiés en neurodéveloppement. Recherche par spécialité, ville ou trouble, 100% gratuite.',
    url: 'https://neuro-care.fr',
    route: '/neurocare',
    color: '#5BA89D',
    gradient: 'from-[#5BA89D] via-[#4A9488] to-[#3D7F74]',
    heroImage: '/screenshots/neurocare-hero.png',
    brief: "NeuroCare avait besoin d'une plateforme accessible pour aider les parents à trouver des professionnels spécialisés en TND (Troubles du NeuroDéveloppement) : autisme, TDAH, troubles DYS. L'outil devait être gratuit, simple d'utilisation et regrouper des profils vérifiés.",
    solution:
      "Nous avons conçu une plateforme de recherche intuitive avec un moteur de recherche par spécialité, ville ou trouble. Les profils professionnels sont vérifiés, et l'interface claire permet aux parents de comparer et contacter directement les praticiens adaptés.",
    features: [
      'Moteur de recherche par spécialité et ville',
      'Profils professionnels vérifiés',
      'Plateforme 100% gratuite',
      'Espace professionnel dédié',
      'Communauté et ressources',
      'Données protégées',
    ],
    mockups: [
      {
        title: 'Page d\'accueil',
        gradient: 'from-[#3D7F74] to-[#2C5F57]',
        content: 'Recherche de professionnels avec barre de recherche',
        image: '/screenshots/neurocare-hero.png',
      },
      {
        title: 'Résultats de recherche',
        gradient: 'from-[#2C5F57] to-[#3D7F74]',
        content: 'Liste de professionnels avec filtres',
        image: '/screenshots/neurocare-2.png',
      },
      {
        title: 'Profil professionnel',
        gradient: 'from-[#3D7F74] to-[#4A9488]',
        content: 'Diplômes, spécialisations, méthodes et tarifs',
        image: '/screenshots/neurocare-3.png',
      },
      {
        title: 'Espace Pro',
        gradient: 'from-[#4A9488] to-[#5BA89D]',
        content: 'Gestion de profil et visibilité',
        image: '/screenshots/neurocare-4.png',
      },
    ],
  },
  {
    id: 'lissage',
    title: 'lissage-sur-mesure.com',
    subtitle: 'Beauté & soins capillaires',
    description:
      'Site vitrine haut de gamme pour un salon spécialisé en lissage sur mesure. Design luxe sombre avec des animations immersives et une expérience utilisateur soignée.',
    url: 'https://www.lissage-sur-mesure.com',
    route: '/lissage',
    color: '#5B1A3A',
    gradient: 'from-[#5B1A3A] via-[#7A2A4A] to-[#3D1228]',
    heroImage: '/screenshots/lissage-hero.png',
    brief: "Lissage sur Mesure avait besoin d'un site vitrine à la hauteur de son positionnement premium. Le défi : traduire l'expertise capillaire et le savoir-faire artisanal en une expérience digitale élégante. Le site devait présenter la formule unique, les services de lissage personnalisé et la formation professionnelle certifiante, tout en véhiculant confiance et luxe.",
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
    mockups: [
      {
        title: "Page d'accueil",
        gradient: 'from-[#5B1A3A] to-[#3D1228]',
        content: 'Hero plein écran avec vidéo capillaire',
        image: '/screenshots/lissage-hero.png',
      },
      {
        title: 'Savoir-faire',
        gradient: 'from-[#3D1228] to-[#5B1A3A]',
        content: 'Trois piliers : Produits, Lissages, Formation',
        image: '/screenshots/lissage-2.png',
      },
      {
        title: 'La Formule',
        gradient: 'from-[#5B1A3A] to-[#7A2A4A]',
        content: 'Philosophie et formule unique sans compromis',
        image: '/screenshots/lissage-3.png',
      },
      {
        title: 'Actifs & Contact',
        gradient: 'from-[#7A2A4A] to-[#5B1A3A]',
        content: 'Composition des actifs et localisation salon',
        image: '/screenshots/lissage-4.png',
      },
    ],
  },
]

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
      'Dashboard professionnel pour le suivi des troubles du neurodéveloppement. Interface sombre, métriques temps réel et gestion de rendez-vous.',
    url: 'https://neuro-care.fr',
    route: '/neurocare',
    color: '#6C5CE7',
    gradient: 'from-[#6C5CE7] via-[#5B4BD6] to-[#4A3AC5]',
    heroImage: '/screenshots/neurocare-hero.png',
    brief: "Neuro-Care avait besoin d'un outil complet pour les professionnels de santé spécialisés en TND (Troubles du NeuroDéveloppement). Le dashboard devait centraliser le suivi patient, les métriques de progression et la prise de rendez-vous, le tout dans une interface professionnelle et intuitive.",
    solution:
      "Nous avons développé une application React complète avec un système de design sombre professionnel. Les données sont visualisées via des graphiques interactifs, et l'interface s'adapte aux différents profils utilisateurs (praticiens, patients, administrateurs).",
    features: [
      'Dashboard temps réel avec graphiques',
      'Système de rendez-vous intégré',
      'Suivi patient avec historique',
      'Interface sombre professionnelle',
      'Notifications et alertes',
      'Export PDF des rapports',
    ],
    mockups: [
      {
        title: 'Dashboard principal',
        gradient: 'from-[#1E1B4B] to-[#0F0E2A]',
        content: "Vue d'ensemble : stats, graphiques, alertes",
        image: '/screenshots/neurocare-hero.png',
      },
      {
        title: 'Suivi patient',
        gradient: 'from-[#0F0E2A] to-[#1A1744]',
        content: 'Timeline patient + métriques de progression',
        image: '/screenshots/neurocare-2.png',
      },
      {
        title: 'Rendez-vous',
        gradient: 'from-[#1A1744] to-[#25215E]',
        content: 'Calendrier + formulaire de prise de RV',
        image: '/screenshots/neurocare-3.png',
      },
      {
        title: 'Rapports',
        gradient: 'from-[#25215E] to-[#302B78]',
        content: 'Génération et export de rapports PDF',
        image: '/screenshots/neurocare-4.png',
      },
    ],
  },
]

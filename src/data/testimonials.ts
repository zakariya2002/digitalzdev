/**
 * Contenu du carrousel clients.
 *
 * Tant qu'un client n'a pas envoyé son avis, l'entrée porte `quote: null` et
 * seul le champ `delivered` s'affiche : un fait vérifiable sur le projet,
 * énoncé à la voix de l'agence, jamais entre guillemets et jamais signé.
 *
 * Quand le vrai avis arrive, il suffit de renseigner `quote` et `author` :
 * la carte bascule automatiquement en témoignage, avec guillemets et
 * signature. Ne jamais rédiger de `quote` à la place d'un client.
 */

export interface Testimonial {
  /** Identifiant du projet correspondant dans data/projects.ts */
  projectId: string
  /** Nom affiché du client */
  company: string
  sector: string
  /** Ce que nous avons livré. Factuel, à notre voix. Toujours renseigné. */
  delivered: string
  /** Avis réel du client. `null` tant qu'il n'a pas été transmis. */
  quote: string | null
  /** Auteur de l'avis : nom et fonction. `null` tant qu'il n'y a pas d'avis. */
  author: { name: string; role: string } | null
  image: string
  route: string
  color: string
}

export const testimonials: Testimonial[] = [
  {
    projectId: 'kalira',
    company: 'Kalira',
    sector: 'Soins capillaires',
    delivered:
      "Boutique Shopify sur mesure autour d'un rituel en trois temps. Direction artistique éditoriale, packs et duos, capture e-mail gamifiée et scénarios Klaviyo. Cinq références en ligne, paiement Shop Pay, PayPal, Klarna et carte.",
    quote: null,
    author: null,
    image: '/screenshots/kalira-hero.webp',
    route: '/kalira',
    color: '#7A6A55',
  },
  {
    projectId: 'sourcing',
    company: 'The Sourcing',
    sector: 'Sourcing et production',
    delivered:
      "Vitrine bilingue français et anglais servie depuis un même arbre de routes Next.js. Sept pôles de services, une méthode en six étapes révélée au scroll, et deux pages dédiées au sourcing en Chine et à la logistique.",
    quote: null,
    author: null,
    image: '/screenshots/sourcing-hero.webp',
    route: '/the-sourcing',
    color: '#B8B8B8',
  },
  {
    projectId: 'drive',
    company: 'DRIVE',
    sector: 'Réseau de franchisés',
    delivered:
      "Portail d'équipement privé pour les dix agences du réseau. Un kit d'ouverture permet d'équiper une nouvelle agence en une seule commande, le reste du catalogue est rangé par zone du point de vente, à tarifs cadrés par la centrale.",
    quote: null,
    author: null,
    image: '/screenshots/drive-hero.webp',
    route: '/drive',
    color: '#8A93A0',
  },
  {
    projectId: 'neurocare',
    company: 'NeuroCare',
    sector: 'Santé et neurodéveloppement',
    delivered:
      "Plateforme d'orientation pour les familles : annuaire de professionnels vérifiés en quatre étapes contre l'Annuaire Santé, forum modéré, simulateur d'aides AEEH, PCH et CESU, carte des lieux adaptés. Hébergé en France, conforme RGPD.",
    quote: null,
    author: null,
    image: '/screenshots/neurocare-hero.webp',
    route: '/neurocare',
    color: '#5BA89D',
  },
  {
    projectId: 'lissage',
    company: 'Lissage sur Mesure',
    sector: 'Beauté',
    delivered:
      "Site vitrine dark luxe pour un salon spécialisé. Animations au scroll, typographie serif, balisage Schema.org pour le référencement local. Le parcours mène de la découverte de la formule à la prise de rendez-vous.",
    quote: null,
    author: null,
    image: '/screenshots/lissage-hero.webp',
    route: '/lissage',
    color: '#5B1A3A',
  },
  {
    projectId: 'angele',
    company: 'Angèle',
    sector: 'Merchandising artiste',
    delivered:
      "Boutique officielle de merchandising : t-shirts, sweats, vinyles et accessoires. Thème Shopify personnalisé, fiches produit avec sélecteur de taille et galerie, livraison européenne, intégrations newsletter et suivi marketing.",
    quote: null,
    author: null,
    image: '/screenshots/angele-hero.webp',
    route: '/angele',
    color: '#7ECDB5',
  },
  {
    projectId: 'reuni',
    company: 'Reuni',
    sector: 'Mode éthique',
    delivered:
      "Plateforme e-commerce avec design system sur mesure. Catalogue à filtres dynamiques, tunnel d'achat optimisé pour la conversion, chargement sous une seconde et demie et score Lighthouse de 98.",
    quote: null,
    author: null,
    image: '/screenshots/reuni-hero.webp',
    route: '/reuni',
    color: '#C4A882',
  },
  {
    projectId: 'st-agni',
    company: 'St. Agni',
    sector: 'Mode premium',
    delivered:
      "Boutique en ligne minimaliste en architecture headless sur Shopify Plus. Visuels plein écran, transitions de page cinématiques, vue produit à 360 degrés et navigation gestuelle sur mobile.",
    quote: null,
    author: null,
    image: '/screenshots/st-agni-hero.webp',
    route: '/st-agni',
    color: '#8A8580',
  },
]

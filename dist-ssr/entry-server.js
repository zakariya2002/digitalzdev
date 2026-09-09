var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, Component, useLayoutEffect, useRef, lazy, Suspense, useCallback, useMemo, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.mjs";
import { createClient } from "@supabase/supabase-js";
import { useLocation, Link, Navigate, useNavigate, Routes, Route } from "react-router-dom";
import { useReducedMotion, motion, AnimatePresence, useScroll, useSpring, useTransform, useInView, useMotionValue, useMotionValueEvent } from "framer-motion";
import Lenis from "lenis";
import * as THREE from "three";
import emailjs from "@emailjs/browser";
const supabaseUrl = "https://uipxlesrpdocqpblmrrr.supabase.co";
const supabaseAnonKey = "sb_publishable_9xAZPEmBviPFiunZ8vwifw_ZIo493WC";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: session2 } }) => {
      setSession(session2);
      setUser((session2 == null ? void 0 : session2.user) ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session2) => {
      setSession(session2);
      setUser((session2 == null ? void 0 : session2.user) ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, session, loading, signIn, signOut }, children });
}
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
class ErrorBoundary extends Component {
  constructor() {
    super(...arguments);
    __publicField(this, "state", { error: null });
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Erreur d'affichage :", error, info.componentStack);
  }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-950 text-white flex items-center justify-center p-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-lg w-full bg-gray-900 border border-gray-800 rounded-xl p-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold mb-2", children: "Cette page n'a pas pu s'afficher" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mb-4", children: "Le reste du back-office continue de fonctionner. Recharge la page ; si le problème persiste, envoie ce message :" }),
      /* @__PURE__ */ jsx("pre", { className: "text-xs text-amber-400 bg-gray-950 border border-gray-800 rounded-lg p-3 overflow-x-auto mb-4", children: error.message }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => window.location.reload(),
            className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors",
            children: "Recharger"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/dashboard",
            className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors",
            children: "Retour au tableau de bord"
          }
        )
      ] })
    ] }) });
  }
}
const projects = [
  {
    id: "kalira",
    title: "kaliracare.com",
    subtitle: "Soins capillaires premium",
    year: "2026",
    tags: ["E-commerce", "Shopify", "Direction artistique"],
    stack: ["Shopify", "Liquid", "JavaScript", "Klaviyo"],
    description: "Boutique Shopify pour la marque de soins capillaires Kalira. Un rituel en trois temps (Clean, Care, Protect), servi par une direction artistique éditoriale et un tunnel d'achat taillé pour la conversion.",
    url: "https://kaliracare.com",
    route: "/kalira",
    color: "#7A6A55",
    gradient: "from-[#F5F0E8] via-[#D8CEC0] to-[#7A6A55]",
    heroImage: "/screenshots/kalira-hero.webp",
    brief: "Kalira est née de plusieurs années passées derrière un fauteuil de coiffure : des centaines de femmes, des cheveux et des attentes toutes différentes. La marque arrivait avec une gamme construite (kératine, acide hyaluronique, collagène) mais sans vitrine à sa hauteur. Il fallait un site qui rende lisible un rituel en trois étapes, qui donne envie de toucher le produit à travers l'écran, et qui transforme une visite Instagram en commande.",
    solution: "Nous avons bâti un thème Shopify sur mesure autour d'une grille éditoriale : hero plein écran en diptyque, numérotation romaine des trois soins (I-Clean, II-Care, III-Protect) qui structure toute la navigation, et une section « Scroll & Shop » qui rejoue les codes du feed social directement dans la page. Le tunnel est réduit au strict nécessaire, la roue de fidélisation capte l'e-mail dès la première visite et Klaviyo prend le relais.",
    features: [
      "Thème Shopify sur mesure, typographie éditoriale",
      "Rituel en 3 temps comme colonne vertébrale du site",
      "Section « Scroll & Shop » inspirée du feed social",
      "Packs et duos avec prix barrés et upsell panier",
      "Capture e-mail gamifiée et scénarios Klaviyo",
      "Paiement Shop Pay, PayPal, Klarna et CB"
    ],
    metrics: [
      { value: "3", label: "soins, un rituel" },
      { value: "5", label: "références en ligne" },
      { value: "100%", label: "mobile-first" }
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: "from-[#F5F0E8] to-[#D8CEC0]",
        content: "Hero diptyque égérie / packshot",
        image: "/screenshots/kalira-hero.webp"
      },
      {
        title: "Collection",
        gradient: "from-[#D8CEC0] to-[#C4B8A6]",
        content: "Toute la gamme, packs en tête",
        image: "/screenshots/kalira-2.webp"
      },
      {
        title: "Fiche produit",
        gradient: "from-[#C4B8A6] to-[#A89880]",
        content: "Pack hair-care, bénéfices et ajout panier",
        image: "/screenshots/kalira-3.webp"
      },
      {
        title: "Univers de marque",
        gradient: "from-[#A89880] to-[#7A6A55]",
        content: "Actifs, formulation et Scroll & Shop",
        image: "/screenshots/kalira-4.webp"
      }
    ]
  },
  {
    id: "sourcing",
    title: "the-sourcing.com",
    subtitle: "Sourcing & production",
    year: "2026",
    tags: ["Site vitrine", "Bilingue", "B2B"],
    stack: ["Next.js", "React", "TypeScript", "i18n"],
    description: "Vitrine bilingue d'un cabinet de sourcing entre la France et la Chine. Noir et blanc, typographie massive, et une méthode en six temps rendue lisible d'un seul scroll.",
    url: "https://www.the-sourcing.com/fr",
    route: "/the-sourcing",
    color: "#B8B8B8",
    gradient: "from-[#1A1A1A] via-[#2E2E2E] to-[#0A0A0A]",
    heroImage: "/screenshots/sourcing-hero.webp",
    brief: "The Sourcing accompagne des entrepreneurs et des marques dans la recherche de fabricants, le développement produit et la logistique internationale. Un métier de confiance, difficile à vendre en ligne : le visiteur doit comprendre en trente secondes ce qui est pris en charge, à quel moment il décide, et pourquoi il ne se retrouvera pas seul face à une usine à 9 000 km. Le tout en français et en anglais, sans dupliquer le travail.",
    solution: "Un parti pris graphique radical : noir profond, photographie d'entrepôt en pleine page, typographie condensée à très grande échelle. La méthode devient un parcours numéroté en six étapes (Présenter, Étudier, Proposer, Rechercher, Sélectionner, Produire) révélé progressivement au scroll. L'architecture Next.js sert les deux langues depuis un même arbre de routes, avec des pages dédiées au sourcing en Chine et à la logistique.",
    features: [
      "Architecture Next.js bilingue FR / EN",
      "Méthode en 6 étapes révélée au scroll",
      "Sept pôles de services détaillés",
      "Pages dédiées sourcing Chine et logistique",
      "Direction artistique noir et blanc, typo condensée",
      "Formulaire de qualification de projet"
    ],
    metrics: [
      { value: "2", label: "langues servies" },
      { value: "6", label: "étapes de méthode" },
      { value: "7", label: "pôles de services" }
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: "from-[#0A0A0A] to-[#1A1A1A]",
        content: "Hero entrepôt et promesse en trois lignes",
        image: "/screenshots/sourcing-hero.webp"
      },
      {
        title: "Services",
        gradient: "from-[#1A1A1A] to-[#2E2E2E]",
        content: "Les sept pôles d'accompagnement",
        image: "/screenshots/sourcing-2.webp"
      },
      {
        title: "Sourcing Chine",
        gradient: "from-[#2E2E2E] to-[#1A1A1A]",
        content: "Voyages, salons et visites d'usines",
        image: "/screenshots/sourcing-3.webp"
      },
      {
        title: "Logistique",
        gradient: "from-[#1A1A1A] to-[#0A0A0A]",
        content: "Aérien, maritime, routier et ferroviaire",
        image: "/screenshots/sourcing-4.webp"
      }
    ]
  },
  {
    id: "drive",
    title: "DRIVE",
    subtitle: "Portail B2B franchisés",
    year: "2026",
    tags: ["E-commerce B2B", "Shopify", "Réseau"],
    stack: ["Shopify", "Liquid", "Thème sur mesure"],
    description: "Portail d'équipement réservé aux franchisés du réseau DRIVE. Un catalogue cadré par la centrale : chaque agence s'équipe au standard de la marque, en une commande.",
    url: "https://drive-12398.myshopify.com/",
    access: "Accès réservé aux franchisés",
    route: "/drive",
    color: "#8A93A0",
    gradient: "from-[#101214] via-[#1C1F24] to-[#05070A]",
    heroImage: "/screenshots/drive-hero.webp",
    brief: "Quand une agence DRIVE ouvre, le franchisé doit équiper son point de vente à l'identique du reste du réseau : informatique, mobilier, signalétique, matériel de détailing. Jusqu'ici, chacun négociait dans son coin, avec des écarts de prix, de délais et de standard. La centrale voulait un catalogue fermé, réservé au réseau, où tout est déjà validé, chiffré et livrable.",
    solution: "Une boutique Shopify privée, protégée par mot de passe, pensée comme un outil interne plus que comme un site marchand. Un « kit d'ouverture » regroupe tout ce qu'il faut pour démarrer une agence en une seule commande ; le reste du catalogue est rangé par zone du point de vente : surface de vente, back office, bureaux, détailing, informatique. Direction artistique sombre et sobre, alignée sur l'identité DRIVE, avec bascule jour / nuit.",
    features: [
      "Boutique privée, accès réservé au réseau",
      "Kit d'ouverture : une agence équipée en une commande",
      "Catalogue rangé par zone du point de vente",
      "Tarifs cadrés HT validés par la centrale",
      "Livraison directe fournisseur, suivi consolidé",
      "Thème sombre avec bascule jour / nuit"
    ],
    metrics: [
      { value: "10", label: "agences du réseau" },
      { value: "7", label: "catégories catalogue" },
      { value: "1", label: "commande pour ouvrir" }
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: "from-[#05070A] to-[#101214]",
        content: "Promesse réseau et double entrée catalogue",
        image: "/screenshots/drive-hero.webp"
      },
      {
        title: "Kit d'ouverture",
        gradient: "from-[#101214] to-[#1C1F24]",
        content: "Tout l'équipement d'une nouvelle agence",
        image: "/screenshots/drive-2.webp"
      },
      {
        title: "Catalogue informatique",
        gradient: "from-[#1C1F24] to-[#101214]",
        content: "Matériel validé, tarifs cadrés HT",
        image: "/screenshots/drive-3.webp"
      },
      {
        title: "Le réseau",
        gradient: "from-[#101214] to-[#05070A]",
        content: "Standard de marque et implantations",
        image: "/screenshots/drive-4.webp"
      }
    ]
  },
  {
    id: "neurocare",
    title: "neuro-care.fr",
    subtitle: "Santé & neurodéveloppement",
    year: "2026",
    tags: ["Plateforme", "Annuaire vérifié", "Communauté"],
    stack: ["Next.js", "React", "PostgreSQL", "RGPD"],
    description: "Plateforme d'orientation pour les familles concernées par les troubles du neurodéveloppement : annuaire de professionnels vérifiés, forum d'entraide, simulateur d'aides et carte des lieux adaptés. Gratuit, sans inscription.",
    url: "https://neuro-care.fr",
    route: "/neurocare",
    color: "#5BA89D",
    gradient: "from-[#5BA89D] via-[#2C7A70] to-[#134B45]",
    heroImage: "/screenshots/neurocare-hero.webp",
    brief: "Trouver un orthophoniste, un psychomotricien ou un éducateur formé aux TND relève souvent du parcours du combattant : listes obsolètes, diplômes invérifiables, délais à rallonge. NeuroCare devait répondre à trois besoins d'un coup : trouver le bon professionnel, comprendre à quelles aides on a droit, et ne pas rester seul dans les démarches. Le tout gratuitement pour les familles, et conforme au RGPD sur des données de santé.",
    solution: "La plateforme s'est élargie bien au-delà de l'annuaire initial. Chaque professionnel passe désormais une vérification en quatre étapes, avec croisement du numéro RPPS / ADELI contre l'Annuaire Santé avant d'obtenir le badge « Vérifié ». Autour, nous avons ouvert un forum modéré, un simulateur d'aides financières (AEEH, PCH, CESU), une carte des lieux adaptés, un espace structures pour les cabinets et associations, un blog et des annonces. Hébergement en France, échanges chiffrés.",
    features: [
      "Vérification en 4 étapes, RPPS / ADELI contrôlés",
      "Recherche par spécialité, trouble ou ville",
      "Forum communautaire modéré, lecture libre",
      "Simulateur d’aides : AEEH, PCH, CESU",
      "Carte des lieux adaptés et annonces familles",
      "Espace structures : cabinets et associations",
      "Espace pro avec agenda et demandes de RDV",
      "Hébergé en France, RGPD, échanges chiffrés"
    ],
    metrics: [
      { value: "100%", label: "gratuit pour les familles" },
      { value: "4", label: "étapes de vérification" },
      { value: "30+", label: "villes couvertes" }
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: "from-[#134B45] to-[#2C7A70]",
        content: "Recherche en trois étapes, sans inscription",
        image: "/screenshots/neurocare-hero.webp"
      },
      {
        title: "Recherche",
        gradient: "from-[#2C7A70] to-[#5BA89D]",
        content: "Filtres par spécialité, trouble et ville",
        image: "/screenshots/neurocare-2.webp"
      },
      {
        title: "Forum",
        gradient: "from-[#5BA89D] to-[#2C7A70]",
        content: "Conseils, témoignages, questions, ressources",
        image: "/screenshots/neurocare-3.webp"
      },
      {
        title: "Simulateur d’aides",
        gradient: "from-[#2C7A70] to-[#134B45]",
        content: "AEEH, PCH et CESU en deux minutes",
        image: "/screenshots/neurocare-4.webp"
      }
    ]
  },
  {
    id: "lissage",
    title: "lissage-sur-mesure.com",
    subtitle: "Beauté & soins capillaires",
    year: "2025",
    tags: ["Site vitrine", "Dark luxe", "SEO local"],
    stack: ["Next.js", "Framer Motion", "Lenis", "Schema.org"],
    description: "Site vitrine haut de gamme pour un salon spécialisé en lissage sur mesure. Dark luxe, animations immersives et parcours guidé jusqu’à la prise de rendez-vous.",
    url: "https://www.lissage-sur-mesure.com",
    route: "/lissage",
    color: "#5B1A3A",
    gradient: "from-[#5B1A3A] via-[#7A2A4A] to-[#3D1228]",
    heroImage: "/screenshots/lissage-hero.webp",
    brief: "Lissage sur Mesure avait besoin d'un site vitrine à la hauteur de son positionnement premium. Le défi : traduire l'expertise capillaire et le savoir-faire artisanal en une expérience digitale élégante. Le site devait présenter la formule unique, les services de lissage personnalisé et la formation professionnelle certifiante, tout en véhiculant confiance et luxe.",
    solution: "Nous avons conçu un site vitrine immersif avec une esthétique dark luxe, des animations scroll fluides et une typographie serif élégante. L'architecture Next.js assure des performances optimales, tandis que Framer Motion apporte des transitions cinématiques. Chaque section guide le visiteur de la découverte de la formule jusqu'à la prise de rendez-vous.",
    features: [
      "Design dark luxe immersif",
      "Animations scroll avec Framer Motion",
      "Smooth scroll avec Lenis",
      "Optimisation SEO avec Schema.org",
      "Architecture Next.js performante",
      "Responsive mobile-first"
    ],
    metrics: [
      { value: "3", label: "piliers de savoir-faire" },
      { value: "1", label: "formule signature" },
      { value: "<1.5s", label: "temps de chargement" }
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: "from-[#5B1A3A] to-[#3D1228]",
        content: "Hero plein écran avec vidéo capillaire",
        image: "/screenshots/lissage-hero.webp"
      },
      {
        title: "Savoir-faire",
        gradient: "from-[#3D1228] to-[#5B1A3A]",
        content: "Trois piliers : Produits, Lissages, Formation",
        image: "/screenshots/lissage-2.webp"
      },
      {
        title: "La Formule",
        gradient: "from-[#5B1A3A] to-[#7A2A4A]",
        content: "Philosophie et formule unique sans compromis",
        image: "/screenshots/lissage-3.webp"
      },
      {
        title: "Actifs & Contact",
        gradient: "from-[#7A2A4A] to-[#5B1A3A]",
        content: "Composition des actifs et localisation salon",
        image: "/screenshots/lissage-4.webp"
      }
    ]
  },
  {
    id: "angele",
    title: "angele.store",
    subtitle: "Merch artiste Shopify",
    year: "2025",
    tags: ["E-commerce", "Shopify", "Musique"],
    stack: ["Shopify", "Liquid", "GTM", "Meta Pixel"],
    description: "Boutique e-commerce Shopify pour l'artiste belge Angèle. Merchandising officiel : T-shirts, hoodies, vinyles et accessoires, dans un univers pop assumé.",
    url: "https://angele.store",
    route: "/angele",
    color: "#7ECDB5",
    gradient: "from-[#7ECDB5] via-[#A8E6CF] to-[#C5F0DC]",
    heroImage: "/screenshots/angele-hero.webp",
    brief: "L'artiste belge Angèle avait besoin d'une boutique en ligne officielle pour sa ligne de merchandising : vêtements, vinyles et accessoires. Le site devait refléter son univers pop et coloré tout en offrant une expérience d'achat fluide et rapide pour ses fans à travers l'Europe.",
    solution: "Nous avons développé une boutique Shopify sur mesure avec un thème personnalisé. Navigation par catégories (T-shirts, Sweatshirts, CD & Vinyles, Accessoires), fiches produit détaillées avec sélecteur de taille, galerie d'images et gestion des stocks. Le tout optimisé pour le mobile et intégré aux outils marketing (newsletter, Facebook Pixel, Google Analytics).",
    features: [
      "Thème Shopify entièrement personnalisé",
      "Catalogue multi-catégories avec carrousel",
      "Fiches produit avec sélecteur taille et galerie",
      "Panier et checkout Shopify optimisés",
      "Intégration newsletter et marketing (Pixel, GTM)",
      "Design responsive mobile-first"
    ],
    metrics: [
      { value: "4", label: "univers produits" },
      { value: "EU", label: "livraison européenne" },
      { value: "100%", label: "mobile-first" }
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: "from-[#7ECDB5] to-[#A8E6CF]",
        content: "Catalogue T-shirts avec carrousel par catégorie",
        image: "/screenshots/angele-hero.webp"
      },
      {
        title: "Sweatshirts & Joggings",
        gradient: "from-[#A8E6CF] to-[#7ECDB5]",
        content: "Grille produits hoodies, crewnecks et joggings",
        image: "/screenshots/angele-2.webp"
      },
      {
        title: "Fiche produit",
        gradient: "from-[#7ECDB5] to-[#C5F0DC]",
        content: "Galerie photos, sélecteur taille et ajout panier",
        image: "/screenshots/angele-3.webp"
      },
      {
        title: "CD & Vinyles",
        gradient: "from-[#C5F0DC] to-[#7ECDB5]",
        content: "Collection vinyles et CD album Nonante-Cinq",
        image: "/screenshots/angele-4.webp"
      }
    ]
  },
  {
    id: "reuni",
    title: "reuni.com",
    subtitle: "Mode éthique française",
    year: "2025",
    tags: ["E-commerce", "Mode", "Éco-responsable"],
    stack: ["React", "Design system", "Headless"],
    description: "Plateforme e-commerce pour une marque de mode éthique et responsable. Design épuré à la française avec une expérience d'achat premium.",
    url: "https://reuni.com",
    route: "/reuni",
    color: "#C4A882",
    gradient: "from-[#C4A882] via-[#D4B892] to-[#E8D5B8]",
    heroImage: "/screenshots/reuni-hero.webp",
    brief: "Reuni avait besoin d'une plateforme e-commerce qui reflète ses valeurs : éthique, transparence et élégance. Le challenge était de créer une expérience d'achat haut de gamme tout en mettant en avant l'engagement éco-responsable de la marque. Chaque détail devait respirer l'authenticité et le savoir-faire français.",
    solution: "Nous avons conçu une architecture front-end performante avec un design system sur mesure. L'accent a été mis sur la vitesse de chargement, l'expérience mobile et les micro-interactions qui guident l'utilisateur vers la conversion.",
    features: [
      "Design responsive mobile-first",
      "Temps de chargement < 1.5s",
      "Catalogue produits avec filtres dynamiques",
      "Panier et checkout optimisés conversion",
      "Animations scroll fluides",
      "Score Lighthouse 98/100"
    ],
    metrics: [
      { value: "98", label: "score Lighthouse" },
      { value: "<1.5s", label: "temps de chargement" },
      { value: "100%", label: "mobile-first" }
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: "from-[#F5EDE3] to-[#E8D5B8]",
        content: "Hero immersif avec vidéo de la collection",
        image: "/screenshots/reuni-hero.webp"
      },
      {
        title: "Catalogue produits",
        gradient: "from-[#E8D5B8] to-[#D4C4A8]",
        content: "Grille produits avec filtres latéraux",
        image: "/screenshots/reuni-2.webp"
      },
      {
        title: "Fiche produit",
        gradient: "from-[#D4C4A8] to-[#C4B498]",
        content: "Galerie zoom + sélecteur taille/couleur",
        image: "/screenshots/reuni-3.webp"
      },
      {
        title: "Checkout",
        gradient: "from-[#C4B498] to-[#B4A488]",
        content: "Tunnel d'achat en 3 étapes",
        image: "/screenshots/reuni-4.webp"
      }
    ]
  },
  {
    id: "st-agni",
    title: "st-agni.com",
    subtitle: "Minimalisme premium",
    year: "2025",
    tags: ["E-commerce", "Luxe", "Headless"],
    stack: ["Shopify Plus", "Headless CMS", "React"],
    description: "Boutique en ligne luxe minimaliste pour la marque St. Agni. Focus sur l'expérience produit avec une navigation épurée et des visuels immersifs.",
    url: "https://st-agni.com",
    route: "/st-agni",
    color: "#8A8580",
    gradient: "from-[#E8E3DC] via-[#D8D3CC] to-[#C8C3BC]",
    heroImage: "/screenshots/st-agni-hero.webp",
    brief: "St. Agni recherchait un écrin digital à la hauteur de son positionnement luxe. La marque souhaitait une expérience immersive où le produit est roi, avec un minimalisme radical qui laisse respirer les visuels. L'enjeu : traduire le toucher et la qualité des matières à travers un écran.",
    solution: 'Une approche "content-first" avec des visuels plein écran, des transitions cinématiques et une architecture headless pour des performances maximales. Chaque interaction a été pensée pour renforcer le positionnement premium.',
    features: [
      "Architecture headless CMS",
      "Transitions de page cinématiques",
      "Galerie produits plein écran",
      "Navigation gestuelle mobile",
      "Lazy loading intelligent des images",
      "Intégration Shopify Plus"
    ],
    metrics: [
      { value: "360°", label: "vue produit" },
      { value: "Plus", label: "Shopify Plus" },
      { value: "100%", label: "headless" }
    ],
    mockups: [
      {
        title: "Homepage",
        gradient: "from-[#F0EDE8] to-[#E0DDD8]",
        content: "Diaporama plein écran haute couture",
        image: "/screenshots/st-agni-hero.webp"
      },
      {
        title: "Collection",
        gradient: "from-[#E0DDD8] to-[#D0CDC8]",
        content: "Grille asymétrique, visuels lifestyle",
        image: "/screenshots/stagni-2.webp"
      },
      {
        title: "Produit",
        gradient: "from-[#D0CDC8] to-[#C0BDB8]",
        content: "Vue 360° + zoom matière",
        image: "/screenshots/stagni-3.webp"
      },
      {
        title: "Panier",
        gradient: "from-[#C0BDB8] to-[#B0ADA8]",
        content: "Slide-over cart minimaliste",
        image: "/screenshots/stagni-4.webp"
      }
    ]
  }
];
const SITE_URL = "https://digitalzdev.com";
const SITE_NAME = "Digitalz Dev";
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;
const HOME = {
  path: "/",
  title: "Agence web et création de site internet | Digitalz Dev",
  description: "Agence web en France : création de site internet sur mesure, site vitrine, boutique Shopify et application métier. Devis sous 48 h."
};
const STATIC_PAGES = [
  HOME,
  {
    path: "/contact",
    title: "Devis gratuit pour votre projet de site internet | Digitalz Dev",
    description: "Décrivez votre projet de site internet en deux minutes : type de site, budget, délais. Réponse sous 24 à 48 h avec un devis adapté par notre agence web."
  },
  {
    path: "/mentions-legales",
    title: "Mentions légales | Digitalz Dev",
    description: "Mentions légales du site digitalzdev.com : éditeur, directeur de la publication, hébergeur et propriété intellectuelle."
  },
  {
    path: "/politique-confidentialite",
    title: "Politique de confidentialité | Digitalz Dev",
    description: "Comment Digitalz Dev collecte et traite vos données personnelles : finalités, durée de conservation, destinataires et exercice de vos droits."
  }
];
const PROJECT_PAGES = projects.map((project) => ({
  path: project.route,
  title: `${project.title}, ${project.subtitle.toLowerCase()} | Réalisation Digitalz Dev`,
  // La description du projet est déjà rédigée pour être lue : on la reprend,
  // en la bornant à la longueur qu'un extrait Google affiche réellement.
  description: truncate(
    `${project.description} Un projet conçu et développé par Digitalz Dev, agence web.`,
    158
  )
}));
const ALL_PAGES = [...STATIC_PAGES, ...PROJECT_PAGES];
const NOT_FOUND = {
  path: "/404",
  title: "Page introuvable | Digitalz Dev",
  description: "Cette page n'existe pas ou plus. Retrouvez nos réalisations et nos services sur digitalzdev.com."
};
function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[ ,;:]$/, "") + "…";
}
function seoForPath(pathname) {
  const clean = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return ALL_PAGES.find((page) => page.path === clean) ?? NOT_FOUND;
}
const canonicalFor = (path) => path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
function setMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
}
function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}
function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = seoForPath(pathname);
    const url = canonicalFor(page.path);
    document.title = page.title;
    setMeta('meta[name="description"]', {
      name: "description",
      content: page.description
    });
    setLink("canonical", url);
    setMeta('meta[property="og:title"]', { property: "og:title", content: page.title });
    setMeta('meta[property="og:description"]', {
      property: "og:description",
      content: page.description
    });
    setMeta('meta[property="og:url"]', { property: "og:url", content: url });
    setMeta('meta[property="og:image"]', { property: "og:image", content: DEFAULT_OG_IMAGE });
    setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: page.title });
    setMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: page.description
    });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: DEFAULT_OG_IMAGE });
    const isNotFound = page.path === "/404";
    setMeta('meta[name="robots"]', {
      name: "robots",
      content: isNotFound ? "noindex, follow" : "index, follow"
    });
  }, [pathname]);
  return null;
}
const scrollState = {
  /** Position de scroll en pixels */
  y: 0,
  /** Vitesse brute renvoyée par Lenis (px/frame) */
  velocity: 0,
  /** Vitesse normalisée et lissée, dans [-1, 1] environ */
  smoothVelocity: 0,
  /** Progression dans la page, dans [0, 1] */
  progress: 0
};
let lenis = null;
const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = () => typeof window !== "undefined" && (window.matchMedia("(max-width: 1024px)").matches || "ontouchstart" in window);
function initSmoothScroll() {
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  if (isTouch() || prefersReducedMotion()) {
    let last = window.scrollY;
    let raf2 = 0;
    const tick2 = () => {
      const y = window.scrollY;
      const v = y - last;
      last = y;
      scrollState.y = y;
      scrollState.velocity = v;
      scrollState.smoothVelocity += (clamp(v / 60, -1, 1) - scrollState.smoothVelocity) * 0.1;
      scrollState.progress = y / maxScroll();
      raf2 = requestAnimationFrame(tick2);
    };
    raf2 = requestAnimationFrame(tick2);
    return () => cancelAnimationFrame(raf2);
  }
  const instance = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6
  });
  lenis = instance;
  window.__lenis = instance;
  instance.on("scroll", ({ scroll, velocity }) => {
    scrollState.y = scroll;
    scrollState.velocity = velocity;
    scrollState.progress = scroll / maxScroll();
  });
  let raf = 0;
  const tick = (time) => {
    instance.raf(time);
    scrollState.smoothVelocity += (clamp(scrollState.velocity / 60, -1, 1) - scrollState.smoothVelocity) * 0.08;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    instance.destroy();
    lenis = null;
    window.__lenis = null;
  };
}
function scrollTo(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, options);
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: options.immediate ? "auto" : "smooth" });
  } else if (el instanceof HTMLElement) {
    const top = el.getBoundingClientRect().top + window.scrollY + (options.offset ?? 0);
    window.scrollTo({ top, behavior: options.immediate ? "auto" : "smooth" });
  }
}
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
function SmoothScroll({ children }) {
  useEffect(() => initSmoothScroll(), []);
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const lenis2 = window.__lenis;
    if (lenis2 && typeof lenis2.scrollTo === "function") {
      lenis2.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [pathname]);
  return null;
}
const EASE_OUT = [0.16, 1, 0.3, 1];
const EASE_IN_OUT = [0.76, 0, 0.24, 1];
const DURATION = {
  base: 0.7
};
const VIEWPORT = { once: true, margin: "-12% 0px -12% 0px" };
let premierAffichage = true;
function PageTransition({ children }) {
  const reduced = useReducedMotion();
  const [sansAnimation] = useState(() => premierAffichage);
  useEffect(() => {
    premierAffichage = false;
  }, []);
  useLayoutEffect(() => {
    scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, []);
  if (reduced || sansAnimation) return /* @__PURE__ */ jsx(Fragment, { children });
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3, ease: EASE_IN_OUT },
      children
    }
  );
}
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      motion.nav,
      {
        className: `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-surface/80 backdrop-blur-xl border-b border-surface-border" : ""}`,
        initial: { y: -100 },
        animate: { y: 0 },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/",
              className: "group flex min-h-[44px] min-w-0 items-center gap-2 sm:gap-3",
              children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "/logo.png",
                    alt: "Digitalz Dev",
                    className: "w-10 h-10 rounded-full"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "truncate font-display font-semibold text-[13px] sm:text-sm tracking-[0.12em] sm:tracking-[0.15em] text-text-primary group-hover:text-accent transition-colors", children: "DIGITALZ DEV" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-6", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/",
                className: "-my-3 inline-flex min-h-[44px] items-center py-3 text-sm text-text-secondary transition-colors hover:text-text-primary",
                children: "Accueil"
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "/#projets",
                className: "-my-3 inline-flex min-h-[44px] items-center py-3 text-sm text-text-secondary transition-colors hover:text-text-primary",
                children: "Projets"
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "/#agence",
                className: "-my-3 inline-flex min-h-[44px] items-center py-3 text-sm text-text-secondary transition-colors hover:text-text-primary",
                children: "L'agence"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/contact",
                className: "-my-3 inline-flex min-h-[44px] items-center py-3 text-sm text-accent transition-opacity hover:opacity-80",
                children: "Contact"
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://quiz.digitalzdev.com",
                className: "inline-flex min-h-[44px] items-center rounded-full bg-accent px-5 font-display text-sm font-semibold text-surface transition-colors hover:bg-accent-hover",
                children: "Démarrer"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex shrink-0 md:hidden items-center gap-1", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setMenuOpen(!menuOpen),
              className: "flex h-11 w-11 flex-col items-center justify-center gap-1.5",
              "aria-label": "Menu",
              children: [
                /* @__PURE__ */ jsx(
                  motion.span,
                  {
                    className: "w-6 h-0.5 bg-text-primary block",
                    animate: { rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.span,
                  {
                    className: "w-6 h-0.5 bg-text-primary block",
                    animate: { opacity: menuOpen ? 0 : 1 }
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.span,
                  {
                    className: "w-6 h-0.5 bg-text-primary block",
                    animate: { rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }
                  }
                )
              ]
            }
          ) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AnimatePresence, { children: menuOpen && /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "fixed inset-0 z-40 md:hidden overflow-y-auto overscroll-contain bg-surface/95 backdrop-blur-xl flex flex-col items-center justify-center gap-2 px-6 py-24 sm:gap-4",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/",
              className: "flex min-h-[44px] items-center px-4 font-display text-2xl font-semibold text-text-primary",
              children: "Accueil"
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/#projets",
              className: "flex min-h-[44px] items-center px-4 font-display text-2xl font-semibold text-text-primary",
              children: "Projets"
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/#agence",
              className: "flex min-h-[44px] items-center px-4 font-display text-2xl font-semibold text-text-primary",
              children: "L'agence"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/contact",
              className: "flex min-h-[44px] items-center px-4 font-display text-2xl font-semibold text-accent",
              children: "Contact"
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://quiz.digitalzdev.com",
              className: "mt-4 flex min-h-[44px] items-center rounded-full bg-accent px-8 font-display text-lg font-semibold text-surface",
              children: "Démarrer"
            }
          )
        ]
      }
    ) })
  ] });
}
function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) {
      setVisible(true);
    }
  }, []);
  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };
  return /* @__PURE__ */ jsx(AnimatePresence, { children: visible && /* @__PURE__ */ jsx(
    motion.div,
    {
      className: "fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6",
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 },
      transition: { duration: 0.4 },
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto bg-surface-card border border-surface-border rounded-xl p-5 md:p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center gap-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-text-secondary text-sm leading-relaxed flex-1", children: [
          "Ce site ne dépose aucun cookie publicitaire et ne vous suit pas. Le stockage local retient seulement que vous avez lu ce message. Le calendrier de prise de rendez-vous est fourni par Calendly, et ne se charge que si vous l'ouvrez.",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/politique-confidentialite",
              className: "text-accent underline",
              children: "Politique de confidentialité"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: accept,
            className: "px-6 py-2.5 bg-accent text-surface text-sm font-display font-semibold rounded-lg hover:opacity-90 transition-all whitespace-nowrap",
            children: "Compris"
          }
        )
      ] })
    }
  ) });
}
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-950 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/login", replace: true });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
let webglSupport = null;
function isWebGLAvailable() {
  var _a;
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    (_a = gl == null ? void 0 : gl.getExtension("WEBGL_lose_context")) == null ? void 0 : _a.loseContext();
    webglSupport = !!gl;
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}
const pixelRatio = () => Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2);
function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(pixelRatio());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}
function createRenderLoop(canvas, frame) {
  const clock = new THREE.Clock();
  let raf = 0;
  let visible = true;
  let onScreen = true;
  const running = () => visible && onScreen;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const delta = Math.min(clock.getDelta(), 1 / 30);
    if (!running()) return;
    frame(clock.getElapsedTime(), delta);
  };
  const onVisibility = () => {
    visible = document.visibilityState === "visible";
  };
  document.addEventListener("visibilitychange", onVisibility);
  const observer = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
    },
    { rootMargin: "200px" }
  );
  observer.observe(canvas);
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", onVisibility);
    observer.disconnect();
  };
}
function observeResize(element, onResize) {
  const observer = new ResizeObserver((entries) => {
    const rect2 = entries[0].contentRect;
    if (rect2.width > 0 && rect2.height > 0) onResize(rect2.width, rect2.height);
  });
  observer.observe(element);
  const rect = element.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) onResize(rect.width, rect.height);
  return () => observer.disconnect();
}
const readVar = (name) => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const [r, g, b] = raw.split(/\s+/).map(Number);
  const color = new THREE.Color();
  if ([r, g, b].every((n) => Number.isFinite(n))) {
    color.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
  }
  return color;
};
function readPalette() {
  return {
    surface: readVar("--surface"),
    accent: readVar("--accent"),
    text: readVar("--text-primary"),
    isDark: document.documentElement.classList.contains("dark")
  };
}
function watchTheme(onChange) {
  const observer = new MutationObserver(() => onChange(readPalette()));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"]
  });
  return () => observer.disconnect();
}
function disposeScene(scene) {
  scene.traverse((object) => {
    const mesh = object;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material;
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    for (const mat of materials) {
      for (const value of Object.values(mat)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      const uniforms = mat.uniforms;
      if (uniforms) {
        for (const uniform of Object.values(uniforms)) {
          if (uniform.value instanceof THREE.Texture) uniform.value.dispose();
        }
      }
      mat.dispose();
    }
  });
  scene.clear();
}
const offsetFor = (from, distance) => {
  switch (from) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: -distance };
    case "right":
      return { x: distance };
    default:
      return {};
  }
};
function Reveal({
  children,
  className,
  delay = 0,
  duration = DURATION.base,
  from = "up",
  distance = 40,
  blur = false,
  scale = false,
  once = true
}) {
  const reduced = useReducedMotion();
  if (reduced) return /* @__PURE__ */ jsx("div", { className, children });
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className,
      initial: {
        opacity: 0,
        ...offsetFor(from, distance),
        ...scale ? { scale: 0.94 } : {},
        ...blur ? { filter: "blur(10px)" } : {}
      },
      whileInView: {
        opacity: 1,
        x: 0,
        y: 0,
        ...scale ? { scale: 1 } : {},
        ...blur ? { filter: "blur(0px)" } : {}
      },
      viewport: { ...VIEWPORT, once },
      transition: { duration, delay, ease: EASE_OUT },
      children
    }
  );
}
const container = (stagger, delay) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay }
  }
});
const item = {
  hidden: { y: "110%", rotate: 4, opacity: 0 },
  visible: {
    y: "0%",
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: EASE_OUT }
  }
};
function segmentsOf(word) {
  return word.match(/[^-.]*[-.]+|[^-.]+/g) ?? [word];
}
function SplitText({
  text,
  className,
  by = "word",
  delay = 0,
  stagger = by === "char" ? 0.022 : 0.06,
  immediate = false,
  as: Tag = "span"
}) {
  const reduced = useReducedMotion();
  if (reduced) return /* @__PURE__ */ jsx(Tag, { className, children: text });
  const words = text.split(" ");
  const animationProps = immediate ? { animate: "visible" } : { whileInView: "visible", viewport: VIEWPORT };
  return /* @__PURE__ */ jsx(Tag, { className, "aria-label": text, children: /* @__PURE__ */ jsx(
    motion.span,
    {
      className: "inline",
      initial: "hidden",
      variants: container(stagger, delay),
      "aria-hidden": true,
      ...animationProps,
      children: words.map((word, wordIndex) => /* @__PURE__ */ jsx(
        "span",
        {
          className: "inline-block overflow-hidden align-bottom py-[0.12em] -my-[0.12em]",
          children: by === "char" ? /* @__PURE__ */ jsxs("span", { className: "inline-block", children: [
            segmentsOf(word).map((segment, segmentIndex) => (
              // Chaque fragment est insécable : le retour à la ligne ne
              // peut tomber qu'après un trait d'union ou un point. Sans
              // ça, un nom de domaine long se coupe en plein milieu d'un
              // mot, les lettres étant des blocs indépendants.
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "inline-block whitespace-nowrap",
                  children: [...segment].map((char, charIndex) => /* @__PURE__ */ jsx(
                    motion.span,
                    {
                      className: "inline-block",
                      variants: item,
                      children: char
                    },
                    `${char}-${charIndex}`
                  ))
                },
                `${segment}-${segmentIndex}`
              )
            )),
            wordIndex < words.length - 1 && /* @__PURE__ */ jsx("span", { className: "inline-block whitespace-pre", children: " " })
          ] }) : /* @__PURE__ */ jsxs(motion.span, { className: "inline-block", variants: item, children: [
            word,
            wordIndex < words.length - 1 && " "
          ] })
        },
        `${word}-${wordIndex}`
      ))
    }
  ) });
}
function Parallax({
  children,
  className,
  speed = 0.15,
  axis = "y",
  zoom = false
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 5e-4
  });
  const distance = speed * 100;
  const offset = useTransform(smooth, [0, 1], [`${distance}%`, `${-distance}%`]);
  const scale = useTransform(smooth, [0, 0.5, 1], [1.12, 1.02, 1.12]);
  if (reduced) return /* @__PURE__ */ jsx("div", { className, children });
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      ref,
      className,
      style: {
        ...axis === "y" ? { y: offset } : { x: offset },
        ...zoom ? { scale } : {}
      },
      children
    }
  );
}
function Marquee({
  items,
  className = "",
  speed = 40,
  direction = 1,
  separator = ""
}) {
  const trackRef = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    if (!track) return;
    let offset = 0;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const delta = Math.min((now - last) / 1e3, 0.05);
      last = now;
      const boost = scrollState.smoothVelocity * 340;
      offset += (speed * direction + boost) * delta;
      const half = track.scrollWidth / 2;
      if (half > 0) offset = (offset % half + half) % half;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, direction, reduced]);
  const sequence = [...items, ...items];
  return /* @__PURE__ */ jsx("div", { className: `overflow-hidden ${className}`, "aria-hidden": true, children: /* @__PURE__ */ jsx("div", { ref: trackRef, className: "flex w-max items-center will-change-transform", children: sequence.map((item2, index) => /* @__PURE__ */ jsxs("span", { className: "flex items-center whitespace-nowrap", children: [
    item2,
    /* @__PURE__ */ jsx("span", { className: "mx-8 text-accent opacity-60 md:mx-14", children: separator })
  ] }, `${item2}-${index}`)) }) });
}
function Counter({ value, className, duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduced = useReducedMotion();
  const match = value.match(/^(\D*?)([\d.,]+)(.*)$/);
  const prefix = (match == null ? void 0 : match[1]) ?? "";
  const target = match ? parseFloat(match[2].replace(",", ".")) : null;
  const suffix = (match == null ? void 0 : match[3]) ?? "";
  const decimals = (match == null ? void 0 : match[2].includes(".")) || (match == null ? void 0 : match[2].includes(",")) ? 1 : 0;
  const [display, setDisplay] = useState(target === null || reduced ? null : 0);
  useEffect(() => {
    if (target === null || reduced || !inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / (duration * 1e3), 1);
      const eased = 1 - Math.pow(2, -10 * t);
      setDisplay(target * (t === 1 ? 1 : eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, reduced]);
  if (target === null || display === null) {
    return /* @__PURE__ */ jsx("span", { ref, className, children: value });
  }
  return /* @__PURE__ */ jsxs("span", { ref, className, children: [
    prefix,
    /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: display.toFixed(decimals) }),
    suffix
  ] });
}
function Magnetic({ children, className, strength = 0.35 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.5 });
  const handleMove = (event) => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      ref,
      className,
      style: { x: springX, y: springY },
      onMouseMove: handleMove,
      onMouseLeave: reset,
      children
    }
  );
}
const HeroScene = lazy(() => import("./assets/HeroScene-CwDnVrpC.js"));
const KEYWORDS = [
  "E-COMMERCE",
  "SHOPIFY",
  "META ADS",
  "NEXT.JS",
  "GOOGLE ADS",
  "DESIGN SYSTEM",
  "WEBGL",
  "DASHBOARD",
  "IDENTITÉ",
  "PERFORMANCE",
  "SEO",
  "CONVERSION"
];
function Hero() {
  const containerRef = useRef(null);
  const [webgl, setWebgl] = useState(false);
  useEffect(() => setWebgl(isWebGLAvailable()), []);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.35, 0.6], [1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], ["0%", "-18%"]);
  const marqueeOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  return /* @__PURE__ */ jsx("section", { ref: containerRef, className: "relative h-[190vh] bg-surface", children: /* @__PURE__ */ jsxs("div", { className: "sticky top-0 h-screen overflow-hidden bg-surface", children: [
    webgl ? /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(HeroScene, { className: "absolute inset-0 opacity-40 lg:left-[45%] lg:right-[2%] lg:opacity-100" }) }) : /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: "absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 lg:left-[72%]",
        style: {
          background: "radial-gradient(circle at 35% 30%, rgb(var(--accent)), transparent 68%)",
          filter: "blur(40px)"
        }
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: "pointer-events-none absolute inset-0 lg:hidden",
        style: {
          background: "radial-gradient(ellipse 78% 52% at 50% 48%, rgb(var(--surface) / 0.94) 0%, rgb(var(--surface) / 0.74) 55%, rgb(var(--surface) / 0.25) 85%)"
        }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 flex h-full items-center", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center lg:items-start lg:text-left",
        style: { opacity: contentOpacity, y: contentY },
        children: [
          /* @__PURE__ */ jsxs("h1", { className: "max-w-3xl font-display text-[13vw] font-bold leading-[0.88] tracking-tight sm:text-[9vw] lg:text-[min(6.4vw,118px)]", children: [
            /* @__PURE__ */ jsx(
              SplitText,
              {
                as: "span",
                by: "char",
                immediate: true,
                text: "Digitalz Dev",
                delay: 0.15,
                className: "block text-text-primary"
              }
            ),
            /* @__PURE__ */ jsx(
              SplitText,
              {
                as: "span",
                by: "char",
                immediate: true,
                text: "agence web",
                delay: 0.45,
                className: "block text-accent"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            motion.p,
            {
              className: "mt-8 max-w-md text-base leading-relaxed text-text-secondary md:text-lg",
              initial: { opacity: 0, y: 24 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.9, delay: 0.9, ease: EASE_OUT },
              children: "Sites vitrines, boutiques Shopify et plateformes métier. Conçus, développés, puis portés par vos campagnes Meta Ads et Google Ads."
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        className: "absolute bottom-8 left-0 right-0 z-10",
        style: { opacity: marqueeOpacity },
        children: /* @__PURE__ */ jsx(
          Marquee,
          {
            items: KEYWORDS,
            speed: 28,
            className: "border-y border-surface-border/60 bg-surface/40 py-3 font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-text-muted backdrop-blur-sm"
          }
        )
      }
    )
  ] }) });
}
function ProjectsIndex({ projects: projects2 }) {
  const [hovered, setHovered] = useState(null);
  return /* @__PURE__ */ jsx("ul", { className: "mx-auto max-w-6xl px-6", children: projects2.map((project, index) => {
    const isHovered = hovered === project.id;
    return /* @__PURE__ */ jsx(
      motion.li,
      {
        className: "border-t border-surface-border last:border-b",
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: VIEWPORT,
        transition: { duration: 0.6, delay: index * 0.05, ease: EASE_OUT },
        onMouseEnter: () => setHovered(project.id),
        onMouseLeave: () => setHovered(null),
        children: /* @__PURE__ */ jsxs(
          Link,
          {
            to: project.route,
            className: "group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-6 md:grid-cols-[1fr_auto_auto] md:gap-x-10 md:py-8",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 md:col-start-1 md:row-start-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "truncate font-display text-lg font-bold text-accent transition-colors group-hover:text-accent-hover sm:text-xl md:text-3xl", children: project.title }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 truncate text-sm text-text-secondary", children: project.subtitle })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "col-span-2 row-start-2 mt-4 md:col-span-1 md:col-start-2 md:row-start-1 md:mt-0", children: [
                /* @__PURE__ */ jsx("div", { className: "flex gap-2 md:hidden", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: project.heroImage,
                    alt: "",
                    loading: "lazy",
                    className: "h-32 w-full rounded-lg object-cover object-top"
                  }
                ) }),
                /* @__PURE__ */ jsx(AnimatePresence, { children: isHovered && /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    className: "hidden gap-2 md:flex",
                    initial: { opacity: 0, width: 0 },
                    animate: { opacity: 1, width: "auto" },
                    exit: { opacity: 0, width: 0 },
                    transition: { duration: 0.4, ease: EASE_OUT },
                    children: project.mockups.slice(0, 3).map((mockup) => /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: mockup.image,
                        alt: "",
                        loading: "lazy",
                        className: "h-16 w-28 shrink-0 rounded-md object-cover object-top"
                      },
                      mockup.title
                    ))
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "col-start-2 row-start-1 flex items-center gap-3 md:col-start-3", children: [
                /* @__PURE__ */ jsx("div", { className: "hidden gap-2 lg:flex", children: project.tags.slice(0, 2).map((tag) => /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "rounded-full border border-surface-border px-3 py-1 text-[11px] uppercase tracking-wider text-text-secondary",
                    children: tag
                  },
                  tag
                )) }),
                /* @__PURE__ */ jsx("span", { className: "text-text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent", children: "→" })
              ] })
            ]
          }
        )
      },
      project.id
    );
  }) });
}
const GalleryScene = lazy(() => import("./assets/GalleryScene-Bqq0HVxz.js"));
const VH_PER_PROJECT = 85;
const MIN_GALLERY_WIDTH = 900;
function ProjectsSection() {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const infoRef = useRef(null);
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [wide, setWide] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${MIN_GALLERY_WIDTH}px)`);
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const useWebGL = wide && !failed && isWebGLAvailable();
  const project = projects[clamp(active, 0, projects.length - 1)];
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { stiffness: 400, damping: 32, mass: 0.4 });
  const smoothY = useSpring(cursorY, { stiffness: 400, damping: 32, mass: 0.4 });
  const trackCursor = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    cursorX.set(event.clientX - rect.left);
    cursorY.set(event.clientY - rect.top);
  };
  const goToProject = useCallback((index) => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const distance = track.offsetHeight - window.innerHeight;
    const ratio = index / Math.max(projects.length - 1, 1);
    scrollTo(top + distance * ratio, { duration: 1.1 });
  }, []);
  const openProject = useCallback(
    (index) => navigate(projects[index].route),
    [navigate]
  );
  useEffect(() => {
    if (!useWebGL) return;
    const onKey = (event) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const pinned = rect.top <= 1 && rect.bottom >= window.innerHeight;
      if (!pinned) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToProject(Math.min(active + 1, projects.length - 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToProject(Math.max(active - 1, 0));
      } else if (event.key === "Enter") {
        openProject(active);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, useWebGL, goToProject, openProject]);
  const trackHeight = useMemo(
    () => `${projects.length * VH_PER_PROJECT}vh`,
    []
  );
  return /* @__PURE__ */ jsxs("section", { id: "projets", className: "relative bg-surface", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-6 pb-16 pt-24 md:pb-24 md:pt-32", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-8 md:flex-row md:items-end md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent", children: "Réalisations" }) }),
        /* @__PURE__ */ jsx(
          SplitText,
          {
            as: "h2",
            by: "char",
            text: "Nos réalisations",
            delay: 0.1,
            className: "mt-5 block font-display text-4xl font-bold leading-[0.95] tracking-tight text-text-primary md:text-7xl"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Reveal, { delay: 0.2, className: "max-w-sm", children: [
        /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: "Des boutiques Shopify aux plateformes métier. Chaque projet part d'un problème concret et se juge sur ce qu'il change une fois en ligne." }),
        /* @__PURE__ */ jsx(Magnetic, { className: "mt-6 inline-block", children: /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://quiz.digitalzdev.com",
            className: "inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 font-display text-sm font-semibold tracking-wider text-surface transition-opacity hover:opacity-90",
            children: "GÉNÉRER MA DÉMO GRATUITE"
          }
        ) })
      ] })
    ] }) }),
    useWebGL ? /* @__PURE__ */ jsx("div", { ref: trackRef, className: "relative", style: { height: trackHeight }, children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "sticky top-0 h-screen overflow-hidden",
        onMouseMove: trackCursor,
        children: [
          /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(
            GalleryScene,
            {
              projects,
              trackRef,
              onActiveChange: setActive,
              onHoverChange: setHovering,
              onSelect: openProject,
              onUnavailable: () => setFailed(true),
              infoRef,
              className: "absolute inset-0"
            }
          ) }),
          /* @__PURE__ */ jsx(
            "div",
            {
              ref: infoRef,
              className: "pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-10 [@media(max-height:700px)]:pb-5 md:px-12 md:pb-14",
              children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex w-full max-w-[1600px] flex-col gap-6 md:flex-row md:items-end md:justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "flex min-h-[13rem] flex-1 flex-col justify-end [@media(max-height:700px)]:min-h-0 md:min-h-[14rem]", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 28 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -18 },
                    transition: { duration: 0.5, ease: EASE_OUT },
                    className: "max-w-2xl",
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "mb-4 [@media(max-height:700px)]:mb-2", children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary", children: project.subtitle }) }),
                      /* @__PURE__ */ jsx(
                        "h3",
                        {
                          className: `font-display font-bold tracking-tight text-accent ${project.title.length > 19 ? "text-3xl md:text-5xl" : "text-4xl md:text-6xl"}`,
                          children: project.title
                        }
                      ),
                      /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-xl text-text-secondary [@media(max-height:700px)]:mt-2", children: project.description }),
                      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-3 [@media(max-height:700px)]:mt-3", children: [
                        project.tags.map((tag) => /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: "rounded-full border border-surface-border bg-surface-card/60 px-3 py-1 text-[11px] uppercase tracking-wider text-text-secondary backdrop-blur-sm",
                            children: tag
                          },
                          tag
                        )),
                        /* @__PURE__ */ jsxs(
                          Link,
                          {
                            to: project.route,
                            className: "pointer-events-auto ml-1 inline-flex items-center gap-2 border-b border-accent/40 pb-0.5 font-display text-sm font-semibold text-accent transition-colors hover:border-accent",
                            children: [
                              "Voir le projet ",
                              /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "→" })
                            ]
                          }
                        )
                      ] })
                    ]
                  },
                  project.id
                ) }) }),
                /* @__PURE__ */ jsx("div", { className: "hidden shrink-0 items-center gap-2 pb-1 md:flex", children: projects.map((item2, index) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => goToProject(index),
                    "aria-label": `Aller au projet ${item2.title}`,
                    "aria-current": index === active,
                    className: "pointer-events-auto group flex h-8 items-center px-1",
                    children: /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `block h-px transition-all duration-500 ${index === active ? "w-10 bg-accent" : "w-5 bg-text-muted group-hover:w-8 group-hover:bg-text-secondary"}`
                      }
                    )
                  },
                  item2.id
                )) })
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "pointer-events-none absolute left-0 top-0 z-10 -translate-x-1/2 -translate-y-1/2",
              style: { x: smoothX, y: smoothY },
              animate: { scale: hovering ? 1 : 0, opacity: hovering ? 1 : 0 },
              transition: { duration: 0.25, ease: EASE_OUT },
              children: /* @__PURE__ */ jsx("span", { className: "block rounded-full bg-accent px-5 py-5 font-display text-[11px] font-bold uppercase tracking-widest text-white", children: "Voir" })
            }
          )
        ]
      }
    ) }) : /* @__PURE__ */ jsx(ProjectsIndex, { projects })
  ] });
}
const SERVICES$1 = [
  {
    title: "Site vitrine sur mesure",
    lead: "Pour présenter une activité et déclencher la prise de contact.",
    body: "Nous concevons un site internet taillé pour votre métier plutôt qu'un gabarit repeint : arborescence, rédaction, direction artistique et développement. Chaque page vise une intention de recherche précise et mène à une action claire, appel, formulaire ou prise de rendez-vous.",
    points: [
      "Maquettes validées avant la première ligne de code",
      "Rédaction et structure orientées référencement naturel",
      "Formulaire de contact et suivi des demandes",
      "Formation à la prise en main, vous restez autonome"
    ]
  },
  {
    title: "Boutique e-commerce Shopify",
    lead: "Pour vendre en ligne sans se battre contre son propre site.",
    body: "Thème Shopify développé sur mesure, fiches produits pensées pour la conversion, tunnel d'achat réduit au strict nécessaire et paiements Shop Pay, PayPal, Klarna et carte bancaire. Nous branchons ensuite vos outils marketing pour que chaque visite compte.",
    points: [
      "Thème sur mesure, pas de gabarit du commerce",
      "Fiches produits, packs et ventes additionnelles",
      "Capture e-mail et scénarios automatisés",
      "Suivi des ventes et des conversions"
    ]
  },
  {
    title: "Refonte de site internet",
    lead: "Pour un site qui ne convertit plus, ou qui ne suit plus.",
    body: "Nous partons de l'existant : ce qui fonctionne, ce qui coince, ce que disent vos statistiques. La refonte préserve votre référencement acquis grâce à un plan de redirections complet, et corrige ce qui vous coûtait des visiteurs, notamment la lenteur et le confort de lecture sur mobile.",
    points: [
      "Audit du site actuel, contenus et performances",
      "Plan de redirections pour ne rien perdre en référencement",
      "Reprise et réécriture des contenus existants",
      "Mise en conformité RGPD et accessibilité"
    ]
  },
  {
    title: "Application web et dashboard",
    lead: "Pour outiller une activité que les tableurs ne suivent plus.",
    body: "Quand le besoin dépasse le site web, nous développons l'outil métier : espace client, back-office, tableau de bord, facturation, automatisations. Les mêmes personnes conçoivent et développent, ce qui évite le jeu de téléphone entre agence et prestataire technique.",
    points: [
      "Espaces client et back-office sur mesure",
      "Tableaux de bord et indicateurs métier",
      "Automatisations et intégrations tierces",
      "Applications iOS lorsque le mobile est central"
    ]
  },
  {
    title: "Meta Ads et Google Ads",
    lead: "Pour aller chercher le trafic que le site ne capte pas seul.",
    body: "Un site sans visiteurs ne sert à rien. Nous mettons en place et pilotons vos campagnes : structure des comptes, audiences, rédaction et création des annonces, arbitrages de budget. Les conversions sont mesurées, pour savoir ce qui rapporte et ce qui coûte.",
    points: [
      "Création et structuration des comptes publicitaires",
      "Annonces, visuels et audiences",
      "Suivi des conversions et attribution",
      "Rapports lisibles, sans jargon inutile"
    ]
  },
  {
    title: "Référencement naturel",
    lead: "Pour exister sur Google au-delà de votre propre nom.",
    body: "Le référencement se construit dès la conception : structure des URL, balises, données structurées, temps de chargement, maillage interne et contenus qui répondent aux questions réelles de vos clients. Nous livrons un site déjà prêt, puis nous suivons les positions.",
    points: [
      "Architecture et balisage optimisés dès le départ",
      "Données structurées et extraits enrichis",
      "Temps de chargement et Core Web Vitals",
      "Suivi des positions et corrections continues"
    ]
  }
];
function ServicesSection() {
  return /* @__PURE__ */ jsx("section", { id: "services", className: "relative bg-surface py-24 md:py-36", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent", children: "Nos services" }) }),
        /* @__PURE__ */ jsx(
          SplitText,
          {
            as: "h2",
            by: "word",
            text: "Une agence web qui conçoit, développe et fait connaître votre site",
            delay: 0.1,
            className: "mt-5 block font-display text-3xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-4xl lg:text-5xl"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(Reveal, { delay: 0.2, className: "max-w-sm lg:shrink-0", children: /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-text-secondary", children: "Création de site internet, boutique en ligne, refonte, outil métier et campagnes publicitaires. Un projet de site web se juge sur ce qu'il rapporte une fois en ligne, pas sur sa maquette." }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-14 grid gap-6 md:mt-20 md:grid-cols-2 md:gap-8", children: SERVICES$1.map((service, index) => /* @__PURE__ */ jsxs(
      motion.article,
      {
        className: "flex flex-col rounded-2xl border border-surface-border bg-surface-card p-7 md:h-[22rem] md:p-9",
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: VIEWPORT,
        transition: { duration: 0.7, delay: index % 2 * 0.1, ease: EASE_OUT },
        children: [
          /* @__PURE__ */ jsx("h3", { className: "font-display text-xl font-bold text-text-primary md:text-2xl", children: service.title }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 font-display text-sm font-semibold text-accent", children: service.lead }),
          /* @__PURE__ */ jsxs("div", { className: "relative mt-4 min-h-0 flex-1 md:overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "h-full md:overflow-y-auto md:pr-3", children: [
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-text-secondary", children: service.body }),
              /* @__PURE__ */ jsx("ul", { className: "mt-6 space-y-2 md:pb-6", children: service.points.map((point) => /* @__PURE__ */ jsxs(
                "li",
                {
                  className: "flex items-baseline gap-3 text-sm text-text-secondary",
                  children: [
                    /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-accent", children: "·" }),
                    point
                  ]
                },
                point
              )) })
            ] }),
            /* @__PURE__ */ jsx(
              "div",
              {
                "aria-hidden": true,
                className: "pointer-events-none absolute inset-x-0 bottom-0 hidden h-10 bg-gradient-to-t from-surface-card to-transparent md:block"
              }
            )
          ] })
        ]
      },
      service.title
    )) }),
    /* @__PURE__ */ jsxs(Reveal, { delay: 0.1, className: "mt-14 text-center md:mt-20", children: [
      /* @__PURE__ */ jsx("p", { className: "mx-auto max-w-2xl leading-relaxed text-text-secondary", children: "Vous avez un projet de site internet, une boutique à ouvrir ou un site à refondre ? Décrivez-le en deux minutes, nous revenons vers vous sous 24 à 48 heures avec un devis adapté." }),
      /* @__PURE__ */ jsx(Magnetic, { className: "mt-8 inline-block", children: /* @__PURE__ */ jsx(
        Link,
        {
          to: "/contact",
          className: "inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-sm font-semibold tracking-wider text-surface transition-opacity hover:opacity-90",
          children: "DÉCRIRE MON PROJET"
        }
      ) })
    ] })
  ] }) });
}
const testimonials = [
  {
    projectId: "kalira",
    company: "Kalira",
    sector: "Soins capillaires",
    delivered: "Boutique Shopify sur mesure autour d'un rituel en trois temps. Direction artistique éditoriale, packs et duos, capture e-mail gamifiée et scénarios Klaviyo. Cinq références en ligne, paiement Shop Pay, PayPal, Klarna et carte.",
    quote: null,
    author: null,
    image: "/screenshots/kalira-hero.webp",
    route: "/kalira",
    color: "#7A6A55"
  },
  {
    projectId: "sourcing",
    company: "The Sourcing",
    sector: "Sourcing et production",
    delivered: "Vitrine bilingue français et anglais servie depuis un même arbre de routes Next.js. Sept pôles de services, une méthode en six étapes révélée au scroll, et deux pages dédiées au sourcing en Chine et à la logistique.",
    quote: null,
    author: null,
    image: "/screenshots/sourcing-hero.webp",
    route: "/the-sourcing",
    color: "#B8B8B8"
  },
  {
    projectId: "drive",
    company: "DRIVE",
    sector: "Réseau de franchisés",
    delivered: "Portail d'équipement privé pour les dix agences du réseau. Un kit d'ouverture permet d'équiper une nouvelle agence en une seule commande, le reste du catalogue est rangé par zone du point de vente, à tarifs cadrés par la centrale.",
    quote: null,
    author: null,
    image: "/screenshots/drive-hero.webp",
    route: "/drive",
    color: "#8A93A0"
  },
  {
    projectId: "neurocare",
    company: "NeuroCare",
    sector: "Santé et neurodéveloppement",
    delivered: "Plateforme d'orientation pour les familles : annuaire de professionnels vérifiés en quatre étapes contre l'Annuaire Santé, forum modéré, simulateur d'aides AEEH, PCH et CESU, carte des lieux adaptés. Hébergé en France, conforme RGPD.",
    quote: null,
    author: null,
    image: "/screenshots/neurocare-hero.webp",
    route: "/neurocare",
    color: "#5BA89D"
  },
  {
    projectId: "lissage",
    company: "Lissage sur Mesure",
    sector: "Beauté",
    delivered: "Site vitrine dark luxe pour un salon spécialisé. Animations au scroll, typographie serif, balisage Schema.org pour le référencement local. Le parcours mène de la découverte de la formule à la prise de rendez-vous.",
    quote: null,
    author: null,
    image: "/screenshots/lissage-hero.webp",
    route: "/lissage",
    color: "#5B1A3A"
  },
  {
    projectId: "angele",
    company: "Angèle",
    sector: "Merchandising artiste",
    delivered: "Boutique officielle de merchandising : t-shirts, sweats, vinyles et accessoires. Thème Shopify personnalisé, fiches produit avec sélecteur de taille et galerie, livraison européenne, intégrations newsletter et suivi marketing.",
    quote: null,
    author: null,
    image: "/screenshots/angele-hero.webp",
    route: "/angele",
    color: "#7ECDB5"
  },
  {
    projectId: "reuni",
    company: "Reuni",
    sector: "Mode éthique",
    delivered: "Plateforme e-commerce avec design system sur mesure. Catalogue à filtres dynamiques, tunnel d'achat optimisé pour la conversion, chargement sous une seconde et demie et score Lighthouse de 98.",
    quote: null,
    author: null,
    image: "/screenshots/reuni-hero.webp",
    route: "/reuni",
    color: "#C4A882"
  },
  {
    projectId: "st-agni",
    company: "St. Agni",
    sector: "Mode premium",
    delivered: "Boutique en ligne minimaliste en architecture headless sur Shopify Plus. Visuels plein écran, transitions de page cinématiques, vue produit à 360 degrés et navigation gestuelle sur mobile.",
    quote: null,
    author: null,
    image: "/screenshots/st-agni-hero.webp",
    route: "/st-agni",
    color: "#8A8580"
  }
];
const CARD_MAX = 380;
const GAP = 24;
const largeurCarte = (cadre) => cadre ? Math.max(220, Math.min(CARD_MAX, cadre - 48)) : CARD_MAX;
const AUTOPLAY = 6e3;
function Card({
  item: item2,
  index,
  trackX,
  viewport,
  card,
  step
}) {
  const distance = useTransform(trackX, (x) => {
    if (!viewport) return 0;
    return index * step + x + card / 2 - viewport / 2;
  });
  const normalized = useTransform(
    distance,
    (d) => viewport ? clamp(d / (viewport / 2), -1.6, 1.6) : 0
  );
  const rotateY = useTransform(normalized, (n) => -n * 22);
  const scale = useTransform(normalized, (n) => 1 - Math.min(Math.abs(n), 1) * 0.1);
  const opacity = useTransform(normalized, (n) => 1 - Math.min(Math.abs(n), 1) * 0.55);
  const z = useTransform(normalized, (n) => -Math.abs(n) * 120);
  const estTemoignage = item2.quote !== null && item2.author !== null;
  return /* @__PURE__ */ jsx(
    motion.li,
    {
      className: "shrink-0",
      style: {
        width: card,
        rotateY,
        scale,
        opacity,
        z,
        transformStyle: "preserve-3d"
      },
      children: /* @__PURE__ */ jsxs("article", { className: "flex h-full flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface-card", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative h-40 overflow-hidden", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: item2.image,
              alt: "",
              loading: "lazy",
              draggable: false,
              className: "h-full w-full object-cover object-top"
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              "aria-hidden": true,
              className: "absolute inset-0",
              style: {
                background: `linear-gradient(to top, rgb(var(--surface-card)) 4%, ${item2.color}22 60%, transparent)`
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-5 sm:p-7", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-display text-xl font-bold text-text-primary", children: item2.company }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent", children: item2.sector }),
          estTemoignage ? /* @__PURE__ */ jsxs("blockquote", { className: "mt-5 flex-1", children: [
            /* @__PURE__ */ jsxs("p", { className: "leading-relaxed text-text-secondary", children: [
              "« ",
              item2.quote,
              " »"
            ] }),
            /* @__PURE__ */ jsxs("footer", { className: "mt-5 text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-text-primary", children: item2.author.name }),
              /* @__PURE__ */ jsxs("span", { className: "text-text-muted", children: [
                " · ",
                item2.author.role
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsx("p", { className: "mt-5 flex-1 leading-relaxed text-text-secondary", children: item2.delivered }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: item2.route,
              className: "relative mt-7 inline-flex w-fit items-center gap-2 border-b border-accent/40 pb-0.5 font-display text-sm font-semibold text-accent transition-colors before:absolute before:inset-x-0 before:-inset-y-3 before:content-[''] hover:border-accent",
              children: [
                "Voir le projet ",
                /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "→" })
              ]
            }
          )
        ] })
      ] })
    }
  );
}
function TestimonialsSection() {
  var _a;
  const navigate = useNavigate();
  const cadreRef = useRef(null);
  const glissementRef = useRef(false);
  const [viewport, setViewport] = useState(0);
  const [actif, setActif] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const reduced = useReducedMotion();
  const trackX = useMotionValue(0);
  const doux = useSpring(trackX, { stiffness: 120, damping: 26, mass: 0.6 });
  const card = largeurCarte(viewport);
  const step = card + GAP;
  const largeurTotale = testimonials.length * step - GAP;
  const minX = Math.min(0, viewport - largeurTotale);
  useEffect(() => {
    const el = cadreRef.current;
    if (!el) return;
    const observer = new ResizeObserver(
      ([entry]) => setViewport(entry.contentRect.width)
    );
    observer.observe(el);
    setViewport(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);
  const positionDe = useCallback(
    (index) => clamp(viewport / 2 - index * step - card / 2, minX, 0),
    [viewport, minX, step, card]
  );
  const allerA = useCallback(
    (index) => {
      const cible = clamp(index, 0, testimonials.length - 1);
      setActif(cible);
      trackX.set(positionDe(cible));
    },
    [positionDe, trackX]
  );
  useMotionValueEvent(doux, "change", (x) => {
    if (!viewport) return;
    const index = Math.round((viewport / 2 - x - card / 2) / step);
    const borne = clamp(index, 0, testimonials.length - 1);
    setActif((precedent) => precedent === borne ? precedent : borne);
  });
  useEffect(() => {
    if (viewport) trackX.set(positionDe(actif));
  }, [viewport, positionDe, trackX]);
  useEffect(() => {
    if (reduced || enPause || !viewport) return;
    const id = window.setInterval(() => {
      setActif((precedent) => {
        const suivant = (precedent + 1) % testimonials.length;
        trackX.set(positionDe(suivant));
        return suivant;
      });
    }, AUTOPLAY);
    return () => window.clearInterval(id);
  }, [reduced, enPause, viewport, positionDe, trackX]);
  const ouvrirDepuisClic = (event) => {
    if (glissementRef.current || !viewport) return;
    const cadre = cadreRef.current;
    if (!cadre) return;
    const x = event.clientX - cadre.getBoundingClientRect().left - doux.get();
    const index = Math.floor(x / step);
    if (x - index * step > card) return;
    if (index < 0 || index >= testimonials.length) return;
    navigate(testimonials[index].route);
  };
  const teinte = ((_a = testimonials[actif]) == null ? void 0 : _a.color) ?? "#7A6047";
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "avis",
      className: "relative overflow-hidden bg-surface py-24 md:py-36",
      onMouseEnter: () => setEnPause(true),
      onMouseLeave: () => setEnPause(false),
      onFocusCapture: () => setEnPause(true),
      onBlurCapture: () => setEnPause(false),
      children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            "aria-hidden": true,
            className: "pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]",
            animate: { backgroundColor: teinte, opacity: 0.14 },
            transition: { duration: 1.2, ease: EASE_OUT }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxs("div", { className: "mx-auto mb-14 max-w-6xl px-6 md:mb-20", children: [
            /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent", children: "Ils nous ont fait confiance" }) }),
            /* @__PURE__ */ jsx(
              SplitText,
              {
                as: "h2",
                by: "word",
                text: "Des marques qui nous ont confié leur site",
                delay: 0.1,
                className: "mt-5 block max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-5xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "div",
            {
              ref: cadreRef,
              className: "cursor-pointer overflow-hidden active:cursor-grabbing",
              style: { perspective: 1400 },
              children: /* @__PURE__ */ jsx(
                motion.ul,
                {
                  className: "flex items-stretch",
                  style: { x: doux, gap: GAP, transformStyle: "preserve-3d" },
                  drag: reduced ? false : "x",
                  dragConstraints: { left: minX, right: 0 },
                  dragElastic: 0.08,
                  onDragStart: () => {
                    glissementRef.current = true;
                    setEnPause(true);
                  },
                  onDragEnd: () => {
                    setEnPause(false);
                    window.setTimeout(() => {
                      glissementRef.current = false;
                    }, 0);
                  },
                  onClick: ouvrirDepuisClic,
                  initial: false,
                  children: testimonials.map((item2, index) => /* @__PURE__ */ jsx(
                    Card,
                    {
                      item: item2,
                      index,
                      trackX: doux,
                      viewport,
                      card,
                      step
                    },
                    item2.projectId
                  ))
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-10 flex max-w-6xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6", children: [
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-1 sm:gap-2", children: testimonials.map((item2, index) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => allerA(index),
                "aria-label": `Voir ${item2.company}`,
                "aria-current": index === actif,
                className: "group flex h-11 items-center px-1",
                children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `block h-px transition-all duration-500 ${index === actif ? "w-10 bg-accent" : "w-5 bg-text-muted group-hover:w-8 group-hover:bg-text-secondary"}`
                  }
                )
              },
              item2.projectId
            )) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => allerA(actif - 1),
                  disabled: actif === 0,
                  "aria-label": "Client précédent",
                  className: "flex h-11 w-11 items-center justify-center rounded-full border border-surface-border text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30",
                  children: /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "←" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => allerA(actif + 1),
                  disabled: actif === testimonials.length - 1,
                  "aria-label": "Client suivant",
                  className: "flex h-11 w-11 items-center justify-center rounded-full border border-surface-border text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30",
                  children: /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "→" })
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}
const CALENDLY_URL = "https://calendly.com/zakariya-neurocare/call-decouverte-20min?hide_gdpr_banner=1";
const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
let chargement = null;
function chargerCalendly() {
  if (chargement) return chargement;
  chargement = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("script Calendly injoignable"));
    document.head.appendChild(script);
  });
  return chargement;
}
function CalendlyModal({ open, onClose }) {
  const conteneur = useRef(null);
  const fermer = useCallback(() => {
    if (conteneur.current) conteneur.current.innerHTML = "";
    onClose();
  }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const gererTouche = (e) => {
      if (e.key === "Escape") fermer();
    };
    window.addEventListener("keydown", gererTouche);
    const defilementInitial = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", gererTouche);
      document.body.style.overflow = defilementInitial;
    };
  }, [open, fermer]);
  useEffect(() => {
    if (!open) return;
    let annule = false;
    void chargerCalendly().then(() => {
      const cible = conteneur.current;
      const fenetre = window;
      if (annule || !cible || !fenetre.Calendly) return;
      cible.innerHTML = "";
      fenetre.Calendly.initInlineWidget({
        url: CALENDLY_URL,
        parentElement: cible
      });
    }).catch((err) => console.error("[calendly]", err));
    return () => {
      annule = true;
    };
  }, [open]);
  return /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[60] flex items-end justify-center sm:items-center", children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
        onClick: fermer,
        className: "absolute inset-0 bg-text-primary/50 backdrop-blur-sm",
        "aria-hidden": true
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "calendly-titre",
        initial: { y: 40, opacity: 0, scale: 0.98 },
        animate: { y: 0, opacity: 1, scale: 1 },
        exit: { y: 40, opacity: 0, scale: 0.98 },
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
        className: "relative z-10 flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl border border-surface-border bg-surface-card sm:max-h-[92vh] sm:max-w-3xl sm:rounded-2xl",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 px-6 pb-4 pt-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                "h2",
                {
                  id: "calendly-titre",
                  className: "font-display text-xl font-bold text-text-primary sm:text-2xl",
                  children: "Parlons de votre projet"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-xl text-sm leading-relaxed text-text-secondary", children: "Un appel court pour comprendre ce que vous voulez mettre en place, ce dont vous disposez déjà, et ce que ça représente. Vous repartez avec un devis précis, sans engagement." })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: fermer,
                "aria-label": "Fermer",
                className: "-m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary",
                children: /* @__PURE__ */ jsx(
                  "svg",
                  {
                    className: "h-5 w-5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    strokeWidth: 1.5,
                    "aria-hidden": true,
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        d: "M6 18L18 6M6 6l12 12"
                      }
                    )
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6", children: /* @__PURE__ */ jsx(
            "div",
            {
              ref: conteneur,
              className: "h-[68vh] min-h-[560px] w-full overflow-hidden rounded-xl bg-white"
            }
          ) })
        ]
      }
    )
  ] }) });
}
const MEMBERS = [
  {
    initials: "ZN",
    name: "Zakariya Nebbache",
    role: "Développement",
    pitch: "Développeur fullstack. Je prends le projet du premier commit à la mise en ligne : interface, back-office, intégrations et applications iOS.",
    disciplines: [
      "React & Next.js",
      "TypeScript / Node",
      "iOS",
      "Shopify & Liquid",
      "PostgreSQL & Supabase",
      "WebGL"
    ],
    linkedin: "https://www.linkedin.com/in/zakariya-nebbache-7b0644214/"
  },
  {
    initials: "AN",
    name: "Anissa Nebbache",
    role: "Direction de projet, marketing & design",
    pitch: "Cheffe de projet et directrice marketing et design. Je cadre le besoin, dessine le parcours et pilote le projet jusqu'à la livraison, puis ce qu'il produit une fois en ligne : campagnes Meta Ads et Google Ads, suivi des conversions, itérations.",
    disciplines: [
      "Direction artistique",
      "UX / UI",
      "Stratégie de marque",
      "Meta Ads",
      "Google Ads",
      "Tracking & conversions",
      "Gestion de projet",
      "Relation client"
    ],
    linkedin: "https://www.linkedin.com/in/anissa-nebbache-696bb9150/"
  }
];
const FACTS = [
  { value: "8", label: "projets en ligne" },
  { value: "6", label: "secteurs couverts" },
  { value: "2", label: "métiers réunis" }
];
const SECTORS = [
  "MODE",
  "BEAUTÉ",
  "MUSIQUE",
  "SANTÉ",
  "FRANCHISE B2B",
  "SOURCING INDUSTRIEL"
];
const SERVICES = [
  { title: "Conception et développement", body: "Sites vitrines, boutiques Shopify, plateformes métier et applications iOS. Du cadrage à la mise en ligne." },
  { title: "Meta Ads et Google Ads", body: "Mise en place et pilotage des campagnes : structure des comptes, audiences, création des annonces, budget et arbitrages." },
  { title: "Mesure et conversions", body: "Tracking, événements de conversion et lecture des résultats, pour savoir ce qui rapporte et ce qui coûte." }
];
function MemberCard({ member, index }) {
  return /* @__PURE__ */ jsx(
    motion.article,
    {
      className: "relative",
      initial: { opacity: 0, y: 48 },
      whileInView: { opacity: 1, y: 0 },
      viewport: VIEWPORT,
      transition: { duration: 0.8, delay: index * 0.12, ease: EASE_OUT },
      children: /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col rounded-2xl border border-surface-border bg-surface-card p-7 md:p-9", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-start gap-4", children: /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": true,
            className: "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 md:h-20 md:w-20",
            children: /* @__PURE__ */ jsx("span", { className: "font-display text-lg font-bold tracking-widest text-accent md:text-xl", children: member.initials })
          }
        ) }),
        /* @__PURE__ */ jsx("h3", { className: "mt-6 font-display text-2xl font-bold tracking-tight text-text-primary md:text-3xl", children: member.name }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent", children: member.role }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 leading-relaxed text-text-secondary", children: member.pitch }),
        /* @__PURE__ */ jsx("ul", { className: "mt-7 flex flex-wrap gap-2", children: member.disciplines.map((discipline, i) => /* @__PURE__ */ jsx(
          motion.li,
          {
            className: "rounded-full border border-surface-border px-3 py-1 text-[11px] uppercase tracking-wider text-text-secondary",
            initial: { opacity: 0, y: 10 },
            whileInView: { opacity: 1, y: 0 },
            viewport: VIEWPORT,
            transition: { duration: 0.4, delay: 0.25 + i * 0.04, ease: EASE_OUT },
            children: discipline
          },
          discipline
        )) }),
        /* @__PURE__ */ jsx("div", { className: "mt-auto pt-8", children: /* @__PURE__ */ jsxs(
          "a",
          {
            href: member.linkedin,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "group/link inline-flex min-h-[44px] items-center gap-2 border-b border-transparent pb-0.5 font-display text-sm font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" }) }),
              "Profil LinkedIn",
              /* @__PURE__ */ jsx(
                "span",
                {
                  "aria-hidden": true,
                  className: "transition-transform duration-300 group-hover/link:translate-x-0.5",
                  children: "↗"
                }
              )
            ]
          }
        ) })
      ] })
    }
  );
}
function TeamSection() {
  const [rdvOuvert, setRdvOuvert] = useState(false);
  return /* @__PURE__ */ jsxs("section", { id: "agence", className: "relative overflow-hidden bg-surface-light py-24 md:py-36", children: [
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent", children: "L'agence" }) }),
          /* @__PURE__ */ jsx(
            SplitText,
            {
              as: "h2",
              by: "word",
              text: "Une équipe restreinte, deux métiers complets",
              delay: 0.1,
              className: "mt-5 block font-display text-3xl font-bold leading-[1.02] tracking-tight text-text-primary md:text-5xl lg:text-6xl"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Reveal, { delay: 0.2, className: "max-w-sm lg:shrink-0", children: /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-text-secondary", children: "Pas de chaîne d'intermédiaires : vous parlez directement aux deux personnes qui conçoivent et qui développent. Et le travail ne s'arrête pas à la mise en ligne : nous mettons aussi en place et pilotons vos campagnes Meta Ads et Google Ads." }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-14 grid gap-px overflow-hidden rounded-2xl border border-surface-border bg-surface-border md:mt-20 md:grid-cols-3", children: SERVICES.map((service, index) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "bg-surface-light p-6 md:p-8",
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: VIEWPORT,
          transition: { duration: 0.6, delay: index * 0.1, ease: EASE_OUT },
          children: [
            /* @__PURE__ */ jsx("h3", { className: "font-display text-base font-bold text-text-primary md:text-lg", children: service.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-text-secondary", children: service.body })
          ]
        },
        service.title
      )) }),
      /* @__PURE__ */ jsx("div", { className: "mt-14 grid gap-6 md:mt-20 md:grid-cols-2 md:gap-8", children: MEMBERS.map((member, index) => /* @__PURE__ */ jsx(MemberCard, { member, index }, member.name)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-16 grid grid-cols-3 gap-4 border-t border-surface-border pt-12 md:mt-24", children: FACTS.map((fact, index) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "text-center md:text-left",
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: VIEWPORT,
          transition: { duration: 0.6, delay: index * 0.1, ease: EASE_OUT },
          children: [
            /* @__PURE__ */ jsx(
              Counter,
              {
                value: fact.value,
                className: "block font-display text-4xl font-bold text-accent md:text-6xl"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "mt-2 text-xs uppercase tracking-wider text-text-muted md:text-sm", children: fact.label })
          ]
        },
        fact.label
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-16 border-y border-surface-border py-4 md:mt-24", children: /* @__PURE__ */ jsx(
      Marquee,
      {
        items: SECTORS,
        speed: 26,
        direction: -1,
        className: "font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-text-secondary"
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto mt-16 max-w-6xl px-6 text-center md:mt-20", children: /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx(Magnetic, { className: "inline-block", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setRdvOuvert(true),
        className: "inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 py-4 font-display text-xs font-semibold tracking-wide text-surface transition-opacity hover:opacity-90 sm:gap-3 sm:px-8 sm:text-sm sm:tracking-wider",
        children: "PARLONS DE VOTRE PROJET"
      }
    ) }) }) }),
    /* @__PURE__ */ jsx(CalendlyModal, { open: rdvOuvert, onClose: () => setRdvOuvert(false) })
  ] });
}
const FAQ = [
  {
    question: "Combien coûte la création d’un site internet ?",
    reponse: "Un site vitrine démarre autour de 1 500 € et un projet e-commerce ou une application métier se situe plus haut, selon le nombre de pages, les fonctionnalités et le travail de rédaction. Nous chiffrons après un premier échange, sur la base d'un cahier des charges écrit : pas de fourchette au doigt mouillé, et pas de surprise en cours de route."
  },
  {
    question: "Combien de temps prend un projet de site web ?",
    reponse: "Comptez trois à six semaines pour un site vitrine, six à douze semaines pour une boutique e-commerce ou un outil métier. Le calendrier dépend surtout de la disponibilité de vos contenus, textes et photos, qui est le premier facteur de retard sur ce type de projet."
  },
  {
    question: "Le site sera-t-il visible sur Google ?",
    reponse: "Le référencement naturel est intégré à la conception, pas ajouté après coup : structure des URL, balises, données structurées, temps de chargement, maillage interne et contenus rédigés pour répondre aux recherches réelles de vos clients. Nous pouvons aussi accompagner le site après sa mise en ligne, en suivi de positions ou en campagnes Google Ads."
  },
  {
    question: "Puis-je modifier mon site moi-même ensuite ?",
    reponse: "Oui. Selon le projet, vous administrez vos contenus depuis Shopify, depuis un back-office sur mesure ou depuis un espace d'administration dédié. Nous vous formons à la prise en main à la livraison, et nous restons joignables ensuite."
  },
  {
    question: "Travaillez-vous partout en France ?",
    reponse: "Oui, dans toute la France et à l'international. Nos réalisations vont d'une marque de mode australienne à un cabinet de sourcing entre la France et la Chine. Les échanges se font en visioconférence, avec des points d'avancement réguliers et un interlocuteur unique."
  },
  {
    question: "Que se passe-t-il après la mise en ligne ?",
    reponse: "Le site vous appartient, code et hébergement compris. Nous proposons ensuite un suivi à la carte : corrections, évolutions, ajout de pages, campagnes Meta Ads et Google Ads, ou simplement une intervention ponctuelle quand vous en avez besoin. Aucun abonnement n'est imposé."
  },
  {
    question: "Reprenez-vous un site existant pour une refonte ?",
    reponse: "Régulièrement. Nous partons de l'existant, de vos statistiques et de ce qui fonctionne déjà, puis nous établissons un plan de redirections complet pour conserver le référencement acquis. Une refonte mal préparée fait chuter les positions : c'est précisément ce que ce plan évite."
  }
];
function FaqSection() {
  const [ouverte, setOuverte] = useState(0);
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((item2) => ({
        "@type": "Question",
        name: item2.question,
        acceptedAnswer: { "@type": "Answer", text: item2.reponse }
      }))
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);
  return /* @__PURE__ */ jsx("section", { id: "faq", className: "relative bg-surface-light py-24 md:py-36", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-14 text-center md:mb-20", children: [
      /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent", children: "Questions fréquentes" }) }),
      /* @__PURE__ */ jsx(
        SplitText,
        {
          as: "h2",
          by: "word",
          text: "Ce qu’on nous demande avant de se lancer",
          delay: 0.1,
          className: "mx-auto mt-5 block font-display text-3xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-5xl"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("dl", { children: FAQ.map((item2, index) => {
      const estOuverte = ouverte === index;
      return /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "border-t border-surface-border last:border-b",
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: VIEWPORT,
          transition: { duration: 0.5, delay: index * 0.04, ease: EASE_OUT },
          children: [
            /* @__PURE__ */ jsx("dt", { children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setOuverte(estOuverte ? null : index),
                "aria-expanded": estOuverte,
                "aria-controls": `faq-reponse-${index}`,
                className: "flex w-full items-center justify-between gap-6 py-6 text-left",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "font-display text-base font-semibold text-text-primary md:text-lg", children: item2.question }),
                  /* @__PURE__ */ jsx(
                    motion.span,
                    {
                      "aria-hidden": true,
                      className: "shrink-0 text-2xl leading-none text-accent",
                      animate: { rotate: estOuverte ? 45 : 0 },
                      transition: { duration: 0.3, ease: EASE_OUT },
                      children: "+"
                    }
                  )
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: estOuverte && /* @__PURE__ */ jsx(
              motion.dd,
              {
                id: `faq-reponse-${index}`,
                className: "overflow-hidden",
                initial: { height: 0, opacity: 0 },
                animate: { height: "auto", opacity: 1 },
                exit: { height: 0, opacity: 0 },
                transition: { duration: 0.35, ease: EASE_OUT },
                children: /* @__PURE__ */ jsx("p", { className: "pb-6 leading-relaxed text-text-secondary sm:pr-10", children: item2.reponse })
              }
            ) })
          ]
        },
        item2.question
      );
    }) })
  ] }) });
}
const PARAGRAPHS = [
  "Ce projet est né d'un constat simple mais désolant : il n'y a pas suffisamment de places dans les établissements spécialisés, et beaucoup de familles se retrouvent à domicile, sans solution.",
  "NeuroCare met en relation des professionnels spécialisés en troubles du neurodéveloppement (autisme, TDAH, troubles DYS…) avec les personnes concernées et leurs familles."
];
const STATS = [
  { value: "100%", label: "des revenus réinvestis" },
  { value: "4", label: "étapes de vérification" },
  { value: "30+", label: "villes couvertes" }
];
function MissionSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const auraScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.35]);
  const auraOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.06, 0]);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      ref: sectionRef,
      className: "relative overflow-hidden bg-surface py-24 md:py-36",
      children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            "aria-hidden": true,
            className: "pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent blur-[130px]",
            style: { scale: auraScale, opacity: auraOpacity }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-6xl px-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-16 text-center md:mb-24", children: [
            /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent", children: "Notre mission" }) }),
            /* @__PURE__ */ jsx(
              SplitText,
              {
                as: "h2",
                by: "word",
                text: "Chaque projet finance une cause",
                delay: 0.1,
                className: "mx-auto mt-5 block max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-6xl"
              }
            ),
            /* @__PURE__ */ jsx(Reveal, { delay: 0.25, className: "mx-auto mt-8 max-w-2xl", children: /* @__PURE__ */ jsxs("p", { className: "text-lg leading-relaxed text-text-secondary", children: [
              "100% des revenus générés par Digitalz Dev sont réinvestis dans",
              " ",
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://neuro-care.fr",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "font-semibold text-accent underline-offset-4 hover:underline",
                  children: "NeuroCare"
                }
              ),
              ", une plateforme dédiée aux personnes en situation de handicap."
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid items-center gap-12 md:grid-cols-2 md:gap-16", children: [
            /* @__PURE__ */ jsx(Reveal, { from: "left", distance: 60, duration: 1, children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-2xl shadow-xl", children: [
              /* @__PURE__ */ jsx(Parallax, { speed: 0.06, zoom: true, children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: "/screenshots/neurocare-hero.webp",
                  alt: "NeuroCare, plateforme dédiée au neurodéveloppement",
                  loading: "lazy",
                  className: "h-full w-full object-cover"
                }
              ) }),
              /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Reveal, { from: "right", distance: 50, children: /* @__PURE__ */ jsx("h3", { className: "mb-6 font-display text-2xl font-bold text-text-primary md:text-3xl", children: "NeuroCare : bien plus qu'une plateforme" }) }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4 leading-relaxed text-text-secondary", children: [
                PARAGRAPHS.map((paragraph, index) => /* @__PURE__ */ jsx(Reveal, { from: "right", distance: 40, delay: 0.1 + index * 0.1, children: /* @__PURE__ */ jsx("p", { children: paragraph }) }, index)),
                /* @__PURE__ */ jsx(Reveal, { from: "right", distance: 40, delay: 0.3, children: /* @__PURE__ */ jsx("p", { className: "font-medium text-text-primary", children: "Plus qu'une plateforme, nous guidons et accompagnons les familles dans leur parcours." }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-10 grid grid-cols-3 gap-2 sm:gap-3", children: STATS.map((stat, index) => /* @__PURE__ */ jsxs(
                motion.div,
                {
                  className: "rounded-xl border border-surface-border bg-surface-card p-3 sm:p-4",
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: VIEWPORT,
                  transition: { duration: 0.6, delay: index * 0.1, ease: EASE_OUT },
                  children: [
                    /* @__PURE__ */ jsx(
                      Counter,
                      {
                        value: stat.value,
                        className: "block font-display text-xl font-bold text-accent sm:text-2xl"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs leading-snug text-text-muted", children: stat.label })
                  ]
                },
                stat.label
              )) }),
              /* @__PURE__ */ jsx(Reveal, { delay: 0.2, className: "mt-10", children: /* @__PURE__ */ jsx(Magnetic, { className: "inline-block", children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "https://neuro-care.fr",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 py-3 font-display text-xs font-semibold tracking-wide text-surface transition-colors hover:bg-accent-hover sm:px-8 sm:text-sm sm:tracking-wider",
                  children: [
                    "DÉCOUVRIR NEUROCARE",
                    /* @__PURE__ */ jsx(
                      "svg",
                      {
                        className: "h-4 w-4",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        strokeWidth: 2,
                        "aria-hidden": true,
                        children: /* @__PURE__ */ jsx(
                          "path",
                          {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          }
                        )
                      }
                    )
                  ]
                }
              ) }) })
            ] })
          ] })
        ] })
      ]
    }
  );
}
const RACCOURCIS = [
  { to: "/#services", label: "Nos services" },
  { to: "/#projets", label: "Nos réalisations" },
  { to: "/#agence", label: "L'agence" },
  { to: "/#faq", label: "Questions fréquentes" },
  { to: "/contact", label: "Nous contacter" },
  // Point d'entrée principal : plutôt qu'un formulaire de devis, le visiteur
  // repart avec un aperçu de son site en une minute.
  { to: "https://quiz.digitalzdev.com", label: "Générer ma démo gratuite", externe: true }
];
function Footer() {
  return /* @__PURE__ */ jsx("footer", { className: "border-t border-surface-border bg-surface py-16 px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-8", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex min-h-[44px] items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/logo.png",
            alt: "Digitalz Dev",
            className: "w-10 h-10 rounded-full"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "font-display font-semibold text-sm tracking-[0.15em]", children: "DIGITALZ DEV" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.instagram.com/digitalzdev/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex h-11 w-11 items-center justify-center text-text-secondary transition-colors hover:text-accent",
            "aria-label": "Instagram",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.linkedin.com/in/zakariya-nebbache-7b0644214/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex h-11 w-11 items-center justify-center text-text-secondary transition-colors hover:text-accent",
            "aria-label": "LinkedIn",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "mailto:zdigitalzdev@gmail.com",
            className: "flex h-11 w-11 items-center justify-center text-text-secondary transition-colors hover:text-accent",
            "aria-label": "Email",
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-5 h-5",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                strokeWidth: 1.5,
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  }
                )
              }
            )
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      "nav",
      {
        "aria-label": "Plan du site",
        className: "mt-12 grid gap-8 border-t border-surface-border pt-12 sm:grid-cols-2 md:grid-cols-3",
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-display text-xs font-semibold uppercase tracking-[0.2em] text-text-primary", children: "Le site" }),
            /* @__PURE__ */ jsx("ul", { className: "mt-4 lg:space-y-2", children: RACCOURCIS.map((lien) => /* @__PURE__ */ jsx("li", { children: lien.externe ? /* @__PURE__ */ jsx(
              "a",
              {
                href: lien.to,
                className: "inline-block py-3.5 text-sm text-text-secondary transition-colors hover:text-accent lg:py-0",
                children: lien.label
              }
            ) : /* @__PURE__ */ jsx(
              Link,
              {
                to: lien.to,
                className: "inline-block py-3.5 text-sm text-text-secondary transition-colors hover:text-accent lg:py-0",
                children: lien.label
              }
            ) }, lien.to)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsx("h2", { className: "font-display text-xs font-semibold uppercase tracking-[0.2em] text-text-primary", children: "Réalisations" }),
            /* @__PURE__ */ jsx("ul", { className: "mt-4 grid gap-x-6 sm:grid-cols-2 lg:gap-y-2", children: projects.map((project) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              Link,
              {
                to: project.route,
                className: "inline-block py-3.5 text-sm text-text-secondary transition-colors hover:text-accent lg:py-0",
                children: [
                  project.title,
                  /* @__PURE__ */ jsxs("span", { className: "text-text-muted", children: [
                    " · ",
                    project.subtitle
                  ] })
                ]
              }
            ) }, project.id)) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 pt-8 border-t border-surface-border flex flex-col md:flex-row items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-text-muted text-sm", children: [
        "Digitalz Dev © ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " · Tous droits réservés"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/mentions-legales",
            className: "inline-block py-3.5 text-sm text-text-muted transition-colors hover:text-accent lg:py-0",
            children: "Mentions légales"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/politique-confidentialite",
            className: "inline-block py-3.5 text-sm text-text-muted transition-colors hover:text-accent lg:py-0",
            children: "Politique de confidentialité"
          }
        )
      ] })
    ] })
  ] }) });
}
function Home() {
  return /* @__PURE__ */ jsxs("main", { children: [
    /* @__PURE__ */ jsx(Hero, {}),
    /* @__PURE__ */ jsx(ProjectsSection, {}),
    /* @__PURE__ */ jsx(TestimonialsSection, {}),
    /* @__PURE__ */ jsx(TeamSection, {}),
    /* @__PURE__ */ jsx(ServicesSection, {}),
    /* @__PURE__ */ jsx(FaqSection, {}),
    /* @__PURE__ */ jsx(MissionSection, {}),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function ContactForm() {
  return /* @__PURE__ */ jsx("section", { className: "py-24 md:py-32 px-6 bg-surface", children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      className: "max-w-2xl mx-auto text-center",
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0.8 },
      children: [
        /* @__PURE__ */ jsx("span", { className: "text-accent font-display font-semibold text-sm tracking-[0.2em] uppercase", children: "Contact" }),
        /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-3xl md:text-4xl text-text-primary mt-4 mb-4", children: "Un projet en tête ?" }),
        /* @__PURE__ */ jsx("p", { className: "text-text-secondary mb-8", children: "Répondez à huit questions et repartez avec un aperçu de votre site, généré pour votre marque. Gratuit, en moins d'une minute." }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://quiz.digitalzdev.com",
            className: "inline-block px-8 py-4 bg-accent text-surface font-display font-semibold tracking-wider rounded-lg hover:opacity-90 transition-all",
            children: "GÉNÉRER MA DÉMO GRATUITE"
          }
        )
      ]
    }
  ) });
}
function titleScale(title) {
  if (title.length > 19) return "text-[9.5vw] md:text-[min(5.4vw,78px)]";
  if (title.length > 15) return "text-[9vw] md:text-[min(6.6vw,108px)]";
  if (title.length > 12) return "text-[10.8vw] md:text-[min(7.6vw,128px)]";
  if (title.length > 10) return "text-[12.8vw] md:text-[min(8.4vw,150px)]";
  return "text-[15.5vw] md:text-[min(9vw,188px)]";
}
function BrowserFrame({
  url,
  image,
  gradient,
  tall = false,
  label
}) {
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-xl shadow-black/5 md:rounded-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 border-b border-surface-border bg-surface-light px-4 py-3", children: [
      /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-[#FF6058]" }),
      /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-[#FFBF2E]" }),
      /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-[#28CA42]" }),
      /* @__PURE__ */ jsx("span", { className: "ml-3 flex h-7 flex-1 items-center rounded-md bg-surface-card px-3", children: /* @__PURE__ */ jsx("span", { className: "truncate font-mono text-[11px] text-text-muted", children: label ?? url }) })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `relative overflow-hidden bg-gradient-to-br ${gradient} ${tall ? "h-64 md:h-[520px]" : "h-48 md:h-72"}`,
        children: /* @__PURE__ */ jsx(Parallax, { speed: 0.05, zoom: true, className: "absolute inset-0", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: image,
            alt: "",
            loading: "lazy",
            className: "h-full w-full object-cover object-top"
          }
        ) })
      }
    )
  ] });
}
function NextProject({ current }) {
  const index = projects.findIndex((p) => p.id === current.id);
  const next = projects[(index + 1) % projects.length];
  return /* @__PURE__ */ jsx("section", { className: "border-t border-surface-border bg-surface", children: /* @__PURE__ */ jsx(Link, { to: next.route, className: "group block", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-6 py-20 md:py-28", children: [
    /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.3em] text-text-muted", children: "Projet suivant" }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-8 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsx(
        SplitText,
        {
          as: "h2",
          by: "char",
          text: next.title,
          className: `block font-display font-bold tracking-tight text-text-primary transition-colors group-hover:text-accent ${// La vignette de survol occupe 224 px de la ligne à partir
          // de `md` : le corps ne repasse au maximum qu'à `lg`, sinon
          // le nom de domaine se cassait en trois lignes à 768 px.
          next.title.length > 19 ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl" : "text-2xl sm:text-4xl md:text-5xl lg:text-7xl"}`
        }
      ),
      /* @__PURE__ */ jsx(Reveal, { from: "right", delay: 0.15, children: /* @__PURE__ */ jsx("div", { className: "hidden h-28 w-44 overflow-hidden rounded-xl opacity-0 transition-all duration-500 group-hover:opacity-100 md:block md:h-32 md:w-56 md:translate-x-4 md:group-hover:translate-x-0", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: next.heroImage,
          alt: "",
          loading: "lazy",
          className: "h-full w-full object-cover object-top"
        }
      ) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center gap-3 text-sm text-text-secondary", children: [
      /* @__PURE__ */ jsx("span", { children: next.subtitle }),
      /* @__PURE__ */ jsx("span", { className: "text-text-muted transition-transform duration-300 group-hover:translate-x-1", children: "→" })
    ] })
  ] }) }) });
}
function ProjectPage({ project }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 30,
    restDelta: 1e-3
  });
  const imageY = useTransform(smooth, [0, 1], ["0%", "22%"]);
  const imageScale = useTransform(smooth, [0, 1], [1, 1.15]);
  const contentY = useTransform(smooth, [0, 1], ["0%", "-40%"]);
  const contentOpacity = useTransform(smooth, [0, 0.75], [1, 0]);
  const overlayOpacity = useTransform(smooth, [0, 1], [1, 1.4]);
  return /* @__PURE__ */ jsxs("main", { className: "bg-surface", children: [
    /* @__PURE__ */ jsxs(
      "section",
      {
        ref: heroRef,
        className: "relative h-[88vh] min-h-[560px] overflow-hidden bg-surface md:h-screen md:min-h-[620px]",
        children: [
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: "absolute inset-x-0 -top-[8%] h-[118%]",
              style: { y: imageY, scale: imageScale },
              children: [
                /* @__PURE__ */ jsx("div", { className: `absolute inset-0 bg-gradient-to-br ${project.gradient}` }),
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: project.heroImage,
                    alt: "",
                    className: "absolute inset-0 h-full w-full object-cover object-top"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              "aria-hidden": true,
              className: "absolute inset-0 bg-gradient-to-t from-surface from-38% via-surface/90 via-72% to-surface/25 md:from-20% md:via-surface/85 md:via-58% md:to-surface/20",
              style: { opacity: overlayOpacity }
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "absolute inset-x-0 bottom-0 z-10 px-6 pb-14 md:px-14 md:pb-20",
              style: { y: contentY, opacity: contentOpacity },
              children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-5xl", children: [
                /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, x: -16 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.6, delay: 0.15 },
                    children: /* @__PURE__ */ jsxs(
                      Link,
                      {
                        to: "/#projets",
                        className: "group -my-2 inline-flex min-h-[44px] items-center gap-2 py-2 text-sm font-semibold text-text-primary transition-colors hover:text-accent",
                        children: [
                          /* @__PURE__ */ jsx("span", { className: "transition-transform duration-300 group-hover:-translate-x-1", children: "←" }),
                          "Retour aux projets"
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  SplitText,
                  {
                    as: "h1",
                    by: "char",
                    immediate: true,
                    text: project.title,
                    delay: 0.35,
                    className: `mt-8 block font-display font-black leading-[0.92] tracking-tight text-text-primary ${titleScale(
                      project.title
                    )}`
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.p,
                  {
                    className: "mt-5 max-w-2xl text-base font-medium text-text-secondary sm:text-lg md:text-xl",
                    initial: { opacity: 0, y: 24 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.8, delay: 0.6, ease: EASE_OUT },
                    children: project.description
                  }
                ),
                /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    className: "mt-8 flex flex-wrap items-center gap-4",
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.8, delay: 0.75, ease: EASE_OUT },
                    children: [
                      /* @__PURE__ */ jsx(Magnetic, { children: /* @__PURE__ */ jsxs(
                        "a",
                        {
                          href: project.url,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className: "inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 py-3 font-display text-xs font-semibold tracking-wide text-surface transition-opacity hover:opacity-90 sm:px-7 sm:text-sm sm:tracking-wider",
                          children: [
                            "VOIR LE SITE EN LIGNE",
                            /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "↗" })
                          ]
                        }
                      ) }),
                      project.access && /* @__PURE__ */ jsx("span", { className: "rounded-full border border-surface-border px-4 py-2 text-xs text-text-muted", children: project.access })
                    ]
                  }
                )
              ] })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "border-y border-surface-border bg-surface-light py-4", children: /* @__PURE__ */ jsx(
      Marquee,
      {
        items: project.stack,
        speed: 22,
        separator: "/",
        className: "font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-text-secondary"
      }
    ) }),
    /* @__PURE__ */ jsx("section", { className: "bg-surface px-6 py-16 md:py-20", children: /* @__PURE__ */ jsx("div", { className: "mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3", children: project.metrics.map((metric, index) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "text-center",
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: VIEWPORT,
        transition: { duration: 0.7, delay: index * 0.1, ease: EASE_OUT },
        children: [
          /* @__PURE__ */ jsx(
            Counter,
            {
              value: metric.value,
              className: "block font-display text-4xl font-bold text-accent md:text-6xl"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-text-secondary", children: metric.label })
        ]
      },
      metric.label
    )) }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-surface px-6 pb-16 md:pb-24", children: /* @__PURE__ */ jsx(Reveal, { scale: true, duration: 1.1, className: "mx-auto max-w-5xl", children: /* @__PURE__ */ jsx(
      BrowserFrame,
      {
        url: project.url,
        image: project.heroImage,
        gradient: project.gradient,
        tall: true
      }
    ) }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-surface px-6 py-16 md:py-28", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-5xl space-y-20 md:space-y-32", children: [
      { label: "Le brief", title: "Comprendre le besoin", body: project.brief },
      { label: "La solution", title: "Notre approche", body: project.solution }
    ].map((block) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "grid gap-8 md:grid-cols-[220px_1fr] md:gap-16",
        children: [
          /* @__PURE__ */ jsx("div", { className: "md:sticky md:top-32 md:h-fit", children: /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent", children: block.label }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              SplitText,
              {
                as: "h2",
                by: "word",
                text: block.title,
                className: "block font-display text-2xl font-bold tracking-tight text-text-primary md:text-4xl"
              }
            ),
            /* @__PURE__ */ jsx(Reveal, { delay: 0.15, children: /* @__PURE__ */ jsx("p", { className: "mt-6 text-base leading-relaxed text-text-secondary md:text-lg", children: block.body }) })
          ] })
        ]
      },
      block.label
    )) }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-surface-light px-6 py-16 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-12 text-center", children: [
        /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent", children: "Technique" }) }),
        /* @__PURE__ */ jsx(
          SplitText,
          {
            as: "h2",
            by: "word",
            text: "Caractéristiques clés",
            delay: 0.1,
            className: "mt-4 block font-display text-2xl font-bold tracking-tight text-text-primary md:text-4xl"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("ul", { children: project.features.map((feature, index) => /* @__PURE__ */ jsxs(
        motion.li,
        {
          className: "group flex items-baseline gap-4 border-t border-surface-border py-5 last:border-b",
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: VIEWPORT,
          transition: { duration: 0.55, delay: index * 0.06, ease: EASE_OUT },
          children: [
            /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "text-accent", children: "·" }),
            /* @__PURE__ */ jsx("span", { className: "text-text-primary transition-transform duration-300 group-hover:translate-x-1 md:text-lg", children: feature })
          ]
        },
        feature
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-surface px-6 py-16 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-14 text-center", children: [
        /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent", children: "Aperçus" }) }),
        /* @__PURE__ */ jsx(
          SplitText,
          {
            as: "h2",
            by: "word",
            text: "Les écrans clés",
            delay: 0.1,
            className: "mt-4 block font-display text-2xl font-bold tracking-tight text-text-primary md:text-4xl"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-8 md:grid-cols-2 md:gap-10", children: project.mockups.map((mockup, index) => /* @__PURE__ */ jsxs(
        Reveal,
        {
          delay: index % 2 * 0.12,
          distance: 70,
          duration: 0.9,
          className: index % 2 === 1 ? "md:mt-16" : void 0,
          children: [
            /* @__PURE__ */ jsx(
              BrowserFrame,
              {
                url: project.url,
                label: mockup.title,
                image: mockup.image,
                gradient: mockup.gradient
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-text-secondary", children: mockup.content })
          ]
        },
        mockup.title
      )) })
    ] }) }),
    /* @__PURE__ */ jsx(NextProject, { current: project }),
    /* @__PURE__ */ jsx(ContactForm, {}),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
const PROJECT_TYPES = [
  "Site vitrine",
  "E-commerce",
  "Application web",
  "Dashboard / SaaS",
  "Refonte de site",
  "Autre"
];
const BUDGETS = [
  "Moins de 1 500 €",
  "1 500 € à 3 000 €",
  "3 000 € à 5 000 €",
  "5 000 € à 10 000 €",
  "Plus de 10 000 €",
  "À définir"
];
const TIMELINES = [
  "Moins de 1 mois",
  "1 à 2 mois",
  "2 à 3 mois",
  "3+ mois",
  "Pas de deadline"
];
function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    projectType: "",
    projectTypeOther: "",
    budget: "",
    timeline: "",
    hasDesign: "",
    description: "",
    url: ""
  });
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const templateParams = {
      from_name: form.name,
      from_email: form.email,
      company: form.company || "Non renseigné",
      phone: form.phone || "Non renseigné",
      project_type: form.projectType === "Autre" ? `Autre : ${form.projectTypeOther}` : form.projectType,
      budget: form.budget,
      timeline: form.timeline,
      has_design: form.hasDesign || "Non renseigné",
      website_url: form.url || "Non renseigné",
      description: form.description
    };
    try {
      await emailjs.send(
        "service_jpu9w4m",
        "template_uf32b6j",
        templateParams,
        "_sQi0ifLC4W46LEvs"
      );
      setSubmitted(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer ou nous contacter directement à zdigitalzdev@gmail.com.");
    } finally {
      setSending(false);
    }
  };
  return /* @__PURE__ */ jsxs("main", { className: "bg-surface min-h-screen", children: [
    /* @__PURE__ */ jsx("section", { className: "pt-32 pb-16 md:pt-40 md:pb-20 px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto text-center", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          className: "text-left",
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          children: /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/",
              className: "group -mt-3 mb-5 inline-flex min-h-[44px] items-center gap-2 py-3 text-sm text-text-secondary transition-colors hover:text-accent",
              children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    "aria-hidden": true,
                    className: "transition-transform duration-300 group-hover:-translate-x-1",
                    children: "←"
                  }
                ),
                "Retour à l'accueil"
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(
        motion.span,
        {
          className: "text-accent font-display font-semibold text-sm tracking-[0.2em] uppercase",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.1 },
          children: "Contact"
        }
      ),
      /* @__PURE__ */ jsx(
        motion.h1,
        {
          className: "font-display font-black text-5xl md:text-8xl lg:text-9xl text-text-primary mt-4 mb-6",
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
          children: "Parlons de votre projet"
        }
      ),
      /* @__PURE__ */ jsx(
        motion.p,
        {
          className: "text-text-secondary text-lg md:text-xl max-w-xl mx-auto",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay: 0.3 },
          children: "Remplissez ce formulaire pour nous aider à préparer un devis adapté à vos besoins."
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "pb-24 md:pb-32 px-6", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: !submitted ? /* @__PURE__ */ jsxs(
      motion.form,
      {
        onSubmit: handleSubmit,
        className: "space-y-10",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.5, delay: 0.3 },
        children: [
          /* @__PURE__ */ jsxs("fieldset", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("legend", { className: "font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold", children: "1" }),
              "Vos coordonnées"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm text-text-secondary mb-1.5 font-display", children: "Nom complet *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    required: true,
                    value: form.name,
                    onChange: (e) => update("name", e.target.value),
                    className: "w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors",
                    placeholder: "Jean Dupont"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm text-text-secondary mb-1.5 font-display", children: "Entreprise" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: form.company,
                    onChange: (e) => update("company", e.target.value),
                    className: "w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors",
                    placeholder: "Nom de l'entreprise"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm text-text-secondary mb-1.5 font-display", children: "Email *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "email",
                    required: true,
                    value: form.email,
                    onChange: (e) => update("email", e.target.value),
                    className: "w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors",
                    placeholder: "jean@entreprise.com"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm text-text-secondary mb-1.5 font-display", children: "Téléphone" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "tel",
                    value: form.phone,
                    onChange: (e) => update("phone", e.target.value),
                    className: "w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors",
                    placeholder: "06 12 34 56 78"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("fieldset", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("legend", { className: "font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold", children: "2" }),
              "Votre projet"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-text-secondary mb-2 font-display", children: "Type de projet *" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: PROJECT_TYPES.map((type) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => update("projectType", type),
                  className: `inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 font-display text-sm transition-all ${form.projectType === type ? "bg-accent text-surface border-accent" : "bg-surface-card text-text-secondary border-surface-border hover:border-accent/30"}`,
                  children: type
                },
                type
              )) }),
              form.projectType === "Autre" && /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: form.projectTypeOther,
                  onChange: (e) => update("projectTypeOther", e.target.value),
                  className: "mt-3 w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors",
                  placeholder: "Précisez le type de projet...",
                  autoFocus: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-text-secondary mb-1.5 font-display", children: "Site web actuel (si refonte)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "url",
                  value: form.url,
                  onChange: (e) => update("url", e.target.value),
                  className: "w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors",
                  placeholder: "https://monsite.com"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-text-secondary mb-2 font-display", children: "Avez-vous déjà un design / maquette ?" }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: ["Oui", "Non", "En cours"].map((opt) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => update("hasDesign", opt),
                  className: `inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 font-display text-sm transition-all ${form.hasDesign === opt ? "bg-accent text-surface border-accent" : "bg-surface-card text-text-secondary border-surface-border hover:border-accent/30"}`,
                  children: opt
                },
                opt
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("fieldset", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("legend", { className: "font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold", children: "3" }),
              "Budget & délai"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-text-secondary mb-2 font-display", children: "Budget estimé *" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: BUDGETS.map((b) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => update("budget", b),
                  className: `inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 font-display text-sm transition-all ${form.budget === b ? "bg-accent text-surface border-accent" : "bg-surface-card text-text-secondary border-surface-border hover:border-accent/30"}`,
                  children: b
                },
                b
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-text-secondary mb-2 font-display", children: "Délai souhaité" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: TIMELINES.map((t) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => update("timeline", t),
                  className: `inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 font-display text-sm transition-all ${form.timeline === t ? "bg-accent text-surface border-accent" : "bg-surface-card text-text-secondary border-surface-border hover:border-accent/30"}`,
                  children: t
                },
                t
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("fieldset", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("legend", { className: "font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold", children: "4" }),
              "Décrivez votre projet"
            ] }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                required: true,
                rows: 6,
                value: form.description,
                onChange: (e) => update("description", e.target.value),
                className: "w-full px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none",
                placeholder: "Décrivez votre projet, vos objectifs, votre cible, les fonctionnalités souhaitées, des sites de référence que vous aimez..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                id: "consent",
                required: true,
                className: "mt-0.5 h-5 w-5 flex-shrink-0 accent-accent"
              }
            ),
            /* @__PURE__ */ jsxs(
              "label",
              {
                htmlFor: "consent",
                className: "text-text-secondary text-sm leading-relaxed",
                children: [
                  "J'accepte que mes données soient utilisées pour traiter ma demande de devis. Consultez notre",
                  " ",
                  /* @__PURE__ */ jsx(
                    Link,
                    {
                      to: "/politique-confidentialite",
                      className: "text-accent underline",
                      children: "politique de confidentialité"
                    }
                  ),
                  ". *"
                ]
              }
            )
          ] }),
          error && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm text-center bg-red-500/10 py-3 px-4 rounded-lg", children: error }),
          /* @__PURE__ */ jsx(
            motion.button,
            {
              type: "submit",
              disabled: sending,
              className: "w-full py-4 bg-accent text-surface font-display font-semibold tracking-wider rounded-lg hover:opacity-90 transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed",
              whileHover: sending ? {} : { scale: 1.01 },
              whileTap: sending ? {} : { scale: 0.98 },
              children: sending ? "ENVOI EN COURS..." : "ENVOYER LA DEMANDE"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-text-muted text-xs text-center", children: "Nous revenons vers vous sous 24 à 48h avec une proposition adaptée." })
        ]
      },
      "form"
    ) : /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "text-center py-20",
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5 },
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-8", children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: "w-10 h-10 text-accent",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              strokeWidth: 2,
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  d: "M5 13l4 4L19 7"
                }
              )
            }
          ) }),
          /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-3xl text-text-primary mb-3", children: "Demande envoyée !" }),
          /* @__PURE__ */ jsx("p", { className: "text-text-secondary text-lg mb-8", children: "Nous analysons votre projet et revenons vers vous sous 24 à 48h." }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/",
              className: "px-8 py-3 bg-accent text-surface rounded-full font-display font-semibold inline-block hover:opacity-90 transition-all",
              children: "Retour à l'accueil"
            }
          )
        ]
      },
      "success"
    ) }) }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function MentionsLegales() {
  return /* @__PURE__ */ jsxs("main", { className: "bg-surface min-h-screen", children: [
    /* @__PURE__ */ jsx("section", { className: "pt-32 pb-16 md:pt-40 md:pb-20 px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          children: /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/",
              className: "-mt-3 mb-5 inline-flex min-h-[44px] items-center gap-2 py-3 text-sm text-text-secondary transition-colors hover:text-accent",
              children: [
                /* @__PURE__ */ jsx("span", { children: "←" }),
                " Retour"
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(
        motion.h1,
        {
          className: "mb-12 font-display text-3xl font-black text-text-primary [hyphens:auto] sm:text-4xl md:text-5xl",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.1 },
          children: "Mentions légales"
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "space-y-8 text-text-secondary leading-relaxed",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.2 },
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Éditeur du site" }),
              /* @__PURE__ */ jsx("p", { children: "Digitalz Dev est le nom commercial de :" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-3", children: [
                /* @__PURE__ */ jsx("strong", { className: "text-text-primary", children: "NeuroCare" }),
                /* @__PURE__ */ jsx("br", {}),
                "Société par actions simplifiée à associé unique (SASU)",
                /* @__PURE__ */ jsx("br", {}),
                "Capital social : 150 €",
                /* @__PURE__ */ jsx("br", {}),
                "Siège social : 8 avenue Édouard Branly, 93420 Villepinte, France",
                /* @__PURE__ */ jsx("br", {}),
                "RCS Bobigny : immatriculation en cours",
                /* @__PURE__ */ jsx("br", {}),
                "Email :",
                " ",
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: "mailto:zdigitalzdev@gmail.com",
                    className: "text-accent underline underline-offset-2",
                    children: "zdigitalzdev@gmail.com"
                  }
                ),
                /* @__PURE__ */ jsx("br", {}),
                "Site : digitalzdev.com"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Directeur de la publication" }),
              /* @__PURE__ */ jsx("p", { children: "Zakariya Nebbache, président de la société NeuroCare." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Hébergement" }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Ce site est hébergé par :",
                /* @__PURE__ */ jsx("br", {}),
                "Vercel Inc.",
                /* @__PURE__ */ jsx("br", {}),
                "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
                /* @__PURE__ */ jsx("br", {}),
                "Site : vercel.com"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Propriété intellectuelle" }),
              /* @__PURE__ */ jsx("p", { children: "L'ensemble du contenu de ce site (textes, images, logos, maquettes, code source) est la propriété exclusive de la société NeuroCare, sauf mention contraire. Les captures d'écran des réalisations restent la propriété de leurs marques respectives. Toute reproduction, même partielle, est interdite sans autorisation préalable." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Données personnelles" }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Pour en savoir plus sur la collecte et le traitement de vos données, consultez notre",
                " ",
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: "/politique-confidentialite",
                    className: "text-accent underline",
                    children: "Politique de confidentialité"
                  }
                ),
                "."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Cookies" }),
              /* @__PURE__ */ jsx("p", { children: "Ce site n'utilise aucun cookie tiers ni outil de tracking. Seul le stockage local du navigateur (localStorage) est utilisé pour mémoriser votre préférence de thème (clair/sombre). Cette donnée reste sur votre appareil et n'est jamais transmise." })
            ] })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function PolitiqueConfidentialite() {
  return /* @__PURE__ */ jsxs("main", { className: "bg-surface min-h-screen", children: [
    /* @__PURE__ */ jsx("section", { className: "pt-32 pb-16 md:pt-40 md:pb-20 px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          children: /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/",
              className: "-mt-3 mb-5 inline-flex min-h-[44px] items-center gap-2 py-3 text-sm text-text-secondary transition-colors hover:text-accent",
              children: [
                /* @__PURE__ */ jsx("span", { children: "←" }),
                " Retour"
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(
        motion.h1,
        {
          className: "mb-12 font-display text-3xl font-black text-text-primary [hyphens:auto] sm:text-4xl md:text-5xl",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.1 },
          children: "Politique de confidentialité"
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "space-y-8 text-text-secondary leading-relaxed",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.2 },
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Responsable du traitement" }),
              /* @__PURE__ */ jsxs("p", { children: [
                "NeuroCare, société par actions simplifiée à associé unique, éditrice du site sous le nom commercial Digitalz Dev.",
                /* @__PURE__ */ jsx("br", {}),
                "Siège social : 8 avenue Édouard Branly, 93420 Villepinte, France",
                /* @__PURE__ */ jsx("br", {}),
                "Email :",
                " ",
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: "mailto:zdigitalzdev@gmail.com",
                    className: "text-accent underline underline-offset-2",
                    children: "zdigitalzdev@gmail.com"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Données collectées" }),
              /* @__PURE__ */ jsx("p", { children: "Lorsque vous utilisez le formulaire de contact, les données suivantes peuvent être collectées :" }),
              /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 mt-2 space-y-1", children: [
                /* @__PURE__ */ jsx("li", { children: "Nom complet" }),
                /* @__PURE__ */ jsx("li", { children: "Adresse email" }),
                /* @__PURE__ */ jsx("li", { children: "Numéro de téléphone (facultatif)" }),
                /* @__PURE__ */ jsx("li", { children: "Nom d'entreprise (facultatif)" }),
                /* @__PURE__ */ jsx("li", { children: "Description du projet" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Finalité du traitement" }),
              /* @__PURE__ */ jsx("p", { children: "Vos données sont collectées uniquement pour répondre à votre demande de devis et vous recontacter dans le cadre de votre projet. Elles ne sont jamais utilisées à des fins commerciales ou publicitaires." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Base légale" }),
              /* @__PURE__ */ jsx("p", { children: "Le traitement repose sur votre consentement explicite (case cochée avant l'envoi du formulaire), conformément à l'article 6.1.a du RGPD." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Destinataires" }),
              /* @__PURE__ */ jsx("p", { children: "Vos données sont transmises uniquement au responsable du traitement, par email. Aucun sous-traitant ni tiers n'y a accès." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Durée de conservation" }),
              /* @__PURE__ */ jsx("p", { children: "Vos données sont conservées pendant la durée nécessaire au traitement de votre demande, puis supprimées dans un délai maximum de 12 mois après le dernier échange." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Vos droits" }),
              /* @__PURE__ */ jsx("p", { children: "Conformément au RGPD, vous disposez des droits suivants :" }),
              /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 mt-2 space-y-1", children: [
                /* @__PURE__ */ jsx("li", { children: "Droit d'accès à vos données" }),
                /* @__PURE__ */ jsx("li", { children: "Droit de rectification" }),
                /* @__PURE__ */ jsx("li", { children: "Droit à l'effacement (« droit à l'oubli »)" }),
                /* @__PURE__ */ jsx("li", { children: "Droit à la limitation du traitement" }),
                /* @__PURE__ */ jsx("li", { children: "Droit à la portabilité" }),
                /* @__PURE__ */ jsx("li", { children: "Droit d'opposition" }),
                /* @__PURE__ */ jsx("li", { children: "Droit de retirer votre consentement à tout moment" })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "mt-3", children: [
                "Pour exercer vos droits, contactez-nous à :",
                " ",
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: "mailto:zdigitalzdev@gmail.com",
                    className: "text-accent underline",
                    children: "zdigitalzdev@gmail.com"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Cookies et stockage local" }),
              /* @__PURE__ */ jsx("p", { children: "Ce site n'utilise aucun cookie. Le stockage local du navigateur (localStorage) est utilisé uniquement pour mémoriser votre préférence de thème (clair/sombre). Cette donnée est strictement fonctionnelle et reste sur votre appareil." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Services tiers" }),
              /* @__PURE__ */ jsx("p", { children: "Ce site n'intègre aucun service tiers de tracking ou d'analyse. Les polices de caractères sont hébergées localement sur notre serveur. Aucune donnée n'est transmise à Google ou tout autre fournisseur externe." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-text-primary mb-3", children: "Réclamation" }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Si vous estimez que le traitement de vos données ne respecte pas la réglementation, vous pouvez adresser une réclamation à la CNIL :",
                " ",
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: "https://www.cnil.fr",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-accent underline",
                    children: "www.cnil.fr"
                  }
                )
              ] })
            ] })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function NotFound() {
  return /* @__PURE__ */ jsx("main", { className: "bg-surface min-h-screen flex items-center justify-center px-6 pb-16 pt-28", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx(
      motion.h1,
      {
        className: "font-display font-black text-7xl sm:text-8xl md:text-[12rem] text-text-primary leading-none",
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.6 },
        children: "404"
      }
    ),
    /* @__PURE__ */ jsx(
      motion.p,
      {
        className: "text-text-secondary text-lg md:text-xl mt-4 mb-8",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.2 },
        children: "Cette page n'existe pas ou a été déplacée."
      }
    ),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.3 },
        children: /* @__PURE__ */ jsx(
          Link,
          {
            to: "/",
            className: "inline-flex min-h-[44px] items-center px-8 py-3 bg-accent text-surface rounded-full font-display font-semibold hover:opacity-90 transition-all",
            children: "Retour à l'accueil"
          }
        )
      }
    )
  ] }) });
}
const Login = lazy(() => import("./assets/Login-BRA0lzkU.js"));
const ClientPortal = lazy(() => import("./assets/ClientPortal-Cyb14TnS.js"));
const DashboardLayout = lazy(() => import("./assets/DashboardLayout-Cc3cuLcf.js"));
function RouteFallback() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-surface", children: /* @__PURE__ */ jsx("span", { className: "h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-accent" }) });
}
function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard") || location.pathname === "/login" || location.pathname.startsWith("/espace/");
  if (isDashboard) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(ScrollToTop, {}),
      /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(RouteFallback, {}), children: /* @__PURE__ */ jsxs(Routes, { children: [
        /* @__PURE__ */ jsx(Route, { path: "/login", element: /* @__PURE__ */ jsx(Login, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/espace/:token", element: /* @__PURE__ */ jsx(ClientPortal, {}) }),
        /* @__PURE__ */ jsx(
          Route,
          {
            path: "/dashboard/*",
            element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(DashboardLayout, {}) })
          }
        )
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(SmoothScroll, { children: [
    /* @__PURE__ */ jsx(Seo, {}),
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", initial: false, children: /* @__PURE__ */ jsx(PageTransition, { children: /* @__PURE__ */ jsxs(Routes, { location, children: [
      /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(Home, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/contact", element: /* @__PURE__ */ jsx(Contact, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/mentions-legales", element: /* @__PURE__ */ jsx(MentionsLegales, {}) }),
      /* @__PURE__ */ jsx(
        Route,
        {
          path: "/politique-confidentialite",
          element: /* @__PURE__ */ jsx(PolitiqueConfidentialite, {})
        }
      ),
      projects.map((project) => /* @__PURE__ */ jsx(
        Route,
        {
          path: project.route,
          element: /* @__PURE__ */ jsx(ProjectPage, { project })
        },
        project.id
      )),
      /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(NotFound, {}) })
    ] }) }, location.pathname) }),
    /* @__PURE__ */ jsx(CookieBanner, {})
  ] });
}
function render(url) {
  return renderToString(
    /* @__PURE__ */ jsx(StrictMode, { children: /* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(App, {}) }) }) }) })
  );
}
export {
  createRenderLoop as a,
  clamp as b,
  createRenderer as c,
  disposeScene as d,
  scrollState as e,
  isWebGLAvailable as i,
  lerp as l,
  observeResize as o,
  pixelRatio as p,
  readPalette as r,
  render,
  supabase as s,
  useAuth as u,
  watchTheme as w
};

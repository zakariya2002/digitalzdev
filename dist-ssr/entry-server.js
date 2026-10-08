var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, Component, useLayoutEffect, useRef, lazy, Suspense, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.mjs";
import { createClient } from "@supabase/supabase-js";
import { useLocation, Link, Navigate, Routes, Route } from "react-router-dom";
import { useReducedMotion, motion, useScroll, useMotionValueEvent, AnimatePresence, useMotionValue, useSpring, useTransform, useInView, useMotionTemplate } from "framer-motion";
import Lenis from "lenis";
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
    id: "nouvelle-garde",
    title: "lanouvellegarde.com",
    subtitle: "Groupe de brasseries",
    year: "2026",
    tags: ["Site vitrine", "Bilingue", "Restauration"],
    stack: ["WordPress", "Elementor", "PHP", "SEO technique"],
    description: "Vitrine bilingue de la Nouvelle Garde, douze brasseries et un bar entre Paris, la province et Londres. Une page d'accueil en grille d'objets, une adresse par page, et sa propre couleur à chacune.",
    url: "https://lanouvellegarde.com/fr/",
    route: "/la-nouvelle-garde",
    color: "#C8961F",
    gradient: "from-[#FBF8F1] via-[#C8961F] to-[#3F5D33]",
    heroImage: "/screenshots/nouvelle-garde-hero.webp",
    brief: "La Nouvelle Garde tient douze brasseries et un bar, de la Gare du Nord à Sloane Square, en passant par Lille, Marseille, Lyon, Bordeaux et Neuilly. Un groupe de cette taille a un problème que n'ont pas les autres restaurants : chaque adresse a sa salle, sa carte, sa clientèle et son caractère, et pourtant elles appartiennent toutes à la même maison. Un site unique aplatit les différences, douze sites séparés dissolvent le groupe. Il fallait tenir les deux.",
    solution: "La page d'accueil ne liste rien : elle pose douze objets sur du blanc, une assiette, une chaise de terrasse, un moulin à poivre, un pichet en forme de coq, chacun portant le nom d'une brasserie en lettrage dessiné. On choisit une adresse comme on choisirait une table. Derrière, chaque brasserie a sa page et sa couleur, son logo, son quartier, son équipe en photo. La réservation se sépare de la privatisation au seuil de vingt-cinq couverts, là où le métier change vraiment, et les capacités assises et cocktail sont annoncées adresse par adresse. Le tout en français et en anglais.",
    features: [
      "Page d'accueil en grille d'objets, une par adresse",
      "Une page par brasserie, avec sa couleur et son lettrage",
      "Réservation et privatisation séparées au seuil de 25 couverts",
      "Capacités assises et cocktail, devis et brochure par adresse",
      "Site intégralement bilingue français et anglais",
      "FAQ, charte maison et lettre d’information"
    ],
    metrics: [
      { value: "12", label: "brasseries et un bar" },
      { value: "2", label: "pays, France et Royaume-Uni" },
      { value: "FR / EN", label: "entièrement bilingue" }
    ],
    mockups: [
      {
        title: "Page d'accueil",
        gradient: "from-[#FBF8F1] to-[#F2E9D6]",
        content: "Douze objets sur fond blanc, une par adresse",
        image: "/screenshots/nouvelle-garde-hero.webp"
      },
      {
        title: "Une brasserie",
        gradient: "from-[#F2E9D6] to-[#C8961F]",
        content: "Son lettrage, son adresse, sa couleur",
        image: "/screenshots/nouvelle-garde-2.webp"
      },
      {
        title: "Réserver ou privatiser",
        gradient: "from-[#C8961F] to-[#6F7F4A]",
        content: "L'équipe en photo, et le choix à 25 couverts",
        image: "/screenshots/nouvelle-garde-3.webp"
      },
      {
        title: "Groupes et privatisation",
        gradient: "from-[#6F7F4A] to-[#3F5D33]",
        content: "Capacités, devis et brochure par adresse",
        image: "/screenshots/nouvelle-garde-4.webp"
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
  },
  {
    id: "soeur",
    title: "soeur.fr",
    subtitle: "Prêt-à-porter parisien",
    year: "2026",
    tags: ["E-commerce", "Mode", "Shopify"],
    stack: ["Shopify", "Liquid", "JavaScript"],
    description: "Boutique en ligne de la maison parisienne Soeur : prêt-à-porter femme et enfant, sacs, chaussures, seconde main et archives, dans un univers éditorial sobre.",
    url: "https://www.soeur.fr",
    route: "/soeur",
    color: "#8C7A62",
    gradient: "from-[#EDE8E0] via-[#DDD6CB] to-[#C9C0B2]",
    heroImage: "/screenshots/soeur-hero.webp",
    brief: "Soeur avait besoin d'une boutique à la hauteur de ses campagnes : des collections présentées comme dans un lookbook, un catalogue large (prêt-à-porter, enfant, sacs, chaussures) facile à parcourir, et des rubriques à part pour la seconde main et les archives.",
    solution: "Une boutique Shopify où l'image domine : visuels de campagne plein écran, grilles produits aérées sur fond neutre, navigation par familles et par catégories, et un parcours d'achat court sur mobile comme sur ordinateur.",
    features: [
      "Visuels de campagne plein écran",
      "Grilles produits épurées par catégorie",
      "Rubriques seconde main et archives",
      "Navigation par familles et sous-catégories",
      "Parcours d’achat optimisé mobile",
      "Thème Shopify sur mesure"
    ],
    metrics: [
      { value: "Shopify", label: "boutique sur mesure" },
      { value: "2", label: "univers : femme et enfant" },
      { value: "100%", label: "responsive" }
    ],
    mockups: [
      {
        title: "Accueil",
        gradient: "from-[#EDE8E0] to-[#DDD6CB]",
        content: "Campagne plein écran",
        image: "/screenshots/soeur-hero.webp"
      },
      {
        title: "Collection",
        gradient: "from-[#DDD6CB] to-[#CFC7BA]",
        content: "Grille produits sur fond neutre",
        image: "/screenshots/soeur-2.webp"
      },
      {
        title: "Catalogue",
        gradient: "from-[#CFC7BA] to-[#C1B8AA]",
        content: "Familles et sous-catégories",
        image: "/screenshots/soeur-3.webp"
      },
      {
        title: "Nouveautés",
        gradient: "from-[#C1B8AA] to-[#B3A99A]",
        content: "Parcours fluide jusqu’au panier",
        image: "/screenshots/soeur-4.webp"
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
    id: "fidal",
    title: "Fidal Montpellier",
    subtitle: "Cabinet d’avocats d’affaires",
    year: "2026",
    tags: ["Avocats", "Site institutionnel", "Référencement local"],
    stack: ["CMS", "SEO local", "Cartographie"],
    description: "Page du bureau montpelliérain de Fidal, cabinet d'avocats d'affaires : présentation du bureau, expertises, équipe et coordonnées, pensée pour le référencement local.",
    url: "https://www.fidal.com/nos-implantations/mediterranee/montpellier",
    route: "/fidal",
    color: "#1B2A41",
    gradient: "from-[#E6E9EE] via-[#C9D0DA] to-[#1B2A41]",
    heroImage: "/screenshots/fidal-hero.webp",
    brief: "Fidal souhaitait que chacun de ses bureaux régionaux existe en ligne à part entière : une page qui présente le bureau de Montpellier, ses expertises et ses avocats, et qui ressorte sur les recherches locales d'avocat d'affaires.",
    solution: "Une page de bureau structurée pour la recherche locale : présentation et domaines d'intervention, coordonnées et carte, équipe avec fonctions et secteurs, liens vers les autres implantations.",
    features: [
      "Page de bureau dédiée à Montpellier",
      "Présentation des expertises du bureau",
      "Équipe avec fonctions et secteurs",
      "Coordonnées, carte et accès",
      "Maillage vers les autres implantations",
      "Référencement local avocat d’affaires"
    ],
    metrics: [
      { value: "1", label: "bureau régional dédié" },
      { value: "100%", label: "référencement local" },
      { value: "FR / EN", label: "cabinet international" }
    ],
    mockups: [
      {
        title: "Bureau",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Présentation du bureau de Montpellier",
        image: "/screenshots/fidal-hero.webp"
      },
      {
        title: "Contact",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Coordonnées et carte",
        image: "/screenshots/fidal-2.webp"
      },
      {
        title: "Équipe",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Avocats et directeur de bureau",
        image: "/screenshots/fidal-3.webp"
      },
      {
        title: "Réseau",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Les autres implantations",
        image: "/screenshots/fidal-4.webp"
      }
    ]
  },
  {
    id: "celsi",
    title: "oliviercelsi.com",
    subtitle: "Maison d’architecture à Bordeaux",
    year: "2026",
    tags: ["Architecte", "Portfolio", "Site vitrine"],
    stack: ["Site vitrine", "Galerie projets", "SEO"],
    description: "Site d'Olivier Celsi Maison d'Architecture (OCMA), à Bordeaux : construction et rénovation de maisons, appartements et commerces, présentés par de grandes images.",
    url: "https://www.oliviercelsi.com",
    route: "/olivier-celsi",
    color: "#6B4E3D",
    gradient: "from-[#F2ECE6] via-[#DCCFC4] to-[#B59C88]",
    heroImage: "/screenshots/celsi-hero.webp",
    brief: "OCMA voulait un site à l'image de son architecture : chaleureux, lumineux, où les réalisations parlent d'elles-mêmes, et qui donne envie aux particuliers de confier leur projet de vie à l'agence.",
    solution: "Un site vitrine où l'image domine : intérieurs et extérieurs en plein écran, une présentation de la maison et de sa démarche, des actualités et une galerie de projets, sur une mise en page sobre et aérée.",
    features: [
      "Visuels de réalisations plein écran",
      "Présentation de la maison et de sa démarche",
      "Galerie de projets",
      "Rubrique actualités",
      "Mise en page sobre et aérée",
      "Référencement architecte à Bordeaux"
    ],
    metrics: [
      { value: "OCMA", label: "maison d’architecture" },
      { value: "3", label: "types de projets" },
      { value: "100%", label: "responsive" }
    ],
    mockups: [
      {
        title: "Accueil",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Intérieur en plein écran",
        image: "/screenshots/celsi-hero.webp"
      },
      {
        title: "La Maison",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Présentation de l’agence",
        image: "/screenshots/celsi-2.webp"
      },
      {
        title: "Projets",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Galerie de réalisations",
        image: "/screenshots/celsi-3.webp"
      }
    ]
  },
  {
    id: "determines",
    title: "lesdetermines.fr",
    subtitle: "Programme d’entrepreneuriat",
    year: "2026",
    tags: ["Association", "Site institutionnel", "Candidatures"],
    stack: ["Site institutionnel", "Formulaires", "Vidéo"],
    description: "Site des Déterminés, programme d'accompagnement à l'entrepreneuriat présent dans près de 20 villes : programmes, événements, actualités et candidatures en ligne.",
    url: "https://www.lesdetermines.fr",
    route: "/les-determines",
    color: "#1E40FF",
    gradient: "from-[#E7ECFF] via-[#B9C6FF] to-[#1E40FF]",
    heroImage: "/screenshots/determines-hero.webp",
    brief: "Les Déterminés devaient parler à des publics très différents (candidats, partenaires, formateurs) et donner envie de postuler aux habitants des quartiers prioritaires et des zones rurales, avec une identité forte et engagée.",
    solution: "Un site à l'identité affirmée : vidéo en ouverture, typographie condensée, programmes présentés en cartes de couleur, actualités, et des parcours clairs pour candidater, devenir partenaire ou formateur.",
    features: [
      "Vidéo et accroche en ouverture",
      "Programmes en cartes de couleur",
      "Candidature en ligne",
      "Espaces partenaires et formateurs",
      "Actualités et événements",
      "Identité typographique forte"
    ],
    metrics: [
      { value: "20", label: "villes en France" },
      { value: "3", label: "programmes" },
      { value: "100%", label: "gratuit pour les candidats" }
    ],
    mockups: [
      {
        title: "Accueil",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Accroche et vidéo",
        image: "/screenshots/determines-hero.webp"
      },
      {
        title: "Programmes",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Cartes de couleur",
        image: "/screenshots/determines-2.webp"
      },
      {
        title: "Actualités",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Dernières nouvelles",
        image: "/screenshots/determines-3.webp"
      },
      {
        title: "Rejoindre",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Candidats, partenaires, formateurs",
        image: "/screenshots/determines-4.webp"
      }
    ]
  },
  {
    id: "foster",
    title: "fosterandpartners.com",
    subtitle: "Studio d’architecture international",
    year: "2026",
    tags: ["Architecte", "Site institutionnel", "International"],
    stack: ["Site institutionnel", "Galerie projets", "Multilingue"],
    description: "Site de Foster + Partners, studio international d'architecture, d'urbanisme, d'ingénierie et de design fondé par Norman Foster en 1967 : projets, studio, expertises et actualités.",
    url: "https://www.fosterandpartners.com",
    route: "/foster-and-partners",
    color: "#1A1A1A",
    gradient: "from-[#E9E9E9] via-[#BDBDBD] to-[#1A1A1A]",
    heroImage: "/screenshots/foster-hero.webp",
    brief: "Un studio présent dans le monde entier, des centaines de projets et des métiers très variés : le site devait rester lisible, mettre l'architecture en grand et donner accès rapidement aux projets, aux expertises et à la vie du studio.",
    solution: "Une interface sombre et éditoriale où l'image domine : grandes vignettes de projets, rubriques studio, architecture et expertises, citations du fondateur et actualités, dans une navigation sobre.",
    features: [
      "Interface sombre et éditoriale",
      "Grandes vignettes de projets",
      "Rubriques studio, architecture, expertises",
      "Actualités et vie du studio",
      "Pages carrières et diversité",
      "Navigation sobre et rapide"
    ],
    metrics: [
      { value: "1967", label: "studio fondé" },
      { value: "6", label: "expertises" },
      { value: "100%", label: "responsive" }
    ],
    mockups: [
      {
        title: "Accueil",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Projet à la une",
        image: "/screenshots/foster-hero.webp"
      },
      {
        title: "Studio",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Vie et valeurs du studio",
        image: "/screenshots/foster-2.webp"
      },
      {
        title: "Architecture",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Projets et citations",
        image: "/screenshots/foster-3.webp"
      },
      {
        title: "Expertises",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Ingénierie, intérieurs, urbanisme",
        image: "/screenshots/foster-4.webp"
      }
    ]
  },
  {
    id: "gensler",
    title: "gensler.com",
    subtitle: "Agence d’architecture et de design",
    year: "2026",
    tags: ["Architecte", "Site institutionnel", "Contenus"],
    stack: ["Site institutionnel", "Blog", "Recherche"],
    description: "Site de Gensler, agence mondiale d'architecture, de design et d'urbanisme : recherches, projets, expertises et actualités, avec une forte place aux contenus éditoriaux.",
    url: "https://www.gensler.com",
    route: "/gensler",
    color: "#E2401C",
    gradient: "from-[#F4F1EE] via-[#E7D9D2] to-[#E2401C]",
    heroImage: "/screenshots/gensler-hero.webp",
    brief: "Gensler publie énormément : recherches, blog, études de cas. Le site devait mettre ces contenus en avant sans perdre l'accès aux projets, aux expertises et aux bureaux.",
    solution: "Un site éditorial clair : recherches et articles mis en avant avec de grands visuels, carrousels d'actualités, accès direct aux expertises, aux projets et aux bureaux.",
    features: [
      "Recherches et articles mis en avant",
      "Carrousels d’actualités",
      "Accès aux expertises et projets",
      "Pages des bureaux dans le monde",
      "Mise en page éditoriale claire",
      "Responsive et accessible"
    ],
    metrics: [
      { value: "58", label: "bureaux dans le monde" },
      { value: "6 000+", label: "professionnels" },
      { value: "100%", label: "responsive" }
    ],
    mockups: [
      {
        title: "Recherche",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Articles mis en avant",
        image: "/screenshots/gensler-hero.webp"
      },
      {
        title: "Actualités",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Carrousel de contenus",
        image: "/screenshots/gensler-2.webp"
      },
      {
        title: "À propos",
        gradient: "from-[#EEE] to-[#DDD]",
        content: "Mission de l’agence",
        image: "/screenshots/gensler-3.webp"
      }
    ]
  },
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
  }
];
const SITE_URL = "https://digitalzdev.com";
const SITE_NAME = "Digitalz Dev";
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;
const HOME = {
  path: "/",
  title: "Agence web pour avocats, architectes et photographes | Digitalz Dev",
  description: "Sites internet sur mesure pour cabinets d'avocats, agences d'architecture, photographes et vidéastes : design sobre, référencement local et campagnes. Devis sous 48 h."
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
let lenis = null;
const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = () => typeof window !== "undefined" && (window.matchMedia("(max-width: 1024px)").matches || "ontouchstart" in window);
function initSmoothScroll() {
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  if (isTouch() || prefersReducedMotion()) {
    let raf2 = 0;
    const tick2 = () => {
      const y = window.scrollY;
      y / maxScroll();
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
    scroll / maxScroll();
  });
  let raf = 0;
  const tick = (time) => {
    instance.raf(time);
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
  {
    window.scrollTo({ top: target, behavior: options.immediate ? "auto" : "smooth" });
  }
}
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
const LIENS = [
  { libelle: "Accueil", vers: "/", interne: true },
  { libelle: "Projets", vers: "/#projets", interne: false },
  { libelle: "Services", vers: "/#services", interne: false },
  { libelle: "L'agence", vers: "/#agence", interne: false },
  { libelle: "Contact", vers: "/contact", interne: true }
];
const QUIZ$2 = "https://quiz.digitalzdev.com";
const EASE$6 = [0.76, 0, 0.24, 1];
function estCourant(lien2, chemin) {
  if (lien2.vers === "/") return chemin === "/";
  if (lien2.vers.startsWith("/#")) return false;
  return chemin === lien2.vers;
}
function Heure() {
  const formater = () => new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris"
  }).format(/* @__PURE__ */ new Date());
  const [heure, setHeure] = useState(null);
  useEffect(() => {
    setHeure(formater());
    const t = window.setInterval(() => setHeure(formater()), 3e4);
    return () => window.clearInterval(t);
  }, []);
  return /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-text-secondary", children: [
    "Paris, France ",
    /* @__PURE__ */ jsx("span", { className: "text-text-primary", children: heure ?? "" })
  ] });
}
function Navbar() {
  const [defile, setDefile] = useState(false);
  const [survol, setSurvol] = useState(false);
  const [epingle, setEpingle] = useState(false);
  const liensVisibles = !defile || survol || epingle;
  const [ouvert, setOuvert] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setDefile(y > 24));
  useEffect(() => setOuvert(false), [location]);
  useEffect(() => {
    if (!ouvert) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const clavier = (e) => e.key === "Escape" && setOuvert(false);
    window.addEventListener("keydown", clavier);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", clavier);
    };
  }, [ouvert]);
  const fermer = () => setOuvert(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("header", { className: "pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 px-3 pt-3 md:px-6 md:pt-5", children: [
      /* @__PURE__ */ jsxs(
        "nav",
        {
          "aria-label": "Navigation principale",
          className: "pointer-events-auto flex items-center rounded-2xl bg-surface-card/75 py-1.5 pl-3 pr-1.5 backdrop-blur-xl md:pl-4",
          onPointerLeave: () => setSurvol(false),
          children: [
            /* @__PURE__ */ jsxs(Link, { to: "/", onClick: fermer, className: "group flex min-h-[44px] items-center gap-2.5 pr-2", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: "/logo-studio.png",
                  alt: "",
                  className: "h-8 w-8 rounded-full transition-transform duration-500 group-hover:rotate-[-12deg]"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "hidden whitespace-nowrap text-[17px] font-medium tracking-tight text-text-primary sm:inline", children: "Digitalz Dev" })
            ] }),
            /* @__PURE__ */ jsx(
              motion.div,
              {
                className: "hidden overflow-hidden lg:block",
                initial: false,
                animate: { width: liensVisibles ? "auto" : 0, opacity: liensVisibles ? 1 : 0 },
                transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                children: /* @__PURE__ */ jsx("ul", { className: "flex items-center gap-1 whitespace-nowrap pl-4", children: LIENS.filter((l) => l.vers !== "/").map((lien2) => {
                  const classe = "inline-flex min-h-[40px] items-center rounded-xl px-3 text-[15px] text-text-primary transition-colors hover:text-text-muted";
                  return /* @__PURE__ */ jsx("li", { children: lien2.interne ? /* @__PURE__ */ jsx(Link, { to: lien2.vers, className: classe, children: lien2.libelle }) : /* @__PURE__ */ jsx("a", { href: lien2.vers, className: classe, children: lien2.libelle }) }, lien2.libelle);
                }) })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onPointerEnter: (e) => e.pointerType === "mouse" && setSurvol(true),
                onClick: () => {
                  if (window.matchMedia("(min-width: 1024px)").matches) setEpingle((v) => !v);
                  else setOuvert((o) => !o);
                },
                "aria-expanded": ouvert,
                "aria-controls": "menu-plein-ecran",
                "aria-label": ouvert ? "Fermer le menu" : "Ouvrir le menu",
                className: "relative z-[60] ml-1 flex h-10 w-10 items-center justify-center rounded-xl text-text-primary transition-colors hover:bg-surface-border/60",
                children: ouvert ? /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M3.5 3.5l9 9M12.5 3.5l-9 9" }) }) : /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 4 16", className: "h-4 w-1", fill: "currentColor", "aria-hidden": true, children: [
                  /* @__PURE__ */ jsx("circle", { cx: "2", cy: "2", r: "1.6" }),
                  /* @__PURE__ */ jsx("circle", { cx: "2", cy: "8", r: "1.6" }),
                  /* @__PURE__ */ jsx("circle", { cx: "2", cy: "14", r: "1.6" })
                ] })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "pointer-events-auto flex items-center gap-1 rounded-2xl bg-surface-card/75 p-1.5 backdrop-blur-xl", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/contact",
            className: "hidden min-h-[40px] items-center rounded-xl px-4 text-[15px] text-text-primary transition-colors hover:bg-surface-border/60 sm:inline-flex",
            children: "Contact"
          }
        ),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: QUIZ$2,
            className: "inline-flex min-h-[40px] items-center whitespace-nowrap rounded-xl bg-accent px-4 text-[15px] font-semibold text-surface transition-colors hover:bg-accent-hover",
            children: [
              /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Démo gratuite" }),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Ma démo gratuite" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: ouvert && /* @__PURE__ */ jsxs(
      motion.div,
      {
        id: "menu-plein-ecran",
        className: "fixed inset-0 z-40 flex flex-col justify-between bg-surface-light px-5 pb-8 pt-28 md:px-10 md:pb-10",
        initial: { clipPath: "inset(0% 0% 100% 0%)" },
        animate: { clipPath: "inset(0% 0% 0% 0%)" },
        exit: { clipPath: "inset(0% 0% 100% 0%)" },
        transition: { duration: 0.7, ease: EASE$6 },
        children: [
          /* @__PURE__ */ jsx("nav", { "aria-label": "Menu", children: /* @__PURE__ */ jsx("ul", { children: LIENS.map((lien2, i) => {
            const courant = estCourant(lien2, location.pathname);
            const classe = `group inline-flex items-center gap-4 text-[13vw] font-normal leading-[0.95] tracking-[-0.05em] transition-colors md:text-[7.5vw] ${courant ? "text-accent" : "text-text-primary hover:text-accent"}`;
            const contenu = /* @__PURE__ */ jsxs(Fragment, { children: [
              lien2.libelle,
              /* @__PURE__ */ jsx(
                "span",
                {
                  "aria-hidden": true,
                  className: "text-[0.4em] opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100",
                  children: "→"
                }
              )
            ] });
            return /* @__PURE__ */ jsx("li", { className: "overflow-hidden", children: /* @__PURE__ */ jsx(
              motion.div,
              {
                initial: { y: "110%" },
                animate: { y: 0 },
                exit: { y: "110%" },
                transition: { duration: 0.6, delay: 0.15 + i * 0.05, ease: [0.22, 1, 0.36, 1] },
                children: lien2.interne ? /* @__PURE__ */ jsx(Link, { to: lien2.vers, onClick: fermer, className: classe, "aria-current": courant ? "page" : void 0, children: contenu }) : /* @__PURE__ */ jsx("a", { href: lien2.vers, onClick: fermer, className: classe, children: contenu })
              }
            ) }, lien2.libelle);
          }) }) }),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0 },
              transition: { duration: 0.5, delay: 0.4 },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 text-[15px] font-medium text-text-secondary", children: [
                  /* @__PURE__ */ jsx(Heure, {}),
                  /* @__PURE__ */ jsx("a", { href: "mailto:zdigitalzdev@gmail.com", className: "transition-colors hover:text-accent", children: "zdigitalzdev@gmail.com" }),
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: "https://www.instagram.com/digitalzdev/",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "transition-colors hover:text-accent",
                      children: "Instagram"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: "https://www.linkedin.com/in/zakariya-nebbache-7b0644214/",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "transition-colors hover:text-accent",
                      children: "LinkedIn"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: QUIZ$2,
                    className: "inline-flex min-h-[60px] w-full items-center justify-center rounded-full bg-accent px-8 text-lg font-medium text-surface transition-colors hover:bg-accent-hover md:w-auto",
                    children: "Générer ma démo gratuite →"
                  }
                )
              ]
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
          "Ce site ne dépose aucun cookie publicitaire et ne vous suit pas. Le stockage local retient seulement que vous avez lu ce message. Les prises de contact passent par WhatsApp, qui ne s'ouvre que si vous cliquez.",
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
            className: "px-6 py-2.5 bg-accent text-surface text-sm font-display font-medium rounded-lg hover:opacity-90 transition-all whitespace-nowrap",
            children: "Compris"
          }
        )
      ] })
    }
  ) });
}
function Curseur() {
  const [actif, setActif] = useState(false);
  const [libelle, setLibelle] = useState(null);
  const [enfonce, setEnfonce] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  useEffect(() => {
    const fin = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const sobre = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fin || sobre) return;
    setActif(true);
    const bouger = (e) => {
      var _a;
      x.set(e.clientX);
      y.set(e.clientY);
      const cible = (_a = e.target) == null ? void 0 : _a.closest("[data-curseur]");
      setLibelle((cible == null ? void 0 : cible.dataset.curseur) ?? null);
    };
    const bas = () => setEnfonce(true);
    const haut = () => setEnfonce(false);
    window.addEventListener("pointermove", bouger);
    window.addEventListener("pointerdown", bas);
    window.addEventListener("pointerup", haut);
    return () => {
      window.removeEventListener("pointermove", bouger);
      window.removeEventListener("pointerdown", bas);
      window.removeEventListener("pointerup", haut);
    };
  }, [x, y]);
  if (!actif) return null;
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      "aria-hidden": true,
      className: "pointer-events-none fixed left-0 top-0 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-citron font-sans text-[11px] font-medium text-[#1d1d1f]",
      style: { x: sx, y: sy, translateX: "-50%", translateY: "-50%" },
      animate: {
        opacity: libelle ? 1 : 0,
        scale: libelle ? enfonce ? 0.85 : 1 : 0
      },
      transition: { type: "spring", stiffness: 400, damping: 30 },
      children: libelle ? /* @__PURE__ */ jsx(motion.span, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: libelle }) : null
    }
  );
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
const WHATSAPP_PROJET = `https://wa.me/33783259869?text=${encodeURIComponent(
  "Bonjour Digitalz Dev, j'aimerais vous parler de mon projet de site : "
)}`;
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
const EASE$5 = [0.22, 1, 0.36, 1];
const QUIZ$1 = "https://quiz.digitalzdev.com";
function Ligne$1({ children, delai }) {
  return /* @__PURE__ */ jsx("span", { className: "block overflow-hidden pb-[0.06em]", children: /* @__PURE__ */ jsx(
    motion.span,
    {
      className: "block",
      initial: { y: "110%" },
      animate: { y: 0 },
      transition: { duration: 1, delay: delai, ease: EASE$5 },
      children
    }
  ) });
}
function HeroStudio() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [son, setSon] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const requete = window.matchMedia("(max-width: 767px)");
    const suivre = () => setMobile(requete.matches);
    suivre();
    requete.addEventListener("change", suivre);
    return () => requete.removeEventListener("change", suivre);
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting ? void video.play().catch(() => {
      }) : video.pause(),
      { threshold: 0.1 }
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, []);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const [haut0, droite0, bas0, gauche0] = mobile ? [58, 5, 4, 5] : [56, 4, 5, 50];
  const haut = useTransform(scrollYProgress, [0, 0.6], [haut0, 0]);
  const droite = useTransform(scrollYProgress, [0, 0.6], [droite0, 0]);
  const bas = useTransform(scrollYProgress, [0, 0.6], [bas0, 0]);
  const gauche = useTransform(scrollYProgress, [0, 0.6], [gauche0, 0]);
  const rayon = useTransform(scrollYProgress, [0, 0.6], [mobile ? 18 : 28, 0]);
  const decoupe = useMotionTemplate`inset(${haut}% ${droite}% ${bas}% ${gauche}% round ${rayon}px)`;
  const zoom = useTransform(scrollYProgress, [0, 0.6], [1.15, 1]);
  const titreOpacite = useTransform(scrollYProgress, [0.05, 0.4], [1, 0]);
  const titreY = useTransform(scrollYProgress, [0, 0.4], ["0%", "-12%"]);
  const accrocheOpacite = useTransform(scrollYProgress, [0.62, 0.78], [0, 1]);
  const accrocheY = useTransform(scrollYProgress, [0.62, 0.78], [40, 0]);
  const basculerSon = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setSon(!video.muted);
    if (video.paused) void video.play().catch(() => {
    });
  };
  return /* @__PURE__ */ jsx("section", { ref: sectionRef, className: "relative h-[190vh] bg-surface md:h-[240vh]", children: /* @__PURE__ */ jsxs("div", { className: "sticky top-0 h-[100svh] overflow-hidden", children: [
    /* @__PURE__ */ jsxs(motion.div, { className: "absolute inset-0", style: { clipPath: decoupe }, children: [
      /* @__PURE__ */ jsx(
        motion.video,
        {
          ref: videoRef,
          className: "h-full w-full object-cover",
          style: { scale: zoom },
          src: "/videos/presentation.mp4",
          poster: "/videos/presentation-poster.jpg",
          muted: true,
          loop: true,
          playsInline: true,
          preload: "metadata",
          "aria-label": "Vidéo de présentation de Digitalz Dev"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" })
    ] }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "relative z-10 flex h-full flex-col justify-start px-5 pt-28 md:px-10 md:pt-32",
        style: { opacity: titreOpacite, y: titreY },
        children: [
          /* @__PURE__ */ jsxs("h1", { className: "whitespace-nowrap text-[8.6vw] font-extrabold uppercase leading-[1.02] text-text-primary md:text-[5vw] lg:text-[min(5vw,88px)]", children: [
            /* @__PURE__ */ jsx(Ligne$1, { delai: 0.25, children: "Créons un site" }),
            /* @__PURE__ */ jsx(Ligne$1, { delai: 0.35, children: "à la hauteur de" }),
            /* @__PURE__ */ jsxs(Ligne$1, { delai: 0.45, children: [
              "votre ",
              /* @__PURE__ */ jsx("span", { className: "text-pop", children: "image." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: "mt-6 max-w-sm md:absolute md:bottom-[7%] md:left-10 md:mt-0",
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8, delay: 0.8, ease: EASE$5 },
              children: [
                /* @__PURE__ */ jsx("p", { className: "hidden text-[15px] font-medium leading-relaxed text-text-secondary md:block", children: "Cabinets d'avocats, agences d'architecture, photographes et vidéastes : nous concevons des sites sobres et rapides, qui inspirent confiance et font venir les bons clients." }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 md:mt-5", children: [
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: WHATSAPP_PROJET,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "inline-flex min-h-[46px] items-center rounded-full bg-accent px-5 text-sm font-semibold text-surface transition-colors hover:bg-accent-hover md:min-h-[48px] md:px-6 md:text-[15px]",
                      children: "Prendre rendez-vous"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: QUIZ$1,
                      className: "inline-flex min-h-[46px] items-center rounded-full bg-surface-card px-5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-border md:min-h-[48px] md:px-6 md:text-[15px]",
                      children: "Voir un aperçu"
                    }
                  )
                ] })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "absolute inset-x-0 bottom-0 z-10 flex flex-col gap-5 px-5 pb-10 md:flex-row md:items-end md:justify-between md:px-10 md:pb-14",
        style: { opacity: accrocheOpacite, y: accrocheY },
        children: [
          /* @__PURE__ */ jsxs("h2", { className: "max-w-3xl text-5xl text-white md:text-7xl", children: [
            "Votre site à votre image.",
            /* @__PURE__ */ jsx("span", { className: "block font-extrabold text-[#1d1d1f]", children: "Un aperçu en 60 secondes." })
          ] }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: QUIZ$1,
              "data-curseur": "Go",
              className: "inline-flex min-h-[56px] w-fit items-center gap-2 rounded-full bg-accent px-8 text-base font-semibold text-surface transition-colors hover:bg-accent-hover",
              children: "Voir mon aperçu →"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: basculerSon,
        "aria-label": son ? "Couper le son" : "Activer le son",
        className: "absolute bottom-[6%] right-[8%] z-20 inline-flex min-h-[40px] items-center rounded-full bg-black/50 px-4 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/70 md:bottom-auto md:right-10 md:top-28",
        children: son ? "Son activé" : "Son coupé"
      }
    )
  ] }) });
}
const PHRASE = [
  { texte: "Pas seulement esthétique.", accent: false },
  { texte: "Pensé pour le référencement.", accent: true }
];
const MOTS = PHRASE.flatMap(
  (p) => p.texte.split(" ").map((mot) => ({ mot, accent: p.accent }))
);
function Mot({
  mot,
  accent,
  p,
  i,
  n
}) {
  const opacite = useTransform(p, [i / n, (i + 1) / n], [0.14, 1]);
  return /* @__PURE__ */ jsxs(motion.span, { style: { opacity: opacite }, className: accent ? "text-pop" : "text-text-primary", children: [
    mot,
    " "
  ] });
}
function ManifesteStudio() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  return /* @__PURE__ */ jsx("section", { className: "bg-surface px-5 pb-2 pt-20 md:px-10 md:pb-4 md:pt-32", children: /* @__PURE__ */ jsx("div", { ref, className: "mx-auto max-w-7xl", children: /* @__PURE__ */ jsx("h2", { className: "mx-auto max-w-5xl text-center text-[8vw] font-extrabold uppercase leading-[1.04] md:text-[4.6vw] lg:text-[min(4.4vw,76px)]", children: MOTS.map((m, i) => /* @__PURE__ */ jsx(Mot, { mot: m.mot, accent: m.accent, p: scrollYProgress, i, n: MOTS.length }, `${m.mot}-${i}`)) }) }) });
}
function CarteProjet({ projet, className = "" }) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: projet.route,
      "data-curseur": "Voir",
      className: `group block shrink-0 ${className}`,
      children: [
        /* @__PURE__ */ jsx("div", { className: "relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-card md:aspect-[16/10] lg:aspect-auto lg:h-[calc(100svh-14rem)]", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: projet.heroImage,
            alt: `Site ${projet.title}`,
            loading: "eager",
            decoding: "async",
            className: "h-full w-full object-cover object-top transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-normal tracking-tight text-text-primary md:text-2xl", children: projet.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm font-medium text-text-secondary md:text-base", children: projet.subtitle })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "mt-2 shrink-0 rounded-full bg-surface-card px-3 py-1 text-xs font-medium text-text-secondary", children: projet.year })
        ] })
      ]
    }
  );
}
function Selection() {
  const sectionRef = useRef(null);
  const pisteRef = useRef(null);
  const [course, setCourse] = useState(0);
  useEffect(() => {
    const mesurer = () => {
      const piste = pisteRef.current;
      if (piste) setCourse(Math.max(0, piste.scrollWidth - window.innerWidth));
    };
    mesurer();
    window.addEventListener("resize", mesurer);
    return () => window.removeEventListener("resize", mesurer);
  }, []);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -course]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "section",
      {
        ref: sectionRef,
        className: "relative hidden lg:block",
        style: { height: `calc(100vh + ${course}px)` },
        children: /* @__PURE__ */ jsx("div", { className: "sticky top-0 flex h-screen flex-col justify-start overflow-hidden pt-24", children: /* @__PURE__ */ jsx(motion.div, { ref: pisteRef, className: "flex gap-8 px-10 will-change-transform", style: { x }, children: projects.map((p) => /* @__PURE__ */ jsx(CarteProjet, { projet: p, className: "w-[46vw]" }, p.id)) }) })
      }
    ),
    /* @__PURE__ */ jsx("section", { className: "pb-6 pt-24 lg:hidden", children: /* @__PURE__ */ jsx("div", { className: "flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]", children: projects.map((p) => /* @__PURE__ */ jsx(CarteProjet, { projet: p, className: "w-[82vw] snap-center sm:w-[60vw]" }, p.id)) }) })
  ] });
}
function TravauxStudio() {
  return /* @__PURE__ */ jsx("div", { id: "projets", children: /* @__PURE__ */ jsx(Selection, {}) });
}
function Carte({
  service,
  i,
  n,
  progression
}) {
  const echelle = useTransform(progression, [i / n, 1], [1, 1 - (n - 1 - i) * 0.035]);
  const voile = useTransform(progression, [i / n, 1], [0, (n - 1 - i) * 0.08]);
  const accent = i === n - 1;
  return /* @__PURE__ */ jsx("div", { className: "sticky", style: { top: `calc(12svh + ${i * 22}px)` }, children: /* @__PURE__ */ jsxs(
    motion.article,
    {
      style: { scale: echelle },
      className: `relative origin-top overflow-hidden rounded-[1.75rem] will-change-transform p-7 md:min-h-[62vh] md:p-12 ${accent ? "bg-pop text-white" : "bg-surface-card text-text-primary"}`,
      children: [
        /* @__PURE__ */ jsx(motion.div, { "aria-hidden": true, className: "pointer-events-none absolute inset-0 z-10 bg-black", style: { opacity: voile } }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-8 md:grid-cols-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-7", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-3xl font-normal leading-[1] tracking-tight md:text-5xl", children: service.title }),
            /* @__PURE__ */ jsx("p", { className: `mt-4 text-lg font-medium md:text-xl ${accent ? "text-white" : "text-accent"}`, children: service.lead })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-5", children: [
            /* @__PURE__ */ jsx("p", { className: `text-[15px] font-medium leading-relaxed md:text-base ${accent ? "text-white/80" : "text-text-secondary"}`, children: service.body }),
            /* @__PURE__ */ jsx("ul", { className: "mt-6 space-y-2", children: service.points.map((point) => /* @__PURE__ */ jsx(
              "li",
              {
                className: `rounded-xl px-4 py-3 text-sm font-medium ${accent ? "bg-white/15" : "bg-surface-light"}`,
                children: point
              },
              point
            )) })
          ] })
        ] })
      ]
    }
  ) });
}
function ServicesStudio() {
  const pileRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: pileRef, offset: ["start start", "end end"] });
  return /* @__PURE__ */ jsx("section", { id: "services", className: "bg-surface px-5 pb-8 pt-8 md:px-10 md:pb-10 md:pt-10", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl", children: [
    /* @__PURE__ */ jsxs("h2", { className: "max-w-5xl text-[9vw] text-text-primary md:text-5xl lg:text-6xl", children: [
      "Une agence web qui conçoit, développe ",
      /* @__PURE__ */ jsx("span", { className: "font-bold text-pop", children: "et fait connaître votre site." })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-2xl text-lg font-medium text-text-secondary", children: "Création de site internet, boutique en ligne, refonte, outil métier et campagnes publicitaires. Un projet de site web se juge sur ce qu'il rapporte une fois en ligne, pas sur sa maquette." }),
    /* @__PURE__ */ jsx("div", { ref: pileRef, className: "mt-16 space-y-6 md:mt-24 md:space-y-10", children: SERVICES$1.map((s, i) => /* @__PURE__ */ jsx(Carte, { service: s, i, n: SERVICES$1.length, progression: scrollYProgress }, s.title)) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 flex flex-col items-start gap-6 rounded-[1.75rem] bg-surface-light p-8 md:mt-16 md:flex-row md:items-center md:justify-between md:p-12", children: [
      /* @__PURE__ */ jsx("p", { className: "max-w-2xl text-xl font-medium leading-snug text-text-primary md:text-2xl", children: "Vous avez un projet de site internet, une boutique à ouvrir ou un site à refondre ? Décrivez-le-nous directement sur WhatsApp." }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: WHATSAPP_PROJET,
          target: "_blank",
          rel: "noopener noreferrer",
          "data-curseur": "WhatsApp",
          className: "inline-flex min-h-[56px] shrink-0 items-center rounded-full bg-accent px-8 text-base font-medium text-surface transition-colors hover:bg-accent-hover",
          children: "Décrire mon projet"
        }
      )
    ] })
  ] }) });
}
const LEVIERS = [
  {
    titre: "Référencement naturel",
    accroche: "Être trouvé sur ce que cherchent vos clients.",
    points: [
      "Articles de fond sur les questions de vos clients",
      "Pages par spécialité, type de projet ou prestation",
      "Structure technique, vitesse et balisage soignés",
      "Suivi mensuel des positions et du trafic"
    ]
  },
  {
    titre: "Fiche Google",
    accroche: "Apparaître dans les premiers résultats de Maps.",
    points: [
      "Fiche d’établissement complétée et optimisée",
      "Photos, horaires, domaines et publications régulières",
      "Collecte et réponse aux avis clients",
      "Visibilité locale, ville par ville"
    ]
  },
  {
    titre: "Google Ads",
    accroche: "En tête des recherches dès la semaine suivante.",
    points: [
      "Campagnes sur les recherches qui précèdent un appel",
      "Annonces, extensions d’appel et de lieu",
      "Suivi des appels et des formulaires reçus",
      "Budget piloté sur le coût par demande"
    ]
  },
  {
    titre: "Meta Ads",
    accroche: "Montrer votre travail là où il se regarde.",
    points: [
      "Diffusion de vos réalisations sur Instagram et Facebook",
      "Ciblage par zone et par profil de client",
      "Reciblage des visiteurs de votre site",
      "Formulaires de contact intégrés aux publicités"
    ]
  }
];
const REQUETE = "avocat droit des affaires lyon";
const NOTE_DEBUT = 3;
const NOTE_FIN = 5;
const CONCURRENTS = [
  { titre: "Cabinet Durand & Associés · Avocats Lyon", url: "durand-avocats.fr", texte: "Conseil et contentieux des entreprises. Prise de rendez-vous par téléphone." },
  { titre: "Avocat affaires Lyon : annuaire des cabinets", url: "annuaire-juridique.com", texte: "Comparez 240 avocats en droit des affaires à Lyon et dans le Rhône." },
  { titre: "Lefèvre Avocats · Droit commercial", url: "lefevre-avocats.com", texte: "Création de société, baux commerciaux, recouvrement de créances." },
  { titre: "Droit des affaires : trouver un avocat", url: "forum-entrepreneurs.fr", texte: "Discussion · 38 réponses · Quel avocat choisir pour une levée de fonds ?" }
];
const CLIENT = {
  titre: "Martin Avocats · Droit des affaires à Lyon",
  url: "martin-avocats.fr",
  texte: "Cabinet dédié aux entreprises : création, contrats, levées de fonds. Premier rendez-vous sous 48 h."
};
function useHauteurLigne() {
  const [h, setH] = useState(84);
  useEffect(() => {
    const requete = window.matchMedia("(max-width: 767px)");
    const suivre = () => setH(requete.matches ? 104 : 84);
    suivre();
    requete.addEventListener("change", suivre);
    return () => requete.removeEventListener("change", suivre);
  }, []);
  return h;
}
function Etoiles$1({ remplissage }) {
  return /* @__PURE__ */ jsxs("span", { className: "relative inline-flex text-[#dadce0]", "aria-hidden": true, children: [
    "★★★★★",
    /* @__PURE__ */ jsx(motion.span, { className: "absolute inset-0 text-[#fbbc04]", style: { clipPath: remplissage }, children: "★★★★★" })
  ] });
}
function LogoGoogle$1({ className = "" }) {
  return /* @__PURE__ */ jsxs("span", { className: `font-medium tracking-tight ${className}`, "aria-label": "Google", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[#4285f4]", children: "G" }),
    /* @__PURE__ */ jsx("span", { className: "text-[#ea4335]", children: "o" }),
    /* @__PURE__ */ jsx("span", { className: "text-[#fbbc05]", children: "o" }),
    /* @__PURE__ */ jsx("span", { className: "text-[#4285f4]", children: "g" }),
    /* @__PURE__ */ jsx("span", { className: "text-[#34a853]", children: "l" }),
    /* @__PURE__ */ jsx("span", { className: "text-[#ea4335]", children: "e" })
  ] });
}
function Ligne({
  i,
  position,
  r,
  h
}) {
  const y = useTransform(position, (p) => (i + Math.min(1, Math.max(0, i + 1 - p))) * h);
  return /* @__PURE__ */ jsx(motion.div, { className: "absolute inset-x-0 top-0 px-1", style: { y }, children: /* @__PURE__ */ jsx(Resultat, { ...r }) });
}
function Resultat({
  titre,
  url,
  texte,
  client = false,
  fiche
}) {
  return /* @__PURE__ */ jsxs("div", { className: `rounded-xl px-3 py-2.5 ${client ? "bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5" : ""}`, children: [
    /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-[#4d5156]", children: url }),
    /* @__PURE__ */ jsx("p", { className: `truncate text-[15px] leading-snug md:text-[17px] ${client ? "text-[#1a0dab]" : "text-[#1a0dab]/80"}`, children: titre }),
    fiche && /* @__PURE__ */ jsxs("p", { className: "mt-0.5 flex items-center gap-1.5 text-xs text-[#4d5156] md:hidden", children: [
      /* @__PURE__ */ jsx(motion.span, { className: "tabular-nums text-[#202124]", children: fiche.note }),
      /* @__PURE__ */ jsx(Etoiles$1, { remplissage: fiche.remplissage }),
      /* @__PURE__ */ jsx(motion.span, { className: "tabular-nums", children: fiche.avis })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "line-clamp-2 text-xs text-[#4d5156] md:text-[13px]", children: texte })
  ] });
}
const COULEURS = ["#4285f4", "#ea4335", "#fbbc05", "#34a853", "#a142f4", "#ff6d01"];
function Eclat({ cle }) {
  return /* @__PURE__ */ jsxs("span", { "aria-hidden": true, className: "pointer-events-none absolute inset-0", children: [
    COULEURS.concat(COULEURS).map((c, i) => {
      const angle = i / 12 * Math.PI * 2;
      const distance = 34 + i % 3 * 10;
      return /* @__PURE__ */ jsx(
        motion.span,
        {
          className: "absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full",
          style: { backgroundColor: c },
          initial: { x: 0, y: 0, scale: 0, opacity: 1 },
          animate: {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            scale: [0, 1.4, 0],
            opacity: [1, 1, 0]
          },
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        },
        i
      );
    }),
    [
      { c: "#fbbc05", cls: "-right-2 -top-2" },
      { c: "#4285f4", cls: "-bottom-2 -left-1" }
    ].map((e, i) => /* @__PURE__ */ jsx(
      motion.svg,
      {
        viewBox: "0 0 24 24",
        className: `absolute h-4 w-4 ${e.cls}`,
        initial: { scale: 0, rotate: -30, opacity: 0 },
        animate: { scale: [0, 1.2, 0.9, 1.1, 0], rotate: [-30, 0, 20, 0, 30], opacity: [0, 1, 1, 1, 0] },
        transition: { duration: 1.4, delay: 0.15 + i * 0.2 },
        children: /* @__PURE__ */ jsx("path", { fill: e.c, d: "M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" })
      },
      i
    ))
  ] }, cle);
}
function useEclat(progression, seuil) {
  const [cle, setCle] = useState(0);
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(progression, "change", (v) => {
    const dedans = v >= seuil;
    if (dedans && !visible) setCle((c) => c + 1);
    if (dedans !== visible) setVisible(dedans);
  });
  return visible ? cle : 0;
}
function Badge({
  progression,
  debut,
  className,
  titre,
  detail
}) {
  const opacite = useTransform(progression, [debut, debut + 0.08], [0, 1]);
  const y = useTransform(progression, [debut, debut + 0.08], [24, 0]);
  const eclat = useEclat(progression, debut + 0.02);
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      className: `rounded-xl bg-white px-3 py-2 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.4)] ring-1 ring-black/5 lg:rounded-2xl lg:px-4 lg:py-3 ${className}`,
      style: { opacity: opacite, y },
      children: [
        eclat > 0 && /* @__PURE__ */ jsx(Eclat, { cle: eclat }),
        /* @__PURE__ */ jsx("p", { className: "text-[13px] font-medium text-text-primary lg:text-sm", children: titre }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-text-secondary lg:text-xs", children: detail })
      ]
    }
  );
}
function RechercheGoogle() {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const texteRequete = useTransform(
    p,
    (v) => REQUETE.slice(0, Math.round(Math.min(1, Math.max(0, v / 0.18)) * REQUETE.length))
  );
  const t = useTransform(p, [0.3, 0.8], [0, 1], { clamp: true });
  const fiche = {
    note: useTransform(t, (v) => (NOTE_DEBUT + v * (NOTE_FIN - NOTE_DEBUT)).toFixed(1).replace(".", ",")),
    avis: useTransform(t, (v) => `(${Math.round(12 + v * 136)})`),
    remplissage: useTransform(t, (v) => `inset(0 ${100 - (NOTE_DEBUT + v * (NOTE_FIN - NOTE_DEBUT)) * 20}% 0 0)`)
  };
  const position = useTransform(p, [0.2, 0.75], [CONCURRENTS.length, 0], { clamp: true });
  const H = useHauteurLigne();
  const yClient = useTransform(position, (v) => v * H);
  const resultatsOpacite = useTransform(p, [0.14, 0.22], [0, 1]);
  const sponsorise = useTransform(p, [0.78, 0.86], [0, 1]);
  return /* @__PURE__ */ jsx("section", { ref, className: "relative h-[240vh] bg-surface md:h-[280vh]", children: /* @__PURE__ */ jsxs("div", { className: "sticky top-0 flex h-[100svh] flex-col items-center justify-start gap-4 overflow-hidden px-4 pt-16 md:gap-6 md:px-10 md:pt-28", children: [
    /* @__PURE__ */ jsx(Badge, { progression: p, debut: 0.3, className: "absolute left-1 top-[36%] z-20 lg:left-[4%] lg:top-[22%]", titre: "Optimisation SEO", detail: "Positions suivies chaque mois" }),
    /* @__PURE__ */ jsx(Badge, { progression: p, debut: 0.5, className: "absolute right-1 top-[55%] z-20 lg:right-[4%] lg:top-[30%]", titre: "Google Ads", detail: "+214 % de clics qualifiés" }),
    /* @__PURE__ */ jsx(Badge, { progression: p, debut: 0.66, className: "absolute bottom-[10%] left-1 z-20 lg:bottom-[16%] lg:left-[6%]", titre: "Meta Ads", detail: "Vos réalisations sur Instagram" }),
    /* @__PURE__ */ jsxs("h2", { className: "w-full max-w-4xl text-center text-[7vw] text-text-primary md:text-4xl lg:text-[2.6rem]", children: [
      "Un beau site ne suffit pas. ",
      /* @__PURE__ */ jsx("span", { className: "font-bold text-citron", children: "Il doit être trouvé." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-[0_40px_90px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-[#f1f3f4] px-4 py-2.5", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-[#ff5f57]" }),
        /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-[#febc2e]" }),
        /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-[#28c840]" }),
        /* @__PURE__ */ jsx("span", { className: "ml-3 truncate rounded-md bg-white px-3 py-1 text-[11px] text-[#5f6368]", children: "google.fr/search" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-4 pb-6 pt-4 md:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(LogoGoogle$1, { className: "hidden text-2xl md:inline" }),
          /* @__PURE__ */ jsxs("div", { className: "flex min-h-[44px] flex-1 items-center rounded-full bg-white px-5 text-[15px] text-[#202124] shadow-[0_1px_6px_rgba(32,33,36,0.28)]", children: [
            /* @__PURE__ */ jsx(motion.span, { children: texteRequete }),
            /* @__PURE__ */ jsx(
              motion.span,
              {
                "aria-hidden": true,
                className: "ml-0.5 inline-block h-5 w-px bg-[#202124]",
                animate: { opacity: [1, 0, 1] },
                transition: { duration: 1, repeat: Infinity }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs(motion.div, { className: "mt-5 grid gap-6 md:grid-cols-[1fr_15rem]", style: { opacity: resultatsOpacite }, children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", style: { height: (CONCURRENTS.length + 1) * H }, children: [
            CONCURRENTS.map((r, i) => /* @__PURE__ */ jsx(Ligne, { i, position, r, h: H }, r.url)),
            /* @__PURE__ */ jsx(motion.div, { className: "absolute inset-x-0 top-0 z-10 px-1", style: { y: yClient }, children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                motion.span,
                {
                  className: "absolute -top-2 right-3 rounded-md bg-[#1a73e8] px-2 py-0.5 text-[10px] font-medium text-white",
                  style: { opacity: sponsorise },
                  children: "Sponsorisé"
                }
              ),
              /* @__PURE__ */ jsx(Resultat, { ...CLIENT, client: true, fiche })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "hidden self-start rounded-xl p-4 ring-1 ring-black/10 md:block", children: [
            /* @__PURE__ */ jsx("div", { className: "h-24 rounded-lg bg-gradient-to-br from-[#e8eaed] to-[#c9ccd1]" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-[17px] text-[#202124]", children: "Martin Avocats" }),
            /* @__PURE__ */ jsxs("p", { className: "mt-0.5 flex items-center gap-1.5 text-sm text-[#4d5156]", children: [
              /* @__PURE__ */ jsx(motion.span, { className: "tabular-nums text-[#202124]", children: fiche.note }),
              /* @__PURE__ */ jsx(Etoiles$1, { remplissage: fiche.remplissage }),
              /* @__PURE__ */ jsx(motion.span, { className: "tabular-nums", children: fiche.avis })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-[#4d5156]", children: "Avocat · Lyon 2e · Ouvert" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-3 gap-1.5 text-center text-[11px] text-[#1a73e8]", children: [
              /* @__PURE__ */ jsx("span", { className: "rounded-full py-1.5 ring-1 ring-black/10", children: "Itinéraire" }),
              /* @__PURE__ */ jsx("span", { className: "rounded-full py-1.5 ring-1 ring-black/10", children: "Site" }),
              /* @__PURE__ */ jsx("span", { className: "rounded-full py-1.5 ring-1 ring-black/10", children: "Appeler" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
const EASE$4 = [0.22, 1, 0.36, 1];
const LARGEURS = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"];
const SURVOL = [
  { carte: "[@media(hover:hover)]:hover:bg-[#1d1d1f]", texte: "[@media(hover:hover)]:group-hover:text-white", puce: "[@media(hover:hover)]:group-hover:bg-white" },
  { carte: "[@media(hover:hover)]:hover:bg-[#6e7177]", texte: "[@media(hover:hover)]:group-hover:text-white", puce: "[@media(hover:hover)]:group-hover:bg-white" },
  { carte: "[@media(hover:hover)]:hover:bg-pop", texte: "[@media(hover:hover)]:group-hover:text-white", puce: "[@media(hover:hover)]:group-hover:bg-white" },
  { carte: "[@media(hover:hover)]:hover:bg-citron", texte: "[@media(hover:hover)]:group-hover:text-[#1d1d1f]", puce: "[@media(hover:hover)]:group-hover:bg-[#1d1d1f]" }
];
function AcquisitionStudio() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { id: "acquisition", children: /* @__PURE__ */ jsx(RechercheGoogle, {}) }),
    /* @__PURE__ */ jsx("section", { className: "bg-surface px-5 pb-8 pt-16 md:px-10 md:pb-10 md:pt-8", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl", children: /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-6", children: LEVIERS.map((levier, i) => /* @__PURE__ */ jsxs(
      motion.article,
      {
        className: `group flex flex-col justify-between rounded-[1.75rem] bg-surface-card p-7 transition-colors duration-500 md:min-h-[24rem] md:p-10 ${SURVOL[i].carte} ${LARGEURS[i]}`,
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.8, delay: i * 0.08, ease: EASE$4 },
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: `text-sm font-medium text-accent transition-colors duration-500 ${SURVOL[i].texte}`, children: levier.titre }),
            /* @__PURE__ */ jsx("h3", { className: `mt-4 text-2xl font-normal leading-[1.05] tracking-tight text-text-primary transition-colors duration-500 md:text-3xl ${SURVOL[i].texte}`, children: levier.accroche })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "mt-8 space-y-2", children: levier.points.map((point) => /* @__PURE__ */ jsxs(
            "li",
            {
              className: `flex gap-3 text-[15px] font-medium text-text-secondary transition-colors duration-500 ${SURVOL[i].texte}`,
              children: [
                /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: `mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pop transition-colors duration-500 ${SURVOL[i].puce}` }),
                point
              ]
            },
            point
          )) })
        ]
      },
      levier.titre
    )) }) }) })
  ] });
}
const MEMBERS = [
  {
    initials: "ZN",
    name: "Zakariya N.",
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
  }
];
const FACTS = [
  { value: "8", label: "projets en ligne" },
  { value: "6", label: "secteurs couverts" },
  { value: "2", label: "métiers réunis" }
];
const SERVICES = [
  { title: "Conception et développement", body: "Sites vitrines, boutiques Shopify, plateformes métier et applications iOS. Du cadrage à la mise en ligne." },
  { title: "Meta Ads et Google Ads", body: "Mise en place et pilotage des campagnes : structure des comptes, audiences, création des annonces, budget et arbitrages." },
  { title: "Mesure et conversions", body: "Tracking, événements de conversion et lecture des résultats, pour savoir ce qui rapporte et ce qui coûte." }
];
const FONDATEUR = MEMBERS[0];
const DISCIPLINES_EQUIPE = [
  "Direction artistique",
  "UX / UI",
  "Stratégie de marque",
  "Meta Ads",
  "Google Ads",
  "Tracking & conversions",
  "Gestion de projet"
];
const PHOTOS = [
  { src: "/images/equipe/atelier.webp", alt: "L'équipe au travail autour d'un bureau", classe: "aspect-[4/3] md:col-span-7 md:aspect-auto md:h-[26rem]" },
  { src: "/images/equipe/creation.webp", alt: "Séance de création sur un projet de site", classe: "aspect-[4/3] md:col-span-5 md:aspect-auto md:h-[26rem]" },
  { src: "/images/equipe/moodboard.webp", alt: "Réunion devant un tableau d'inspiration", classe: "aspect-[4/3] md:col-span-4 md:aspect-auto md:h-72" },
  { src: "/images/equipe/strategie.webp", alt: "Point stratégie devant un tableau de bord", classe: "aspect-[4/3] md:col-span-4 md:aspect-auto md:h-72" },
  { src: "/images/equipe/reunion.webp", alt: "Échange avec l'équipe en réunion", classe: "aspect-[4/3] md:col-span-4 md:aspect-auto md:h-72" }
];
const EASE$3 = [0.22, 1, 0.36, 1];
function Chiffre({ valeur }) {
  const ref = useRef(null);
  const vu = useInView(ref, { once: true, margin: "-60px" });
  const cible = parseInt(valeur, 10);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!vu || Number.isNaN(cible)) return;
    const debut = performance.now();
    let f = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - debut) / 1200);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * cible));
      if (p < 1) f = requestAnimationFrame(tick);
    };
    f = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(f);
  }, [vu, cible]);
  return /* @__PURE__ */ jsx("span", { ref, children: Number.isNaN(cible) ? valeur : n });
}
function EquipeStudio() {
  return /* @__PURE__ */ jsx("section", { id: "agence", className: "bg-surface-light px-5 py-10 md:px-10 md:py-14", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-10 lg:grid-cols-12", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-7", children: /* @__PURE__ */ jsxs("h2", { className: "text-[9vw] text-text-primary md:text-5xl lg:text-6xl", children: [
        "Une équipe, ",
        /* @__PURE__ */ jsx("span", { className: "font-bold text-citron", children: "deux métiers complets." })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "self-end text-lg font-medium leading-relaxed text-text-secondary lg:col-span-5", children: "Pas de chaîne d'intermédiaires : vous parlez directement à l'équipe qui conçoit et qui développe votre site. Et le travail ne s'arrête pas à la mise en ligne : nous mettons aussi en place et pilotons vos campagnes Meta Ads et Google Ads." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-4 md:mt-16 md:grid-cols-12", children: PHOTOS.map((photo, i) => /* @__PURE__ */ jsx(
      motion.figure,
      {
        className: `overflow-hidden rounded-[1.75rem] bg-surface-card ${photo.classe}`,
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.8, delay: i * 0.08, ease: EASE$3 },
        children: /* @__PURE__ */ jsx(
          "img",
          {
            src: photo.src,
            alt: photo.alt,
            loading: "lazy",
            decoding: "async",
            className: "h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03]"
          }
        )
      },
      photo.src
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(
        motion.article,
        {
          className: "flex flex-col rounded-[1.75rem] bg-surface-card p-8 md:p-10",
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.8, ease: EASE$3 },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("span", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-citron text-xl font-normal text-[#1d1d1f]", children: FONDATEUR.initials }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-2xl font-normal tracking-tight text-text-primary md:text-3xl", children: FONDATEUR.name }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-accent", children: [
                  "Fondateur · ",
                  FONDATEUR.role
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-6 flex-1 text-[15px] font-medium leading-relaxed text-text-secondary", children: FONDATEUR.pitch }),
            /* @__PURE__ */ jsx("ul", { className: "mt-6 flex flex-wrap gap-2", children: FONDATEUR.disciplines.map((d) => /* @__PURE__ */ jsx("li", { className: "rounded-full bg-surface-light px-3 py-1.5 text-xs font-medium text-text-secondary", children: d }, d)) }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: FONDATEUR.linkedin,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "mt-6 inline-flex min-h-[44px] w-fit items-center text-sm font-medium text-text-primary transition-colors hover:text-accent",
                children: "Profil LinkedIn ↗"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.article,
        {
          className: "flex flex-col rounded-[1.75rem] bg-pop p-8 text-white md:p-10",
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.8, delay: 0.1, ease: EASE$3 },
          children: [
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-normal tracking-tight md:text-3xl", children: "L'équipe" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white/75", children: "Direction de projet, design et marketing" }),
            /* @__PURE__ */ jsx("p", { className: "mt-6 flex-1 text-[15px] font-medium leading-relaxed text-white/85", children: "Autour du développement, une équipe cadre votre besoin, dessine le parcours, pilote le projet jusqu'à la livraison, puis fait vivre le site une fois en ligne : campagnes Meta Ads et Google Ads, suivi des conversions, améliorations continues." }),
            /* @__PURE__ */ jsx("ul", { className: "mt-6 flex flex-wrap gap-2", children: DISCIPLINES_EQUIPE.map((d) => /* @__PURE__ */ jsx("li", { className: "rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white", children: d }, d)) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 grid gap-4 md:grid-cols-3", children: SERVICES.map((r, i) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "rounded-[1.75rem] bg-surface-card p-7",
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.7, delay: i * 0.08, ease: EASE$3 },
        children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-normal text-text-primary", children: r.title }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-medium leading-relaxed text-text-secondary", children: r.body })
        ]
      },
      r.title
    )) }),
    /* @__PURE__ */ jsx("div", { className: "mt-16 grid grid-cols-3 gap-4 md:mt-24", children: FACTS.map((f) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[13vw] font-extrabold leading-none tracking-[-0.04em] text-pop md:text-[6vw] lg:text-[min(6vw,104px)]", children: /* @__PURE__ */ jsx(Chiffre, { valeur: f.value }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs font-medium uppercase tracking-[0.18em] text-text-secondary md:text-sm", children: f.label })
    ] }, f.label)) })
  ] }) });
}
const EASE$2 = [0.22, 1, 0.36, 1];
const DUREES = { sonne: 2600, decroche: 900 };
function Combine({ className = "" }) {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className, fill: "currentColor", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z" }) });
}
function AppelEntrant() {
  const ref = useRef(null);
  const visible = useInView(ref, { amount: 0.6 });
  const [etape, setEtape] = useState("sonne");
  const [secondes, setSecondes] = useState(0);
  const pisteRef = useRef(null);
  const [course, setCourse] = useState(0);
  useLayoutEffect(() => {
    const piste = pisteRef.current;
    if (!piste) return;
    const mesurer = () => setCourse(piste.clientWidth - 56);
    mesurer();
    const obs = new ResizeObserver(mesurer);
    obs.observe(piste);
    return () => obs.disconnect();
  }, [etape]);
  useEffect(() => {
    if (!visible) {
      setEtape("sonne");
      setSecondes(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEtape("enligne");
      return;
    }
    const t1 = window.setTimeout(() => setEtape("decroche"), DUREES.sonne);
    const t2 = window.setTimeout(() => setEtape("enligne"), DUREES.sonne + DUREES.decroche);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [visible]);
  useEffect(() => {
    if (etape !== "enligne") return;
    const t = window.setInterval(() => setSecondes((s) => s + 1), 1e3);
    return () => window.clearInterval(t);
  }, [etape]);
  const duree = `${String(Math.floor(secondes / 60)).padStart(2, "0")}:${String(secondes % 60).padStart(2, "0")}`;
  const sonne = etape === "sonne";
  return /* @__PURE__ */ jsxs("div", { ref, className: "relative mx-auto flex h-[30rem] w-full items-center justify-center md:h-[34rem]", children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        "aria-hidden": true,
        className: "pointer-events-none absolute inset-0 flex items-center justify-center",
        animate: { opacity: sonne ? 1 : 0 },
        transition: { duration: 0.6, ease: "easeOut" },
        children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx(
          "span",
          {
            className: "onde-appel absolute h-64 w-64 rounded-full border-2 border-[#25D366]/50",
            style: { animationDelay: `${-i * 0.9}s` }
          },
          i
        ))
      }
    ),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        className: "relative h-[27rem] w-[13.5rem] rounded-[2.6rem] bg-[#1d1d1f] p-[7px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)] md:h-[31rem] md:w-[15.5rem]",
        animate: sonne ? { rotate: [0, -3, 3, -3, 3, -2, 2, 0, 0, 0], x: [0, -2, 2, -2, 2, -1, 1, 0, 0, 0] } : { rotate: 0, x: 0, y: etape === "decroche" ? -8 : 0 },
        transition: sonne ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5, ease: EASE$2 },
        children: /* @__PURE__ */ jsxs("div", { className: "relative flex h-full w-full flex-col overflow-hidden rounded-[2.2rem] bg-gradient-to-b from-[#3a3d42] via-[#26282c] to-[#161718] px-5 pb-8 pt-12 text-white", children: [
          /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black" }),
          /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: etape !== "enligne" ? /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: "flex h-full flex-col items-center",
              exit: { opacity: 0, y: -10 },
              transition: { duration: 0.35 },
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60", children: "Appel entrant…" }),
                /* @__PURE__ */ jsx("span", { className: "mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl", children: "NC" }),
                /* @__PURE__ */ jsx("p", { className: "mt-3 text-xl", children: "Nouveau client" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "via digitalzdev.com" }),
                /* @__PURE__ */ jsx("div", { className: "mt-auto w-full", children: /* @__PURE__ */ jsxs("div", { ref: pisteRef, className: "relative h-14 w-full overflow-hidden rounded-full bg-white/15", children: [
                  /* @__PURE__ */ jsx(
                    motion.p,
                    {
                      className: "absolute inset-0 flex items-center justify-center pl-12 text-[11px] text-white/70 md:text-xs",
                      animate: { opacity: etape === "decroche" ? 0 : [0.4, 1, 0.4] },
                      transition: etape === "decroche" ? { duration: 0.2 } : { duration: 1.8, repeat: Infinity },
                      children: "faire glisser pour répondre"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    motion.span,
                    {
                      className: "absolute left-1 top-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#34c759]",
                      animate: { x: etape === "decroche" ? course : 0 },
                      transition: { duration: 0.7, ease: EASE$2 },
                      children: /* @__PURE__ */ jsx(Combine, { className: "h-5 w-5" })
                    }
                  )
                ] }) })
              ]
            },
            "entrant"
          ) : /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: "flex h-full flex-col items-center",
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.45, ease: EASE$2 },
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm tabular-nums text-[#34c759]", children: duree }),
                /* @__PURE__ */ jsx("span", { className: "mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl", children: "NC" }),
                /* @__PURE__ */ jsx("p", { className: "mt-3 text-xl", children: "Nouveau client" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "« Bonjour, j'ai vu votre site… »" }),
                /* @__PURE__ */ jsx("div", { className: "mt-auto grid w-full grid-cols-3 gap-3", children: ["Silence", "Clavier", "HP"].map((l) => /* @__PURE__ */ jsxs("span", { className: "flex flex-col items-center gap-1 text-[10px] text-white/60", children: [
                  /* @__PURE__ */ jsx("span", { className: "h-11 w-11 rounded-full bg-white/15" }),
                  l
                ] }, l)) }),
                /* @__PURE__ */ jsx("span", { className: "mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff3b30]", children: /* @__PURE__ */ jsx(Combine, { className: "h-5 w-5 rotate-[135deg]" }) })
              ]
            },
            "enligne"
          ) })
        ] })
      }
    )
  ] });
}
function FinalStudio() {
  const ref = useRef(null);
  const boutonRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const ligne1 = useTransform(scrollYProgress, [0, 0.6], ["-12%", "0%"]);
  const ligne2 = useTransform(scrollYProgress, [0, 0.6], ["12%", "0%"]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 150, damping: 15 });
  const sy = useSpring(my, { stiffness: 150, damping: 15 });
  const attirer = (e) => {
    if (e.pointerType !== "mouse" || !boutonRef.current) return;
    const r = boutonRef.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };
  const relacher = () => {
    mx.set(0);
    my.set(0);
  };
  return /* @__PURE__ */ jsx("section", { ref, className: "overflow-hidden bg-surface px-5 pb-8 pt-14 md:px-10 md:pb-10 md:pt-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-center text-[8vw] font-extrabold uppercase leading-[1.04] text-text-primary md:text-[4.6vw] lg:text-[min(4.4vw,76px)]", children: [
      /* @__PURE__ */ jsx(motion.span, { className: "block", style: { x: ligne1 }, children: "Nous vendons plus qu'un site." }),
      /* @__PURE__ */ jsx(motion.span, { className: "block text-[#25D366]", style: { x: ligne2 }, children: "Nous vendons des appels." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 md:mt-10", children: /* @__PURE__ */ jsx(AppelEntrant, {}) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col items-center gap-10 text-center md:mt-8", children: [
      /* @__PURE__ */ jsx("p", { className: "max-w-md text-xl leading-snug text-text-secondary md:text-2xl", children: "Commandez le site qui vous apportera vos prochains prospects." }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-6", onPointerMove: attirer, onPointerLeave: relacher, children: /* @__PURE__ */ jsx(
        motion.a,
        {
          ref: boutonRef,
          href: WHATSAPP_PROJET,
          target: "_blank",
          rel: "noopener noreferrer",
          style: { x: sx, y: sy },
          whileTap: { scale: 0.94 },
          className: "flex h-32 w-32 items-center justify-center rounded-full bg-[#25D366] p-6 text-center text-lg font-normal leading-tight text-white transition-colors hover:bg-[#1ebe5a] md:h-40 md:w-40 md:text-lg",
          children: "Parlons-en"
        }
      ) })
    ] })
  ] }) });
}
const CLE$1 = "digitalz-prechargeur-vu";
const DUREE_MS = 1100;
const EASE$1 = [0.76, 0, 0.24, 1];
function Prechargeur() {
  const [visible, setVisible] = useState(false);
  const [compte, setCompte] = useState(0);
  useEffect(() => {
    let dejaVu = false;
    try {
      dejaVu = sessionStorage.getItem(CLE$1) === "1";
    } catch {
    }
    const sobre = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (dejaVu || sobre) return;
    setVisible(true);
    const debut = performance.now();
    let frame = 0;
    let sortie = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - debut) / DUREE_MS);
      setCompte(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) frame = requestAnimationFrame(tick);
      else {
        try {
          sessionStorage.setItem(CLE$1, "1");
        } catch {
        }
        sortie = window.setTimeout(() => setVisible(false), 180);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(sortie);
    };
  }, []);
  return /* @__PURE__ */ jsx(AnimatePresence, { children: visible && /* @__PURE__ */ jsxs(
    motion.div,
    {
      className: "fixed inset-0 z-[90] flex flex-col justify-between bg-pop p-6 text-white md:p-10",
      initial: { y: 0 },
      exit: { y: "-100%" },
      transition: { duration: 0.8, ease: EASE$1 },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("img", { src: "/logo-studio.png", alt: "", className: "h-10 w-10 rounded-full ring-2 ring-surface" }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-normal tracking-tight", children: "Digitalz Dev" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between gap-6", children: [
          /* @__PURE__ */ jsx("p", { className: "max-w-[14rem] text-sm font-medium leading-snug", children: "Sites internet pour avocats, architectes et métiers de l'image." }),
          /* @__PURE__ */ jsx("span", { className: "text-[28vw] font-normal leading-[0.8] tracking-[-0.06em] md:text-[18vw]", children: compte })
        ] })
      ]
    }
  ) });
}
const avisGoogle = [];
const ficheGoogle = {
  note: null,
  total: null,
  lien: null
};
function Etoiles({ note }) {
  return /* @__PURE__ */ jsx("div", { className: "flex gap-0.5", "aria-label": `${note} sur 5`, children: Array.from({ length: 5 }, (_, i) => /* @__PURE__ */ jsx(
    "svg",
    {
      viewBox: "0 0 20 20",
      className: `h-4 w-4 ${i < Math.round(note) ? "text-accent" : "text-surface-border"}`,
      fill: "currentColor",
      "aria-hidden": true,
      children: /* @__PURE__ */ jsx("path", { d: "M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" })
    },
    i
  )) });
}
function LogoGoogle({ className = "" }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", className, "aria-hidden": true, children: [
    /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" }),
    /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" }),
    /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z" }),
    /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" })
  ] });
}
const EXEMPLES = [
  { auteur: "Maître Sarah M.", note: 5, texte: "Un site sobre, clair sur nos domaines d'intervention, et des demandes de premier rendez-vous qui arrivent désormais par le formulaire plutôt que par hasard.", date: "il y a 2 semaines" },
  { auteur: "Karim B., architecte", note: 5, texte: "Nos projets sont enfin montrés en grand, sans perte de qualité. Les maîtres d'ouvrage nous parlent du site dès le premier échange.", date: "il y a 1 mois" },
  { auteur: "Julie R., photographe", note: 5, texte: "Galeries rapides, vidéos en pleine qualité et une fiche Google optimisée : je reçois des demandes de devis chaque semaine.", date: "il y a 2 mois" }
];
function horsProduction() {
  if (typeof window === "undefined") return false;
  return !/(^|\.)digitalzdev\.com$/.test(window.location.hostname);
}
function AvisGoogleSection() {
  const [exemplesPermis, setExemplesPermis] = useState(false);
  useEffect(() => setExemplesPermis(horsProduction()), []);
  const enExemple = avisGoogle.length === 0;
  if (enExemple && !exemplesPermis) return null;
  const liste = enExemple ? EXEMPLES : avisGoogle;
  const fiche = enExemple ? { note: 4.9, total: null, lien: null } : ficheGoogle;
  return /* @__PURE__ */ jsx("section", { id: "avis-google", className: "relative overflow-hidden bg-surface py-10 md:py-14", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-8 md:flex-row md:items-end md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          SplitText,
          {
            as: "h2",
            by: "word",
            text: "Nos clients en parlent mieux que nous.",
            delay: 0.1,
            className: "block max-w-3xl font-display text-4xl md:text-6xl"
          }
        ),
        enExemple && /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-text-muted", children: "Avis d'exemple" })
      ] }),
      fiche.note !== null && /* @__PURE__ */ jsx(Reveal, { delay: 0.2, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 rounded-3xl bg-surface-card px-6 py-5", children: [
        /* @__PURE__ */ jsx(LogoGoogle, { className: "h-9 w-9" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-display text-4xl font-normal text-text-primary", children: fiche.note.toLocaleString("fr-FR") }),
            /* @__PURE__ */ jsx(Etoiles, { note: fiche.note })
          ] }),
          fiche.total !== null
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-14 grid gap-4 md:mt-20 md:grid-cols-3", children: liste.map((avis, index) => /* @__PURE__ */ jsxs(
      motion.figure,
      {
        className: "flex flex-col rounded-3xl bg-surface-card p-7",
        initial: { opacity: 0, y: 32 },
        whileInView: { opacity: 1, y: 0 },
        viewport: VIEWPORT,
        transition: { duration: 0.6, delay: index * 0.08, ease: EASE_OUT },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(Etoiles, { note: avis.note }),
            /* @__PURE__ */ jsx(LogoGoogle, { className: "h-5 w-5" })
          ] }),
          /* @__PURE__ */ jsxs("blockquote", { className: "mt-5 flex-1 text-base leading-relaxed text-text-primary", children: [
            "« ",
            avis.texte,
            " »"
          ] }),
          /* @__PURE__ */ jsxs("figcaption", { className: "mt-6", children: [
            /* @__PURE__ */ jsx("span", { className: "block font-display font-medium text-text-primary", children: avis.auteur }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-text-muted", children: avis.date })
          ] })
        ]
      },
      `${avis.auteur}-${index}`
    )) }),
    fiche.lien
  ] }) });
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
    reponse: "Oui, dans toute la France et à l'international. Nos réalisations vont d'une marque de mode australienne à une maison de prêt-à-porter parisienne. Les échanges se font en visioconférence, avec des points d'avancement réguliers et un interlocuteur unique."
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
  return /* @__PURE__ */ jsx("section", { id: "faq", className: "relative bg-surface-light py-10 md:py-14", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl px-6", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-14 text-center md:mb-20", children: /* @__PURE__ */ jsx(
      SplitText,
      {
        as: "h2",
        by: "word",
        text: "Ce qu’on nous demande avant de se lancer",
        delay: 0.1,
        className: "mx-auto block font-display text-3xl font-medium leading-[1.05] tracking-tight text-text-primary md:text-5xl"
      }
    ) }),
    /* @__PURE__ */ jsx("dl", { children: FAQ.map((item2, index) => {
      const estOuverte = ouverte === index;
      return /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "mb-3 rounded-2xl bg-surface-card px-5 last:mb-0 md:px-7",
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
                  /* @__PURE__ */ jsx("span", { className: "font-display text-base font-medium text-text-primary md:text-lg", children: item2.question }),
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
      className: "relative overflow-hidden bg-surface py-10 md:py-14",
      children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            "aria-hidden": true,
            className: "pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent blur-[130px] will-change-transform",
            style: { scale: auraScale, opacity: auraOpacity }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-6xl px-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-16 text-center md:mb-24", children: [
            /* @__PURE__ */ jsx(
              SplitText,
              {
                as: "h2",
                by: "word",
                text: "Chaque projet finance une cause",
                delay: 0.1,
                className: "mx-auto block max-w-3xl font-display text-3xl font-medium leading-[1.05] tracking-tight text-text-primary md:text-6xl"
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
                  className: "font-medium text-accent underline-offset-4 hover:underline",
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
              /* @__PURE__ */ jsx(Reveal, { from: "right", distance: 50, children: /* @__PURE__ */ jsx("h3", { className: "mb-6 font-display text-2xl font-medium text-text-primary md:text-3xl", children: "NeuroCare : bien plus qu'une plateforme" }) }),
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
                        className: "block font-display text-xl font-medium text-accent sm:text-2xl"
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
                  className: "inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 py-3 font-display text-xs font-medium text-surface transition-colors hover:bg-accent-hover sm:px-8 sm:text-sm",
                  children: [
                    "Découvrir NeuroCare",
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
const QUIZ = "https://quiz.digitalzdev.com";
const CLE = "digitalz-accueil-vu";
const EASE = [0.32, 0.72, 0, 1];
function AccueilPopup() {
  const [ouverte, setOuverte] = useState(false);
  useEffect(() => {
    let dejaVue = false;
    try {
      dejaVue = sessionStorage.getItem(CLE) === "1";
    } catch {
    }
    if (dejaVue) return;
    const t = window.setTimeout(() => setOuverte(true), 3500);
    return () => window.clearTimeout(t);
  }, []);
  const fermer = () => {
    setOuverte(false);
    try {
      sessionStorage.setItem(CLE, "1");
    } catch {
    }
  };
  useEffect(() => {
    if (!ouverte) return;
    const auClavier = (e) => {
      if (e.key === "Escape") fermer();
    };
    window.addEventListener("keydown", auClavier);
    return () => window.removeEventListener("keydown", auClavier);
  }, [ouverte]);
  return /* @__PURE__ */ jsx(AnimatePresence, { children: ouverte && /* @__PURE__ */ jsxs(
    motion.div,
    {
      className: "fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 },
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "aria-label": "Fermer",
            onClick: fermer,
            className: "absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "accueil-titre",
            className: "relative w-full max-w-xl overflow-hidden rounded-[2rem] bg-surface px-7 pb-7 pt-12 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] sm:px-12 sm:pb-10 sm:pt-14",
            initial: { opacity: 0, y: 40, scale: 0.96 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 24, scale: 0.98 },
            transition: { duration: 0.5, ease: EASE },
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: fermer,
                  "aria-label": "Fermer",
                  className: "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-text-primary transition-colors hover:bg-accent hover:text-surface",
                  children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M3 3l10 10M13 3L3 13" }) })
                }
              ),
              /* @__PURE__ */ jsxs(
                "h2",
                {
                  id: "accueil-titre",
                  className: "text-[2.6rem] leading-[0.98] sm:text-6xl",
                  children: [
                    /* @__PURE__ */ jsx(
                      motion.span,
                      {
                        className: "block text-text-primary",
                        initial: { opacity: 0, y: 16 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, delay: 0.15, ease: EASE },
                        children: "Votre site à votre image."
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      motion.span,
                      {
                        className: "mt-1 block font-bold text-accent",
                        initial: { opacity: 0, y: 16 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, delay: 0.28, ease: EASE },
                        children: "Un aperçu en 60 secondes."
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                motion.p,
                {
                  className: "mx-auto mt-5 max-w-sm text-base text-text-secondary",
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { duration: 0.5, delay: 0.42 },
                  children: "Répondez à quelques questions, nous générons une démo de votre site. Gratuit, sans engagement."
                }
              ),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  className: "mt-8 flex flex-col items-center gap-3",
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.5, delay: 0.5, ease: EASE },
                  children: [
                    /* @__PURE__ */ jsxs(
                      "a",
                      {
                        href: QUIZ,
                        onClick: fermer,
                        className: "group inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-full bg-accent px-8 font-display text-base font-medium text-surface transition-colors hover:bg-accent-hover sm:w-auto",
                        children: [
                          "Voir mon aperçu",
                          /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 transition-transform duration-300 group-hover:translate-x-1", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M3 8h10M9 4l4 4-4 4" }) })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: fermer,
                        className: "min-h-[44px] px-4 text-sm font-medium text-text-muted transition-colors hover:text-text-primary",
                        children: "Plus tard"
                      }
                    )
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  ) });
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
const RESEAUX = [
  { href: "https://www.instagram.com/digitalzdev/", label: "Instagram" },
  { href: "https://www.linkedin.com/in/zakariya-nebbache-7b0644214/", label: "LinkedIn" },
  { href: "mailto:zdigitalzdev@gmail.com", label: "zdigitalzdev@gmail.com" }
];
const lien = "inline-block py-2 text-[15px] font-medium text-text-secondary transition-colors hover:text-accent";
function Footer() {
  return /* @__PURE__ */ jsxs("footer", { className: "overflow-hidden bg-surface px-5 pt-10 md:px-10 md:pt-14", children: [
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl", children: [
      /* @__PURE__ */ jsxs("nav", { "aria-label": "Plan du site", className: "grid gap-10 sm:grid-cols-2 lg:grid-cols-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-text-muted", children: "Le site" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-4", children: RACCOURCIS.map((l) => /* @__PURE__ */ jsx("li", { children: l.externe ? /* @__PURE__ */ jsx("a", { href: l.to, className: lien, children: l.label }) : /* @__PURE__ */ jsx(Link, { to: l.to, className: lien, children: l.label }) }, l.to)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-6", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-text-muted", children: "Réalisations" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-4 grid gap-x-6 sm:grid-cols-2", children: projects.map((p) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, { to: p.route, className: lien, children: [
            p.title,
            /* @__PURE__ */ jsxs("span", { className: "font-medium text-text-muted", children: [
              " · ",
              p.subtitle
            ] })
          ] }) }, p.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-text-muted", children: "Nous suivre" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-4", children: RESEAUX.map((r) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            "a",
            {
              href: r.href,
              target: r.href.startsWith("http") ? "_blank" : void 0,
              rel: r.href.startsWith("http") ? "noopener noreferrer" : void 0,
              className: lien,
              children: r.label
            }
          ) }, r.href)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-14 flex flex-col gap-3 text-sm font-medium text-text-muted md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Digitalz Dev © ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " · Tous droits réservés"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/mentions-legales", className: "py-2 transition-colors hover:text-accent", children: "Mentions légales" }),
          /* @__PURE__ */ jsx(Link, { to: "/politique-confidentialite", className: "py-2 transition-colors hover:text-accent", children: "Politique de confidentialité" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 overflow-hidden", children: /* @__PURE__ */ jsxs(
      motion.p,
      {
        "aria-hidden": true,
        className: "whitespace-nowrap pb-[0.06em] text-center text-[13vw] font-extrabold leading-[1.05] tracking-[-0.06em] text-text-primary",
        initial: { y: "60%" },
        whileInView: { y: "0%" },
        viewport: { once: true },
        transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
        children: [
          "Digitalz ",
          /* @__PURE__ */ jsx("span", { className: "text-accent", children: "Dev" })
        ]
      }
    ) })
  ] });
}
function Home() {
  return /* @__PURE__ */ jsxs("main", { children: [
    /* @__PURE__ */ jsx(Prechargeur, {}),
    /* @__PURE__ */ jsx(HeroStudio, {}),
    /* @__PURE__ */ jsx(ManifesteStudio, {}),
    /* @__PURE__ */ jsx(TravauxStudio, {}),
    /* @__PURE__ */ jsx(FinalStudio, {}),
    /* @__PURE__ */ jsx(AcquisitionStudio, {}),
    /* @__PURE__ */ jsx(ServicesStudio, {}),
    /* @__PURE__ */ jsx(AvisGoogleSection, {}),
    /* @__PURE__ */ jsx(EquipeStudio, {}),
    /* @__PURE__ */ jsx(FaqSection, {}),
    /* @__PURE__ */ jsx(MissionSection, {}),
    /* @__PURE__ */ jsx(Footer, {}),
    /* @__PURE__ */ jsx(AccueilPopup, {})
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
        /* @__PURE__ */ jsx("span", { className: "text-accent font-display font-medium text-sm tracking-[0.2em] uppercase", children: "Contact" }),
        /* @__PURE__ */ jsx("h2", { className: "font-display font-medium text-3xl md:text-4xl text-text-primary mt-4 mb-4", children: "Un projet en tête ?" }),
        /* @__PURE__ */ jsx("p", { className: "text-text-secondary mb-8", children: "Répondez à huit questions et repartez avec un aperçu de votre site, généré pour votre marque. Gratuit, en moins d'une minute." }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://quiz.digitalzdev.com",
            className: "inline-block px-8 py-4 bg-accent text-surface font-display font-medium rounded-lg hover:opacity-90 transition-all",
            children: "Générer ma démo gratuite"
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
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-surface-light px-4 py-3", children: [
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
  return /* @__PURE__ */ jsx("section", { className: "bg-surface", children: /* @__PURE__ */ jsx(Link, { to: next.route, className: "group block", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-6 py-20 md:py-28", children: [
    /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-medium uppercase tracking-[0.3em] text-text-muted", children: "Projet suivant" }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-8 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsx(
        SplitText,
        {
          as: "h2",
          by: "char",
          text: next.title,
          className: `block font-display font-medium tracking-tight text-text-primary transition-colors group-hover:text-accent ${// La vignette de survol occupe 224 px de la ligne à partir
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
  const contentY = useTransform(smooth, [0, 1], ["0%", "-30%"]);
  const contentOpacity = useTransform(smooth, [0, 0.85], [1, 0]);
  return /* @__PURE__ */ jsxs("main", { className: "bg-surface", children: [
    /* @__PURE__ */ jsx(
      "section",
      {
        ref: heroRef,
        className: "relative overflow-hidden bg-surface pt-32 md:pt-44",
        children: /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "relative z-10 px-6 pb-14 md:px-14 md:pb-20",
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
                      className: "group -my-2 inline-flex min-h-[44px] items-center gap-2 py-2 text-sm font-medium text-text-primary transition-colors hover:text-accent",
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
                  className: `mt-8 block font-display font-normal leading-[0.92] tracking-tight text-text-primary ${titleScale(
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
                        className: "inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 py-3 font-display text-xs font-medium text-surface transition-opacity hover:opacity-90 sm:px-7 sm:text-sm",
                        children: [
                          "Voir le site en ligne",
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
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "bg-surface-light px-6 py-6", children: /* @__PURE__ */ jsx("ul", { className: "mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 font-display text-[11px] font-medium uppercase tracking-[0.3em] text-text-secondary", children: project.stack.map((techno) => /* @__PURE__ */ jsx("li", { children: techno }, techno)) }) }),
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
              className: "block font-display text-4xl font-medium text-accent md:text-6xl"
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
          /* @__PURE__ */ jsx("div", { className: "md:sticky md:top-32 md:h-fit", children: /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-medium uppercase tracking-[0.3em] text-accent", children: block.label }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              SplitText,
              {
                as: "h2",
                by: "word",
                text: block.title,
                className: "block font-display text-2xl font-medium tracking-tight text-text-primary md:text-4xl"
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
        /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-medium uppercase tracking-[0.3em] text-accent", children: "Technique" }) }),
        /* @__PURE__ */ jsx(
          SplitText,
          {
            as: "h2",
            by: "word",
            text: "Caractéristiques clés",
            delay: 0.1,
            className: "mt-4 block font-display text-2xl font-medium tracking-tight text-text-primary md:text-4xl"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("ul", { children: project.features.map((feature, index) => /* @__PURE__ */ jsxs(
        motion.li,
        {
          className: "group flex items-baseline gap-4 py-4",
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
        /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("span", { className: "font-display text-xs font-medium uppercase tracking-[0.3em] text-accent", children: "Aperçus" }) }),
        /* @__PURE__ */ jsx(
          SplitText,
          {
            as: "h2",
            by: "word",
            text: "Les écrans clés",
            delay: 0.1,
            className: "mt-4 block font-display text-2xl font-medium tracking-tight text-text-primary md:text-4xl"
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
          className: "text-accent font-display font-medium text-sm tracking-[0.2em] uppercase",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.1 },
          children: "Contact"
        }
      ),
      /* @__PURE__ */ jsx(
        motion.h1,
        {
          className: "font-display font-normal text-5xl md:text-8xl lg:text-9xl text-text-primary mt-4 mb-6",
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
            /* @__PURE__ */ jsxs("legend", { className: "font-display font-medium text-lg text-text-primary mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-medium", children: "1" }),
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
            /* @__PURE__ */ jsxs("legend", { className: "font-display font-medium text-lg text-text-primary mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-medium", children: "2" }),
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
            /* @__PURE__ */ jsxs("legend", { className: "font-display font-medium text-lg text-text-primary mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-medium", children: "3" }),
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
            /* @__PURE__ */ jsxs("legend", { className: "font-display font-medium text-lg text-text-primary mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-medium", children: "4" }),
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
              className: "w-full py-4 bg-accent text-surface font-display font-medium tracking-wider rounded-lg hover:opacity-90 transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed",
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
          /* @__PURE__ */ jsx("h2", { className: "font-display font-medium text-3xl text-text-primary mb-3", children: "Demande envoyée !" }),
          /* @__PURE__ */ jsx("p", { className: "text-text-secondary text-lg mb-8", children: "Nous analysons votre projet et revenons vers vous sous 24 à 48h." }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/",
              className: "px-8 py-3 bg-accent text-surface rounded-full font-display font-medium inline-block hover:opacity-90 transition-all",
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
const Login = lazy(() => import("./assets/Login-DIbTS8yc.js"));
const ClientPortal = lazy(() => import("./assets/ClientPortal-Cyb14TnS.js"));
const DashboardLayout = lazy(() => import("./assets/DashboardLayout-oy6br7e7.js"));
function RouteFallback() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-surface", children: /* @__PURE__ */ jsx("span", { className: "h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-accent" }) });
}
function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard") || location.pathname === "/login" || location.pathname.startsWith("/espace/");
  useEffect(() => {
    document.documentElement.classList.toggle("studio", !isDashboard);
  }, [isDashboard]);
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
    /* @__PURE__ */ jsx(CookieBanner, {}),
    /* @__PURE__ */ jsx(Curseur, {})
  ] });
}
function render(url) {
  return renderToString(
    /* @__PURE__ */ jsx(StrictMode, { children: /* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(App, {}) }) }) }) })
  );
}
export {
  render,
  supabase as s,
  useAuth as u
};

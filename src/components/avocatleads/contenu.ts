/**
 * Textes d'AvocatLeads, la version de la vitrine réservée aux avocats.
 *
 * Règles d'écriture : un ton de cabinet, sobre et précis ; aucune liste
 * numérotée, aucun tiret long, aucun trait de séparation dans la page. Les
 * règles de communication citées viennent du Règlement intérieur national
 * (RIN, article 10) et du vade-mecum de la communication du Conseil national
 * des barreaux.
 */

export const MARQUE = 'AvocatLeads'

/** Conversation WhatsApp, message d'ouverture prérempli. */
export const WHATSAPP = `https://wa.me/33783259869?text=${encodeURIComponent(
  "Bonjour AvocatLeads, je suis avocat et j'aimerais vous parler du site de mon cabinet : "
)}`

export interface Service {
  title: string
  lead: string
  body: string
  points: string[]
}

export const SERVICES: Service[] = [
  {
    title: 'Site de cabinet',
    lead: 'Présenter le cabinet avec la rigueur de vos actes.',
    body: "Arborescence, rédaction, direction artistique et développement, conçus pour votre pratique et non tirés d'un modèle. Chaque page répond à une recherche précise et conduit à une prise de contact.",
    points: [
      "Une page par domaine d'intervention et par ville",
      'Textes relus au regard de la déontologie',
      'Maquettes validées avant tout développement',
      'Prise en main simple, vous restez autonome',
    ],
  },
  {
    title: 'Prise de rendez-vous en ligne',
    lead: 'Des demandes qualifiées, sans échange préalable au téléphone.',
    body: "Le visiteur choisit sa matière, expose sa situation en quelques questions et réserve un créneau, au cabinet ou en visioconférence. Vous recevez une demande déjà qualifiée et conservez la maîtrise de votre agenda.",
    points: [
      'Agenda synchronisé avec votre calendrier',
      'Consultation au cabinet ou en visioconférence',
      'Questions de qualification par matière',
      'Règlement de la consultation en ligne, en option',
    ],
  },
  {
    title: 'Refonte de site',
    lead: 'Pour un site qui ne reflète plus le cabinet.',
    body: "Nous partons de l'existant : ce qui fonctionne, ce qui freine, ce que disent vos statistiques. La refonte conserve votre référencement grâce à un plan de redirections complet et corrige la lenteur et la lecture sur mobile.",
    points: [
      'Audit du site actuel et de ses performances',
      'Plan de redirections, sans perte de référencement',
      'Reprise et réécriture des contenus',
      'Mise en conformité RGPD et accessibilité',
    ],
  },
  {
    title: 'Espace client sécurisé',
    lead: "Les pièces du dossier, hors de la messagerie.",
    body: "Un espace privé où vos clients déposent leurs pièces, suivent l'avancement de leur dossier et signent la convention d'honoraires. Moins d'échanges par courriel, davantage de confidentialité.",
    points: [
      'Dépôt et partage des pièces par dossier',
      'Suivi des étapes et des échéances',
      "Convention d'honoraires à signer en ligne",
      'Données hébergées en France',
    ],
  },
  {
    title: 'Google Ads',
    lead: 'Être présent quand un justiciable cherche un avocat.',
    body: "Campagnes construites sur les recherches qui précèdent un appel : « avocat divorce », « avocat licenciement », « avocat pénaliste », dans votre ressort. Le budget est piloté sur le coût par demande de rendez-vous.",
    points: [
      'Recherches ciblées par matière et par ville',
      "Annonces sobres, conformes à l'article 10 du RIN",
      'Mesure des appels et des formulaires reçus',
      'Rapports clairs, sans jargon',
    ],
  },
  {
    title: 'Référencement local',
    lead: 'Ressortir sur « avocat », votre matière et votre ville.',
    body: "Le référencement se construit dès la conception : structure des pages, balisage, données structurées, vitesse et contenus qui répondent aux questions réelles de vos futurs clients. Puis nous suivons vos positions.",
    points: [
      'Fiche Google complète et entretenue',
      'Pages de matières rédigées pour être comprises',
      'Vitesse et données structurées soignées',
      'Suivi mensuel des positions',
    ],
  },
]

export const LEVIERS = [
  {
    titre: 'Référencement naturel',
    accroche: 'Être trouvé sur les questions que se posent vos clients.',
    points: [
      'Articles sur les questions juridiques de vos clients',
      "Pages par domaine d'intervention et par ville",
      'Structure technique, vitesse et balisage soignés',
      'Suivi mensuel des positions et du trafic',
    ],
  },
  {
    titre: 'Fiche Google',
    accroche: 'Apparaître parmi les premiers cabinets sur Maps.',
    points: [
      "Fiche d'établissement complète et optimisée",
      "Horaires, domaines d'intervention et publications",
      'Réponses aux avis dans le respect du secret professionnel',
      'Visibilité locale, ville par ville',
    ],
  },
  {
    titre: 'Google Ads',
    accroche: 'En tête des recherches dès la semaine suivante.',
    points: [
      'Campagnes sur les recherches qui précèdent un appel',
      "Extensions d'appel et de lieu",
      'Mesure des appels et des formulaires reçus',
      'Budget piloté sur le coût par demande',
    ],
  },
  {
    titre: 'Meta Ads',
    accroche: 'Faire connaître le cabinet dans votre ressort.',
    points: [
      'Diffusion de vos analyses juridiques',
      'Ciblage par zone et par profil de client',
      'Reciblage des visiteurs de votre site',
      'Formulaires de contact intégrés',
    ],
  },
]

/** Les vérifications déontologiques faites sur chaque site livré. */
export const VERIFICATIONS = [
  { titre: 'Mentions obligatoires', texte: "Qualité d'avocat, barreau d'inscription, structure d'exercice et coordonnées complètes, conformément à l'article 10.2 du RIN." },
  { titre: 'Termes réservés', texte: "Le mot « spécialiste » n'apparaît qu'avec un certificat délivré par le CNB. Trois domaines d'activité dominante au plus par avocat." },
  { titre: 'Nom de domaine conforme', texte: "Votre nom ou la dénomination du cabinet, jamais un nom générique ni un domaine du droit (article 10.5 du RIN)." },
  { titre: 'Secret professionnel', texte: 'Aucun nom de client. Vos dossiers marquants sont présentés sous forme de références anonymisées.' },
  { titre: 'Sobriété du message', texte: 'Ni mention comparative, ni promesse de résultat, ni reprise de commentaires élogieux de clients.' },
  { titre: 'Honoraires et médiation', texte: 'Information sur les modes de fixation des honoraires et coordonnées du médiateur de la consommation.' },
  { titre: "Information de l'Ordre", texte: "Le courrier d'information à votre Ordre, pour la création ou la refonte du site, est préparé avec vous." },
  { titre: 'Données personnelles', texte: 'Mentions légales, politique de confidentialité et formulaires sobres en données, hébergés en Europe.' },
]

export const FAQ = [
  {
    question: "Combien coûte le site d'un cabinet d'avocats ?",
    reponse:
      "Un site d'avocat démarre autour de 1 500 €. Un site avec une page par domaine d'intervention, la prise de rendez-vous en ligne et un espace client se situe plus haut, selon le nombre de pages et le travail de rédaction. Nous établissons un devis écrit après un premier échange : aucune surprise en cours de mission.",
  },
  {
    question: 'Puis-je afficher des avis clients sur mon site ?',
    reponse:
      "Le Conseil national des barreaux considère que renvoyer vers des commentaires élogieux de clients est contraire aux principes essentiels de la profession. Nous ne les intégrons donc pas au site. Vos références anonymisées, vos publications et vos distinctions remplissent ce rôle.",
  },
  {
    question: 'Puis-je me présenter comme spécialiste ?',
    reponse:
      "Uniquement si vous êtes titulaire d'un certificat de spécialisation délivré par le CNB, et à titre personnel : un cabinet ne peut pas se dire spécialiste. À défaut, nous présentons vos domaines d'intervention, ou vos domaines d'activité dominante, trois au plus par avocat.",
  },
  {
    question: 'Dois-je informer mon Ordre de la création du site ?',
    reponse:
      "Oui. L'Ordre doit être informé de la création du site et de ses modifications substantielles. Nous préparons ce courrier avec vous, avec l'adresse du site et le nom de domaine retenu.",
  },
  {
    question: 'Quel nom de domaine choisir ?',
    reponse:
      "Il doit comporter votre nom ou la dénomination du cabinet, éventuellement suivi du mot « avocat ». Une adresse générique ou un domaine du droit, du type avocat-divorce-lyon.fr, est interdit. Le référencement sur « avocat divorce Lyon » se travaille par le contenu des pages.",
  },
  {
    question: 'Qui rédige les textes ?',
    reponse:
      "Nous les rédigeons à partir d'un entretien avec vous, pour un lecteur qui n'est pas juriste. Vous relisez et validez chaque page avant la mise en ligne : vous restez seul juge du fond.",
  },
  {
    question: 'Combien de temps faut-il pour être en ligne ?',
    reponse:
      "Comptez trois à six semaines pour un site de cabinet, six à dix semaines avec la prise de rendez-vous en ligne et un espace client. Le calendrier dépend surtout de la disponibilité de vos contenus et de vos relectures.",
  },
  {
    question: 'Pourrai-je modifier mon site moi-même ?',
    reponse:
      "Oui. Vous publiez vos actualités, ajoutez un collaborateur ou modifiez une page depuis une interface simple. Nous vous formons à la livraison et restons joignables ensuite. Le site vous appartient, code et hébergement compris.",
  },
]

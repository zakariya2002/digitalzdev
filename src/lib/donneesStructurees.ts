import { FAQ, SERVICES } from '../components/avocatleads/contenu'
import { SITE_URL } from './seo'

/**
 * Données structurées propres à certaines pages, écrites dans le HTML au
 * pré-rendu à la place de celles d'index.html (qui décrivent Digitalz Dev).
 *
 * AvocatLeads : la société éditrice telle qu'elle figure au Kbis, le service
 * proposé aux avocats, la page elle-même et sa foire aux questions. Les
 * questions sont celles affichées sur la page, jamais d'autres : Google
 * l'exige pour le balisage FAQPage.
 */
export function donneesStructurees(path: string): object | null {
  if (path !== '/avocatleads') return null
  const url = `${SITE_URL}/avocatleads`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#neurocare`,
        name: 'NEUROCARE SAS',
        legalName: 'NEUROCARE SAS',
        url: SITE_URL,
        identifier: { '@type': 'PropertyValue', propertyID: 'SIREN', value: '131907420' },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '8 avenue Édouard Branly',
          postalCode: '93420',
          addressLocality: 'Villepinte',
          addressCountry: 'FR',
        },
        email: 'zdigitalzdev@gmail.com',
        telephone: '+33783259869',
        founder: { '@type': 'Person', name: 'Zakariya Nebbache', sameAs: 'https://www.linkedin.com/in/zakariya-nebbache-7b0644214/' },
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${url}#service`,
        name: 'AvocatLeads',
        url,
        image: `${SITE_URL}/og-avocatleads.png`,
        logo: `${SITE_URL}/avocatleads-icon-180.png`,
        description:
          "Création de sites internet pour avocats et cabinets d'avocats, conformes aux règles de communication de la profession : pages par domaine d'intervention, prise de rendez-vous en ligne, référencement local et campagnes Google Ads.",
        parentOrganization: { '@id': `${SITE_URL}/#neurocare` },
        telephone: '+33783259869',
        email: 'zdigitalzdev@gmail.com',
        priceRange: 'À partir de 1 500 €',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '8 avenue Édouard Branly',
          postalCode: '93420',
          addressLocality: 'Villepinte',
          addressCountry: 'FR',
        },
        areaServed: { '@type': 'Country', name: 'France' },
        audience: { '@type': 'BusinessAudience', audienceType: "Avocats et cabinets d'avocats" },
        knowsLanguage: ['fr', 'en'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Prestations pour les avocats',
          itemListElement: SERVICES.map((s) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.title, description: s.lead },
          })),
        },
      },
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: 'AvocatLeads | Création de site internet pour avocats',
        inLanguage: 'fr-FR',
        about: { '@id': `${url}#service` },
        publisher: { '@id': `${SITE_URL}/#neurocare` },
        primaryImageOfPage: `${SITE_URL}/og-avocatleads.png`,
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: FAQ.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.reponse },
        })),
      },
    ],
  }
}

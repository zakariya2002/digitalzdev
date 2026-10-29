import { Link } from 'react-router-dom'
import PageLegale, { Bloc, Lien } from '../components/PageLegale'

/**
 * Mentions légales (article 6 III de la loi n° 2004-575 du 21 juin 2004 pour
 * la confiance dans l'économie numérique, et article R. 123-237 du code de
 * commerce). Les informations sur la société viennent de l'extrait Kbis du
 * 23 octobre 2026. Le registre des bénéficiaires effectifs n'est pas public :
 * rien n'en est repris ici.
 */
export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions légales" miseAJour="29 octobre 2026">
      <Bloc titre="Éditeur du site">
        <p>
          Les sites digitalzdev.com et digitalzdev.com/avocatleads sont édités par :
        </p>
        <p>
          <strong className="text-text-primary">NEUROCARE SAS</strong>
          <br />
          Société par actions simplifiée à associé unique au capital de 100 €
          <br />
          Siège social : 8 avenue Édouard Branly, 93420 Villepinte, France
          <br />
          Immatriculée au registre du commerce et des sociétés de Bobigny sous le numéro 131 907 420
          <br />
          Identifiant unique européen (EUID) : FR9301.131907420
          <br />
          Noms commerciaux : Digitalz Dev et AvocatLeads
        </p>
        <p>
          Téléphone : <Lien href="tel:+33783259869">+33 7 83 25 98 69</Lien>
          <br />
          Courrier électronique : <Lien href="mailto:zdigitalzdev@gmail.com">zdigitalzdev@gmail.com</Lien>
        </p>
      </Bloc>

      <Bloc titre="Directeur de la publication">
        <p>Zakariya Nebbache, en sa qualité de président de NEUROCARE SAS.</p>
      </Bloc>

      <Bloc titre="Hébergement">
        <p>
          <strong className="text-text-primary">Vercel Inc.</strong>
          <br />
          440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis
          <br />
          Site : <Lien href="https://vercel.com">vercel.com</Lien>, contact :{' '}
          <Lien href="https://vercel.com/contact">vercel.com/contact</Lien>
        </p>
        <p>
          Les demandes envoyées depuis les formulaires sont enregistrées dans une
          base de données fournie par Supabase, hébergée dans l'Union européenne
          (Irlande). Le détail des prestataires figure dans la{' '}
          <Link to="/politique-confidentialite" className="text-accent underline underline-offset-2">
            politique de confidentialité
          </Link>
          .
        </p>
      </Bloc>

      <Bloc titre="Activité">
        <p>
          NEUROCARE SAS conçoit et développe des sites internet et accompagne
          leur visibilité en ligne (référencement, campagnes publicitaires).
          Sous le nom AvocatLeads, ces prestations s'adressent aux avocats et
          aux cabinets d'avocats. Elles sont réservées aux professionnels.
        </p>
        <p>
          NEUROCARE SAS n'est pas un cabinet d'avocats. Elle n'exerce aucune
          activité juridique réglementée et ne délivre ni consultation ni
          conseil juridique. Les indications données sur ce site au sujet des
          règles de communication de la profession d'avocat (Règlement intérieur
          national, avis du Conseil national des barreaux) sont fournies à titre
          d'information générale. Elles ne constituent pas un avis juridique et
          ne remplacent ni l'appréciation de l'avocat ni celle de son Ordre.
        </p>
      </Bloc>

      <Bloc titre="Propriété intellectuelle">
        <p>
          Les textes, éléments graphiques, logos, maquettes et le code source
          de ce site sont la propriété de NEUROCARE SAS, sauf mention contraire.
          Toute reproduction ou représentation, totale ou partielle, sans
          autorisation écrite préalable est interdite (articles L. 122-4 et
          L. 335-2 du code de la propriété intellectuelle).
        </p>
        <p>
          Les noms, marques et captures d'écran des réalisations présentées
          appartiennent à leurs titulaires respectifs et sont reproduits à titre
          de références.
        </p>
      </Bloc>

      <Bloc titre="Responsabilité et liens">
        <p>
          NEUROCARE SAS s'efforce d'assurer l'exactitude des informations
          publiées, sans pouvoir garantir qu'elles soient exemptes d'erreur ou
          d'omission. Les liens vers des sites tiers sont fournis pour faciliter
          la navigation ; NEUROCARE SAS n'exerce aucun contrôle sur leur
          contenu.
        </p>
      </Bloc>

      <Bloc titre="Données personnelles et cookies">
        <p>
          Les traitements de données personnelles, les prestataires concernés,
          les durées de conservation, vos droits et l'usage des cookies sont
          décrits dans la{' '}
          <Link to="/politique-confidentialite" className="text-accent underline underline-offset-2">
            politique de confidentialité
          </Link>
          . Aucun cookie publicitaire n'est déposé sans votre accord.
        </p>
      </Bloc>

      <Bloc titre="Droit applicable">
        <p>
          Les présentes mentions sont régies par le droit français.
        </p>
      </Bloc>
    </PageLegale>
  )
}

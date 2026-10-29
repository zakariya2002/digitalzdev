import { useEffect, useState } from 'react'
import PageLegale, { Bloc, Lien } from '../components/PageLegale'

/**
 * Politique de confidentialité.
 *
 * Elle décrit ce que le site fait réellement, formulaire par formulaire, et
 * doit être tenue à jour à chaque changement : un avocat la lira. La clé
 * `consentement-pub` est celle qu'écrit le bandeau de /projet.
 */
const CLE_CONSENTEMENT = 'consentement-pub'

function ChoixCookies() {
  const [choix, setChoix] = useState<string | null | undefined>(undefined)
  useEffect(() => {
    try {
      setChoix(localStorage.getItem(CLE_CONSENTEMENT))
    } catch {
      setChoix(null)
    }
  }, [])
  const retirer = () => {
    try {
      localStorage.setItem(CLE_CONSENTEMENT, 'non')
    } catch {
      /* stockage refusé : rien n'a pu être enregistré non plus */
    }
    // Les cookies déjà déposés par le pixel sont effacés.
    const domaine = window.location.hostname.replace(/^www\./, '')
    for (const nom of ['_fbp', '_fbc']) {
      document.cookie = `${nom}=; Max-Age=0; path=/`
      document.cookie = `${nom}=; Max-Age=0; path=/; domain=.${domaine}`
    }
    setChoix('non')
  }
  if (choix === undefined) return null
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl bg-surface-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">
        Votre choix actuel sur ce navigateur :{' '}
        <strong className="text-text-primary">
          {choix === 'oui' ? 'cookies publicitaires acceptés' : choix === 'non' ? 'cookies publicitaires refusés' : 'aucun choix enregistré'}
        </strong>
      </p>
      {choix === 'oui' && (
        <button
          type="button"
          onClick={retirer}
          className="min-h-[44px] rounded-lg bg-accent px-5 text-sm font-medium text-surface"
        >
          Retirer mon accord
        </button>
      )}
    </div>
  )
}

export default function PolitiqueConfidentialite() {
  return (
    <PageLegale titre="Politique de confidentialité" miseAJour="29 octobre 2026">
      <Bloc titre="Responsable du traitement">
        <p>
          NEUROCARE SAS, société par actions simplifiée à associé unique au
          capital de 100 €, immatriculée au RCS de Bobigny sous le numéro
          131 907 420, dont le siège est situé 8 avenue Édouard Branly, 93420
          Villepinte, France. Elle exploite les noms commerciaux Digitalz Dev
          et AvocatLeads.
        </p>
        <p>
          Contact pour toute question sur vos données :{' '}
          <Lien href="mailto:zdigitalzdev@gmail.com">zdigitalzdev@gmail.com</Lien>
        </p>
      </Bloc>

      <Bloc titre="Formulaire de demande (page « Démarrer mon projet »)">
        <p>
          <strong className="text-text-primary">Données :</strong> vos réponses
          aux quatre questions (mode d'exercice, situation de votre site,
          budget, délai), votre nom, votre numéro de téléphone et, si vous les
          indiquez, le nom de votre cabinet ou de votre site et un message.
          Nous enregistrons aussi l'origine de votre visite : paramètres de
          campagne présents dans l'adresse (utm), identifiant de clic
          publicitaire (fbclid, gclid) et page de provenance.
        </p>
        <p>
          <strong className="text-text-primary">Finalités :</strong> vous
          recontacter, établir une proposition, suivre votre demande dans notre
          outil de gestion commerciale et savoir quelle campagne vous a amené.
        </p>
        <p>
          <strong className="text-text-primary">Bases légales :</strong> mesures
          précontractuelles prises à votre demande (article 6.1.b du RGPD) ;
          intérêt légitime à mesurer l'origine de nos demandes (article 6.1.f).
        </p>
        <p>
          À l'envoi, WhatsApp s'ouvre avec un message déjà rédigé qui reprend
          vos réponses. Il n'est transmis que si vous appuyez vous-même sur
          « Envoyer ». WhatsApp est fourni par WhatsApp Ireland Limited, selon sa
          propre politique de confidentialité.
        </p>
      </Bloc>

      <Bloc titre="Formulaire de contact (page « Contact »)">
        <p>
          <strong className="text-text-primary">Données :</strong> nom, adresse
          électronique, et selon ce que vous renseignez : téléphone,
          entreprise, type de projet, budget, délai, adresse de votre site et
          description de votre projet.
        </p>
        <p>
          <strong className="text-text-primary">Finalité et base légale :</strong>{' '}
          répondre à votre demande de devis, sur la base de votre consentement
          exprimé par la case à cocher avant l'envoi (article 6.1.a du RGPD).
          Le message nous est acheminé par le service EmailJS, puis reçu dans
          notre messagerie Gmail.
        </p>
      </Bloc>

      <Bloc titre="Prise de rendez-vous">
        <p>
          Le bouton de réservation ouvre l'agenda Calendly. Le service n'est
          chargé que lorsque vous cliquez. Les informations saisies pour
          réserver (nom, adresse électronique, créneau) sont traitées par
          Calendly LLC, selon sa propre politique de confidentialité, et nous
          sont transmises pour organiser l'entretien.
        </p>
      </Bloc>

      <Bloc titre="Cookies et traceurs">
        <p>
          Le site ne dépose aucun cookie publicitaire sans votre accord. Le
          stockage local de votre navigateur retient seulement que vous avez lu
          le bandeau d'information et, le cas échéant, votre choix sur les
          cookies publicitaires.
        </p>
        <p>
          Sur la page « Démarrer mon projet », un bandeau vous demande votre
          accord pour le pixel Meta, un traceur publicitaire de Meta Platforms
          Ireland Limited qui mesure l'efficacité de nos annonces. Il n'est
          chargé qu'après « Accepter ». Avec votre accord, l'envoi de votre
          demande est aussi signalé à Meta par notre serveur (API Conversions),
          avec votre numéro de téléphone et votre nom sous forme chiffrée
          irréversible (hachage). Sans accord, aucune donnée n'est transmise à
          Meta. Refuser n'empêche pas d'utiliser le formulaire.
        </p>
        <p>
          Vous pouvez retirer votre accord à tout moment, aussi simplement que
          vous l'avez donné :
        </p>
        <ChoixCookies />
      </Bloc>

      <Bloc titre="Destinataires et prestataires">
        <p>
          Vos données sont destinées à NEUROCARE SAS. Elles ne sont ni vendues
          ni louées. Elles sont traitées, pour notre compte, par les
          prestataires suivants :
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Vercel Inc. (États-Unis) : hébergement du site et journaux techniques de connexion ;</li>
          <li>Supabase (base de données hébergée dans l'Union européenne, en Irlande) : enregistrement des demandes et suivi commercial ;</li>
          <li>EmailJS : acheminement des messages du formulaire de contact ;</li>
          <li>Google (Gmail) : réception de nos courriers électroniques et des alertes de nouvelle demande ;</li>
          <li>Calendly LLC (États-Unis) : prise de rendez-vous, si vous l'utilisez ;</li>
          <li>Meta Platforms Ireland Limited : mesure publicitaire, uniquement avec votre accord.</li>
        </ul>
      </Bloc>

      <Bloc titre="Transferts hors de l'Union européenne">
        <p>
          Certains prestataires sont établis aux États-Unis ou peuvent y
          traiter des données. Ces transferts sont encadrés par la décision
          d'adéquation relative au cadre de protection des données entre
          l'Union européenne et les États-Unis, pour les sociétés qui y ont
          adhéré, ou à défaut par les clauses contractuelles types de la
          Commission européenne.
        </p>
      </Bloc>

      <Bloc titre="Durées de conservation">
        <ul className="list-disc space-y-1 pl-6">
          <li>Demandes sans suite : trois ans à compter du dernier échange ;</li>
          <li>Clients : pendant la relation contractuelle, puis cinq ans pour les besoins de preuve ;</li>
          <li>Pièces comptables et factures : dix ans, comme l'exige le code de commerce ;</li>
          <li>Journaux techniques de l'hébergeur : selon la durée fixée par celui-ci, pour la sécurité du site.</li>
        </ul>
      </Bloc>

      <Bloc titre="Vos droits">
        <p>
          Vous disposez d'un droit d'accès, de rectification, d'effacement, de
          limitation, de portabilité et d'opposition, ainsi que du droit de
          retirer votre consentement à tout moment et de définir des
          directives sur le sort de vos données après votre décès. Pour les
          exercer, écrivez à{' '}
          <Lien href="mailto:zdigitalzdev@gmail.com">zdigitalzdev@gmail.com</Lien>.
          Nous répondons dans un délai d'un mois.
        </p>
        <p>
          Aucune décision automatisée produisant des effets juridiques à votre
          égard n'est prise à partir de vos données.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez
          adresser une réclamation à la Commission nationale de l'informatique
          et des libertés (CNIL) : <Lien href="https://www.cnil.fr">www.cnil.fr</Lien>.
        </p>
      </Bloc>
    </PageLegale>
  )
}

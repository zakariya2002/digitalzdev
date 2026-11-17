import type { ReactNode } from 'react'

/*
 * Maquettes des back-offices présentés sur /crm.
 *
 * Elles reproduisent la structure des écrans réels (navigation, modules,
 * tableaux) avec des données fictives : aucun nom de client, de famille ou
 * de prospect réel ne doit apparaître sur une page publique.
 */

export const MENTHE = '#2EFFD1'

/** Fenêtre de navigateur sombre qui encadre chaque maquette. */
export function Fenetre({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#0E0E0E] shadow-[0_40px_120px_-40px_rgba(46,255,209,0.25)] ring-1 ring-white/[0.06]">
      <div className="flex items-center gap-3 bg-[#151515] px-4 py-3">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </span>
        <span className="mx-auto rounded-md bg-black/60 px-4 py-1 font-mono text-[11px] text-white/45">{url}</span>
        <span className="w-[54px]" />
      </div>
      {children}
    </div>
  )
}

function Barre({ titre, liens, actif }: { titre: string; liens: string[]; actif: string }) {
  return (
    <aside className="hidden w-[168px] shrink-0 flex-col gap-1 bg-[#111] p-3 sm:flex">
      <p className="mb-3 px-2 text-[12px] font-semibold text-white">{titre}</p>
      {liens.map((l) => (
        <span
          key={l}
          className={`rounded-lg px-2 py-1.5 text-[11px] ${l === actif ? 'bg-[#2EFFD1]/10 font-medium text-[#2EFFD1]' : 'text-white/45'}`}
        >
          {l}
        </span>
      ))}
    </aside>
  )
}

function Kpi({ label, valeur, note }: { label: string; valeur: string; note?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-3">
      <p className="text-[10px] text-white/45">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{valeur}</p>
      {note && <p className="text-[10px] text-[#2EFFD1]">{note}</p>}
    </div>
  )
}

function Pastille({ children, ton = 'menthe' }: { children: ReactNode; ton?: 'menthe' | 'ambre' | 'gris' | 'rose' }) {
  const tons = {
    menthe: 'bg-[#2EFFD1]/[0.12] text-[#2EFFD1]',
    ambre: 'bg-amber-400/[0.12] text-amber-300',
    gris: 'bg-white/[0.08] text-white/55',
    rose: 'bg-rose-400/[0.12] text-rose-300',
  }
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${tons[ton]}`}>{children}</span>
}

/** Aperçu de principe du futur CRM Wage Portage. */
export function MaquetteWage() {
  const lignes: [string, string, string, string, 'menthe' | 'ambre' | 'gris' | 'rose', string][] = [
    ['Consultant A.', 'ESN Alpha', 'Dév. Java, Lyon', 'CRA validé', 'menthe', 'Facturée'],
    ['Consultante B.', 'ESN Bêta', 'Cheffe de projet', 'CRA à valider', 'ambre', 'En attente'],
    ['Consultant C.', 'ESN Gamma', 'DevOps, Paris', 'CRA validé', 'menthe', 'Facturée'],
    ['Consultante D.', 'ESN Alpha', 'Data engineer', 'Relance envoyée', 'rose', 'Bloquée'],
    ['Consultant E.', 'ESN Delta', 'Architecte cloud', 'CRA validé', 'menthe', 'Payée'],
  ]
  return (
    <Fenetre url="crm.wageportage.com">
      <div className="flex min-h-[380px]">
        <Barre
          titre="Wage Portage"
          actif="Missions"
          liens={['Tableau de bord', 'ESN clientes', 'Consultants', 'Missions', 'Comptes rendus', 'Facturation', 'Paie', 'Documents', 'Simulateur']}
        />
        <div className="flex-1 space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Missions de novembre</p>
            <span className="rounded-full bg-[#2EFFD1] px-3 py-1 text-[10px] font-semibold text-black">Nouvelle mission</span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Kpi label="Missions en cours" valeur="151" note="+6 ce mois" />
            <Kpi label="CRA reçus" valeur="128 / 151" />
            <Kpi label="Facturé" valeur="1,42 M€" note="Données fictives" />
            <Kpi label="Paies à temps" valeur="100 %" />
          </div>
          <div className="space-y-1.5">
            {lignes.map(([nom, esn, mission, cra, ton, fact]) => (
              <div key={nom} className="grid grid-cols-[1.1fr_1fr_1.3fr_auto] items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px] md:grid-cols-[1.1fr_1fr_1.3fr_auto_auto]">
                <span className="font-medium text-white">{nom}</span>
                <span className="text-white/55">{esn}</span>
                <span className="truncate text-white/55">{mission}</span>
                <Pastille ton={ton}>{cra}</Pastille>
                <span className="hidden text-right text-white/45 md:block">{fact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Fenetre>
  )
}

/** NeuroCare : appel depuis le navigateur et résumé rédigé par l'IA. */
export function MaquetteNeuro() {
  return (
    <Fenetre url="neuro-care.fr/admin/appels">
      <div className="flex min-h-[360px]">
        <Barre
          titre="NeuroCare admin"
          actif="Appels"
          liens={['Cockpit', 'Professionnels', 'Familles', 'Structures', 'Campagnes', 'Relances', 'Appels', 'Vérifications', 'Paiements', 'Objectifs']}
        />
        <div className="grid flex-1 gap-3 p-4 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            <div className="rounded-xl bg-white/[0.04] p-4 text-center">
              <p className="text-[10px] text-white/45">Appel en cours</p>
              <p className="mt-1 text-base font-semibold text-white">Orthophoniste, Nantes</p>
              <p className="font-mono text-2xl text-[#2EFFD1]">04:12</p>
              <div className="mt-3 flex justify-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] text-white/70">Muet</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] text-white/70">Clavier</span>
                <span className="rounded-full bg-rose-500 px-3 py-1 text-[10px] font-semibold text-white">Raccrocher</span>
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-[10px] text-white/45">Rappels SMS programmés</p>
              {['Demain 9 h, rendez-vous famille', 'Jeudi, relance devis', 'Lundi, pièce manquante'].map((t) => (
                <p key={t} className="mt-1.5 text-[11px] text-white/70">{t}</p>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-[#2EFFD1]/[0.06] p-4">
            <div className="flex items-center gap-2">
              <Pastille>Résumé IA</Pastille>
              <span className="text-[10px] text-white/40">généré après l'appel</span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-white/80">
              Professionnelle intéressée par l'abonnement. Souhaite recevoir les créneaux des familles de son secteur. Diplôme envoyé, vérification en cours.
            </p>
            <p className="mt-4 text-[10px] text-white/45">Prochaines actions</p>
            {['Valider le diplôme', 'Envoyer le lien de paiement', 'Rappeler vendredi'].map((a) => (
              <p key={a} className="mt-1.5 flex items-center gap-2 text-[11px] text-white/75">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2EFFD1]" />
                {a}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Fenetre>
  )
}

/** Application mobile NeuroCare, dans un téléphone. */
export function TelephoneNeuro() {
  return (
    <div className="mx-auto w-[230px] rounded-[38px] bg-[#1b1b1b] p-2.5 ring-1 ring-white/10">
      <div className="relative overflow-hidden rounded-[30px] bg-[#0B0B0B] px-4 pb-6 pt-9">
        <span className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
        <p className="text-[10px] text-white/45">Bonjour</p>
        <p className="text-sm font-semibold text-white">Vos rendez-vous</p>
        {[
          ['Mar. 9 h 30', 'Séance éducative', 'Confirmé'],
          ['Jeu. 14 h', 'Bilan visio', 'Daily.co'],
          ['Sam. 10 h', 'Atelier groupe', 'Payé'],
        ].map(([h, t, s]) => (
          <div key={h} className="mt-3 rounded-2xl bg-white/[0.05] p-3">
            <p className="text-[10px] text-[#2EFFD1]">{h}</p>
            <p className="text-[12px] font-medium text-white">{t}</p>
            <p className="text-[10px] text-white/45">{s}</p>
          </div>
        ))}
        <div className="mt-4 rounded-2xl bg-[#2EFFD1] py-2.5 text-center text-[11px] font-semibold text-black">Réserver</div>
      </div>
    </div>
  )
}

/** CRM Drive : pipeline des prospects par étape. */
export function MaquetteDrive() {
  const colonnes: [string, string[]][] = [
    ['Nouveaux', ['Reprise berline', 'Estimation SUV', 'Achat citadine']],
    ['Rendez-vous', ['Essai break', 'Expertise coupé']],
    ['Devis envoyé', ['Financement monospace', 'Reprise utilitaire']],
    ['Vendu', ['Citadine, Versailles']],
  ]
  return (
    <Fenetre url="crm.drive / pipeline">
      <div className="flex min-h-[360px]">
        <Barre
          titre="Drive CRM"
          actif="Prospects"
          liens={['Prospects', 'Ventes', 'Contacts', 'Véhicules', 'Livre de police', 'Comptabilité', 'Campagnes', 'Agenda', 'Franchises', 'Paramètres']}
        />
        <div className="flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Pipeline, agence de Paris</p>
            <div className="flex gap-1.5">
              <Pastille ton="gris">Franchise</Pastille>
              <Pastille>Agent commercial</Pastille>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {colonnes.map(([titre, cartes]) => (
              <div key={titre} className="rounded-xl bg-white/[0.03] p-2">
                <p className="mb-2 flex justify-between text-[10px] text-white/50">
                  {titre}
                  <span>{cartes.length}</span>
                </p>
                {cartes.map((c) => (
                  <div key={c} className="mb-1.5 rounded-lg bg-[#1a1a1a] p-2">
                    <p className="text-[11px] text-white">{c}</p>
                    <p className="mt-1 text-[9px] text-white/40">Prospect fictif</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Fenetre>
  )
}

/** CRM Drive : comptabilité, devis, factures, bons de commande. */
export function MaquetteDriveCompta() {
  const docs: [string, string, string, 'menthe' | 'ambre' | 'gris'][] = [
    ['Facture', 'F-2026-0412', '18 400 €', 'menthe'],
    ['Devis', 'D-2026-0219', '12 900 €', 'ambre'],
    ['Bon de commande', 'BC-0087', '9 750 €', 'gris'],
    ['Cession interne', 'CI-0031', '7 200 €', 'gris'],
    ['Ordre de réparation', 'OR-0154', '640 €', 'menthe'],
  ]
  return (
    <Fenetre url="crm.drive / comptabilité">
      <div className="space-y-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Documents comptables</p>
          <div className="flex gap-1.5">
            <Pastille ton="gris">Facturation groupée</Pastille>
            <Pastille>Export</Pastille>
          </div>
        </div>
        {docs.map(([type, num, montant, ton]) => (
          <div key={num} className="grid grid-cols-[1.2fr_1fr_auto] items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px]">
            <span className="text-white">{type}</span>
            <span className="font-mono text-white/50">{num}</span>
            <Pastille ton={ton}>{montant}</Pastille>
          </div>
        ))}
      </div>
    </Fenetre>
  )
}

/** AdsPilot : centre de commande des campagnes et décisions de budget. */
export function MaquetteAds() {
  const campagnes: [string, string, string, string, boolean][] = [
    ['Investisseurs expatriés', '42 €', '3,1 %', '18', true],
    ['Webinaire patrimoine', '28 €', '2,4 %', '11', true],
    ['Retargeting visiteurs', '15 €', '4,8 %', '9', false],
  ]
  return (
    <Fenetre url="adspilot / command-center">
      <div className="flex min-h-[340px]">
        <Barre
          titre="AdsPilot"
          actif="Command center"
          liens={['Command center', 'Tableau de bord', 'Génération', 'Landing pages', 'Règles de budget', 'Tâches', 'Top ads', 'Paramètres']}
        />
        <div className="flex-1 space-y-3 p-4">
          <p className="text-sm font-semibold text-white">Campagnes Meta actives</p>
          {campagnes.map(([nom, budget, ctr, leads, actif]) => (
            <div key={nom} className="grid grid-cols-[1.4fr_auto_auto_auto_auto] items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px]">
              <span className="truncate text-white">{nom}</span>
              <span className="text-white/55">{budget}/j</span>
              <span className="text-white/55">CTR {ctr}</span>
              <span className="text-white/55">{leads} leads</span>
              <span className={`h-4 w-7 rounded-full p-0.5 ${actif ? 'bg-[#2EFFD1]' : 'bg-white/15'}`}>
                <span className={`block h-3 w-3 rounded-full bg-black ${actif ? 'translate-x-3' : ''}`} />
              </span>
            </div>
          ))}
          <div className="rounded-xl bg-[#2EFFD1]/[0.06] p-3">
            <div className="flex items-center gap-2">
              <Pastille>Moteur de budget</Pastille>
              <span className="text-[10px] text-white/40">décision proposée</span>
            </div>
            <p className="mt-2 text-[11px] text-white/80">Augmenter « Investisseurs expatriés » de 20 % : coût par lead sous l'objectif depuis 3 jours.</p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-[#2EFFD1] px-3 py-1 text-[10px] font-semibold text-black">Appliquer</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] text-white/70">Ignorer</span>
            </div>
          </div>
        </div>
      </div>
    </Fenetre>
  )
}

/** Back-office Digitalz : prospection téléphonique et script partagé. */
export function MaquetteDigitalz() {
  const prospects: [string, string, string, 'menthe' | 'ambre' | 'gris' | 'rose'][] = [
    ['Cabinet A', 'Lyon, droit de la famille', 'Google : 14e', 'ambre'],
    ['Cabinet B', 'Bordeaux, droit du travail', 'Google : 3e', 'menthe'],
    ['Cabinet C', 'Lille, droit pénal', 'Absent', 'rose'],
    ['Cabinet D', 'Nantes, immobilier', 'Google : 22e', 'ambre'],
  ]
  return (
    <Fenetre url="digitalzdev.com/dashboard/prospection">
      <div className="flex min-h-[360px]">
        <Barre
          titre="Digitalz back-office"
          actif="Prospection"
          liens={['Accueil', 'Clients', 'Tunnel', 'Prospection', 'Projets', 'Devis', 'Factures', 'Comptabilité', 'Messages', 'Pointage', 'Automatisations']}
        />
        <div className="grid flex-1 gap-3 p-4 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-1.5">
            <p className="mb-2 text-sm font-semibold text-white">À appeler aujourd'hui</p>
            {prospects.map(([nom, detail, google, ton]) => (
              <div key={nom} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                <span>
                  <span className="block text-[11px] text-white">{nom}</span>
                  <span className="block text-[10px] text-white/45">{detail}</span>
                </span>
                <Pastille ton={ton}>{google}</Pastille>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <div className="flex items-center justify-between">
              <Pastille>Script d'appel</Pastille>
              <span className="text-[10px] text-white/40">partagé par l'équipe</span>
            </div>
            <p className="mt-3 rounded-lg bg-[#2EFFD1]/[0.07] p-2.5 text-[11px] leading-relaxed text-white/80">
              Moi : Bonjour Maître, j'ai tapé « avocat droit du travail Bordeaux » et votre cabinet sort en troisième position…
            </p>
            <p className="mt-2 text-[10px] italic text-white/40">Les variables se remplissent pour chaque fiche.</p>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
              <span className="font-mono text-[11px] text-white/70">01:47</span>
              <span className="rounded-full bg-rose-500 px-3 py-1 text-[10px] font-semibold text-white">Raccrocher</span>
            </div>
          </div>
        </div>
      </div>
    </Fenetre>
  )
}

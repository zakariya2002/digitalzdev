import { type CSSProperties } from 'react'
import SmoothScroll from '../components/SmoothScroll'
import Curseur from '../components/studio/Curseur'
import AvisGoogleSection from '../components/AvisGoogleSection'
import Prechargeur from '../components/avocatleads/Prechargeur'
import Navigation from '../components/avocatleads/Navigation'
import Hero from '../components/avocatleads/Hero'
import Manifeste from '../components/avocatleads/Manifeste'
import Reference from '../components/avocatleads/Reference'
import RendezVous from '../components/avocatleads/RendezVous'
import Final from '../components/avocatleads/Final'
import Acquisition from '../components/avocatleads/Acquisition'
import Services from '../components/avocatleads/Services'
import Deontologie from '../components/avocatleads/Deontologie'
import Equipe from '../components/avocatleads/Equipe'
import Faq from '../components/avocatleads/Faq'
import PiedDePage from '../components/avocatleads/PiedDePage'

/**
 * AvocatLeads : la vitrine de la V1, réservée aux avocats.
 *
 * Même récit que l'accueil d'origine, avec des couleurs plus sobres : le bleu
 * électrique devient un marine profond et le citron disparaît. La section
 * déontologie s'ajoute, et la réalisation pour un cabinet d'avocats remplace
 * la piste de projets.
 */
const SOBRE = {
  '--pop': '30 52 84',
  '--citron': '138 122 92',
} as CSSProperties

export default function AvocatLeads() {
  return (
    <div style={SOBRE}>
      <SmoothScroll>
        <Navigation />
        <main>
          <Prechargeur />
          <Hero />
          <Manifeste />
          <Reference />
          <RendezVous />
          <Final />
          <Acquisition />
          <Services />
          <Deontologie />
          <AvisGoogleSection />
          <Equipe />
          <Faq />
          <PiedDePage />
        </main>
        <Curseur />
      </SmoothScroll>
    </div>
  )
}

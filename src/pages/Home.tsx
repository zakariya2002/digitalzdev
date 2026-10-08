import HeroStudio from '../components/studio/HeroStudio'
import ManifesteStudio from '../components/studio/ManifesteStudio'
import TravauxStudio from '../components/studio/TravauxStudio'
import ServicesStudio from '../components/studio/ServicesStudio'
import AcquisitionStudio from '../components/studio/AcquisitionStudio'
import EquipeStudio from '../components/studio/EquipeStudio'
import FinalStudio from '../components/studio/FinalStudio'
import Prechargeur from '../components/studio/Prechargeur'
import AvisGoogleSection from '../components/AvisGoogleSection'
import FaqSection from '../components/FaqSection'
import MissionSection from '../components/MissionSection'
import AccueilPopup from '../components/AccueilPopup'
import Footer from '../components/Footer'

/**
 * Accueil, version « studio ».
 *
 * Le récit suit la mécanique des portfolios primés : un titre et une vidéo
 * qui prend l'écran, le manifeste éclairé au défilement, les projets tout de
 * suite, puis les services en cartes empilées, les
 * leviers d'acquisition, les preuves, l'équipe et l'appel final.
 */
export default function Home() {
  return (
    <main>
      <Prechargeur />
      <HeroStudio />
      <ManifesteStudio />
      <TravauxStudio />
      <ServicesStudio />
      <AcquisitionStudio />
      <AvisGoogleSection />
      <EquipeStudio />
      <FaqSection />
      <MissionSection />
      <FinalStudio />
      <Footer />
      <AccueilPopup />
    </main>
  )
}

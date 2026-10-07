import Hero from '../components/Hero'
import StatementSection from '../components/StatementSection'
import AvisGoogleSection from '../components/AvisGoogleSection'
import AcquisitionSection from '../components/AcquisitionSection'
import AccueilPopup from '../components/AccueilPopup'
import ExpertisesSection from '../components/ExpertisesSection'
import ProjectsSection from '../components/ProjectsSection'
import ServicesSection from '../components/ServicesSection'
import TestimonialsSection from '../components/TestimonialsSection'
import TeamSection from '../components/TeamSection'
import FaqSection from '../components/FaqSection'
import MissionSection from '../components/MissionSection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <main>
      {/* Ordre inspiré des sites primés pour cette cible : la promesse, les
          réalisations tout de suite, puis les métiers servis, la méthode
          d'acquisition et les preuves. */}
      <Hero />
      <ProjectsSection />
      <ExpertisesSection />
      <StatementSection />
      <AcquisitionSection />
      <AvisGoogleSection />
      <ServicesSection />
      <TestimonialsSection />
      <TeamSection />
      <FaqSection />
      <MissionSection />
      <Footer />
      <AccueilPopup />
    </main>
  )
}

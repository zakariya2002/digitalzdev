import Hero from '../components/Hero'
import StatementSection from '../components/StatementSection'
import AvisGoogleSection from '../components/AvisGoogleSection'
import AcquisitionSection from '../components/AcquisitionSection'
import AccueilPopup from '../components/AccueilPopup'
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
      <Hero />
      <StatementSection />
      <ProjectsSection />
      {/* Juste après les réalisations : ce qu'en disent les clients, puis
          ce qui fait venir les leurs une fois le site en ligne. */}
      <AvisGoogleSection />
      <AcquisitionSection />
      {/* Les services remontent juste après les réalisations : ils arrivaient
          en cinquième, après l'équipe, si bien qu'on savait qui nous sommes
          avant de savoir ce que nous vendons. La preuve d'abord, l'offre
          ensuite, la maison et les objections après. */}
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

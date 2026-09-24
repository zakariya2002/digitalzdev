import Hero from '../components/Hero'
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
      <ProjectsSection />
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
    </main>
  )
}

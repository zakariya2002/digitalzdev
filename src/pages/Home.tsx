import Hero from '../components/Hero'
import ProjectsSection from '../components/ProjectsSection'
import ServicesSection from '../components/ServicesSection'
import TeamSection from '../components/TeamSection'
import FaqSection from '../components/FaqSection'
import MissionSection from '../components/MissionSection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <ProjectsSection />
      <ServicesSection />
      <TeamSection />
      <FaqSection />
      <MissionSection />
      <Footer />
    </main>
  )
}

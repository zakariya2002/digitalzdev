import Hero from '../components/Hero'
import ProjectsSection from '../components/ProjectsSection'
import TeamSection from '../components/TeamSection'
import MissionSection from '../components/MissionSection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <ProjectsSection />
      <TeamSection />
      <MissionSection />
      <Footer />
    </main>
  )
}

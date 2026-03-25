import { Routes, Route } from 'react-router-dom'
import SmoothScroll from './components/SmoothScroll'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import { projects } from './data/projects'

export default function App() {
  return (
    <SmoothScroll>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {projects.map((project) => (
          <Route
            key={project.id}
            path={project.route}
            element={<ProjectPage project={project} />}
          />
        ))}
      </Routes>
    </SmoothScroll>
  )
}

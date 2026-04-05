import { Routes, Route, useLocation } from 'react-router-dom'
import SmoothScroll from './components/SmoothScroll'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import CookieBanner from './components/CookieBanner'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import Contact from './pages/Contact'
import MentionsLegales from './pages/MentionsLegales'
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import { projects } from './data/projects'

export default function App() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname === '/login'

  if (isDashboard) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    )
  }

  return (
    <SmoothScroll>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        {projects.map((project) => (
          <Route
            key={project.id}
            path={project.route}
            element={<ProjectPage project={project} />}
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieBanner />
    </SmoothScroll>
  )
}

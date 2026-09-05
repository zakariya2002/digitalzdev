import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import SmoothScroll from './components/SmoothScroll'
import ScrollToTop from './components/ScrollToTop'
import ScrollProgress from './components/ScrollProgress'
import PageTransition from './components/PageTransition'
import Navbar from './components/Navbar'
import CookieBanner from './components/CookieBanner'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import Contact from './pages/Contact'
import MentionsLegales from './pages/MentionsLegales'
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite'
import NotFound from './pages/NotFound'
import { projects } from './data/projects'

// Le back-office embarque Supabase, Twilio, Recharts et pdf.js. Rien de tout
// cela ne doit peser sur la vitrine : ces routes sont chargées à la demande.
const Login = lazy(() => import('./pages/Login'))
const ClientPortal = lazy(() => import('./pages/ClientPortal'))
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-accent" />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  // Le back-office et l'espace client s'affichent sans la vitrine autour
  const isDashboard = location.pathname.startsWith('/dashboard')
    || location.pathname === '/login'
    || location.pathname.startsWith('/espace/')

  if (isDashboard) {
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/espace/:token" element={<ClientPortal />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </>
    )
  }

  return (
    <SmoothScroll>
      <ScrollProgress />
      <Navbar />
      {/* `mode="wait"` : la page sortante s'efface avant que la suivante ne
          se monte, ce qui laisse `PageTransition` remonter le scroll sans
          saut visible. */}
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route
              path="/politique-confidentialite"
              element={<PolitiqueConfidentialite />}
            />
            {projects.map((project) => (
              <Route
                key={project.id}
                path={project.route}
                element={<ProjectPage project={project} />}
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </AnimatePresence>
      <CookieBanner />
    </SmoothScroll>
  )
}

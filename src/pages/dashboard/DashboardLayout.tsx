import { Routes, Route } from 'react-router-dom'
import Sidebar from '../../components/dashboard/Sidebar'
import Header from '../../components/dashboard/Header'
import DashboardHome from './DashboardHome'
import KanbanPage from './KanbanPage'
import CalendarPage from './CalendarPage'
import ClientsPage from './ClientsPage'
import RevenuesPage from './RevenuesPage'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main>
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="kanban" element={<KanbanPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="revenues" element={<RevenuesPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

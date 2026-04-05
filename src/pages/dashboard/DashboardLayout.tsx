import { Routes, Route } from 'react-router-dom'
import Sidebar from '../../components/dashboard/Sidebar'
import Header from '../../components/dashboard/Header'
import Softphone from '../../components/dashboard/Softphone'
import { TwilioProvider } from '../../contexts/TwilioContext'
import DashboardHome from './DashboardHome'
import KanbanPage from './KanbanPage'
import CalendarPage from './CalendarPage'
import ClientsPage from './ClientsPage'
import ClientDetailPage from './ClientDetailPage'
import RevenuesPage from './RevenuesPage'
import SmsTemplatesPage from './SmsTemplatesPage'

export default function DashboardLayout() {
  return (
    <TwilioProvider>
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
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="revenues" element={<RevenuesPage />} />
              <Route path="sms-templates" element={<SmsTemplatesPage />} />
            </Routes>
          </main>
        </div>
        <Softphone />
      </div>
    </TwilioProvider>
  )
}

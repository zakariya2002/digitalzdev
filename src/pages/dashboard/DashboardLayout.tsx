import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
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
import QuotesPage from './QuotesPage'
import QuoteDetailPage from './QuoteDetailPage'
import InvoicesPage from './InvoicesPage'
import InvoiceDetailPage from './InvoiceDetailPage'
import FinancesPage from './FinancesPage'
import ProposalsPage from './ProposalsPage'
import ProposalDetailPage from './ProposalDetailPage'
import ProjectDetailPage from './ProjectDetailPage'
import AutomationPage from './AutomationPage'
import { useEffect } from 'react'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <TwilioProvider>
      <div className="min-h-screen bg-gray-950 text-white">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main>
            <Routes>
              <Route index element={<DashboardHome />} />
              <Route path="kanban" element={<KanbanPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="revenues" element={<RevenuesPage />} />
              <Route path="sms-templates" element={<SmsTemplatesPage />} />
              <Route path="quotes" element={<QuotesPage />} />
              <Route path="quotes/new" element={<QuoteDetailPage />} />
              <Route path="quotes/:id" element={<QuoteDetailPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="invoices/new" element={<InvoiceDetailPage />} />
              <Route path="invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="finances" element={<FinancesPage />} />
              <Route path="proposals" element={<ProposalsPage />} />
              <Route path="proposals/new" element={<ProposalDetailPage />} />
              <Route path="proposals/:id" element={<ProposalDetailPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="automation" element={<AutomationPage />} />
            </Routes>
          </main>
        </div>
        <Softphone />
      </div>
    </TwilioProvider>
  )
}

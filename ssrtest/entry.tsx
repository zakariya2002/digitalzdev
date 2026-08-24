import { renderToString } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../src/contexts/AuthContext'
import { TeamProvider } from '../src/contexts/TeamContext'
import MessagesPage from '../src/pages/dashboard/MessagesPage'
import Sidebar from '../src/components/dashboard/Sidebar'

export function run() {
  const out: string[] = []
  try {
    renderToString(
      <MemoryRouter initialEntries={['/dashboard/messages']}>
        <AuthProvider>
          <TeamProvider>
            <Sidebar open={false} onClose={() => {}} />
            <Routes>
              <Route path="/dashboard/messages" element={<MessagesPage />} />
            </Routes>
          </TeamProvider>
        </AuthProvider>
      </MemoryRouter>
    )
    out.push('RENDU OK')
  } catch (e) {
    out.push('CRASH: ' + (e as Error).message)
    out.push((e as Error).stack?.split('\n').slice(0, 6).join('\n') || '')
  }
  return out.join('\n')
}

import { Routes, Route } from 'react-router'
import { Layout } from '@/components/Layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TodayPage } from '@/pages/Today'
import { BodyPage } from '@/pages/Body'
import { ChatPage } from '@/pages/Chat'
import { ProgressPage } from '@/pages/Progress'
import { SettingsPage } from '@/pages/Settings'
import { NotFoundPage } from '@/pages/NotFound'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<TodayPage />} />
          <Route path="body" element={<BodyPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

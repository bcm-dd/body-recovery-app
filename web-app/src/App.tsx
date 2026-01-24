import { Routes, Route } from 'react-router'
import { Layout } from '@/components/Layout'
import { TodayPage } from '@/pages/Today'
import { BodyPage } from '@/pages/Body'
import { ChatPage } from '@/pages/Chat'
import { ProgressPage } from '@/pages/Progress'
import { SettingsPage } from '@/pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TodayPage />} />
        <Route path="body" element={<BodyPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

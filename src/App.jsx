import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SubscriptionList from './pages/SubscriptionList'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import SearchResults from './pages/SearchResults'
import TutorialGuide from './components/TutorialGuide'
import useSubscriptionStore from './store/useSubscriptionStore'

export default function App() {
  const isDarkMode = useSubscriptionStore((state) => state.isDarkMode)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <BrowserRouter>
      <TutorialGuide />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="list" element={<SubscriptionList />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="settings" element={<Settings />} />
          <Route path="search" element={<SearchResults />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

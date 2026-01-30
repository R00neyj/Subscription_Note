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
import { supabase } from './lib/supabase'
import { useEffectiveTheme } from './hooks/useEffectiveTheme'

export default function App() {
  const fetchSubscriptions = useSubscriptionStore((state) => state.fetchSubscriptions)
  const user = useSubscriptionStore((state) => state.user)
  const setUser = useSubscriptionStore((state) => state.setUser)
  const isDark = useEffectiveTheme()

  useEffect(() => {
    // 1. 현재 세션 확인 및 구독
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  useEffect(() => {
    // 2. 유저가 있을 때만 데이터 로드
    // user 객체 전체가 아닌 user.id를 의존성으로 하여 불필요한 재실행 방지
    if (user?.id) {
      fetchSubscriptions()
    }
  }, [user?.id, fetchSubscriptions])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

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

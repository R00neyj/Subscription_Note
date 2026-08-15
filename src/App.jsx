import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SubscriptionList from './pages/SubscriptionList'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import SearchResults from './pages/SearchResults'
import Landing from './pages/Landing'
import TutorialGuide from './components/TutorialGuide'
import InstallPrompt from './components/InstallPrompt'
import SWUpdatePrompt from './components/SWUpdatePrompt'
import useSubscriptionStore from './store/useSubscriptionStore'
import { supabase } from './lib/supabase'
import { useEffectiveTheme } from './hooks/useEffectiveTheme'

export default function App() {
  const fetchSubscriptions = useSubscriptionStore((state) => state.fetchSubscriptions)
  const user = useSubscriptionStore((state) => state.user)
  const setUser = useSubscriptionStore((state) => state.setUser)
  const isGuest = useSubscriptionStore((state) => state.isGuest)
  const isAuthLoading = useSubscriptionStore((state) => state.isAuthLoading)
  const setAuthLoading = useSubscriptionStore((state) => state.setAuthLoading)
  const isDark = useEffectiveTheme()

  useEffect(() => {
    let mounted = true

    // 1. 현재 세션 확인 및 구독
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          setUser(session?.user ?? null)
          setAuthLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setAuthLoading(false)
        }
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        setAuthLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setAuthLoading])

  useEffect(() => {
    // 2. 유저가 있을 때만 데이터 로드
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

  // 초기 인증 세션 확인 중 깜빡임 방지
  if (isAuthLoading) {
    return <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19]" />
  }

  // 앱 진입 가능 여부: 로그인 세션 존재 OR 게스트 모드 활성화
  const canAccessApp = !!user || isGuest

  return (
    <BrowserRouter>
      <TutorialGuide />
      <InstallPrompt />
      <SWUpdatePrompt />
      <Routes>
        {/* 랜딩 페이지 (네비게이션 레이아웃 제외) */}
        <Route path="/landing" element={<Landing />} />
        
        {/* 앱 내부 페이지 (로그인 또는 게스트 세션 필수) */}
        <Route element={canAccessApp ? <Layout /> : <Navigate to="/landing" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="list" element={<SubscriptionList />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="settings" element={<Settings />} />
          <Route path="search" element={<SearchResults />} />
        </Route>

        {/* 미정의 경로 리다이렉트 */}
        <Route path="*" element={<Navigate to={canAccessApp ? "/" : "/landing"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

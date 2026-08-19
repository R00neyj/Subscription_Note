import useSubscriptionStore from '../store/useSubscriptionStore'
import { X, Search, Settings, Sun, Moon } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useEffectiveTheme } from '../hooks/useEffectiveTheme'
import { cn } from '../lib/utils'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchQuery = useSubscriptionStore((state) => state.searchQuery)
  const setSearchQuery = useSubscriptionStore((state) => state.setSearchQuery)
  const themeMode = useSubscriptionStore((state) => state.themeMode) || 'system'
  const setThemeMode = useSubscriptionStore((state) => state.setThemeMode)
  const isDark = useEffectiveTheme()

  const isSearchPage = location.pathname === '/search'
  const isSettingsPage = location.pathname === '/settings'

  // 검색은 저빈도 행동이므로 평소에는 아이콘으로 접어두고 헤더 공간을 돌려준다.
  const [isSearchOpen, setIsSearchOpen] = useState(isSearchPage)
  const inputRef = useRef(null)

  // Sync searchQuery with URL if we are on search page
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('q')
    if (isSearchPage) {
      setIsSearchOpen(true)
      if (q && q !== searchQuery) setSearchQuery(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  const openSearch = () => {
    setIsSearchOpen(true)
    // 펼쳐진 뒤에 포커스를 줘야 모바일 키보드가 올라온다
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
    if (e.key === 'Escape') {
      closeSearch()
    }
  }

  const closeSearch = () => {
    setSearchQuery('')
    setIsSearchOpen(false)
    if (isSearchPage) {
      navigate('/list')
    }
  }

  const toggleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode(isDark ? 'light' : 'dark')
    } else {
      setThemeMode(themeMode === 'dark' ? 'light' : 'dark')
    }
  }

  const iconButtonClass = "flex items-center justify-center w-[36px] h-[36px] md:w-[38px] md:h-[38px] rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-dark dark:hover:text-white transition-all active:scale-90 cursor-pointer shrink-0"

  return (
    <div className="sticky md:relative top-0 z-[50] md:z-0 flex flex-row items-center px-4 py-2 md:p-[6px_8px] gap-2 md:gap-3 w-[calc(100%+28px)] md:w-full -mx-3.5 md:mx-0 h-[56px] md:h-[58px] mb-3 md:mb-6 bg-[#F8FAFC]/95 dark:bg-[#0F172A]/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none transition-all shrink-0">
      {/* Logo & Title — 검색이 열리면 모바일에서는 자리를 내준다 */}
      <div className={cn(
        "flex-row items-center p-0 gap-2 md:gap-[8px] w-fit h-[40px] md:h-[44px] shrink-0",
        isSearchOpen ? "hidden md:flex" : "flex"
      )}>
        <div className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] bg-white dark:bg-slate-800 rounded-xl border border-blue-50 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
          <img
            src={isDark ? "/logo_d.svg" : "/favicon.svg"}
            alt="Logo"
            className="w-[26px] h-[26px] md:w-[32px] md:h-[32px]"
          />
        </div>
        <p className="font-extrabold text-[17px] md:text-[20px] leading-[140%] text-[#1E293B] dark:text-white whitespace-nowrap text-center">
          구독노트
        </p>
      </div>

      {/* Search — 닫혀 있을 때는 빈 공간(spacer)이 아이콘들을 우측으로 민다 */}
      {isSearchOpen ? (
        <div className="flex flex-row items-center px-3.5 md:px-4 gap-2 md:gap-[8px] flex-1 min-w-0 h-[40px] md:h-[44px] bg-slate-100 dark:bg-slate-800/80 rounded-xl transition-all overflow-hidden border border-transparent focus-within:border-primary/40 focus-within:bg-white dark:focus-within:bg-slate-800">
          <Search className="w-[18px] h-[18px] md:w-5 md:h-5 shrink-0 text-slate-400 dark:text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="구독 검색"
            className="bg-transparent border-none outline-none text-[14px] md:text-[15px] leading-[140%] text-dark dark:text-white placeholder:text-dark/40 dark:placeholder:text-white/40 w-full font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button
            onClick={closeSearch}
            aria-label="검색 닫기"
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 text-dark/40 dark:text-white/40" />
          </button>
        </div>
      ) : (
        <div className="flex-1 min-w-0" />
      )}

      {/* Utility Actions */}
      <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
        {!isSearchOpen && (
          <button onClick={openSearch} aria-label="구독 검색" className={iconButtonClass}>
            <Search className="w-[19px] h-[19px] md:w-5 md:h-5" />
          </button>
        )}

        <button
          id="step-theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          className={iconButtonClass}
        >
          {isDark
            ? <Sun className="w-[19px] h-[19px] md:w-5 md:h-5" />
            : <Moon className="w-[19px] h-[19px] md:w-5 md:h-5" />}
        </button>

        <button
          id="step-settings"
          onClick={() => navigate('/settings')}
          aria-label="설정"
          aria-current={isSettingsPage ? 'page' : undefined}
          className={cn(
            iconButtonClass,
            isSettingsPage && "bg-primary/10 text-primary dark:text-blue-400 hover:bg-primary/15 hover:text-primary"
          )}
        >
          <Settings className="w-[19px] h-[19px] md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  )
}

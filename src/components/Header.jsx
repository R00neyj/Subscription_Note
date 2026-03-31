import useSubscriptionStore from '../store/useSubscriptionStore'
import { X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useEffectiveTheme } from '../hooks/useEffectiveTheme'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchQuery = useSubscriptionStore((state) => state.searchQuery)
  const setSearchQuery = useSubscriptionStore((state) => state.setSearchQuery)
  const isDark = useEffectiveTheme()

  // Sync searchQuery with URL if we are on search page
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('q')
    if (location.pathname === '/search' && q && q !== searchQuery) {
      setSearchQuery(q)
    }
  }, [location.pathname, location.search])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    if (location.pathname === '/search') {
      navigate('/list')
    }
  }

  return (
    <div className="sticky md:relative top-0 z-[50] md:z-0 flex flex-row items-center p-[8px_24px] md:p-[8px_12px] gap-[12px] md:gap-[28px] w-[calc(100%+48px)] md:w-full -mx-6 md:mx-0 h-[64px] mb-[24px] md:mb-8 bg-[#F8FAFC]/80 dark:bg-[#0F172A]/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none transition-all shrink-0">
      {/* Frame 23: Logo & Title */}
      <div className="flex flex-row items-center p-0 gap-[8px] w-fit h-[48px] shrink-0">
        <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] bg-white dark:bg-slate-800 rounded-lg border border-blue-50 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img 
              src={isDark ? "/logo_d.svg" : "/favicon.svg"} 
              alt="Logo" 
              className="w-[32px] h-[32px] md:w-[42px] md:h-[42px]" 
            />
        </div>
        <p className="font-extrabold text-[20px] md:text-[22px] leading-[140%] text-[#1E293B] dark:text-white whitespace-nowrap text-center">
          구독노트
        </p>
      </div>

      {/* Frame 19: Search Bar */}
      <div className="flex flex-row items-center px-4 md:px-[24px] gap-[8px] flex-1 h-[48px] md:h-[64px] bg-tertiary dark:bg-slate-800/80 rounded-[99px] transition-all overflow-hidden border border-transparent focus-within:border-primary/30">
        <img src="/name=search, fill=true.svg" alt="Search" className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] shrink-0 opacity-50 dark:opacity-70 dark:invert" />
        <input 
          type="text" 
          placeholder="구독 검색" 
          className="bg-transparent border-none outline-none text-[14px] md:text-[18px] leading-[140%] text-dark dark:text-white placeholder:text-dark/40 dark:placeholder:text-white/40 w-full font-bold"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
        {searchQuery && (
          <button 
            onClick={handleClear}
            className="p-1 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-dark/40 dark:text-white/40" />
          </button>
        )}
      </div>
    </div>
  )
}

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
    <div className="sticky md:relative top-0 z-[50] md:z-0 flex flex-row items-center px-4 py-2 md:p-[6px_8px] gap-3 md:gap-[20px] w-[calc(100%+28px)] md:w-full -mx-3.5 md:mx-0 h-[56px] md:h-[58px] mb-3 md:mb-6 bg-[#F8FAFC]/95 dark:bg-[#0F172A]/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none transition-all shrink-0">
      {/* Frame 23: Logo & Title */}
      <div className="flex flex-row items-center p-0 gap-2 md:gap-[8px] w-fit h-[40px] md:h-[44px] shrink-0">
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

      {/* Frame 19: Search Bar */}
      <div className="flex flex-row items-center px-3.5 md:px-4 gap-2 md:gap-[8px] flex-1 h-[40px] md:h-[44px] bg-slate-100 dark:bg-slate-800/80 rounded-xl transition-all overflow-hidden border border-transparent focus-within:border-primary/40 focus-within:bg-white dark:focus-within:bg-slate-800">
        <img src="/name=search, fill=true.svg" alt="Search" className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] shrink-0 opacity-50 dark:opacity-70 dark:invert" />
        <input 
          type="text" 
          placeholder="구독 검색" 
          className="bg-transparent border-none outline-none text-[14px] md:text-[15px] leading-[140%] text-dark dark:text-white placeholder:text-dark/40 dark:placeholder:text-white/40 w-full font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
        {searchQuery && (
          <button 
            onClick={handleClear}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-dark/40 dark:text-white/40" />
          </button>
        )}
      </div>
    </div>
  )
}

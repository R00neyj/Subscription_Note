import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { useEffectiveTheme } from '../hooks/useEffectiveTheme'

const navItems = [
  { path: '/', activeIcon: '/name=home, fill=true.svg', inactiveIcon: '/name=home, fill=false.svg', label: '홈' },
  { path: '/list', activeIcon: '/name=subscribe, fill=true.svg', inactiveIcon: '/name=subscribe, fill=false.svg', label: '구독목록' },
  { path: '/wishlist', activeIcon: '/name=wishlist, fill=true.svg', inactiveIcon: '/name=wishlist, fill=false.svg', label: '위시리스트' },
  { path: '/calendar', activeIcon: '/name=calendar, fill=true.svg', inactiveIcon: '/name=calendar, fill=false.svg', label: '캘린더' },
  { path: '/settings', activeIcon: '/name=settings, fill=true.svg', inactiveIcon: '/name=settings, fill=false.svg', label: '설정' },
]

export default function Navigation() {
  const location = useLocation()
  const openModal = useSubscriptionStore((state) => state.openModal)
  const themeMode = useSubscriptionStore((state) => state.themeMode) || 'system'
  const setThemeMode = useSubscriptionStore((state) => state.setThemeMode)
  const isDark = useEffectiveTheme()

  const toggleDarkMode = () => {
    if (themeMode === 'dark') setThemeMode('light')
    else if (themeMode === 'light') setThemeMode('dark')
    else {
      // system
      if (isDark) setThemeMode('light')
      else setThemeMode('dark')
    }
  }

  return (
    <nav id="step-nav-bottom" className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 md:border-t-0 md:border-r md:sticky md:top-0 md:w-[76px] md:shrink-0 md:h-screen md:flex md:flex-col md:justify-between md:items-center md:py-6 md:pb-4 z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <div className="flex md:flex-col items-center justify-around w-full md:w-auto md:space-y-6">
        {/* btn (Add Button) */}
        <button 
          id="step-add-pc"
          onClick={() => openModal()}
          className="hidden md:flex justify-center items-center w-[48px] h-[48px] bg-primary rounded-[14px] p-0 transition-all hover:bg-primary/90 active:scale-95 cursor-pointer shadow-md shadow-primary/20" 
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
              <img src="/name=edit, fill=true.svg" alt="Add" className="w-5 h-5 brightness-0 invert" />
          </div>
        </button>

        {/* Nav (Container for menu items) */}
        <div className="flex md:flex-col w-full md:w-[50px] md:h-auto justify-around md:justify-start items-center px-1 py-1 md:p-0 relative md:gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                id={item.path === '/settings' ? 'step-settings-mobile' : undefined}
                to={item.path}
                className="flex flex-col items-center justify-center w-[58px] md:w-[50px] h-[58px] md:h-[58px] py-1 gap-[3px] transition-all group active:scale-95 cursor-pointer"
              >
                {/* size-56 (Icon Container) */}
                <div className={cn(
                  "flex items-center justify-center w-[48px] md:w-[48px] h-[30px] md:h-[28px] rounded-full transition-all",
                  isActive ? "bg-primary shadow-xs shadow-primary/20" : "group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
                )}>
                  <img 
                    src={isActive ? item.activeIcon : item.inactiveIcon} 
                    alt={item.label} 
                    className={cn(
                      "w-[20px] h-[20px] md:w-5 md:h-5 shrink-0 transition-all", 
                      isActive ? "brightness-0 invert" : "opacity-60 dark:invert dark:opacity-80"
                    )} 
                  />
                </div>
                {/* Label */}
                <span className={cn(
                  "text-[11px] md:text-[11px] leading-tight text-center whitespace-nowrap transition-colors",
                  isActive ? "font-extrabold text-primary" : "font-medium text-slate-500 dark:text-slate-400"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <button 
        id="step-dark-pc"
        onClick={toggleDarkMode}
        className="hidden md:flex justify-center items-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90 shadow-xs"
      >
        <img 
          src={isDark ? "/darkMode=true, fill=true.svg" : "/darkMode=false, fill=false.svg"} 
          alt="Dark Mode" 
          className="w-5 h-5 opacity-70 dark:invert" 
        />
      </button>
    </nav>
  )
}

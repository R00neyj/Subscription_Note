import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { useEffectiveTheme } from '../hooks/useEffectiveTheme'

const navItems = [
  { path: '/', activeIcon: '/name=home, fill=true.svg', inactiveIcon: '/name=home, fill=false.svg', label: '홈' },
  { path: '/list', activeIcon: '/name=subscribe, fill=true.svg', inactiveIcon: '/name=subscribe, fill=false.svg', label: '구독목록' },
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
    <nav id="step-nav-bottom" className="fixed bottom-0 left-0 right-0 bg-tertiary dark:bg-slate-950 md:sticky md:top-0 md:w-[90px] md:h-screen md:flex md:flex-col md:justify-between md:items-center md:py-6 md:pb-4 z-50 transition-colors duration-300">
      <div className="flex md:flex-col items-center justify-around w-full md:w-auto md:space-y-10">
        {/* btn (Add Button) */}
        <button 
          id="step-add-pc"
          onClick={() => openModal()}
          className="hidden md:flex justify-center items-center w-[56px] h-[56px] bg-primary rounded-[12px] p-0 transition-colors hover:bg-accent-2" 
          style={{ padding: '16px 13px' }}
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
              <img src="/name=edit, fill=true.svg" alt="Add" className="w-6 h-6 brightness-0 invert" />
          </div>
        </button>

        {/* Nav (Container for menu items) */}
        <div className="flex md:flex-col w-full md:w-[56px] md:h-[195px] justify-around md:justify-start items-start p-0 relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                id={item.path === '/settings' ? 'step-settings-mobile' : undefined}
                to={item.path}
                className="flex flex-col items-center w-[56px] h-[65px] py-[6px] gap-[4px] transition-all group"
              >
                {/* size-56 (Icon Container) */}
                <div className={cn(
                  "flex items-center justify-center w-[56px] h-[32px] px-[16px] py-[4px] rounded-[32px] transition-colors",
                  isActive ? "bg-primary" : "group-hover:bg-white/50 dark:group-hover:bg-slate-700"
                )}>
                  <img 
                    src={isActive ? item.activeIcon : item.inactiveIcon} 
                    alt={item.label} 
                    className={cn(
                      "w-6 h-6 shrink-0 transition-all", 
                      isActive ? "brightness-0 invert" : "dark:invert"
                    )} 
                  />
                </div>
                {/* Label */}
                <span className={cn(
                  "w-[56px] h-[17px] text-[12px] leading-[1.4] text-center tracking-[-0.02em] whitespace-nowrap",
                  isActive ? "font-bold" : "font-medium",
                  "text-[#111111] dark:text-white"
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
        className="hidden md:flex justify-center items-center w-12 h-12 rounded-full border border-dark/20 dark:border-white/20 cursor-pointer hover:bg-white/50 dark:hover:bg-slate-700 transition-colors"
      >
        <img 
          src={isDark ? "/darkMode=true, fill=true.svg" : "/darkMode=false, fill=false.svg"} 
          alt="Dark Mode" 
          className="w-6 h-6 dark:invert" 
        />
      </button>
    </nav>
  )
}

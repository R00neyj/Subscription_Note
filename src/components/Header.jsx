import { Sun, Moon } from 'lucide-react'
import useSubscriptionStore from '../store/useSubscriptionStore'

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useSubscriptionStore()

  return (
    <div className="flex gap-[28px] h-[64px] items-center px-[12px] py-[8px] w-full mb-8">
      {/* Logo & Title */}
      <div className="flex gap-[8px] items-center shrink-0">
        <div className="relative w-[48px] h-[48px] bg-white dark:bg-slate-800 rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden transition-colors">
            <img src="/favicon.svg" alt="Logo" className="w-8 h-8" />
        </div>
        <p className="font-bold text-[22px] text-dark dark:text-white leading-[1.4] transition-colors">
          구독노트
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-tertiary dark:bg-slate-800 flex-1 h-[64px] flex items-center gap-[8px] px-[24px] rounded-[99px] overflow-hidden transition-colors">
        <img src="/name=search, fill=true.svg" alt="Search" className="w-6 h-6 shrink-0 opacity-50 dark:opacity-70 dark:invert" />
        <input 
          type="text" 
          placeholder="내 구독목록을 검색해보세요" 
          className="bg-transparent border-none outline-none text-[18px] text-dark dark:text-white placeholder:text-dark/50 dark:placeholder:text-white/50 w-full tracking-[-0.36px]"
        />
      </div>

      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleDarkMode}
        className="w-[64px] h-[64px] flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-dark dark:text-yellow-400 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-md transition-all cursor-pointer"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? <Sun size={28} /> : <Moon size={28} />}
      </button>
    </div>
  )
}

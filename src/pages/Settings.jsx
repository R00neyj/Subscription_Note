import useSubscriptionStore from '../store/useSubscriptionStore'
import { cn } from '../lib/utils'

export default function Settings() {
  const isDarkMode = useSubscriptionStore((state) => state.isDarkMode)
  const toggleDarkMode = useSubscriptionStore((state) => state.toggleDarkMode)
  const resetToSample = useSubscriptionStore((state) => state.resetToSample)

  const handleReset = () => {
    if (window.confirm('모든 데이터를 초기화하고 샘플 데이터로 복구하시겠습니까?')) {
      resetToSample()
      alert('초기화되었습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark dark:text-white">설정</h1>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-tertiary dark:border-slate-700 divide-y divide-tertiary dark:divide-slate-700">
        
        {/* Dark Mode Toggle */}
        <div className="p-4 flex justify-between items-center">
          <span className="text-dark dark:text-white font-medium">다크 모드</span>
          <button 
            onClick={toggleDarkMode}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors duration-300",
              isDarkMode ? "bg-primary" : "bg-tertiary"
            )}
          >
            <div 
              className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                isDarkMode ? "left-[calc(100%-1.25rem)]" : "left-1"
              )} 
            />
          </button>
        </div>

        {/* Data Reset */}
        <div 
          onClick={handleReset}
          className="p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer font-medium transition-colors"
        >
          데이터 초기화
        </div>
      </div>
    </div>
  )
}

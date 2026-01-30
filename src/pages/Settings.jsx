import useSubscriptionStore from '../store/useSubscriptionStore'
import { cn } from '../lib/utils'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const navigate = useNavigate()
  const resetSubscriptions = useSubscriptionStore((state) => state.resetSubscriptions)
  const isDarkMode = useSubscriptionStore((state) => state.isDarkMode)
  const toggleDarkMode = useSubscriptionStore((state) => state.toggleDarkMode)
  const resetTutorial = useSubscriptionStore((state) => state.resetTutorial)

  const handleReset = () => {
    if (window.confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없으며 모든 구독 정보가 삭제됩니다.')) {
      resetSubscriptions()
      alert('초기화가 완료되었습니다.')
    }
  }

  const handleRestartTutorial = () => {
    resetTutorial()
    navigate('/')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[800px] mx-auto p-0">
      <div className="flex flex-col gap-2">
        <h2 className="text-[32px] md:text-[42px] font-bold text-dark dark:text-white tracking-[-0.04em] leading-[1.2]">
          설정
        </h2>
        <p className="text-slate-500 dark:text-slate-400">앱의 환경설정 및 데이터를 관리합니다.</p>
      </div>

      {/* Unified Settings Card */}
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:border md:border-tertiary dark:md:border-slate-700 overflow-hidden transition-colors divide-y divide-tertiary dark:divide-slate-700">
        
        {/* 테마 설정 */}
        {/* 테마 설정 */}
        <div className="py-4 md:p-6 flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-dark dark:text-white">다크 모드</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">화면 테마를 변경합니다.</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={cn(
              "relative w-[64px] h-[32px] rounded-full transition-all duration-300 flex items-center px-1",
              isDarkMode ? "bg-primary" : "bg-gray-200"
            )}
          >
            <div className={cn(
              "w-6 h-6 bg-white rounded-full transition-all duration-300",
              isDarkMode ? "translate-x-8" : "translate-x-0"
            )} />
          </button>
        </div>

        {/* 튜토리얼 다시보기 */}
        {/* 테마 설정 */}
        <div className="py-4 md:p-6 flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-dark dark:text-white">튜토리얼 가이드</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">앱 사용법 안내를 다시 확인합니다.</p>
          </div>
          <button
            onClick={handleRestartTutorial}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl text-sm font-bold transition-all"
          >
            다시보기
          </button>
        </div>

        {/* 데이터 초기화 */}
        {/* 테마 설정 */}
        <div className="py-4 md:p-6 flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">데이터 초기화</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">모든 구독 정보를 삭제하고 초기화합니다.</p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-all"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  )
}
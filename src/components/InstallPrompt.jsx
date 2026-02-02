import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallPrompt() {
  const { isInstallable, promptInstall } = useInstallPrompt()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isInstallable) {
      // 3초 뒤에 배너 표시 (너무 바로 뜨면 거부감)
      const timer = setTimeout(() => setIsVisible(true), 3000)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isInstallable])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 z-40 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-dark/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-dark border border-white/10 dark:border-dark/10 rounded-2xl shadow-xl p-4 md:w-[360px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 dark:bg-dark/10 p-2 rounded-full shrink-0">
            <Download size={20} />
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-sm">앱 설치하기</p>
            <p className="text-xs opacity-80">홈 화면에 추가하여 더 빠르게 실행하세요.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={promptInstall}
            className="px-3 py-1.5 bg-white dark:bg-dark text-dark dark:text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
          >
            설치
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 dark:hover:bg-dark/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

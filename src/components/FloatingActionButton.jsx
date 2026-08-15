import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { cn } from '../lib/utils'

export default function FloatingActionButton() {
  const openModal = useSubscriptionStore((state) => state.openModal)
  const isTutorialOpen = useSubscriptionStore((state) => state.isTutorialOpen)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      // 튜토리얼 진행 중에는 항상 보이게 유지
      if (isTutorialOpen) {
        setIsVisible(true)
        return
      }

      const currentScrollY = window.scrollY
      
      // 스크롤이 맨 위 근처일 때는 항상 보여줌
      if (currentScrollY < 10) {
        setIsVisible(true)
      } 
      // 아래로 스크롤 중이면 숨김
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false)
      } 
      // 위로 스크롤 중이면 보여줌
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <button
      id="step-fab"
      onClick={() => openModal()}
      aria-label="구독 추가"
      className={cn(
        "md:hidden fixed bottom-[64px] right-3.5 z-[60] flex items-center justify-center size-[46px] bg-primary text-white rounded-full shadow-md shadow-primary/30 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 cursor-pointer",
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-[20%] opacity-0 pointer-events-none"
      )}
    >
      <Plus className="w-5 h-5 stroke-[2.5px]" />
    </button>
  )
}

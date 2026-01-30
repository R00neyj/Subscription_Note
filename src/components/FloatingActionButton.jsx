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
      className={cn(
        "md:hidden fixed bottom-[78px] right-4 z-[60] flex items-center justify-center gap-2 w-[104px] h-[56px] bg-gradient-to-r from-[#2C25EB] to-[#2563EB] text-white rounded-[16px] transition-all duration-500 cursor-pointer",
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-[20%] opacity-0 pointer-events-none"
      )}
    >
      <Plus className="w-6 h-6 shrink-0 stroke-[3px]" />
      <span className="font-bold text-[16px] leading-[24px] tracking-[0.15px]">
        추가
      </span>
    </button>
  )
}

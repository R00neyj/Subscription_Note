import React, { useEffect, useState } from 'react'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { cn } from '../lib/utils'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'

const TUTORIAL_STEPS = [
  {
    title: "반가워요! 👋",
    description: "구독노트에 오신 것을 환영합니다. 모든 구독 서비스를 한눈에 관리하는 방법을 알려드릴게요.",
    target: null, // Center
  },
  {
    title: "월간 리포트",
    description: "이번 달 총 지출액과 가장 많이 지출한 항목을 한눈에 확인할 수 있어요.",
    target: "#step-summary",
  },
  {
    title: "구독 목록",
    description: "현재 활성화된 구독 서비스들을 확인하고 정렬하거나 상세 내용을 볼 수 있습니다.",
    target: "#step-recent",
  },
  {
    title: "빠른 추가하기",
    description: "모바일에서는 하단 버튼으로, PC에서는 사이드바 버튼을 통해 새로운 구독을 빠르게 추가하세요.",
    target: window.innerWidth >= 768 ? "#step-add-pc" : "#step-fab",
  },
  {
    title: "다크모드 & 설정",
    description: "취향에 맞는 테마를 선택하거나 데이터를 관리할 수 있습니다.",
    target: window.innerWidth >= 768 ? "#step-dark-pc" : "#step-settings-mobile",
  }
]

export default function TutorialGuide() {
  const { isTutorialOpen, currentStep, setCurrentStep, completeTutorial } = useSubscriptionStore()
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    if (!isTutorialOpen) return

    const calculateCoords = () => {
      const step = TUTORIAL_STEPS[currentStep]
      if (step.target) {
        const element = document.querySelector(step.target)
        if (element) {
          const rect = element.getBoundingClientRect()
          const padding = 8 // Spotlight padding
          
          setCoords({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + (padding * 2),
            height: rect.height + (padding * 2),
          })
        } else {
          setCoords(null)
        }
      } else {
        setCoords(null)
      }
    }

    // 초기 계산
    calculateCoords()
    
    // 요소가 렌더링되고 레이아웃이 잡힐 시간을 줌
    const timer = setTimeout(calculateCoords, 100)

    // 스크롤 및 리사이즈 시 위치 재계산
    window.addEventListener('resize', calculateCoords)
    window.addEventListener('scroll', calculateCoords, true) // 캡처링 모드로 감지
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculateCoords)
      window.removeEventListener('scroll', calculateCoords, true)
    }
  }, [isTutorialOpen, currentStep])

  // 별도의 이펙트로 스크롤 처리
  useEffect(() => {
    if (!isTutorialOpen || currentStep === 0) return
    const step = TUTORIAL_STEPS[currentStep]
    if (step.target) {
      const element = document.querySelector(step.target)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [isTutorialOpen, currentStep])

  if (!isTutorialOpen) return null

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTutorial()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = TUTORIAL_STEPS[currentStep]

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* SVG Mask Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={completeTutorial}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {coords && (
              <rect 
                className="transition-all duration-500 ease-in-out"
                x={coords.left} 
                y={coords.top} 
                width={coords.width} 
                height={coords.height} 
                rx="24" 
                fill="black" 
              />
            )}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.7)" mask="url(#spotlight-mask)" />
      </svg>

      {/* Animated Highlight Frame */}
      {coords && (
        <div 
          className="absolute border-[2px] border-white/80 rounded-[24px] transition-all duration-500 ease-in-out pointer-events-none"
          style={{
            top: coords.top,
            left: coords.left,
            width: coords.width,
            height: coords.height,
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Subtle Pulse Effect */}
          <div className="absolute inset-[-4px] border border-white/20 rounded-[28px] animate-ping opacity-20" />
        </div>
      )}

      {/* Tooltip Content */}
      <div 
        className={cn(
          "absolute pointer-events-auto transition-all duration-500 w-[280px] md:w-[320px] bg-white dark:bg-slate-800 rounded-2xl border border-tertiary dark:border-slate-700 p-6",
          !coords 
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
            : (coords.top > window.innerHeight / 2 
                ? "bottom-[calc(100vh-" + (coords.top - 20) + "px)] left-1/2 -translate-x-1/2 md:left-[calc(" + (coords.left + coords.width/2) + "px)] md:-translate-x-1/2"
                : "top-[calc(" + (coords.top + coords.height + 20) + "px)] left-1/2 -translate-x-1/2 md:left-[calc(" + (coords.left + coords.width/2) + "px)] md:-translate-x-1/2")
        )}
      >
        <button 
          onClick={completeTutorial}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={20} />
        </button>

        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-full">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white pt-2">
              {step.title}
            </h3>
          </div>
          
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
            {step.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors",
                currentStep === 0 ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" : "text-slate-600 dark:text-slate-400 hover:text-primary"
              )}
            >
              <ChevronLeft size={16} /> 이전
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-primary/20"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? (
                <>시작하기 <Check size={16} /></>
              ) : (
                <>다음 <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

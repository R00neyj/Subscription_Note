import React, { useEffect, useRef, useState } from 'react'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { cn } from '../lib/utils'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'

const TUTORIAL_STEPS = [
  {
    title: "만나서 반가워요! 👋",
    description: "구독노트에 오신 것을 환영합니다. 모든 구독 서비스를 스마트하게 관리하는 팁을 가볍게 짚어드릴게요.",
    target: null, // Center
  },
  {
    title: "월간 구독 리포트",
    description: "이번 달 총 지출액과 가장 많은 비용을 차지하는 항목을 한눈에 파악해 보세요.",
    target: "#step-summary",
  },
  {
    title: "카테고리 분석",
    description: "지출 비중을 차트로 확인하고, 원하는 카테고리만 따로 모아 분석할 수 있답니다.",
    target: "#step-chart",
  },
  {
    title: "최근 등록한 구독",
    description: "방금 추가한 구독을 바로 확인하고, '전체 보기'로 구독 탭에 들어가 상세히 관리하세요.",
    target: "#step-recent",
  },
  {
    title: "빠른 추가하기",
    description: "새로운 구독 서비스를 발견하셨나요? 언제 어디서든 버튼 하나로 빠르게 추가할 수 있어요.",
    target: window.innerWidth >= 768 ? "#step-add-pc" : "#step-fab",
  },
  {
    title: "구독 다이어트",
    description: "'다이어트' 탭에서 새로 들일 구독과 덜어낼 구독을 함께 저울질하며 월 지출을 시뮬레이션해 보세요.",
    target: "#step-nav-bottom",
  },
  {
    title: "테마와 설정",
    description: "화면 오른쪽 위에서 다크모드를 켜고 끄거나, 설정으로 이동해 알림과 계정을 관리할 수 있어요.",
    target: "#step-theme-toggle",
  }
]

export default function TutorialGuide() {
  const { isTutorialOpen, currentStep, setCurrentStep, completeTutorial } = useSubscriptionStore()
  const [coords, setCoords] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, placement: 'bottom' })
  const tooltipRef = useRef(null)

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

          // Tooltip Positioning Logic (데스크톱)
          //
          // 툴팁 높이를 200 으로 어림잡던 이전 로직은 타깃이 화면 전체 높이를 차지할 때
          // 무너졌다. #step-nav-bottom 은 모바일에선 하단 탭바지만 데스크톱에선
          // md:h-screen 좌측 사이드바여서 rect.top 이 0 인데도 "하단 요소"로 판정돼
          // 툴팁이 화면 위로 완전히 빠져나갔다.
          //
          // 그래서 실제로 렌더된 툴팁 크기를 재고, 위/아래에 자리가 없으면 옆에 붙인 뒤
          // 마지막에 뷰포트 안으로 clamp 한다.
          const gap = padding + 12
          const margin = 16
          const tip = tooltipRef.current
          const tipW = tip?.offsetWidth || 320
          const tipH = tip?.offsetHeight || 200

          const spaceBelow = window.innerHeight - rect.bottom - gap - margin
          const spaceAbove = rect.top - gap - margin

          let top
          let left = rect.left + (rect.width / 2) - (tipW / 2)
          let placement

          if (spaceBelow >= tipH) {
            placement = 'bottom'
            top = rect.bottom + gap
          } else if (spaceAbove >= tipH) {
            placement = 'top'
            top = rect.top - gap - tipH
          } else {
            // 위아래 모두 부족한 세로로 긴 타깃(사이드바 등) — 옆에 세로 중앙 정렬로 붙인다
            placement = 'side'
            const fitsRight = window.innerWidth - rect.right - gap - margin >= tipW
            left = fitsRight ? rect.right + gap : rect.left - gap - tipW
            top = rect.top + (rect.height / 2) - (tipH / 2)
          }

          const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))

          setTooltipPos({
            top: clamp(top, margin, window.innerHeight - tipH - margin),
            left: clamp(left, margin, window.innerWidth - tipW - margin),
            placement
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
        ref={tooltipRef}
        className={cn(
          "absolute pointer-events-auto transition-all duration-500 ease-in-out md:w-[320px] bg-white dark:bg-slate-800 rounded-2xl border border-tertiary dark:border-slate-700 p-6 shadow-xl",
          window.innerWidth < 768 ? "left-4 right-4" : (!coords && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2")
        )}
        style={window.innerWidth < 768 ? {
          // Mobile Smooth Transition Logic
          top: !coords 
            ? '50%' // Step 1: Center
            : (currentStep === 4 || currentStep === 5 ? '0%' : '100%'),
          transform: !coords
            ? 'translateY(-50%)'
            : (currentStep === 4 || currentStep === 5 
                ? 'translateY(32px)' 
                : 'translateY(-100%) translateY(-32px)')
        } : (coords ? {
          // tooltipPos 가 이미 뷰포트 안으로 clamp 된 좌상단 좌표라 transform 보정이 없다.
          top: tooltipPos.top,
          left: tooltipPos.left
        } : {})}
      >
        <button 
          onClick={completeTutorial}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="space-y-4 animate-fade-slide-in" key={currentStep}>
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
                currentStep === 0 ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" : "text-slate-600 dark:text-slate-400 hover:text-primary cursor-pointer"
              )}
            >
              <ChevronLeft size={16} /> 이전
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-primary/20 cursor-pointer"
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

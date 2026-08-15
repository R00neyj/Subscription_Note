import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Sun, 
  Moon, 
  Check, 
  ChevronDown,
  Layers,
  BarChart2,
  Lock,
  Flame,
  CreditCard,
  BellRing
} from 'lucide-react'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { useEffectiveTheme } from '../hooks/useEffectiveTheme'
import AntigravityCanvas from '../components/AntigravityCanvas'
import GoogleIcon from '../components/GoogleIcon'

gsap.registerPlugin(ScrollTrigger)

export default function Landing() {
  const navigate = useNavigate()
  const user = useSubscriptionStore((state) => state.user)
  const setGuestAccess = useSubscriptionStore((state) => state.setGuestAccess)
  const signInWithGoogle = useSubscriptionStore((state) => state.signInWithGoogle)
  const themeMode = useSubscriptionStore((state) => state.themeMode)
  const setThemeMode = useSubscriptionStore((state) => state.setThemeMode)
  const isDark = useEffectiveTheme()

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [dietToggle, setDietToggle] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  // DOM Refs for GSAP
  const containerRef = useRef(null)
  const heroRef = useRef(null)
  const scrollySectionRef = useRef(null)
  const mockupWrapperRef = useRef(null)
  const mockupCardRef = useRef(null)

  // Floating chips in Hero
  const chip1Ref = useRef(null)
  const chip2Ref = useRef(null)
  const chip3Ref = useRef(null)

  // Screens in Mockup
  const screen0Ref = useRef(null)
  const screen1Ref = useRef(null)
  const screen2Ref = useRef(null)
  const screen3Ref = useRef(null)

  // Mouse Parallax on Hero Mockup
  const handleMouseMove = (e) => {
    if (!mockupCardRef.current) return
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    const xPos = (clientX / innerWidth - 0.5) * 18
    const yPos = (clientY / innerHeight - 0.5) * -18

    gsap.to(mockupCardRef.current, {
      rotateY: xPos,
      rotateX: yPos,
      duration: 0.8,
      ease: "power2.out",
      transformPerspective: 1000,
      transformOrigin: "center center"
    })
  }

  const handleMouseLeave = () => {
    if (!mockupCardRef.current) return
    gsap.to(mockupCardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.4)"
    })
  }

  // 1. Master Scrollytelling & Hero Initial Animations
  useGSAP(() => {
    // Hero Intro Elastic Animation
    const heroTl = gsap.timeline({ defaults: { ease: "back.out(1.8)", duration: 1 } })
    heroTl
      .from(".hero-badge", { opacity: 0, y: -30, scale: 0.8 })
      .from(".hero-split-word", {
        y: "120%",
        rotateX: 50,
        scale: 0.85,
        opacity: 0,
        stagger: 0.065,
        duration: 1.05,
        ease: "back.out(2.4)",
        transformOrigin: "bottom center"
      }, "-=0.6")
      .from(".hero-desc", { opacity: 0, y: 30, duration: 0.9, ease: "power2.out" }, "-=0.5")
      .from(".hero-cta-btn", { opacity: 0, scale: 0.85, stagger: 0.15, ease: "elastic.out(1.1, 0.5)" }, "-=0.6")
      .from(".hero-feature-tags", { opacity: 0, y: 20, stagger: 0.1, duration: 0.6 }, "-=0.5")

    // Floating Hero Badges (Jelly floating)
    gsap.to(chip1Ref.current, {
      y: -14,
      rotation: -3,
      repeat: -1,
      yoyo: true,
      duration: 2.8,
      ease: "sine.inOut"
    })
    gsap.to(chip2Ref.current, {
      y: 16,
      rotation: 4,
      repeat: -1,
      yoyo: true,
      duration: 3.2,
      delay: 0.4,
      ease: "sine.inOut"
    })
    gsap.to(chip3Ref.current, {
      y: -18,
      rotation: 2,
      repeat: -1,
      yoyo: true,
      duration: 2.5,
      delay: 0.8,
      ease: "sine.inOut"
    })

    // Subtle Scroll Guide Bounce (50% reduced bounce amplitude)
    gsap.to(".scroll-guide-indicator", {
      y: 6,
      repeat: -1,
      yoyo: true,
      duration: 1.1,
      ease: "sine.inOut"
    })

    // Scrollytelling Pinned Master Timeline
    gsap.set([screen1Ref.current, screen2Ref.current, screen3Ref.current], { 
      opacity: 0, 
      scale: 0.92, 
      y: 30, 
      pointerEvents: "none",
      display: "none"
    })
    gsap.set(screen0Ref.current, { opacity: 1, scale: 1, y: 0, display: "block" })

    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollySectionRef.current,
        start: "top top",
        end: "+=3200",
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress
          if (p < 0.25) setActiveStep(0)
          else if (p < 0.52) setActiveStep(1)
          else if (p < 0.78) setActiveStep(2)
          else setActiveStep(3)
        }
      }
    })

    // Sub animations inside Step 0
    masterTl
      .from(".mockup-sub-item", {
        scale: 0.8,
        y: 25,
        opacity: 0,
        stagger: 0.15,
        ease: "back.out(2)"
      })
      .to(mockupCardRef.current, {
        scale: 1.02,
        duration: 0.5,
        ease: "power1.inOut"
      })

    // Step 0 -> Step 1
    masterTl
      .to(screen0Ref.current, { opacity: 0, scale: 0.9, y: -20, duration: 0.4, display: "none" })
      .set(screen1Ref.current, { display: "block" })
      .to(screen1Ref.current, { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        pointerEvents: "auto", 
        duration: 0.6, 
        ease: "elastic.out(1, 0.6)" 
      })
      .from(".cal-alert-badge", { scale: 0.5, opacity: 0, duration: 0.4, ease: "back.out(2.5)" }, "-=0.3")
      .from(".cal-grid-item", { scale: 0.85, opacity: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, "-=0.2")

    // Step 1 -> Step 2
    masterTl
      .to(screen1Ref.current, { opacity: 0, scale: 0.9, y: -20, duration: 0.4, display: "none" })
      .set(screen2Ref.current, { display: "block" })
      .to(screen2Ref.current, { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        pointerEvents: "auto", 
        duration: 0.6, 
        ease: "elastic.out(1, 0.6)" 
      })
      .from(".diet-badge-glow", { scale: 0.7, opacity: 0, duration: 0.4, ease: "back.out(2)" }, "-=0.3")
      .from(".diet-row-item", { x: 30, opacity: 0, stagger: 0.12, duration: 0.4, ease: "power2.out" }, "-=0.2")

    // Step 2 -> Step 3
    masterTl
      .to(screen2Ref.current, { opacity: 0, scale: 0.9, y: -20, duration: 0.4, display: "none" })
      .set(screen3Ref.current, { display: "block" })
      .to(screen3Ref.current, { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        pointerEvents: "auto", 
        duration: 0.6, 
        ease: "elastic.out(1, 0.6)" 
      })
      .from(".security-badge-icon", { rotation: -30, scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2.5)" }, "-=0.3")
      .from(".security-grid-card", { y: 20, opacity: 0, stagger: 0.15, duration: 0.4, ease: "power2.out" }, "-=0.2")

    // Feature Grid
    gsap.from(".feature-box", {
      scrollTrigger: {
        trigger: ".feature-grid-container",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 45,
      opacity: 0,
      scale: 0.92,
      stagger: 0.12,
      duration: 0.8,
      ease: "back.out(1.6)"
    })

    // Final CTA Elastic Entry
    gsap.from(".final-cta-card", {
      scrollTrigger: {
        trigger: ".final-cta-card",
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      y: 50,
      scale: 0.9,
      opacity: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)"
    })

  }, { scope: containerRef })

  // 3. Left Text Elastic Stagger Animation on Step Change
  useGSAP(() => {
    gsap.fromTo(".step-anim-item", 
      { 
        y: 40, 
        opacity: 0, 
        scale: 0.92,
        rotateX: -15
      },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1, 
        rotateX: 0,
        stagger: 0.09, 
        duration: 0.75, 
        ease: "back.out(2.2)" 
      }
    )
  }, { dependencies: [activeStep], scope: containerRef })

  const handleStartGuest = () => {
    setGuestAccess(true)
    navigate('/')
  }

  const handleGoogleLogin = async () => {
    await signInWithGoogle()
  }

  const toggleTheme = () => {
    if (themeMode === 'dark') setThemeMode('light')
    else if (themeMode === 'light') setThemeMode('dark')
    else setThemeMode(isDark ? 'light' : 'dark')
  }

  const stepsData = [
    {
      stepNumber: "01",
      badge: "중복 결제 방지",
      title: <>흩어진 고정비를<br />한 화면에</>,
      description: "OTT, 업무 도구, 멤버십까지 여러 카드와 계좌로 분산된 지출을 직관적인 카테고리 카드로 통합 정리합니다.",
      highlight: "총 5개 서비스 · 월 68,790원 파악",
      icon: Layers,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50"
    },
    {
      stepNumber: "02",
      badge: "예측 가능한 일정",
      title: <>결제일마다<br />가슴 철렁할 일 없도록</>,
      description: "이번 주 다가오는 결제 D-Day 알림과 월간 지출 타임라인으로 예산 초과를 사전에 완벽히 방어합니다.",
      highlight: "이번 주 2건(₩31,900) 결제 예정 브리핑",
      icon: Calendar,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50"
    },
    {
      stepNumber: "03",
      badge: "지능형 지출 다이어트",
      title: <>안 쓰는 구독은<br />즉시 찾아 슬림하게</>,
      description: "클릭 한 번으로 비활성화 토글을 켜고 꺼보세요. 아낀 금액이 실시간으로 누적되어 새로운 위시리스트가 됩니다.",
      highlight: "방치된 구독 1개 정리 시 연 204,000원 절약",
      icon: Flame,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50"
    },
    {
      stepNumber: "04",
      badge: "멀티 디바이스 & 보안",
      title: <>어디서나 안전한<br />클라우드 동기화</>,
      description: "Google OAuth와 RLS 데이터 격리 기술로 철저히 보호되며, PWA를 통해 스마트폰에서도 앱처럼 바로 실행됩니다.",
      highlight: "100% 개인 데이터 암호화 격리 & PWA 지원",
      icon: ShieldCheck,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50"
    }
  ]

  // Jelly button toggle animation
  const handleDietToggleClick = () => {
    setDietToggle(!dietToggle)
    gsap.fromTo(".diet-toggle-btn", 
      { scaleX: 1.25, scaleY: 0.75 }, 
      { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1.2, 0.4)" }
    )
  }

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 transition-colors duration-300 overflow-x-hidden"
    >
      
      {/* 1. Global Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0B1120]/80 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/favicon-96x96.png" 
              alt="구독노트 로고" 
              className="size-10 rounded-2xl shadow-sm object-cover" 
            />
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              구독노트
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <button
              onClick={toggleTheme}
              aria-label="테마 변경"
              className="size-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {!user && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:inline-flex px-4 py-2.5 text-base font-bold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer"
              >
                로그인
              </button>
            )}

            <button
              onClick={handleStartGuest}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-bold shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              {user ? '대시보드로 이동' : '대시보드 시작'}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Floating 3D Chips */}
      <section 
        ref={heroRef} 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative pt-36 pb-20 md:pt-48 md:pb-32 px-4 md:px-8 overflow-hidden max-w-[1360px] mx-auto"
      >
        {/* Floating Ambient Badges */}
        <div 
          ref={chip1Ref}
          className="hidden md:flex absolute top-28 left-6 lg:left-10 z-20 items-center gap-3.5 p-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-xl pointer-events-none"
        >
          <div className="size-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-black text-sm">N</div>
          <div>
            <span className="block text-sm font-black">Netflix 4K</span>
            <span className="text-xs text-slate-400 font-bold">₩17,000 · 매달 14일</span>
          </div>
        </div>

        <div 
          ref={chip2Ref}
          className="hidden md:flex absolute top-32 right-6 lg:right-10 z-20 items-center gap-3.5 p-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-xl pointer-events-none"
        >
          <div className="size-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">G</div>
          <div>
            <span className="block text-sm font-black">ChatGPT Plus</span>
            <span className="text-xs text-emerald-500 font-bold">생산성 극대화</span>
          </div>
        </div>

        <div 
          ref={chip3Ref}
          className="hidden lg:flex absolute bottom-24 right-20 z-20 items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-xl pointer-events-none"
        >
          <div className="size-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm">
            <Flame size={16} />
          </div>
          <span className="text-sm font-black text-amber-500">연 ₩204,000 절약 가능</span>
        </div>

        <div className="text-center max-w-[960px] mx-auto space-y-6 md:space-y-7 relative z-10">
          <div className="hero-badge inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm md:text-base mb-1">
            <Sparkles size={18} />
            <span>매달 새어나가는 고정비 지출 통제 솔루션</span>
          </div>

          <h1 
            className="hero-title text-[38px] sm:text-[56px] md:text-[76px] font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white"
            style={{ perspective: "1000px" }}
          >
            {/* Line 1: 혹시 오늘도 보지 않는 구독에 */}
            <span className="block overflow-hidden py-1">
              {["혹시", "오늘도", "보지", "않는", "구독에"].map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-2 md:mr-3.5 align-top">
                  <span className="hero-split-word inline-block">
                    {word}
                  </span>
                </span>
              ))}
            </span>

            {/* Line 2: 소중한 하루치를 지불하셨나요? */}
            <span className="block overflow-hidden py-1">
              <span className="inline-block overflow-hidden mr-2 md:mr-3.5 align-top">
                <span className="hero-split-word inline-block bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  소중한
                </span>
              </span>
              <span className="inline-block overflow-hidden mr-2 md:mr-3.5 align-top">
                <span className="hero-split-word inline-block bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  하루치를
                </span>
              </span>
              <span className="inline-block overflow-hidden align-top">
                <span className="hero-split-word inline-block">
                  지불하셨나요?
                </span>
              </span>
            </span>
          </h1>

          <p className="hero-desc text-[19px] sm:text-[22px] md:text-[24px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-[760px] mx-auto">
            흩어진 결제 일정부터 D-Day 결제 브리핑, 스마트 다이어트까지.<br className="hidden sm:block" />
            구독노트로 불필요한 누수를 막고 원하는 목표를 달성하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <button
                onClick={() => navigate('/')}
                className="hero-cta-btn w-full sm:w-auto h-15 px-9 rounded-2xl bg-primary hover:bg-primary/90 text-white font-extrabold text-[18px] shadow-xl shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
              >
                내 대시보드로 이동
                <ArrowRight size={20} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hero-cta-btn w-full sm:w-auto h-15 px-9 rounded-2xl bg-primary hover:bg-primary/90 text-white font-extrabold text-[18px] shadow-xl shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                >
                  무료로 시작하기
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={handleStartGuest}
                  className="hero-cta-btn w-full sm:w-auto h-15 px-9 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[18px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                >
                  로그인 없이 바로 체험
                </button>
              </>
            )}
          </div>

          {/* Feature Tags */}
          <div className="hero-feature-tags pt-8 flex flex-wrap items-center justify-center gap-8 text-sm md:text-base text-slate-500 dark:text-slate-400 font-bold">
            <div className="flex items-center gap-2">
              <Check className="text-emerald-500 stroke-[3]" size={18} />
              <span>간편 Google 로그인 연동</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-emerald-500 stroke-[3]" size={18} />
              <span>PWA 스마트폰 앱 설치</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-emerald-500 stroke-[3]" size={18} />
              <span>다크모드 & 실시간 계산</span>
            </div>
          </div>
        </div>

        {/* Scroll Guide Indicator */}
        <div className="mt-16 text-center">
          <div className="scroll-guide-indicator inline-flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-bold">
            <span>스크롤하여 핵심 기능을 둘러보세요</span>
            <ChevronDown size={20} />
          </div>
        </div>
      </section>

      {/* 3. GSAP Scrollytelling Pinned Showcase Track */}
      <section 
        ref={scrollySectionRef} 
        className="relative w-full h-screen border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#070D19]/80 overflow-hidden"
      >
        <div className="h-full max-w-[1360px] w-full mx-auto px-4 md:px-8 flex items-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-14 items-center">
            
            {/* Left Column: Dynamic Step Text with GSAP Elastic Stagger */}
            <div className="lg:col-span-5 space-y-7 z-20" style={{ perspective: "800px" }}>
              <div className="flex items-center gap-3">
                <span className="text-xs md:text-sm font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                  Feature Showcase
                </span>
                <span className="text-sm font-bold text-slate-400">
                  {activeStep + 1} / {stepsData.length}
                </span>
              </div>

              {/* Step Text Container with Dynamic Key for Elastic Stagger */}
              <div className="min-h-[260px] flex flex-col justify-center">
                <div key={activeStep} className="space-y-5">
                  <div className={`step-anim-item inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl text-sm md:text-base font-extrabold border ${stepsData[activeStep].color}`}>
                    <span className="font-black text-base md:text-lg">{stepsData[activeStep].stepNumber}</span>
                    <span>{stepsData[activeStep].badge}</span>
                  </div>

                  <h2 className="step-anim-item text-[32px] sm:text-[42px] md:text-[48px] font-black leading-[1.16] tracking-tight text-slate-900 dark:text-white">
                    {stepsData[activeStep].title}
                  </h2>

                  <p className="step-anim-item text-[17px] sm:text-[20px] md:text-[22px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {stepsData[activeStep].description}
                  </p>

                  <div className="step-anim-item p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-sm sm:text-base md:text-[17px] font-bold text-primary flex items-center gap-3 shadow-sm">
                    <Zap size={20} className="text-amber-500 fill-amber-500 shrink-0" />
                    <span>{stepsData[activeStep].highlight}</span>
                  </div>
                </div>
              </div>

              {/* Progress dots bar */}
              <div className="flex items-center gap-2.5 pt-2">
                {stepsData.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      activeStep === idx 
                        ? 'w-12 bg-primary' 
                        : 'w-3 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: 3D Interactive Device Frame Mockup */}
            <div ref={mockupWrapperRef} className="lg:col-span-7 flex justify-center items-center">
              <div 
                ref={mockupCardRef}
                className="w-full max-w-[650px] aspect-[4/3] sm:aspect-[16/11] bg-white dark:bg-[#0F172A] rounded-[32px] md:rounded-[40px] p-5 md:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col justify-between relative overflow-hidden transition-shadow"
                style={{ transformStyle: "preserve-3d" }}
              >
                
                {/* Mockup Top Window Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="size-3.5 rounded-full bg-rose-400 inline-block" />
                    <span className="size-3.5 rounded-full bg-amber-400 inline-block" />
                    <span className="size-3.5 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-2">
                      Sub-list Dashboard
                    </span>
                  </div>
                  <div className="text-xs font-bold px-3 py-1 rounded-lg bg-primary/10 text-primary">
                    Live Preview
                  </div>
                </div>

                {/* Mockup Dynamic Screen Content */}
                <div className="relative flex-1 py-4 flex flex-col justify-center">
                  
                  {/* SCREEN 0: Aggregation & Summary */}
                  <div ref={screen0Ref} className="space-y-3.5 w-full">
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                      <div>
                        <span className="block text-xs text-slate-400 font-bold">월 총 지출액</span>
                        <span className="text-base sm:text-lg font-black text-primary">₩68,790</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-400 font-bold">구독 서비스</span>
                        <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">5개</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-400 font-bold">최대 지출 항목</span>
                        <span className="text-base sm:text-lg font-black text-rose-500">Netflix</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { name: "Netflix 프리미엄", cat: "OTT", price: "₩17,000", color: "bg-red-500", date: "매달 14일" },
                        { name: "YouTube Premium", cat: "스트리밍", price: "₩14,900", color: "bg-red-600", date: "매달 18일" },
                        { name: "ChatGPT Plus", cat: "생산성", price: "₩29,000", color: "bg-emerald-600", date: "매달 22일" },
                        { name: "쿠팡 와우 멤버십", cat: "쇼핑", price: "₩7,890", color: "bg-blue-500", date: "매달 03일" }
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="mockup-sub-item p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`size-8 rounded-lg ${item.color} text-white font-bold text-sm flex items-center justify-center`}>
                              {item.name[0]}
                            </div>
                            <div>
                              <span className="block text-sm font-extrabold text-slate-800 dark:text-slate-200">{item.name}</span>
                              <span className="text-xs text-slate-400 font-medium">{item.date} · {item.cat}</span>
                            </div>
                          </div>
                          <span className="text-sm font-black text-slate-900 dark:text-white">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SCREEN 1: Intelligent Calendar */}
                  <div ref={screen1Ref} className="space-y-3.5 w-full">
                    <div className="cal-alert-badge p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                          <BellRing size={18} />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-emerald-950 dark:text-emerald-300">이번 주 결제 브리핑</span>
                          <span className="text-xs text-emerald-800 dark:text-emerald-400/80">3일 이내 2건(₩31,900) 결제 예정</span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-emerald-500 text-white">D-3 Alert</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span>2026년 8월 결제 일정 타임라인</span>
                        <span className="text-xs text-primary font-extrabold">월별 보기</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
                        <div className="cal-grid-item p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="block text-xs text-slate-400 font-bold">8월 14일</span>
                          <span className="text-xs font-extrabold text-rose-500">오늘 (D-Day)</span>
                          <span className="block text-xs text-slate-500 mt-0.5">Netflix</span>
                        </div>
                        <div className="cal-grid-item p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700">
                          <span className="block text-xs text-emerald-600 font-bold">8월 18일</span>
                          <span className="text-xs font-extrabold text-emerald-600">D-4</span>
                          <span className="block text-xs text-slate-500 mt-0.5">YouTube</span>
                        </div>
                        <div className="cal-grid-item p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="block text-xs text-slate-400 font-bold">8월 22일</span>
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">D-8</span>
                          <span className="block text-xs text-slate-500 mt-0.5">ChatGPT</span>
                        </div>
                        <div className="cal-grid-item p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="block text-xs text-slate-400 font-bold">9월 03일</span>
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">D-20</span>
                          <span className="block text-xs text-slate-500 mt-0.5">Coupang</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SCREEN 2: Diet Simulator */}
                  <div ref={screen2Ref} className="space-y-3.5 w-full">
                    <div className="diet-badge-glow p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-amber-900 dark:text-amber-300">구독 다이어트 절약 시뮬레이터</span>
                        <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                          {dietToggle ? "현재 월 ₩17,000 절약 중! (연간 ₩204,000)" : "비활성화 토글을 클릭하여 지출을 줄여보세요"}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-amber-500 text-white">Smart</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="diet-row-item p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-red-500 text-white font-bold text-sm flex items-center justify-center">N</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${dietToggle ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>Netflix 프리미엄</span>
                              {dietToggle && <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">정지됨</span>}
                            </div>
                            <span className="text-xs text-slate-400">월 ₩17,000 · 최근 14일간 미사용</span>
                          </div>
                        </div>
                        <button
                          onClick={handleDietToggleClick}
                          className={`diet-toggle-btn px-4 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                            dietToggle 
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' 
                              : 'bg-primary text-white shadow-sm'
                          }`}
                        >
                          {dietToggle ? "구독 재개" : "구독 중지"}
                        </button>
                      </div>

                      <div className="diet-row-item p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between opacity-80">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">G</div>
                          <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">ChatGPT Plus</span>
                            <span className="block text-xs text-slate-400">월 ₩29,000 · 매일 활발히 사용</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-500">유지 권장</span>
                      </div>
                    </div>
                  </div>

                  {/* SCREEN 3: Cloud & PWA */}
                  <div ref={screen3Ref} className="space-y-3.5 w-full">
                    <div className="p-4.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-2">
                      <div className="security-badge-icon size-11 rounded-2xl bg-indigo-500 text-white flex items-center justify-center mx-auto shadow-sm">
                        <ShieldCheck size={24} />
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-indigo-950 dark:text-indigo-200">
                        Supabase Cloud & Google OAuth 완벽 연동
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Row Level Security(RLS)로 본인 외에는 누구도 데이터를 열람할 수 없습니다.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="security-grid-card p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                        <Smartphone size={22} className="mx-auto text-primary mb-1.5" />
                        <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">PWA 모바일 앱</span>
                        <span className="text-xs text-slate-400">홈 화면 1초 설치</span>
                      </div>
                      <div className="security-grid-card p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                        <Lock size={22} className="mx-auto text-emerald-500 mb-1.5" />
                        <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">로컬 / 클라우드</span>
                        <span className="text-xs text-slate-400">오프라인에서도 작동</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Mockup Bottom Indicator */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>스마트 지출 통제 엔진</span>
                  <span className="font-bold text-primary">실시간 데이터 연동</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Feature Breakdown Grid */}
      <section className="feature-grid-container py-24 md:py-32 px-4 md:px-8 max-w-[1360px] mx-auto">
        <div className="text-center max-w-[760px] mx-auto mb-16 space-y-3.5 md:space-y-4">
          <div>
            <span className="inline-block text-xs md:text-sm font-extrabold text-primary tracking-wider uppercase px-4 py-1.5 rounded-full bg-primary/10 mb-1.5">
              Why Sub-list Dashboard?
            </span>
          </div>
          <h2 className="text-[32px] sm:text-[44px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.2]">
            불필요한 기능은 덜어내고,<br />오직 구독 관리에만 집중했습니다.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-[17px] sm:text-[19px]">
            가볍고 빠르며 직관적인 인터페이스로 시작해 보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: BarChart2,
              title: "지출 카테고리 통계",
              desc: "OTT, 생활, 생산성 등 카테고리별 지출 비중을 바 차트와 비율로 한눈에 파악합니다.",
              color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40"
            },
            {
              icon: Calendar,
              title: "월간 결제 달력",
              desc: "날짜별 결제 일정과 주간 요약 브리핑으로 다음 결제액을 미리 대비할 수 있습니다.",
              color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
            },
            {
              icon: CreditCard,
              title: "결제 수단별 필터",
              desc: "신용카드, 계좌이체 등 결제 수단별로 지출을 분리하여 카드 혜택을 극대화합니다.",
              color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
            },
            {
              icon: Smartphone,
              title: "네이티브 PWA 지원",
              desc: "모바일 웹 브라우저뿐만 아니라 스마트폰 홈 화면에 추가하여 앱처럼 구동됩니다.",
              color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
            }
          ].map((card, i) => (
            <div
              key={i}
              className="feature-box p-7 rounded-[30px] bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 space-y-4 hover:border-primary/40 transition-colors shadow-sm"
            >
              <div className={`size-13 rounded-2xl flex items-center justify-center ${card.color}`}>
                <card.icon size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{card.title}</h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Final Call To Action with 3D Antigravity Particle Canvas */}
      <section className="py-20 px-4 md:px-8 max-w-[1360px] mx-auto">
        <div 
          className="final-cta-card relative rounded-[40px] md:rounded-[52px] bg-[#070D19] text-white p-8 sm:p-14 md:p-22 text-center space-y-8 overflow-hidden shadow-2xl border border-blue-500/30"
        >
          {/* Antigravity 3D Matrix Grid Canvas */}
          <AntigravityCanvas intensity={1.15} className="opacity-95" />

          {/* Subtle Ambient Vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-[#070D19]/30 to-[#070D19]/90 pointer-events-none" />

          <div className="relative z-10 max-w-[800px] mx-auto space-y-4 md:space-y-5">
            <div>
              <span className="inline-block text-xs sm:text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 mb-1.5">
                Get Started in Seconds
              </span>
            </div>
            <h2 className="text-[32px] sm:text-[46px] md:text-[58px] font-black leading-tight tracking-tight">
              지금 바로, 당신의 지갑을 위한<br />스마트한 구독 관리를 시작하세요.
            </h2>
            <p className="text-white/85 font-medium text-lg sm:text-xl">
              가입 절차 없이 즉시 대시보드를 둘러보거나, Google 계정으로 모든 기기에서 동기화하세요.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {user ? (
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto h-15 px-9 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-extrabold text-[18px] shadow-lg shadow-black/20 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
              >
                내 대시보드로 이동
                <ArrowRight size={20} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto h-15 px-9 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-extrabold text-[18px] shadow-lg shadow-black/20 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <GoogleIcon size={22} />
                  Google 계정으로 시작
                </button>
                <button
                  onClick={handleStartGuest}
                  className="w-full sm:w-auto h-15 px-9 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-[18px] transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
                >
                  게스트로 바로 시작
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-sm text-slate-400 font-medium">
        <p>© 2026 Sub-list Dashboard. All rights reserved. Made for smarter subscriptions.</p>
      </footer>

      {/* 7. Auth Choice Modal Overlay */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-[460px] bg-white dark:bg-slate-900 rounded-[34px] p-7 sm:p-9 border border-slate-200 dark:border-slate-800 shadow-2xl relative animate-fade-slide-in">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
            >
              닫기
            </button>

            <div className="size-15 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Sparkles size={30} />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
              구독노트 시작하기
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-7">
              로그인하면 스마트폰, 태블릿, PC 어디서나 구독 내역이 실시간으로 안전하게 동기화됩니다.
            </p>

            <div className="space-y-3.5">
              <button
                onClick={handleGoogleLogin}
                className="w-full h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-extrabold text-base flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <GoogleIcon size={22} />
                Google 계정으로 계속하기
              </button>

              <button
                onClick={handleStartGuest}
                className="w-full h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-base hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98] cursor-pointer"
              >
                로그인 없이 체험하기
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400 font-medium">
              언제든지 설정 페이지에서 Google 계정을 연동할 수 있습니다.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

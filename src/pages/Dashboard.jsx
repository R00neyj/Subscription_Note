import { useState, useMemo, useEffect } from 'react'
import Header from '../components/Header'
import SectionHeader from '../components/SectionHeader'
import SubsectionHeader from '../components/SubsectionHeader'
import CategoryDistributionChart from '../components/CategoryDistributionChart'
import PaymentBriefing from '../components/PaymentBriefing'
import { ChevronRight, AlertTriangle, TrendingDown, Info, Star, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { cn, createBackdropClose } from '../lib/utils'
import useSubscriptionStore from '../store/useSubscriptionStore'
import NotificationBanner from '../components/NotificationBanner'
import { CATEGORY_COLORS, TEXT_COLORS, CATEGORIES } from '../constants/categories'
import { buildWorkCost, getWagePreset, WAGE_PRESETS } from '../constants/laborCost'
import { detectSubDomain } from '../constants/serviceSubDomains'
import ServiceIcon from '../components/ServiceIcon'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import EmptyState from '../components/EmptyState'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
}

const cardHover = {
  hover: { 
    y: -5,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
  tap: { scale: 0.98 }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeInsight, setActiveInsight] = useState(null) // 모달 제어용
  
  // Store Data
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const isTutorialOpen = useSubscriptionStore((state) => state.isTutorialOpen)
  const setTutorialOpen = useSubscriptionStore((state) => state.setTutorialOpen)
  const hasSeenTutorial = useSubscriptionStore((state) => state.hasSeenTutorial)
  const openModal = useSubscriptionStore((state) => state.openModal)
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription)
  const ignoredDuplicates = useSubscriptionStore((state) => state.ignoredDuplicates || [])
  const hourlyWage = useSubscriptionStore((state) => state.hourlyWage)
  const wagePresetId = useSubscriptionStore((state) => state.wagePresetId)
  const setWagePreset = useSubscriptionStore((state) => state.setWagePreset)
  const wageBasisLabel = getWagePreset(wagePresetId).basisLabel
  const ignoreDuplicateGroup = useSubscriptionStore((state) => state.ignoreDuplicateGroup)
  const resetIgnoredDuplicates = useSubscriptionStore((state) => state.resetIgnoredDuplicates)

  // Insights Logic
  const insights = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'active')
    if (activeSubs.length === 0) return null

    // 1. Low Satisfaction (1-2 stars) - Exclude essentials
    const lowSatisfaction = activeSubs.filter(s => s.satisfaction && s.satisfaction <= 2 && !s.is_essential)
    
    // 2. Fine-grained Sub-domain Duplicate Detection (Exclude Essentials & Ignored Duplicates)
    const subDomainGroups = activeSubs.reduce((acc, sub) => {
      const mainCat = sub.categories?.[0] || sub.category || 'Etc'
      const subDomain = detectSubDomain(sub.service_name, mainCat)
      
      // Work, Cloud, Etc의 'general' 미분류는 성격이 다를 확률이 높아 오탐 방지를 위해 자동 중복 묶음에서 배제
      if (subDomain.isGeneral && (mainCat === 'Work' || mainCat === 'Cloud' || mainCat === 'Etc')) {
        return acc
      }

      const groupId = subDomain.id
      if (!acc[groupId]) {
        acc[groupId] = {
          subDomain,
          items: []
        }
      }
      acc[groupId].items.push(sub)
      return acc
    }, {})

    const duplicates = Object.entries(subDomainGroups)
      .map(([groupId, group]) => {
        // 사용자가 알림 끄기(예외) 처리한 그룹이면 제외
        if (ignoredDuplicates.includes(groupId)) return null

        // 필수(is_essential)가 아닌 항목들만 중복 후보로 필터링
        const nonEssentialItems = group.items.filter(item => !item.is_essential)
        if (nonEssentialItems.length < 2) return null

        const sorted = [...nonEssentialItems].sort((a, b) => {
          if ((b.satisfaction || 0) !== (a.satisfaction || 0)) {
            return (b.satisfaction || 0) - (a.satisfaction || 0)
          }
          const priceA = a.billing_cycle === 'yearly' ? Math.floor(a.price / 12) : a.price
          const priceB = b.billing_cycle === 'yearly' ? Math.floor(b.price / 12) : b.price
          return priceB - priceA
        })
        
        const others = sorted.slice(1)
        const potentialSaving = others.reduce((sum, s) => {
          const price = s.billing_cycle === 'yearly' ? Math.floor(s.price / 12) : s.price
          return sum + price
        }, 0)

        return {
          id: groupId,
          groupKey: groupId,
          label: group.subDomain.label,
          mainCategory: group.subDomain.mainCategory,
          count: nonEssentialItems.length,
          potentialSaving,
          advice: group.subDomain.advice,
          items: sorted
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.potentialSaving - a.potentialSaving)

    // 3. Long-term Cumulative Cost & Opportunity Cost
    const monthlyTotal = activeSubs.reduce((acc, s) => {
      const monthlyPrice = s.billing_cycle === 'yearly' ? Math.floor(s.price / 12) : s.price
      return acc + monthlyPrice
    }, 0)
    const periods = [
      { key: 'one', label: '1년 누적', periodLabel: '1년', mult: 12 },
      { key: 'two', label: '2년 누적', periodLabel: '2년', mult: 12 * 2 },
      { key: 'three', label: '3년 누적', periodLabel: '3년', mult: 12 * 3 },
      { key: 'four', label: '4년 누적', periodLabel: '4년', mult: 12 * 4 },
      { key: 'five', label: '5년 누적', periodLabel: '5년', mult: 12 * 5 },
      { key: 'ten', label: '10년 누적', periodLabel: '10년', mult: 12 * 10 }
    ]

    const costData = periods.map(p => {
      const amount = monthlyTotal * p.mult
      // 물건 비유 대신 "이 돈을 벌려면 며칠을 일해야 하나"로 환산한다.
      // 기준 시급이 없으면 최저시급으로 폴백하므로 설정 없이도 항상 동작한다.
      return { ...p, amount, work: buildWorkCost(amount, hourlyWage) }
    })

    return {
      lowSatisfaction,
      duplicates,
      costData,
      // Card default shows 3-year (index 2)
      defaultCost: costData.find(p => p.key === 'three') || costData[0]
    }
  }, [subscriptions, ignoredDuplicates, hourlyWage])

  // 모달은 열릴 당시의 스냅샷이 아니라 항상 현재 insights 를 본다.
  // 그래야 기준 시급 칩을 누르거나 중복 알림을 끄는 즉시 화면에 반영된다.
  const activeInsightData = useMemo(() => {
    if (!activeInsight || !insights) return []
    if (activeInsight.type === 'cost') return insights.costData
    if (activeInsight.type === 'satisfaction') return insights.lowSatisfaction
    if (activeInsight.type === 'duplicates') return insights.duplicates
    return []
  }, [activeInsight, insights])

  useEffect(() => {
    // 튜토리얼을 보지 않았다면 자동으로 시작 (약간의 지연 후)
    if (!hasSeenTutorial && !isTutorialOpen) {
      const timer = setTimeout(() => setTutorialOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [hasSeenTutorial, isTutorialOpen, setTutorialOpen])

  // 카테고리 드릴다운은 목록/관리를 담당하는 구독 탭으로 넘긴다.
  // 홈은 요약과 인사이트만 책임지고, 필터링된 목록은 한 곳에서만 보여준다.
  const handleCategoryClick = (categoryId) => {
    navigate(`/list?category=${encodeURIComponent(categoryId)}`)
  }

  // 홈에는 최근 등록한 3건만 미리보기로 노출한다 (전체 목록은 구독 탭)
  const recentSubscriptions = useMemo(() => {
    return subscriptions
      .filter(s => s.status !== 'wishlist')
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
      .slice(0, 3)
  }, [subscriptions])
  
  const totalCost = useSubscriptionStore((state) => 
    state.subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((acc, sub) => {
        const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
        return acc + price
      }, 0)
  )

  // Yearly estimated cost
  const yearlyCost = totalCost * 12

  const activeCount = useSubscriptionStore((state) => 
    state.subscriptions.filter(sub => sub.status === 'active').length
  )

  const maxExpenseItem = useSubscriptionStore((state) => {
    const subs = state.subscriptions.filter(sub => sub.status === 'active')
    if (subs.length === 0) return null
    return [...subs].sort((a, b) => {
      const priceA = a.billing_cycle === 'yearly' ? Math.floor(a.price / 12) : a.price
      const priceB = b.billing_cycle === 'yearly' ? Math.floor(b.price / 12) : b.price
      return priceB - priceA
    })[0]
  })

  // Dynamic Category Data Calculation
  const categoryData = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'active')
    if (activeSubs.length === 0) return []

    const grouped = activeSubs.reduce((acc, sub) => {
      // Use the first category if multiple exist, fallback to single category or 'Etc'
      const cat = (sub.categories && sub.categories.length > 0) 
        ? sub.categories[0] 
        : (sub.category || 'Etc')
      
      const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
      acc[cat] = (acc[cat] || 0) + price
      return acc
    }, {})

    const total = Object.values(grouped).reduce((a, b) => a + b, 0)

    return Object.entries(grouped)
      .map(([label, value]) => ({
        id: label,
        label,
        value,
        percentage: (value / total) * 100,
        color: CATEGORY_COLORS[label] || CATEGORY_COLORS.Etc,
        textColor: TEXT_COLORS[label] || 'text-white'
      }))
      .sort((a, b) => b.value - a.value) // Sort by biggest expense
  }, [subscriptions])

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <NotificationBanner />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-transparent md:bg-white dark:md:bg-slate-900 rounded-2xl md:rounded-3xl px-0 py-2 md:p-6 flex flex-col gap-4 md:gap-6 items-start w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        {/* Title Section */}
        <motion.div variants={itemVariants} className="flex justify-start w-full">
           <SectionHeader title="월간 구독 리포트" />
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          id="step-summary" 
          variants={itemVariants}
          className="grid grid-cols-2 md:flex md:flex-wrap gap-2.5 md:gap-3 items-start w-full"
        >
          {/* 총 구독료 */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            whileTap="tap"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-start gap-0.5 w-full md:max-w-[190px] shadow-xs"
          >
            <p className="text-[12px] md:text-[13px] font-semibold text-primary">총 구독료</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[17px] md:text-[22px] font-bold text-dark dark:text-white">
                {totalCost.toLocaleString()}
              </span>
              <span className="text-[12px] md:text-[13px] font-medium text-slate-500 dark:text-slate-400">원</span>
            </div>
          </motion.div>
          
          {/* 구독중인 서비스 */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/list')} 
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-start gap-0.5 w-full md:max-w-[190px] cursor-pointer shadow-xs"
          >
             <p className="text-[12px] md:text-[13px] font-semibold text-primary">구독중인 서비스</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[17px] md:text-[22px] font-bold text-dark dark:text-white">
                {activeCount}
              </span>
              <span className="text-[12px] md:text-[13px] font-medium text-slate-500 dark:text-slate-400">개</span>
            </div>
          </motion.div>

          {/* 가장 지출이 큰 곳 */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            whileTap="tap"
            onClick={() => maxExpenseItem && openModal(maxExpenseItem)}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-start gap-0.5 w-full md:min-w-[190px] md:w-[220px] cursor-pointer overflow-hidden group shadow-xs"
          >
             <p className="text-[12px] md:text-[13px] font-semibold text-primary">가장 지출이 큰 곳</p>
            <div className="w-full overflow-hidden">
              <span className="text-[17px] md:text-[22px] font-bold text-dark dark:text-white truncate block w-full group-hover:text-primary transition-colors" title={maxExpenseItem?.service_name || '-'}>
                {maxExpenseItem?.service_name || '-'}
              </span>
            </div>
          </motion.div>

          {/* 연간 예상 지출 */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            whileTap="tap"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-start gap-0.5 w-full md:max-w-[220px] shadow-xs"
          >
            <p className="text-[12px] md:text-[13px] font-semibold text-primary">연간 예상 지출</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[17px] md:text-[22px] font-bold text-dark dark:text-white">
                {yearlyCost.toLocaleString()}
              </span>
              <span className="text-[12px] md:text-[13px] font-medium text-slate-500 dark:text-slate-400">원</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Payment Briefing Section */}
        <motion.div variants={itemVariants} className="mt-1 flex flex-col items-start w-full">
          <PaymentBriefing showDetailsList={false} />
        </motion.div>

        {/* Optimization Insights Section */}
        {insights && (
          <motion.div variants={itemVariants} className="mt-4 md:mt-6 flex flex-col items-start w-full gap-3">
            <SubsectionHeader title="구독 최적화 리포트" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-3.5 w-full">
              {/* Long-term Cost Card */}
              <motion.div 
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setActiveInsight({ type: 'cost' })}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl md:rounded-2xl p-3.5 md:p-4.5 flex flex-col items-start gap-1 w-full cursor-pointer overflow-hidden group shadow-xs"
              >
                <div className="flex items-center gap-1.5 text-primary">
                  <TrendingDown size={16} />
                  <p className="text-[13px] md:text-[14px] font-bold">장기 지출 경고</p>
                </div>
                <div className="flex flex-col gap-0.5 mt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[17px] md:text-[20px] font-bold text-dark dark:text-white group-hover:text-primary transition-colors">
                      {insights.defaultCost.periodLabel}이면 {insights.defaultCost.work.duration}
                    </span>
                    <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">치 근무</span>
                  </div>
                  <p className="text-[11.5px] md:text-[12.5px] text-red-500 font-bold line-clamp-1">
                    {insights.defaultCost.work.icon} {insights.defaultCost.work.message}
                  </p>
                </div>
              </motion.div>

              {/* Low Satisfaction Card */}
              <motion.div 
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setActiveInsight({ type: 'satisfaction' })}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl p-3.5 md:p-4.5 flex flex-col items-start gap-1 w-full cursor-pointer overflow-hidden border shadow-xs transition-colors",
                  insights.lowSatisfaction.length > 0 
                    ? "border-red-500/30 dark:border-red-500/30" 
                    : "border-emerald-500/30 dark:border-emerald-500/30"
                )}
              >
                <div className={cn(
                  "flex items-center gap-1.5",
                  insights.lowSatisfaction.length > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  <Star size={16} className={insights.lowSatisfaction.length > 0 ? "fill-red-600/20" : "fill-emerald-600/20"} />
                  <p className="text-[13px] md:text-[14px] font-bold">만족도 분석</p>
                </div>
                <div className="flex flex-col gap-0.5 mt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[17px] md:text-[20px] font-bold text-dark dark:text-white">
                      {insights.lowSatisfaction.length > 0 ? `${insights.lowSatisfaction.length}개 발견` : '모두 만족'}
                    </span>
                  </div>
                  <p className="text-[11.5px] md:text-[12.5px] text-slate-400 dark:text-slate-500 font-medium">
                    {insights.lowSatisfaction.length > 0 
                      ? '낮은 만족도 서비스 정리'
                      : '효율적으로 구독 관리 중'}
                  </p>
                </div>
              </motion.div>

              {/* Duplicate Category Card */}
              <motion.div 
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setActiveInsight({ type: 'duplicates' })}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl p-3.5 md:p-4.5 flex flex-col items-start gap-1 w-full cursor-pointer overflow-hidden border shadow-xs transition-colors",
                  insights.duplicates.length > 0
                    ? "border-amber-500/30 dark:border-amber-500/30"
                    : "border-slate-200/80 dark:border-slate-800"
                )}
              >
                <div className={cn(
                  "flex items-center gap-1.5",
                  insights.duplicates.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-500"
                )}>
                  {insights.duplicates.length > 0 ? <AlertTriangle size={16} /> : <Info size={16} />}
                  <p className="text-[13px] md:text-[14px] font-bold">비슷한 서비스 점검</p>
                </div>
                <div className="flex flex-col gap-0.5 mt-0.5 w-full">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[17px] md:text-[20px] font-bold text-dark dark:text-white">
                      {insights.duplicates.length > 0 
                        ? `월 ${insights.duplicates[0].potentialSaving.toLocaleString()}원` 
                        : '중복 항목 없음'}
                    </span>
                    {insights.duplicates.length > 0 && (
                      <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">절감 가능</span>
                    )}
                  </div>
                  <p className="text-[11.5px] md:text-[12.5px] text-slate-400 dark:text-slate-500 font-medium truncate w-full">
                    {insights.duplicates.length > 0 
                      ? `${insights.duplicates[0].label} 카테고리 점검 추천`
                      : '알뜰하게 구독 관리 중'}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Insight Detail Modal */}
        <AnimatePresence>
          {activeInsight && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={createBackdropClose(() => setActiveInsight(null))}
              className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-slate-800 w-full max-w-[520px] rounded-[32px] overflow-hidden ring-1 ring-black/5 shadow-2xl shadow-primary/10 border border-tertiary dark:border-slate-700 flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="p-4 pt-5 pb-5 border-b border-tertiary dark:border-slate-700 flex items-center justify-between shrink-0">
                  <h3 className="text-[22px] font-bold text-dark dark:text-white">
                    {activeInsight.type === 'cost' && '장기 지출 분석'}
                    {activeInsight.type === 'satisfaction' && (activeInsightData.length > 0 ? '낮은 만족도 서비스' : '만족도 분석 결과')}
                    {activeInsight.type === 'duplicates' && '비슷한 서비스 상세 분석'}
                  </h3>
                  <button 
                    onClick={() => setActiveInsight(null)}
                    className="p-2 hover:bg-tertiary dark:hover:bg-slate-700 rounded-full transition-all active:scale-95 cursor-pointer"
                  >
                    <X size={24} className="text-dark dark:text-white" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="px-4 py-4 md:py-6 overflow-y-auto custom-scrollbar grow">
                  {activeInsight.type === 'cost' && (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col gap-4"
                    >
                      <motion.div variants={itemVariants} className="text-center space-y-2 mb-4 break-keep px-2">
                        <p className="text-[13px] md:text-[14px] text-slate-500 font-bold">이 구독료를 벌려면 얼마나 일해야 할까요?</p>
                        <h4 className="text-[20px] md:text-[22px] font-bold text-dark dark:text-white leading-[1.5]">
                          구독료로 나가는 돈은 결국<br/>
                          <span className="text-primary font-extrabold underline decoration-primary/20 decoration-4 underline-offset-4 decoration-clone inline">
                            내가 일한 시간
                          </span>입니다.
                        </h4>
                      </motion.div>

                      {/* 기준 시급 선택 — 설정 페이지까지 가지 않아도 여기서 바로 바꾼다 */}
                      <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 -mt-2 mb-1">
                        <p className="text-[11.5px] md:text-[12px] font-bold text-slate-400 dark:text-slate-500">
                          내 소득 기준으로 다시 계산하기
                        </p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {WAGE_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => setWagePreset(preset.id)}
                              className={cn(
                                "px-3 py-1.5 text-[12px] font-bold rounded-full border transition-all cursor-pointer active:scale-95",
                                wagePresetId === preset.id
                                  ? "bg-primary text-white border-primary shadow-xs"
                                  : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:text-dark dark:hover:text-white"
                              )}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">
                          {wageBasisLabel} · 1일 8시간 근무 환산
                        </p>
                      </motion.div>

                      <div className="grid grid-cols-1 gap-3">
                        {activeInsightData.map((item, i) => (
                          <motion.div 
                            key={i} 
                            variants={itemVariants}
                            whileHover={{ y: -2, backgroundColor: "rgba(37, 99, 235, 0.08)" }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-4 p-3 bg-primary/5 dark:bg-primary/10 rounded-[24px] border border-primary/10 transition-colors relative group"
                          >
                            {/* Cumulative Amount Badge - Top Right */}
                            <div className="absolute top-4 right-5">
                               <span className="text-[13px] font-extrabold text-slate-400 dark:text-slate-500">
                                {item.amount.toLocaleString()}원
                               </span>
                            </div>

                            {/* Left: Icon Area */}
                            <div className="size-16 bg-white dark:bg-slate-900 rounded-[20px] flex items-center justify-center text-[32px] shrink-0 shadow-sm border border-primary/5">
                              {item.work.icon}
                            </div>

                            {/* Right: Text Area */}
                            <div className="flex flex-col gap-0.5 pr-2 md:pr-16">
                              <span className="text-[13px] font-bold text-primary/60 uppercase tracking-tight">
                                {item.periodLabel || item.label} 구독하면
                              </span>
                              <h5 className="text-[17px] md:text-[19px] font-extrabold text-dark dark:text-white leading-tight break-keep">
                                {item.work.headline}
                              </h5>
                              <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                {item.work.message}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div variants={itemVariants} className="bg-amber-50 dark:bg-amber-950/20 rounded-[24px] p-5 border border-amber-100 dark:border-amber-900/30 mt-2 mb-2">
                        <p className="text-[13px] md:text-[14px] text-amber-700 dark:text-amber-400 leading-relaxed font-bold text-center break-keep">
                          매달 빠져나가는 금액은 작아 보여도, 결국 내 근무일로 갚고 있는 셈입니다.<br/>정말 그만큼 일할 가치가 있는 서비스만 남겨보세요.
                        </p>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeInsight.type === 'satisfaction' && (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {activeInsightData.length > 0 ? (
                        <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-950/20 p-4 rounded-[20px] border border-red-100 dark:border-red-900/30 mb-2">
                          <p className="text-[14px] font-bold text-red-600 dark:text-red-400 text-center break-keep">
                            만족도가 낮은 서비스들을 발견했습니다.<br/>
                            <span className="font-extrabold underline underline-offset-4">아까운 비용이 매달 새어나가고 있어요.</span>
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div variants={itemVariants} className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-[20px] border border-emerald-100 dark:border-emerald-900/30 mb-2">
                          <p className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400 text-center break-keep">
                            현재 모든 서비스를 만족하며 이용하고 계시네요!<br/>
                            <span className="font-extrabold underline underline-offset-4">현명한 소비 습관을 유지하고 있습니다.</span>
                          </p>
                        </motion.div>
                      )}

                      {activeInsightData.map(sub => (
                        <motion.div 
                          key={sub.id} 
                          variants={itemVariants}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex flex-col bg-white dark:bg-slate-900 rounded-[24px] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm"
                        >
                          <div 
                            onClick={() => {
                              openModal(sub);
                              setActiveInsight(null);
                            }}
                            className="flex items-center justify-between p-5 cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <ServiceIcon 
                                serviceName={sub.service_name} 
                                category={sub.categories?.[0] || sub.category || 'Etc'} 
                                size="lg"
                              />
                              <div className="flex flex-col gap-1">
                                <p className="font-extrabold text-dark dark:text-white text-[18px] group-hover:text-primary transition-colors">{sub.service_name}</p>
                                {/* Satisfaction Gauge */}
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((idx) => (
                                    <div 
                                      key={idx} 
                                      className={cn(
                                        "w-3 h-1.5 rounded-full transition-all duration-500",
                                        idx <= sub.satisfaction 
                                          ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" 
                                          : "bg-slate-200 dark:bg-slate-800"
                                      )} 
                                    />
                                  ))}
                                  <span className="ml-1 text-[12px] font-bold text-amber-600">낮음</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <p className="font-extrabold text-dark dark:text-white text-[19px]">
                                {sub.price.toLocaleString()}원{sub.billing_cycle === 'yearly' ? '/년' : ''}
                              </p>
                              <p className="text-[11px] font-bold text-red-500 uppercase tracking-tight">
                                연 {(sub.billing_cycle === 'yearly' ? sub.price : sub.price * 12).toLocaleString()}원 낭비 중
                              </p>
                            </div>
                          </div>

                          {/* Footer Action Area */}
                          <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[12px] font-bold text-slate-400">결제일: {sub.billing_date}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSubscription(sub.id, { is_essential: true });
                                setActiveInsight(null);
                              }}
                              className="text-[12px] text-purple-500 font-extrabold hover:underline active:scale-95 transition-all"
                            >
                              이 서비스는 필수예요 (분류 제외)
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {activeInsight.type === 'duplicates' && (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-6 pb-6"
                    >
                      {(insights?.duplicates || []).length > 0 ? (
                        (insights.duplicates).map(group => (
                          <motion.div key={group.id} variants={itemVariants} className="space-y-4 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-[28px] border border-slate-200/60 dark:border-slate-700/50">
                            <div className="flex items-center justify-between px-1">
                              <div>
                                <h4 className="font-extrabold text-[16px] text-primary flex items-center gap-1.5">
                                  <span>[{group.label}]</span>
                                  <span className="text-dark dark:text-white">상세 비교</span>
                                </h4>
                                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                  💡 {group.advice}
                                </p>
                              </div>
                              <span className="text-[12px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full shrink-0">
                                {group.count}개 후보
                              </span>
                            </div>

                            <div className="space-y-3">
                              {group.items.map((sub, idx) => (
                                <motion.div 
                                  key={sub.id} 
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  onClick={() => {
                                    openModal(sub);
                                    setActiveInsight(null);
                                  }}
                                  className={cn(
                                    "relative flex items-center justify-between p-4 rounded-[20px] transition-all cursor-pointer group overflow-hidden",
                                    idx === 0 
                                      ? "bg-dark dark:bg-slate-700 text-white shadow-xl shadow-black/10 z-10 border-none" 
                                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                                  )}
                                >
                                  {idx === 0 && (
                                    <div className="absolute top-0 left-0 bg-primary text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-br-lg uppercase tracking-wider">
                                      Best Choice
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3">
                                    <ServiceIcon 
                                      serviceName={sub.service_name} 
                                      category={sub.categories?.[0] || sub.category || 'Etc'} 
                                      size="md"
                                    />
                                    <div className="flex flex-col">
                                      <p className={cn(
                                        "font-extrabold text-[15px]",
                                        idx === 0 ? "text-white" : "text-dark dark:text-white"
                                      )}>
                                        {sub.service_name}
                                      </p>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateSubscription(sub.id, { is_essential: true });
                                        }}
                                        className={cn(
                                          "text-[11px] text-left font-bold hover:underline mt-0.5",
                                          idx === 0 ? "text-white/60" : "text-purple-500"
                                        )}
                                      >
                                        필수 서비스로 지정 (비교 제외)
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-0.5">
                                    <p className={cn(
                                      "font-extrabold text-[16px]",
                                      idx === 0 ? "text-white" : "text-dark dark:text-white"
                                    )}>
                                      {sub.price.toLocaleString()}원{sub.billing_cycle === 'yearly' ? '/년' : ''}
                                    </p>
                                    {sub.billing_cycle === 'yearly' && (
                                      <span className={cn(
                                        "text-[10px] font-medium",
                                        idx === 0 ? "text-white/70" : "text-dark/50 dark:text-slate-400"
                                      )}>
                                        (월 {Math.floor(sub.price / 12).toLocaleString()}원)
                                      </span>
                                    )}
                                    <span className={cn(
                                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter mt-0.5",
                                      idx === 0 ? "bg-white/10 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                    )}>
                                      {idx === 0 ? '유지 권장' : '해지 후보'}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* Savings Summary & Ignore Action */}
                            <div className="space-y-2 pt-1">
                              <div className="p-4 bg-primary text-white rounded-[20px] shadow-lg shadow-primary/20 flex items-center justify-between border border-white/10">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider leading-none mb-1">Monthly potential saving</span>
                                  <p className="text-[13px] font-bold leading-none">불필요한 중복 정리 시</p>
                                </div>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-[22px] font-extrabold leading-none">{group.potentialSaving.toLocaleString()}</span>
                                  <span className="text-[13px] font-bold">원 절약</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between px-2 pt-1">
                                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                  서로 다른 목적으로 쓰고 계신가요?
                                </span>
                                <button
                                  type="button"
                                  onClick={() => ignoreDuplicateGroup(group.groupKey)}
                                  className="text-[11px] font-bold text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 px-2 py-1 rounded-md hover:bg-amber-500/10 active:scale-95 transition-all cursor-pointer"
                                >
                                  중복 알림 끄기
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="p-8 text-center space-y-2">
                          <p className="text-[16px] font-bold text-dark dark:text-white">
                            비슷하거나 중복된 서비스가 없습니다.
                          </p>
                          <p className="text-[13px] text-slate-400">
                            모든 구독이 각자의 고유한 용도로 효율적으로 관리되고 있습니다.
                          </p>
                        </div>
                      )}

                      {/* Ignored duplicates restoration footer */}
                      {ignoredDuplicates.length > 0 && (
                        <motion.div variants={itemVariants} className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800/50 rounded-[18px] text-slate-500 text-[12px] border border-slate-200/50 dark:border-slate-700">
                          <span>알림 제외된 중복 그룹: <strong className="text-dark dark:text-slate-300">{ignoredDuplicates.length}개</strong></span>
                          <button
                            type="button"
                            onClick={resetIgnoredDuplicates}
                            className="font-extrabold text-primary hover:underline cursor-pointer"
                          >
                            제외 목록 초기화
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 pt-0 flex justify-center shrink-0">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveInsight(null)}
                    className="w-full h-14 bg-dark dark:bg-slate-700 text-white rounded-[20px] text-[18px] font-extrabold hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-black/10"
                  >
                    확인 완료
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart Section */}
         <motion.div id="step-chart" variants={itemVariants} className="mt-8 flex flex-col items-start w-full gap-4">
            <SubsectionHeader title="카테고리별 비중" />

            <CategoryDistributionChart
              categoryData={categoryData}
              selectedCategory={null}
              onCategoryClick={handleCategoryClick}
            />
         </motion.div>

        {/* Recent Subscriptions Preview (전체 목록은 구독 탭에서) */}
        <motion.div id="step-recent" variants={itemVariants} className="flex flex-col gap-3 mt-8 w-full">
            <SubsectionHeader
              title="최근 등록한 구독"
              action={
                <Link
                  to="/list"
                  className="flex items-center gap-0.5 text-[13px] font-bold text-primary dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
                >
                  전체 보기
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            {recentSubscriptions.length > 0 ? (
              <div className="flex flex-col w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs">
                {recentSubscriptions.map((sub) => {
                  const isYearly = sub.billing_cycle === 'yearly'
                  const monthlyPrice = isYearly ? Math.floor(sub.price / 12) : sub.price

                  return (
                    <div
                      key={sub.id}
                      onClick={() => openModal(sub)}
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        <ServiceIcon
                          serviceName={sub.service_name}
                          category={sub.categories?.[0] || sub.category || 'Etc'}
                          size="md"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className={cn(
                            "font-bold text-[14px] truncate",
                            sub.status === 'active' ? "text-dark dark:text-white" : "text-slate-400 dark:text-slate-500 line-through"
                          )}>
                            {sub.service_name}
                          </span>
                          <span className="text-[11.5px] text-slate-400 dark:text-slate-500 font-medium truncate">
                            {sub.status === 'active' ? (sub.billing_date || '결제일 미설정') : '정지됨'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[13.5px] font-extrabold text-dark dark:text-white block">
                          {monthlyPrice.toLocaleString()}원
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {isYearly ? '월 환산' : '/월'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState message="아직 등록된 구독 서비스가 없습니다." />
            )}
        </motion.div>

      </motion.div>
    </div>
  )
}

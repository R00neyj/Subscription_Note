import { useState, useMemo, useEffect } from 'react'
import Header from '../components/Header'
import SubscriptionTable from '../components/SubscriptionTable'
import SectionHeader from '../components/SectionHeader'
import CategoryDistributionChart from '../components/CategoryDistributionChart'
import { ChevronRight, AlertTriangle, TrendingDown, Info, Star, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import useSubscriptionStore from '../store/useSubscriptionStore'
import NotificationBanner from '../components/NotificationBanner'
import { getDashboardUpcomingInfo } from '../lib/notificationUtils'
import { CATEGORY_COLORS, TEXT_COLORS, CATEGORIES } from '../constants/categories'
import { OPPORTUNITY_COST_ITEMS } from '../constants/opportunityCosts'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

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
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [activeInsight, setActiveInsight] = useState(null) // 모달 제어용
  
  // Store Data
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const isTutorialOpen = useSubscriptionStore((state) => state.isTutorialOpen)
  const setTutorialOpen = useSubscriptionStore((state) => state.setTutorialOpen)
  const hasSeenTutorial = useSubscriptionStore((state) => state.hasSeenTutorial)
  const openModal = useSubscriptionStore((state) => state.openModal)
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription)

  // Insights Logic
  const insights = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'active')
    if (activeSubs.length === 0) return null

    // 1. Low Satisfaction (1-2 stars) - Exclude essentials
    const lowSatisfaction = activeSubs.filter(s => s.satisfaction && s.satisfaction <= 2 && !s.is_essential)
    
    // 2. Duplicate Categories & Potential Savings (Exclude Essentials)
    const catGroups = activeSubs.reduce((acc, sub) => {
      const cat = sub.categories?.[0] || sub.category || 'Etc'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(sub)
      return acc
    }, {})

    const duplicates = Object.entries(catGroups)
      .map(([catId, allItems]) => {
        // 필수(is_essential)가 아닌 항목들만 중복 후보로 필터링
        const nonEssentialItems = allItems.filter(item => !item.is_essential)
        
        if (nonEssentialItems.length < 2) return null

        const category = CATEGORIES.find(c => c.id === catId)
        const label = category?.label || catId
        
        const sorted = [...nonEssentialItems].sort((a, b) => {
          if ((b.satisfaction || 0) !== (a.satisfaction || 0)) {
            return (b.satisfaction || 0) - (a.satisfaction || 0)
          }
          return b.price - a.price
        })
        
        const others = sorted.slice(1)
        const potentialSaving = others.reduce((sum, s) => sum + s.price, 0)

        let advice = ''
        if (catId === 'OTT') advice = '비슷한 영상 콘텐츠가 겹치지 않나요?'
        else if (catId === 'Music') advice = '하나의 플레이리스트로 합쳐보세요.'
        else if (catId === 'Shopping') advice = '가장 자주 쓰는 배송 혜택만 남겨보세요.'
        else advice = '불필요한 중복이 없는지 확인해보세요.'

        return { id: catId, label, count: nonEssentialItems.length, potentialSaving, advice, items: sorted }
      })
      .filter(Boolean)
      .sort((a, b) => b.potentialSaving - a.potentialSaving)

    // 3. Long-term Cumulative Cost & Opportunity Cost
    const monthlyTotal = activeSubs.reduce((acc, s) => {
      const monthlyPrice = s.billing_cycle === 'yearly' ? Math.floor(s.price / 12) : s.price
      return acc + monthlyPrice
    }, 0)
    const periods = [
      { key: 'one', label: '1년 누적', mult: 12 },
      { key: 'five', label: '5년 누적', mult: 12 * 5 },
      { key: 'ten', label: '10년 누적', mult: 12 * 10 },
      { key: 'twenty', label: '20년 누적', mult: 12 * 20 }
    ]

    const costData = periods.map(p => {
      const amount = monthlyTotal * p.mult
      // Find best match for this amount
      const match = [...OPPORTUNITY_COST_ITEMS].reverse().find(item => amount >= item.price) || OPPORTUNITY_COST_ITEMS[0]
      
      // Generate dynamic message based on price range
      let message = ''
      if (match.price >= 100000000) message = `${match.name}의 꿈이 조금씩 멀어지고 있을지도 몰라요.`
      else if (match.price >= 10000000) message = `통장에서 ${match.name} 한 대 값이 조용히 빠져나갔네요.`
      else if (match.price >= 1000000) message = `벌써 ${match.name}을 사고도 남을 만큼의 소중한 돈이에요.`
      else if (match.price >= 100000) message = `${match.name}을 손에 넣을 수 있는 넉넉한 금액입니다.`
      else message = `${match.name}을 ${Math.floor(amount / match.price)}번이나 즐길 수 있었겠네요.`

      return { ...p, amount, match, message }
    })

    return {
      lowSatisfaction,
      duplicates,
      costData,
      // Card default shows 5-year (index 1)
      defaultCost: costData[1]
    }
  }, [subscriptions])

  useEffect(() => {
    // 튜토리얼을 보지 않았다면 자동으로 시작 (약간의 지연 후)
    if (!hasSeenTutorial && !isTutorialOpen) {
      const timer = setTimeout(() => setTutorialOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [hasSeenTutorial, isTutorialOpen, setTutorialOpen])

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId)
  }

  // Sort Logic (Same as SubscriptionList)
  const sortedSubscriptions = useMemo(() => {
    let data = [...subscriptions]

    // 1. Filter by Selected Category
    if (selectedCategory) {
      data = data.filter(sub => 
        sub.category === selectedCategory || 
        (sub.categories && sub.categories.includes(selectedCategory))
      )
    }

    // 2. Sort
    data.sort((a, b) => {
      // 2.1. Primary Sort: Status (Active first)
      if (a.status !== b.status) {
        return a.status === 'active' ? -1 : 1
      }

      // 2.2. Secondary Sort: User Configuration
      if (sortConfig.key) {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle category specially (might be in categories array)
        if (sortConfig.key === 'category') {
          aValue = a.category || a.categories?.[0] || ''
          bValue = b.category || b.categories?.[0] || ''
        }

        if (sortConfig.key === 'price') {
           return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }
        if (sortConfig.key === 'billing_date') {
            const getDay = (str) => parseInt(str.replace(/[^0-9]/g, '')) || 0
            aValue = getDay(aValue)
            bValue = getDay(bValue)
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }
        // Handle strings (service_name, payment_method)
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }
      } else {
        // Default: Sort by newest (created_at descending)
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      }
      return 0
    })
    return data
  }, [subscriptions, sortConfig, selectedCategory])

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }
  
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
    return subs.sort((a, b) => b.price - a.price)[0]
  })

  // Upcoming Payments Info (Today or This Week)
  const upcomingInfo = useMemo(() => {
    return getDashboardUpcomingInfo(subscriptions)
  }, [subscriptions])

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
        className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:rounded-[48px] px-0 py-4 md:p-8 flex flex-col gap-6 items-start w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        {/* Title Section */}
        <motion.div variants={itemVariants} className="flex justify-start w-full">
           <SectionHeader title="월간 구독 리포트" />
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          id="step-summary" 
          variants={itemVariants}
          className="grid grid-cols-2 md:flex md:flex-wrap gap-4 items-start w-full"
        >
          {/* 총 구독료 */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            whileTap="tap"
            className="bg-background dark:bg-slate-900 border border-primary/20 dark:border-primary/40 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full md:max-w-[200px]"
          >
            <p className="text-[14px] md:text-[18px] font-bold text-primary leading-[1.4]">총 구독료</p>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white leading-[1.4]">
                {totalCost.toLocaleString()}
              </span>
              <div className="pt-1">
                <span className="text-[14px] md:text-[18px] font-medium text-dark dark:text-slate-200 leading-[1.4]">원</span>
              </div>
            </div>
          </motion.div>
          
          {/* 구독중인 서비스 */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            whileTap="tap"
            className="bg-background dark:bg-slate-900 border border-primary/20 dark:border-primary/40 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full md:max-w-[200px]"
          >
             <p className="text-[14px] md:text-[18px] font-bold text-primary leading-[1.4]">구독중인 서비스</p>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white leading-[1.4]">
                {activeCount}
              </span>
              <div className="pt-1">
                <span className="text-[14px] md:text-[18px] font-medium text-dark dark:text-slate-200 leading-[1.4]">개</span>
              </div>
            </div>
          </motion.div>

          {/* 가장 지출이 큰 곳 */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            whileTap="tap"
            onClick={() => maxExpenseItem && openModal(maxExpenseItem)}
            className="bg-background dark:bg-slate-900 border border-primary/20 dark:border-primary/40 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full md:min-w-[200px] md:w-[240px] cursor-pointer overflow-hidden group"
          >
             <p className="text-[14px] md:text-[18px] font-bold text-primary leading-[1.4]">가장 지출이 큰 곳</p>
            <div className="flex items-center gap-[3px] w-full overflow-hidden">
              <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white leading-[1.4] truncate block w-full group-hover:text-primary transition-colors" title={maxExpenseItem?.service_name || '-'}>
                {maxExpenseItem?.service_name || '-'}
              </span>
            </div>
          </motion.div>

          {/* 연간 예상 지출 */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            whileTap="tap"
            className="bg-background dark:bg-slate-900 border border-primary/20 dark:border-primary/40 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full md:max-w-[240px]"
          >
            <p className="text-[14px] md:text-[18px] font-bold text-primary leading-[1.4]">연간 예상 지출</p>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white leading-[1.4]">
                {yearlyCost.toLocaleString()}
              </span>
              <div className="pt-1">
                <span className="text-[14px] md:text-[18px] font-medium text-dark dark:text-slate-200 leading-[1.4]">원</span>
              </div>
            </div>
          </motion.div>

          {/* 곧 결제될 구독 (배너형) */}
          {upcomingInfo && (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate('/calendar')}
              className="col-span-2 w-full bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[24px] px-5 py-4 md:py-6 flex items-center justify-between cursor-pointer group mt-2 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 md:gap-4 text-primary">
                <span className="text-[15px] md:text-[18px] font-extrabold">
                  {upcomingInfo.type === 'today' ? '오늘' : '이번 주'} 결제 예정: <span className="text-[17px] md:text-[20px] ml-1">{upcomingInfo.items.length}건</span>
                </span>
                <span className="text-primary/30 font-light">|</span>
                <span className="text-[15px] md:text-[18px] font-extrabold">
                  합계 <span className="text-[17px] md:text-[20px] ml-1">{upcomingInfo.items.reduce((acc, cur) => acc + cur.price, 0).toLocaleString()}원</span>
                </span>
              </div>
              <ChevronRight className="text-primary group-hover:translate-x-1 transition-transform duration-300" size={24} />
            </motion.div>
          )}
        </motion.div>

        {/* Optimization Insights Section */}
        {insights && (
          <motion.div variants={itemVariants} className="mt-8 flex flex-col items-start w-full gap-4">
            <SectionHeader title="구독 최적화 리포트" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {/* Long-term Cost Card */}
              <motion.div 
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setActiveInsight({ 
                  type: 'cost', 
                  data: insights.costData
                })}
                className="bg-background dark:bg-slate-900 border border-primary/20 dark:border-primary/40 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full cursor-pointer overflow-hidden group"
              >
                <div className="flex items-center gap-2 text-primary">
                  <TrendingDown size={18} />
                  <p className="text-[14px] md:text-[18px] font-bold leading-[1.4]">장기 지출 경고</p>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-baseline gap-[3px]">
                    <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white leading-[1.4] group-hover:text-primary transition-colors duration-300">
                      {insights.defaultCost.label} {insights.defaultCost.amount.toLocaleString()}
                    </span>
                    <span className="text-[14px] md:text-[18px] font-medium text-dark dark:text-slate-200">원</span>
                  </div>
                  <p className="text-[12px] md:text-[14px] text-red-500 font-extrabold">
                    {insights.defaultCost.match.icon} {insights.defaultCost.message}
                  </p>
                </div>
              </motion.div>

              {/* Low Satisfaction Card */}
              <motion.div 
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setActiveInsight({ type: 'satisfaction', data: insights.lowSatisfaction })}
                className={cn(
                  "bg-background dark:bg-slate-900 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full cursor-pointer overflow-hidden border transition-colors duration-300",
                  insights.lowSatisfaction.length > 0 
                    ? "border-red-500/30" 
                    : "border-emerald-500/30"
                )}
              >
                <div className={cn(
                  "flex items-center gap-2",
                  insights.lowSatisfaction.length > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  <Star size={18} className={insights.lowSatisfaction.length > 0 ? "fill-red-600/20" : "fill-emerald-600/20"} />
                  <p className="text-[14px] md:text-[18px] font-bold leading-[1.4]">만족도 분석</p>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-baseline gap-[3px]">
                    <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white leading-[1.4]">
                      {insights.lowSatisfaction.length > 0 ? `${insights.lowSatisfaction.length}개 발견` : '모두 만족'}
                    </span>
                  </div>
                  <p className="text-[12px] md:text-[14px] text-dark/40 dark:text-slate-400 font-extrabold leading-tight">
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
                onClick={() => setActiveInsight({ type: 'duplicates', data: insights.duplicates })}
                className={cn(
                  "bg-background dark:bg-slate-900 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full cursor-pointer overflow-hidden border transition-colors duration-300",
                  insights.duplicates.length > 0
                    ? "border-amber-500/30"
                    : "border-slate-200 dark:border-slate-700"
                )}
              >
                <div className={cn(
                  "flex items-center gap-2",
                  insights.duplicates.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-500"
                )}>
                  {insights.duplicates.length > 0 ? <AlertTriangle size={18} /> : <Info size={18} />}
                  <p className="text-[14px] md:text-[18px] font-bold leading-[1.4]">비슷한 서비스 점검</p>
                </div>
                <div className="flex flex-col gap-1 mt-1 w-full">
                  <div className="flex items-baseline gap-[3px]">
                    <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white leading-[1.4]">
                      {insights.duplicates.length > 0 
                        ? `월 ${insights.duplicates[0].potentialSaving.toLocaleString()}원` 
                        : '중복된 항목이 없어요'}
                    </span>
                    {insights.duplicates.length > 0 && (
                      <span className="text-[14px] md:text-[18px] font-medium text-dark dark:text-slate-200">절감 가능</span>
                    )}
                  </div>
                  <p className="text-[12px] md:text-[14px] text-dark/40 dark:text-slate-400 font-extrabold truncate w-full">
                    {insights.duplicates.length > 0 
                      ? `${insights.duplicates[0].label} 카테고리를 점검해보세요`
                      : '아주 알뜰하게 구독을 관리하고 계시네요!'}
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
                <div className="p-6 border-b border-tertiary dark:border-slate-700 flex items-center justify-between shrink-0">
                  <h3 className="text-[22px] font-bold text-dark dark:text-white">
                    {activeInsight.type === 'cost' && '장기 지출 분석'}
                    {activeInsight.type === 'satisfaction' && '낮은 만족도 서비스'}
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
                <div className="px-6 py-4 md:py-6 overflow-y-auto custom-scrollbar grow">
                  {activeInsight.type === 'cost' && (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col gap-4"
                    >
                      <motion.div variants={itemVariants} className="text-center space-y-2 mb-4 break-keep px-2">
                        <p className="text-[13px] md:text-[14px] text-slate-500 font-bold">지금까지의 구독료를 모았다면?</p>
                        <h4 className="text-[20px] md:text-[22px] font-bold text-dark dark:text-white leading-[1.5]">
                          작은 금액이라도 시간이 지나면<br/>
                          <span className="text-primary font-extrabold underline decoration-primary/20 decoration-4 underline-offset-4 decoration-clone inline">
                            상상 이상의 가치
                          </span>가 됩니다.
                        </h4>
                      </motion.div>

                      <div className="grid grid-cols-1 gap-3">
                        {activeInsight.data.map((item, i) => (
                          <motion.div 
                            key={i} 
                            variants={itemVariants}
                            whileHover={{ y: -2, backgroundColor: "rgba(37, 99, 235, 0.08)" }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-4 p-4 bg-primary/5 dark:bg-primary/10 rounded-[24px] border border-primary/10 transition-colors relative group"
                          >
                            {/* Cumulative Amount Badge - Top Right */}
                            <div className="absolute top-4 right-5">
                               <span className="text-[13px] font-extrabold text-slate-400 dark:text-slate-500">
                                {item.amount.toLocaleString()}원
                               </span>
                            </div>

                            {/* Left: Icon Area */}
                            <div className="size-16 bg-white dark:bg-slate-900 rounded-[20px] flex items-center justify-center text-[32px] shrink-0 shadow-sm border border-primary/5">
                              {item.match.icon}
                            </div>

                            {/* Right: Text Area */}
                            <div className="flex flex-col gap-0.5 pr-16">
                              <span className="text-[13px] font-bold text-primary/60 uppercase tracking-tight">
                                {item.label}만 아껴도
                              </span>
                              <h5 className="text-[17px] md:text-[19px] font-extrabold text-dark dark:text-white leading-tight break-keep">
                                {item.match.name}
                              </h5>
                              <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                {item.message.split('!')[0]}!
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div variants={itemVariants} className="bg-amber-50 dark:bg-amber-950/20 rounded-[24px] p-5 border border-amber-100 dark:border-amber-900/30 mt-2 mb-2">
                        <p className="text-[13px] md:text-[14px] text-amber-700 dark:text-amber-400 leading-relaxed font-bold text-center break-keep">
                          "이 금액은 단순한 비용이 아니라,<br/>당신이 더 가치 있게 사용할 수 있는 소중한 기회입니다."
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
                      <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-950/20 p-4 rounded-[20px] border border-red-100 dark:border-red-900/30 mb-2">
                        <p className="text-[14px] font-bold text-red-600 dark:text-red-400 text-center break-keep">
                          만족도가 낮은 서비스들을 발견했습니다.<br/>
                          <span className="font-extrabold underline underline-offset-4">아까운 비용이 매달 새어나가고 있어요.</span>
                        </p>
                      </motion.div>

                      {activeInsight.data.map(sub => (
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
                              <div className={cn("size-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary/10 shrink-0", CATEGORY_COLORS[sub.categories?.[0] || 'Etc'])}>
                                {sub.service_name[0]}
                              </div>
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
                              <p className="font-extrabold text-dark dark:text-white text-[19px]">{sub.price.toLocaleString()}원</p>
                              <p className="text-[11px] font-bold text-red-500 uppercase tracking-tight">
                                연 {(sub.price * 12).toLocaleString()}원 낭비 중
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
                      className="space-y-10 pb-20"
                    >
                      {activeInsight.data.map(group => (
                        <motion.div key={group.id} variants={itemVariants} className="space-y-4">
                          <div className="flex items-center gap-3 px-1">
                            <h4 className="font-extrabold text-[15px] text-primary uppercase tracking-wider">[{group.label}] 상세 비교</h4>
                            <div className="h-px bg-primary/10 grow" />
                            <span className="text-[12px] font-bold bg-primary/5 text-primary px-2 py-0.5 rounded-md">
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
                                  "relative flex items-center justify-between p-5 rounded-[24px] transition-all cursor-pointer group overflow-hidden",
                                  idx === 0 
                                    ? "bg-dark dark:bg-slate-700 text-white shadow-xl shadow-black/10 scale-[1.02] z-10 border-none" 
                                    : "bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                                )}
                              >
                                {idx === 0 && (
                                  <div className="absolute top-0 left-0 bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-br-xl uppercase tracking-widest">
                                    Best Choice
                                  </div>
                                )}
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "size-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0",
                                    idx === 0 ? "bg-white/10 text-white" : "bg-slate-100 dark:bg-slate-800 text-dark dark:text-white"
                                  )}>
                                    {sub.service_name[0]}
                                  </div>
                                  <div className="flex flex-col">
                                    <p className={cn(
                                      "font-extrabold text-[16px]",
                                      idx === 0 ? "text-white" : "text-dark dark:text-white"
                                    )}>
                                      {sub.service_name}
                                    </p>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateSubscription(sub.id, { is_essential: true });
                                        setActiveInsight(null);
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
                                <div className="flex flex-col items-end gap-1">
                                  <p className={cn(
                                    "font-extrabold text-[17px]",
                                    idx === 0 ? "text-white" : "text-dark dark:text-white"
                                  )}>{sub.price.toLocaleString()}원</p>
                                  <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                    idx === 0 ? "bg-white/10 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                  )}>
                                    {idx === 0 ? '유지 권장' : '해지 후보'}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Savings Summary Box */}
                          <div className="mt-6">
                            <motion.div 
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="p-5 bg-primary text-white rounded-[24px] shadow-2xl shadow-primary/30 flex items-center justify-between border border-white/10"
                            >
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none mb-1">Monthly potential saving</span>
                                <p className="text-[14px] font-bold leading-none">불필요한 중복 정리 시</p>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[24px] font-extrabold leading-none">{group.potentialSaving.toLocaleString()}</span>
                                <span className="text-[14px] font-bold">원 절약</span>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}                </div>

                {/* Modal Footer */}
                <div className="p-6 pt-0 flex justify-center shrink-0">
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
            <SectionHeader title="카테고리별 비중" />
            
            <CategoryDistributionChart 
              categoryData={categoryData}
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
            />
         </motion.div>

        {/* Subscription Table */}
        <motion.div id="step-recent" variants={itemVariants} className="flex flex-col gap-4 mt-8 w-full">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-extrabold text-dark dark:text-white">
                {selectedCategory ? `${selectedCategory} 목록` : '최근 구독 내역'}
              </h3>
            </div>
            
            {sortedSubscriptions.length > 0 ? (
              <SubscriptionTable 
                data={selectedCategory ? sortedSubscriptions : sortedSubscriptions.slice(0, 5)} 
                onRowClick={(item) => openModal(item)}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            ) : (
              <div className="w-full h-[120px] flex items-center justify-center bg-tertiary/50 dark:bg-slate-800/50 rounded-[24px] text-dark/40 dark:text-slate-500 font-extrabold">
                아직 등록된 구독 서비스가 없어요.
              </div>
            )}
            
            {!selectedCategory && (
              <motion.div className="flex justify-center w-full">
                <Link to="/list" className="mt-2 flex items-center gap-1 px-6 py-3 bg-background dark:bg-slate-700 rounded-[20px] text-dark dark:text-white font-extrabold hover:bg-tertiary dark:hover:bg-slate-600 transition-all active:scale-95 group cursor-pointer shadow-sm">
                  더 보기
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
            
            {selectedCategory && (
              <motion.div className="flex justify-center w-full">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="mt-2 flex items-center gap-1 px-6 py-3 bg-background dark:bg-slate-700 rounded-[20px] text-dark dark:text-white font-extrabold hover:bg-tertiary dark:hover:bg-slate-600 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  전체 목록 보기
                </button>
              </motion.div>
            )}
        </motion.div>

      </motion.div>
    </div>
  )
}

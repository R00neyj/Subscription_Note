import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  getDate, 
  differenceInCalendarDays, 
  startOfDay, 
  isBefore 
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Check,
  ChevronRight
} from 'lucide-react'
import { cn } from '../lib/utils'
import { getSubscriptionPaymentDateInMonth } from '../lib/dateUtils'
import { getWeeklyUpcomingPayments } from '../lib/notificationUtils'
import ServiceIcon from './ServiceIcon'
import useSubscriptionStore from '../store/useSubscriptionStore'

export default function PaymentBriefing({ 
  currentDate = new Date(),
  showDetailsList = false,
  onItemClick,
  className
}) {
  const navigate = useNavigate()
  const [briefingTab, setBriefingTab] = useState('monthly') // 'monthly' | 'weekly'
  const [monthlyFilter, setMonthlyFilter] = useState('all') // 'all' | 'remaining' | 'paid'
  const [weeklyFilter, setWeeklyFilter] = useState('all') // 'all' | 'remaining' | 'paid'
  
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item)
    } else {
      openModal(item)
    }
  }

  // Active Subscriptions
  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => sub.status === 'active')
  }, [subscriptions])

  // Monthly Payment Details
  const monthlyPaymentDetails = useMemo(() => {
    const today = startOfDay(new Date())
    const isCurrentMonthView = isSameMonth(currentDate, today)
    const isPastMonthView = isBefore(endOfMonth(currentDate), today) && !isCurrentMonthView

    return activeSubscriptions
      .map(sub => {
        const paymentDate = getSubscriptionPaymentDateInMonth(sub, currentDate)
        if (!paymentDate) return null // 이번 달에 결제 일정이 없는 연간 구독 제외

        const billingDay = getDate(paymentDate)
        const daysDiff = differenceInCalendarDays(paymentDate, today)

        let isPaid = false
        let isTodayDate = false

        if (isCurrentMonthView) {
          if (isSameDay(paymentDate, today)) {
            isTodayDate = true
            isPaid = false
          } else if (isBefore(paymentDate, today)) {
            isPaid = true
          } else {
            isPaid = false
          }
        } else if (isPastMonthView) {
          isPaid = true
        } else {
          isPaid = false
        }

        return {
          ...sub,
          paymentDate,
          billingDay,
          isPaid,
          isTodayDate,
          daysDiff
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.billingDay - b.billingDay)
  }, [activeSubscriptions, currentDate])

  // Monthly Summary Statistics
  const monthlySummary = useMemo(() => {
    const totalAmount = monthlyPaymentDetails.reduce((sum, item) => sum + item.price, 0)
    const totalCount = monthlyPaymentDetails.length

    const paidItems = monthlyPaymentDetails.filter(item => item.isPaid)
    const paidAmount = paidItems.reduce((sum, item) => sum + item.price, 0)
    const paidCount = paidItems.length

    const remainingItems = monthlyPaymentDetails.filter(item => !item.isPaid)
    const remainingAmount = remainingItems.reduce((sum, item) => sum + item.price, 0)
    const remainingCount = remainingItems.length

    const progressPercent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0

    return {
      totalAmount,
      totalCount,
      paidAmount,
      paidCount,
      remainingAmount,
      remainingCount,
      progressPercent
    }
  }, [monthlyPaymentDetails])

  // Filtered Monthly Payments
  const filteredMonthlyPayments = useMemo(() => {
    if (monthlyFilter === 'remaining') {
      return monthlyPaymentDetails.filter(item => !item.isPaid)
    }
    if (monthlyFilter === 'paid') {
      return monthlyPaymentDetails.filter(item => item.isPaid)
    }
    return monthlyPaymentDetails
  }, [monthlyPaymentDetails, monthlyFilter])

  // Weekly Upcoming Payments
  const upcomingThisWeek = useMemo(() => {
    return getWeeklyUpcomingPayments(subscriptions)
  }, [subscriptions])

  // Weekly Payment Details
  const weeklyPaymentDetails = useMemo(() => {
    const today = startOfDay(new Date())
    return upcomingThisWeek.map(sub => {
      const paymentDate = sub.thisWeekDate
      const billingDay = getDate(paymentDate)
      const daysDiff = differenceInCalendarDays(paymentDate, today)
      const isTodayDate = isSameDay(paymentDate, today)
      const isPaid = isBefore(paymentDate, today) && !isTodayDate

      return {
        ...sub,
        paymentDate,
        billingDay,
        isPaid,
        isTodayDate,
        daysDiff
      }
    }).sort((a, b) => a.paymentDate - b.paymentDate)
  }, [upcomingThisWeek])

  // Weekly Summary Statistics
  const weeklySummary = useMemo(() => {
    const totalAmount = weeklyPaymentDetails.reduce((sum, item) => sum + item.price, 0)
    const totalCount = weeklyPaymentDetails.length

    const paidItems = weeklyPaymentDetails.filter(item => item.isPaid)
    const paidAmount = paidItems.reduce((sum, item) => sum + item.price, 0)
    const paidCount = paidItems.length

    const remainingItems = weeklyPaymentDetails.filter(item => !item.isPaid)
    const remainingAmount = remainingItems.reduce((sum, item) => sum + item.price, 0)
    const remainingCount = remainingItems.length

    const progressPercent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0

    return {
      totalAmount,
      totalCount,
      paidAmount,
      paidCount,
      remainingAmount,
      remainingCount,
      progressPercent
    }
  }, [weeklyPaymentDetails])

  // Filtered Weekly Payments
  const filteredWeeklyPayments = useMemo(() => {
    if (weeklyFilter === 'remaining') {
      return weeklyPaymentDetails.filter(item => !item.isPaid)
    }
    if (weeklyFilter === 'paid') {
      return weeklyPaymentDetails.filter(item => item.isPaid)
    }
    return weeklyPaymentDetails
  }, [weeklyPaymentDetails, weeklyFilter])

  // Dynamic View Data
  const isMonthly = briefingTab === 'monthly'
  const currentSummary = isMonthly ? monthlySummary : weeklySummary
  const currentDetails = isMonthly ? filteredMonthlyPayments : filteredWeeklyPayments
  const currentFilter = isMonthly ? monthlyFilter : weeklyFilter
  const setCurrentFilter = isMonthly ? setMonthlyFilter : setWeeklyFilter
  const remainingLabel = isMonthly ? `${format(currentDate, 'M월')} 남은 결제 예정액` : '이번 주 남은 결제 예정액'
  const totalLabel = isMonthly ? '이번 달 전체' : '이번 주 전체'

  return (
    <div className={cn("w-full flex flex-col gap-3.5 md:gap-4", className)}>
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarIcon size={20} className="text-primary" />
          <h3 className="text-base md:text-lg font-bold text-dark dark:text-white">
            결제 브리핑
          </h3>
          <span className="text-[11px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            {isMonthly 
              ? format(currentDate, 'yyyy년 M월', { locale: ko }) 
              : `${format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'M.d')} - ${format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'M.d')}`
            }
          </span>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          {/* View Mode Toggle Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-0.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <button
              onClick={() => setBriefingTab('monthly')}
              className={cn(
                "px-2.5 md:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                isMonthly
                  ? "bg-white dark:bg-slate-800 text-primary shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-dark dark:hover:text-white"
              )}
            >
              이번 달
            </button>
            <button
              onClick={() => setBriefingTab('weekly')}
              className={cn(
                "px-2.5 md:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                !isMonthly
                  ? "bg-white dark:bg-slate-800 text-primary shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-dark dark:hover:text-white"
              )}
            >
              이번 주
            </button>
          </div>

          {!showDetailsList && (
            <button
              onClick={() => navigate('/calendar')}
              className="flex items-center gap-0.5 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
            >
              <span>캘린더</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Overview Card (Unified Monthly & Weekly Style) */}
      <div className="flex flex-col gap-4 w-full">
        {currentSummary.totalCount > 0 ? (
          <div className="bg-dark dark:bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
            {/* Left Area: Remaining Amount & Progress */}
            <div className="flex flex-col gap-2 min-w-[240px]">
              <div className="space-y-0.5">
                <p className="text-white/60 text-[11px] md:text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Clock size={13} className="text-primary" />
                  {remainingLabel}
                </p>
                <p className="text-[22px] md:text-3xl font-extrabold text-white whitespace-nowrap">
                  {currentSummary.remainingAmount.toLocaleString()}
                  <span className="text-base md:text-xl font-medium text-white/70 ml-1">원</span>
                </p>
              </div>

              {/* Expense Progress Bar */}
              <div className="w-full space-y-1 pt-0.5">
                <div className="flex items-center justify-between text-[10.5px] md:text-xs font-medium text-white/60">
                  <span>진행률: {currentSummary.progressPercent}% 완료</span>
                  <span>총 {currentSummary.totalAmount.toLocaleString()}원</span>
                </div>
                <div className="w-full h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${currentSummary.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Area: Stat Counters (Completed, Remaining, Total) */}
            <div className="grid grid-cols-3 gap-1.5 md:gap-2.5 shrink-0">
              {/* 1. Completed */}
              <div 
                onClick={() => showDetailsList && setCurrentFilter(currentFilter === 'paid' ? 'all' : 'paid')}
                className={cn(
                  "px-2.5 py-2 md:px-4 md:py-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                  showDetailsList ? "cursor-pointer" : "cursor-default",
                  currentFilter === 'paid' && showDetailsList
                    ? "bg-emerald-500/20 border-emerald-500/50 ring-1 ring-emerald-500/40"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-0.5 text-emerald-400">
                  <CheckCircle2 size={11} />
                  <p className="text-[9.5px] md:text-[10.5px] uppercase font-bold tracking-tight">결제 완료</p>
                </div>
                <p className="text-white font-bold text-[13px] md:text-[16px]">
                  {currentSummary.paidCount}건
                </p>
                <p className="text-white/40 text-[9.5px] md:text-[10.5px] font-medium">
                  {currentSummary.paidAmount.toLocaleString()}원
                </p>
              </div>

              {/* 2. Remaining */}
              <div 
                onClick={() => showDetailsList && setCurrentFilter(currentFilter === 'remaining' ? 'all' : 'remaining')}
                className={cn(
                  "px-2.5 py-2 md:px-4 md:py-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                  showDetailsList ? "cursor-pointer" : "cursor-default",
                  currentFilter === 'remaining' && showDetailsList
                    ? "bg-primary border-primary ring-1 ring-primary/40 shadow-xs"
                    : "bg-primary/20 border-primary/30 hover:bg-primary/30"
                )}
              >
                <div className="flex items-center gap-0.5 text-blue-300">
                  <Clock size={11} />
                  <p className="text-[9.5px] md:text-[10.5px] uppercase font-bold tracking-tight text-blue-200">남은 예정</p>
                </div>
                <p className="text-white font-bold text-[13px] md:text-[16px]">
                  {currentSummary.remainingCount}건
                </p>
                <p className="text-white/60 text-[9.5px] md:text-[10.5px] font-medium">
                  {currentSummary.remainingAmount.toLocaleString()}원
                </p>
              </div>

              {/* 3. Total */}
              <div 
                onClick={() => showDetailsList && setCurrentFilter('all')}
                className={cn(
                  "px-2.5 py-2 md:px-4 md:py-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                  showDetailsList ? "cursor-pointer" : "cursor-default",
                  currentFilter === 'all' && showDetailsList
                    ? "bg-white/15 border-white/30 ring-1 ring-white/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-0.5 text-white/50">
                  <CreditCard size={11} />
                  <p className="text-[9.5px] md:text-[10.5px] uppercase font-bold tracking-tight">{totalLabel}</p>
                </div>
                <p className="text-white font-bold text-[13px] md:text-[16px]">
                  {currentSummary.totalCount}건
                </p>
                <p className="text-white/40 text-[9.5px] md:text-[10.5px] font-medium">
                  {currentSummary.totalAmount.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full py-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium">
              {isMonthly ? '이번 달에 결제 일정이 없습니다.' : '이번 주에 예정된 결제 항목이 없습니다.'}
            </p>
          </div>
        )}

        {/* Details List (Only when showDetailsList is true) */}
        {showDetailsList && (
          <>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 px-0.5">
              <button
                onClick={() => setCurrentFilter('all')}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                  currentFilter === 'all'
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                전체 ({currentSummary.totalCount})
              </button>
              <button
                onClick={() => setCurrentFilter('remaining')}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                  currentFilter === 'remaining'
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                남은 결제 ({currentSummary.remainingCount})
              </button>
              <button
                onClick={() => setCurrentFilter('paid')}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                  currentFilter === 'paid'
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                결제 완료 ({currentSummary.paidCount})
              </button>
            </div>

            {/* Subscriptions List */}
            {currentDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full">
                {currentDetails.map((sub) => {
                  const dDayText = sub.isPaid 
                    ? '결제 완료' 
                    : sub.isTodayDate 
                      ? '오늘 결제' 
                      : sub.daysDiff === 1 
                        ? '내일 결제' 
                        : sub.daysDiff > 1 
                          ? `D-${sub.daysDiff}` 
                          : `${sub.billingDay}일 결제`

                  return (
                    <div 
                      key={sub.id}
                      onClick={() => handleItemClick(sub)}
                      className={cn(
                        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between hover:border-primary transition-all active:scale-[0.99] cursor-pointer group shadow-xs",
                        sub.isPaid && "opacity-60 grayscale-[0.6] hover:opacity-100 hover:grayscale-0 bg-slate-50/50 dark:bg-slate-900/40"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ServiceIcon 
                          serviceName={sub.service_name} 
                          category={sub.categories?.[0] || sub.category} 
                          size="md"
                          className="shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-dark dark:text-white group-hover:text-primary transition-colors text-[14.5px] truncate">
                              {sub.service_name}
                            </p>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase flex items-center gap-0.5 shrink-0",
                              sub.isTodayDate ? "bg-red-500 text-white animate-pulse" :
                              sub.isPaid ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" :
                              sub.daysDiff === 1 ? "bg-primary text-white" :
                              "bg-primary/10 text-primary"
                            )}>
                              {sub.isPaid && <Check size={10} strokeWidth={3} />}
                              {dDayText}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-slate-400 dark:text-slate-500 font-medium">
                            {format(sub.paymentDate, 'M월 d일 (EEEE)', { locale: ko })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 pl-2">
                        <p className="font-bold text-dark dark:text-white text-[14.5px]">
                          {sub.price.toLocaleString()}원
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {sub.billing_cycle === 'yearly' && (
                            <span className="text-[9.5px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1 py-0.2 rounded font-bold">
                              연간
                            </span>
                          )}
                          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[80px]">
                            {sub.payment_method}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="w-full py-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                <p className="text-slate-400 text-sm font-medium">해당하는 결제 항목이 없습니다.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

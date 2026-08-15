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

  const weeklyUpcomingTotalAmount = useMemo(() => {
    const today = startOfDay(new Date())
    return upcomingThisWeek
      .filter(sub => !isBefore(sub.thisWeekDate, today) || isSameDay(sub.thisWeekDate, today))
      .reduce((acc, sub) => acc + sub.price, 0)
  }, [upcomingThisWeek])

  const weeklyRemainingCount = useMemo(() => {
    const today = startOfDay(new Date())
    return upcomingThisWeek.filter(sub => !isBefore(sub.thisWeekDate, today) || isSameDay(sub.thisWeekDate, today)).length
  }, [upcomingThisWeek])

  return (
    <div className={cn("w-full flex flex-col gap-5", className)}>
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <CalendarIcon size={24} className="text-primary" />
          <h3 className="text-lg md:text-xl font-extrabold text-dark dark:text-white">
            결제 브리핑
          </h3>
          <span className="text-xs md:text-sm font-extrabold text-dark/40 dark:text-slate-400 bg-tertiary/60 dark:bg-slate-800 px-3 py-1 rounded-full">
            {briefingTab === 'monthly' 
              ? format(currentDate, 'yyyy년 M월', { locale: ko }) 
              : `${format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'M.d')} - ${format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'M.d')}`
            }
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* View Mode Toggle Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-tertiary dark:border-slate-800 shadow-inner">
            <button
              onClick={() => setBriefingTab('monthly')}
              className={cn(
                "px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer",
                briefingTab === 'monthly'
                  ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                  : "text-dark/50 dark:text-slate-400 hover:text-dark dark:hover:text-white"
              )}
            >
              이번 달 결제 현황
            </button>
            <button
              onClick={() => setBriefingTab('weekly')}
              className={cn(
                "px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer",
                briefingTab === 'weekly'
                  ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                  : "text-dark/50 dark:text-slate-400 hover:text-dark dark:hover:text-white"
              )}
            >
              이번 주 결제 일정
            </button>
          </div>

          {!showDetailsList && (
            <button
              onClick={() => navigate('/calendar')}
              className="flex items-center gap-1 px-3 py-1.5 md:py-2 text-xs md:text-sm font-extrabold text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"
            >
              <span>캘린더 보기</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* MONTHLY VIEW */}
      {briefingTab === 'monthly' && (
        <div className="flex flex-col gap-6 w-full">
          {/* Monthly Overview Card */}
          <div className="bg-dark dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-[28px] p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            {/* Left Area: Remaining Amount & Progress */}
            <div className="flex flex-col gap-3 min-w-[280px]">
              <div className="space-y-1">
                <p className="text-white/50 text-[12px] md:text-sm font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={15} className="text-primary" />
                  {format(currentDate, 'M월')} 남은 결제 예정액
                </p>
                <p className="text-[28px] md:text-4xl font-extrabold text-white whitespace-nowrap">
                  {monthlySummary.remainingAmount.toLocaleString()}
                  <span className="text-lg md:text-2xl font-bold text-white/70 ml-1">원</span>
                </p>
              </div>

              {/* Expense Progress Bar */}
              <div className="w-full space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] md:text-xs font-extrabold text-white/60">
                  <span>진행률: {monthlySummary.progressPercent}% 지출 완료</span>
                  <span>총 {monthlySummary.totalAmount.toLocaleString()}원</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${monthlySummary.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Area: Stat Counters (Completed, Remaining, Total) */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 shrink-0">
              {/* 1. Completed */}
              <div 
                onClick={() => showDetailsList && setMonthlyFilter(monthlyFilter === 'paid' ? 'all' : 'paid')}
                className={cn(
                  "px-3 py-3 md:px-5 md:py-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                  showDetailsList ? "cursor-pointer" : "cursor-default",
                  monthlyFilter === 'paid' && showDetailsList
                    ? "bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500/40"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={13} />
                  <p className="text-[10px] md:text-[11px] uppercase font-extrabold tracking-tighter">결제 완료</p>
                </div>
                <p className="text-white font-extrabold text-[15px] md:text-[18px]">
                  {monthlySummary.paidCount}건
                </p>
                <p className="text-white/40 text-[10px] md:text-[11px] font-bold">
                  {monthlySummary.paidAmount.toLocaleString()}원
                </p>
              </div>

              {/* 2. Remaining */}
              <div 
                onClick={() => showDetailsList && setMonthlyFilter(monthlyFilter === 'remaining' ? 'all' : 'remaining')}
                className={cn(
                  "px-3 py-3 md:px-5 md:py-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                  showDetailsList ? "cursor-pointer" : "cursor-default",
                  monthlyFilter === 'remaining' && showDetailsList
                    ? "bg-primary border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/30"
                    : "bg-primary/20 border-primary/30 hover:bg-primary/30"
                )}
              >
                <div className="flex items-center gap-1 text-blue-300">
                  <Clock size={13} />
                  <p className="text-[10px] md:text-[11px] uppercase font-extrabold tracking-tighter text-blue-200">남은 예정</p>
                </div>
                <p className="text-white font-extrabold text-[15px] md:text-[18px]">
                  {monthlySummary.remainingCount}건
                </p>
                <p className="text-white/60 text-[10px] md:text-[11px] font-bold">
                  {monthlySummary.remainingAmount.toLocaleString()}원
                </p>
              </div>

              {/* 3. Total */}
              <div 
                onClick={() => showDetailsList && setMonthlyFilter('all')}
                className={cn(
                  "px-3 py-3 md:px-5 md:py-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                  showDetailsList ? "cursor-pointer" : "cursor-default",
                  monthlyFilter === 'all' && showDetailsList
                    ? "bg-white/15 border-white/30 ring-2 ring-white/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-1 text-white/50">
                  <CreditCard size={13} />
                  <p className="text-[10px] md:text-[11px] uppercase font-extrabold tracking-tighter">이번 달 전체</p>
                </div>
                <p className="text-white font-extrabold text-[15px] md:text-[18px]">
                  {monthlySummary.totalCount}건
                </p>
                <p className="text-white/40 text-[10px] md:text-[11px] font-bold">
                  {monthlySummary.totalAmount.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>

          {/* Details List (Only when showDetailsList is true) */}
          {showDetailsList && (
            <>
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 px-1">
                <button
                  onClick={() => setMonthlyFilter('all')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold transition-all cursor-pointer",
                    monthlyFilter === 'all'
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "bg-slate-100 dark:bg-slate-800 text-dark/60 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  전체 ({monthlySummary.totalCount})
                </button>
                <button
                  onClick={() => setMonthlyFilter('remaining')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold transition-all cursor-pointer",
                    monthlyFilter === 'remaining'
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "bg-slate-100 dark:bg-slate-800 text-dark/60 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  남은 결제 ({monthlySummary.remainingCount})
                </button>
                <button
                  onClick={() => setMonthlyFilter('paid')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold transition-all cursor-pointer",
                    monthlyFilter === 'paid'
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "bg-slate-100 dark:bg-slate-800 text-dark/60 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  결제 완료 ({monthlySummary.paidCount})
                </button>
              </div>

              {/* Monthly Subscriptions List */}
              {filteredMonthlyPayments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {filteredMonthlyPayments.map((sub) => {
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
                          "bg-white dark:bg-slate-900 border border-tertiary dark:border-slate-700 rounded-[24px] p-5 flex items-center justify-between hover:border-primary dark:hover:border-primary transition-all active:scale-[0.98] cursor-pointer group shadow-sm",
                          sub.isPaid && "opacity-60 grayscale-[0.6] hover:opacity-100 hover:grayscale-0 bg-slate-50/50 dark:bg-slate-900/40"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <ServiceIcon 
                            serviceName={sub.service_name} 
                            category={sub.categories?.[0] || sub.category} 
                            size="lg"
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-dark dark:text-white group-hover:text-primary transition-colors text-lg">
                                {sub.service_name}
                              </p>
                              <span className={cn(
                                "text-[11px] px-2 py-0.5 rounded-full font-extrabold uppercase flex items-center gap-1",
                                sub.isTodayDate ? "bg-red-500 text-white animate-pulse" :
                                sub.isPaid ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400" :
                                sub.daysDiff === 1 ? "bg-primary text-white" :
                                "bg-primary/10 text-primary"
                              )}>
                                {sub.isPaid && <Check size={11} strokeWidth={3} />}
                                {dDayText}
                              </span>
                            </div>
                            <p className="text-[12px] text-dark/40 dark:text-slate-500 font-bold">
                              {format(sub.paymentDate, 'M월 d일 (EEEE)', { locale: ko })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="font-extrabold text-dark dark:text-white text-[18px]">
                            {sub.price.toLocaleString()}원
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {sub.billing_cycle === 'yearly' && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md font-extrabold">
                                연간
                              </span>
                            )}
                            <p className="text-[12px] text-dark/40 dark:text-slate-500 font-extrabold uppercase tracking-tighter">
                              {sub.payment_method}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="w-full py-12 flex items-center justify-center bg-tertiary/10 dark:bg-slate-800/20 border border-transparent dark:border-slate-700 rounded-[24px]">
                  <p className="text-dark/30 dark:text-slate-500 text-base font-extrabold">해당하는 결제 항목이 없습니다.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* WEEKLY VIEW */}
      {briefingTab === 'weekly' && (
        <div className="flex flex-col gap-6 w-full">
          {/* Weekly Summary Card */}
          {upcomingThisWeek.length > 0 ? (
            <>
              <div className="bg-dark dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-[28px] p-6 md:p-8 flex flex-row items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1 md:space-y-2">
                  <p className="text-white/50 text-[12px] md:text-sm font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={15} className="text-primary" />
                    이번 주 남은 결제 예정액
                  </p>
                  <p className="text-[24px] md:text-4xl font-extrabold text-white whitespace-nowrap">
                    {weeklyUpcomingTotalAmount.toLocaleString()}
                    <span className="text-base md:text-2xl font-bold text-white/70 ml-1">원</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                  <div className="px-3 py-2 md:px-5 md:py-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-white/30 text-[10px] md:text-[11px] uppercase font-extrabold tracking-tighter">전체</p>
                    <p className="text-white font-extrabold text-[16px] md:text-[20px]">{upcomingThisWeek.length}건</p>
                  </div>
                  <div className="px-3 py-2 md:px-5 md:py-3 bg-primary rounded-2xl text-center shadow-lg shadow-primary/20">
                    <p className="text-white/50 text-[10px] md:text-[11px] uppercase font-extrabold tracking-tighter">남은 건수</p>
                    <p className="text-white font-extrabold text-[16px] md:text-[20px]">
                      {weeklyRemainingCount}건
                    </p>
                  </div>
                </div>
              </div>

              {/* Upcoming Subscriptions List (Only when showDetailsList is true) */}
              {showDetailsList && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {upcomingThisWeek.map((sub) => {
                    const today = startOfDay(new Date())
                    const daysDiff = differenceInCalendarDays(sub.thisWeekDate, today)
                    const isPast = isBefore(sub.thisWeekDate, today) && !isSameDay(sub.thisWeekDate, today)
                    
                    let dDayText = daysDiff === 0 ? '오늘' : daysDiff === 1 ? '내일' : daysDiff < 0 ? '완료' : `${daysDiff}일 후`
                    
                    return (
                      <div 
                        key={sub.id}
                        onClick={() => handleItemClick(sub)}
                        className={cn(
                          "bg-white dark:bg-slate-900 border border-tertiary dark:border-slate-700 rounded-[24px] p-5 flex items-center justify-between hover:border-primary dark:hover:border-primary transition-all active:scale-[0.98] cursor-pointer group shadow-sm",
                          isPast && "opacity-50 grayscale-[0.8]"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <ServiceIcon 
                            serviceName={sub.service_name} 
                            category={sub.categories?.[0] || sub.category} 
                            size="lg"
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-dark dark:text-white group-hover:text-primary transition-colors text-lg">
                                {sub.service_name}
                              </p>
                              <span className={cn(
                                "text-[11px] px-2 py-0.5 rounded-full font-extrabold uppercase",
                                daysDiff === 0 ? "bg-red-500 text-white animate-pulse" : 
                                isPast ? "bg-slate-200 dark:bg-slate-800 text-slate-500" :
                                "bg-primary/10 text-primary"
                              )}>
                                {dDayText}
                              </span>
                            </div>
                            <p className="text-[12px] text-dark/40 dark:text-slate-500 font-bold">
                              {format(sub.thisWeekDate, 'M월 d일 (EEEE)', { locale: ko })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="font-extrabold text-dark dark:text-white text-[18px]">
                            {sub.price.toLocaleString()}원
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {sub.billing_cycle === 'yearly' && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md font-extrabold">
                                연간
                              </span>
                            )}
                            <p className="text-[12px] text-dark/40 dark:text-slate-500 font-extrabold uppercase tracking-tighter">
                              {sub.payment_method}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="w-full py-12 flex items-center justify-center bg-tertiary/10 dark:bg-slate-800/20 border border-transparent dark:border-slate-700 rounded-[24px]">
              <p className="text-dark/30 dark:text-slate-500 text-base font-extrabold">이번 주에 예정된 결제 항목이 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

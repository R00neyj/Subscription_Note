import { useState, useMemo } from 'react'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  getDate, 
  getDaysInMonth,
  isToday, 
  differenceInCalendarDays, 
  startOfDay, 
  isBefore
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Check
} from 'lucide-react'
import { cn } from '../lib/utils'
import { extractDayFromBillingDate } from '../lib/dateUtils'
import { getWeeklyUpcomingPayments } from '../lib/notificationUtils'

import Header from '../components/Header'
import SectionHeader from '../components/SectionHeader'
import ServiceIcon from '../components/ServiceIcon'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORY_COLORS } from '../constants/categories'

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [briefingTab, setBriefingTab] = useState('monthly') // 'monthly' | 'weekly'
  const [monthlyFilter, setMonthlyFilter] = useState('all') // 'all' | 'remaining' | 'paid'
  
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  // Calendar Logic
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  // Get active subscriptions and group them by billing day
  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => sub.status === 'active')
  }, [subscriptions])

  const getSubscriptionsForDay = (day) => {
    const dayNum = getDate(day)
    return activeSubscriptions.filter(sub => extractDayFromBillingDate(sub.billing_date) === dayNum)
  }

  // Monthly Payment Details & Status Calculation
  const monthlyPaymentDetails = useMemo(() => {
    const today = startOfDay(new Date())
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInCurrentMonth = getDaysInMonth(currentDate)
    const isCurrentMonthView = isSameMonth(currentDate, today)
    const isPastMonthView = isBefore(endOfMonth(currentDate), today) && !isCurrentMonthView

    return activeSubscriptions.map(sub => {
      const rawDay = extractDayFromBillingDate(sub.billing_date) || 1
      const billingDay = Math.min(rawDay, daysInCurrentMonth)
      const paymentDate = startOfDay(new Date(year, month, billingDay))
      const daysDiff = differenceInCalendarDays(paymentDate, today)

      let isPaid = false
      let isTodayDate = false

      if (isCurrentMonthView) {
        if (isSameDay(paymentDate, today)) {
          isTodayDate = true
          isPaid = false // 오늘 결제 예정 항목으로 집계
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
    }).sort((a, b) => a.billingDay - b.billingDay)
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

  // Filtered Monthly Payment List
  const filteredMonthlyPayments = useMemo(() => {
    if (monthlyFilter === 'remaining') {
      return monthlyPaymentDetails.filter(item => !item.isPaid)
    }
    if (monthlyFilter === 'paid') {
      return monthlyPaymentDetails.filter(item => item.isPaid)
    }
    return monthlyPaymentDetails
  }, [monthlyPaymentDetails, monthlyFilter])

  // Calculate payments for the current week (Monday to Sunday) using shared logic
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
    <div className="flex flex-col min-h-full">
      <Header />
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:rounded-[48px] px-0 py-4 md:p-8 flex flex-col gap-6 items-start w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <SectionHeader title="결제 달력" />

        {/* Calendar Container */}
        <div className="w-full bg-white dark:bg-slate-900 md:bg-background md:dark:bg-slate-900 border border-primary/20 dark:border-slate-700 rounded-[32px] overflow-hidden shadow-sm">
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between py-4 px-6 border-b border-tertiary dark:border-slate-800">
            <h2 className="text-xl md:text-2xl font-extrabold text-dark dark:text-white">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-tertiary dark:hover:bg-slate-800 rounded-full transition-all active:scale-90 cursor-pointer text-dark dark:text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-1.5 text-sm font-extrabold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-all active:scale-95 cursor-pointer"
              >
                오늘
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-tertiary dark:hover:bg-slate-800 rounded-full transition-all active:scale-90 cursor-pointer text-dark dark:text-white"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Weekdays Header */}
          <div className="grid grid-cols-7 border-b border-tertiary dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            {WEEK_DAYS.map((day, i) => (
              <div 
                key={day} 
                className={cn(
                  "py-4 text-center text-sm font-extrabold",
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-dark/40 dark:text-slate-500"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const isSelected = isSameDay(day, selectedDate)
              const isCurrentMonth = isSameMonth(day, monthStart)
              const isTodayDate = isToday(day)

              return (
                <div 
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[100px] md:min-h-[140px] p-2 border-b border-r border-tertiary dark:border-slate-800 cursor-pointer transition-all hover:bg-tertiary/30 dark:hover:bg-slate-800/50 flex flex-col items-start gap-1 relative group",
                    (i + 1) % 7 === 0 && "border-r-0",
                    !isCurrentMonth && "opacity-20 grayscale",
                    isSelected && "bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  <span className={cn(
                    "size-8 flex items-center justify-center text-sm font-extrabold rounded-full transition-all",
                    isTodayDate ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-dark dark:text-white",
                    isSelected && !isTodayDate && "ring-2 ring-primary bg-white dark:bg-slate-800"
                  )}>
                    {getDate(day)}
                  </span>
                  
                  {/* Subscription Items (Step 3) */}
                  <div className="w-full flex flex-col items-center md:items-start gap-1.5 mt-1 overflow-hidden">
                    {getSubscriptionsForDay(day).slice(0, 3).map((sub) => (
                      <div 
                        key={sub.id} 
                        className="flex items-center justify-center md:justify-start gap-1.5 w-full transition-transform group-hover:translate-x-0.5"
                      >
                        <div className={cn(
                          "size-2 md:size-2.5 rounded-full shrink-0 shadow-sm",
                          CATEGORY_COLORS[sub.categories?.[0] || sub.category] || CATEGORY_COLORS.Etc
                        )} />
                        <span className="hidden md:block text-[12px] font-extrabold text-dark/70 dark:text-slate-400 truncate">
                          {sub.service_name}
                        </span>
                      </div>
                    ))}
                    {getSubscriptionsForDay(day).length > 3 && (
                      <p className="text-[12px] font-extrabold text-dark/30 dark:text-slate-500 md:pl-1 text-center md:text-left">
                        + {getSubscriptionsForDay(day).length - 3}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Date Info (Step 4) */}
        <div className="w-full mt-6 flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between gap-2 px-2">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
              <h3 className="text-lg md:text-xl font-extrabold text-dark dark:text-white whitespace-nowrap">
                {format(selectedDate, 'M월 d일', { locale: ko })} 결제 예정
              </h3>
              <span className="text-[12px] md:text-sm font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                총 {getSubscriptionsForDay(selectedDate).length}건
              </span>
            </div>
            
            <button 
              onClick={() => openModal({ billing_date: `${getDate(selectedDate)}` })}
              className="h-[44px] md:h-[52px] px-5 md:px-8 bg-primary text-white rounded-[16px] md:rounded-[20px] flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer group active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-90" />
              <span className="font-extrabold text-[14px] md:text-[16px] whitespace-nowrap">이 날짜에 추가</span>
            </button>
          </div>

          {getSubscriptionsForDay(selectedDate).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {getSubscriptionsForDay(selectedDate).map((sub) => (
                <div 
                  key={sub.id} 
                  onClick={() => openModal(sub)}
                  className="bg-white dark:bg-slate-900 border border-tertiary dark:border-slate-700 rounded-[24px] p-4 flex items-center justify-between hover:border-primary dark:hover:border-primary transition-all active:scale-[0.98] cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <ServiceIcon 
                      serviceName={sub.service_name} 
                      category={sub.categories?.[0] || sub.category} 
                      size="md"
                    />
                    <div className="flex flex-col">
                      <p className="font-extrabold text-dark dark:text-white group-hover:text-primary transition-colors">
                        {sub.service_name}
                      </p>
                      <p className="text-xs text-dark/40 dark:text-slate-500 font-bold uppercase tracking-tighter">
                        {sub.categories?.[0] || sub.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-extrabold text-dark dark:text-white">
                      {sub.price.toLocaleString()}원
                    </p>
                    <p className="text-[12px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-extrabold">
                      {sub.payment_method}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Daily Total Summary Card */}
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/40 rounded-[24px] p-4 md:p-5 flex items-center justify-between">
                <p className="font-extrabold text-primary">이날의 합계</p>
                <p className="text-xl md:text-2xl font-extrabold text-primary">
                  {getSubscriptionsForDay(selectedDate).reduce((acc, sub) => acc + sub.price, 0).toLocaleString()}원
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full py-16 flex flex-col items-center justify-center gap-2 bg-tertiary/10 dark:bg-slate-800/20 rounded-[32px] border-2 border-dashed border-tertiary dark:border-slate-800">
              <p className="text-dark/30 dark:text-slate-500 font-extrabold text-lg">결제 예정된 항목이 없습니다.</p>
            </div>
          )}
        </div>

        {/* Payment Briefing Section (Monthly / Weekly Toggle) */}
        <div className="w-full mt-8 flex flex-col gap-6 border-t border-tertiary dark:border-slate-700 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-2.5">
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

            {/* View Mode Toggle Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-tertiary dark:border-slate-800 self-start sm:self-auto shadow-inner">
              <button
                onClick={() => setBriefingTab('monthly')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer",
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
                  "px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer",
                  briefingTab === 'weekly'
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                    : "text-dark/50 dark:text-slate-400 hover:text-dark dark:hover:text-white"
                )}
              >
                이번 주 결제 일정
              </button>
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
                    onClick={() => setMonthlyFilter(monthlyFilter === 'paid' ? 'all' : 'paid')}
                    className={cn(
                      "px-3 py-3 md:px-5 md:py-4 rounded-2xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5",
                      monthlyFilter === 'paid'
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
                    onClick={() => setMonthlyFilter(monthlyFilter === 'remaining' ? 'all' : 'remaining')}
                    className={cn(
                      "px-3 py-3 md:px-5 md:py-4 rounded-2xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5",
                      monthlyFilter === 'remaining'
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
                    onClick={() => setMonthlyFilter('all')}
                    className={cn(
                      "px-3 py-3 md:px-5 md:py-4 rounded-2xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5",
                      monthlyFilter === 'all'
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
                        onClick={() => openModal(sub)}
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
                          <p className="text-[12px] text-dark/40 dark:text-slate-500 font-extrabold uppercase tracking-tighter">
                            {sub.payment_method}
                          </p>
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

                  {/* Upcoming Subscriptions List - Vertical on Mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {upcomingThisWeek.map((sub) => {
                      const today = startOfDay(new Date())
                      const daysDiff = differenceInCalendarDays(sub.thisWeekDate, today)
                      const isPast = isBefore(sub.thisWeekDate, today) && !isSameDay(sub.thisWeekDate, today)
                      
                      let dDayText = daysDiff === 0 ? '오늘' : daysDiff === 1 ? '내일' : daysDiff < 0 ? '완료' : `${daysDiff}일 후`
                      
                      return (
                        <div 
                          key={sub.id}
                          onClick={() => openModal(sub)}
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
                            <p className="text-[12px] text-dark/40 dark:text-slate-500 font-extrabold uppercase tracking-tighter">
                              {sub.payment_method}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="w-full py-12 flex items-center justify-center bg-tertiary/10 dark:bg-slate-800/20 border border-transparent dark:border-slate-700 rounded-[24px]">
                  <p className="text-dark/30 dark:text-slate-500 text-base font-extrabold">이번 주에 예정된 결제 항목이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



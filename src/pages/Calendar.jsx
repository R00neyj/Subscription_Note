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
  isToday,
  differenceInCalendarDays,
  startOfDay,
  isBefore
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'
import { cn } from '../lib/utils'
import { extractDayFromBillingDate, getNextPaymentDate } from '../lib/dateUtils'
import { getWeeklyUpcomingPayments } from '../lib/notificationUtils'
import Header from '../components/Header'
import SectionHeader from '../components/SectionHeader'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORY_COLORS } from '../constants/categories'

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  
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

  // Calculate payments for the current week (Monday to Sunday) using shared logic
  const upcomingThisWeek = useMemo(() => {
    return getWeeklyUpcomingPayments(subscriptions)
  }, [subscriptions])

  const upcomingTotalAmount = useMemo(() => {
    const today = startOfDay(new Date())
    return upcomingThisWeek
      .filter(sub => !isBefore(sub.thisWeekDate, today) || isSameDay(sub.thisWeekDate, today))
      .reduce((acc, sub) => acc + sub.price, 0)
  }, [upcomingThisWeek])

  const remainingCount = useMemo(() => {
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
                    <div className={cn(
                      "size-10 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary/10",
                      CATEGORY_COLORS[sub.categories?.[0] || sub.category] || CATEGORY_COLORS.Etc
                    )}>
                      {sub.service_name[0].toUpperCase()}
                    </div>
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

        {/* Upcoming This Week (Step 5) - Fixed to Mon-Sun */}
        <div className="w-full mt-8 flex flex-col gap-6 border-t border-tertiary dark:border-slate-700 pt-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <CalendarIcon size={24} className="text-primary" />
              <h3 className="text-lg md:text-xl font-extrabold text-dark dark:text-white">
                이번 주 결제 일정
              </h3>
            </div>
            <span className="text-sm font-extrabold text-dark/40 dark:text-slate-500 bg-tertiary dark:bg-slate-800 px-3 py-1 rounded-full">
              {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'M.d')} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'M.d')}
            </span>
          </div>

          {upcomingThisWeek.length > 0 ? (
            <div className="flex flex-col gap-6 w-full">
              {/* Weekly Summary Card */}
              <div className="bg-dark dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-[28px] p-6 md:p-8 flex flex-row items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1 md:space-y-2">
                  <p className="text-white/50 text-[12px] md:text-sm font-extrabold uppercase tracking-widest">이번 주 남은 결제 예정액</p>
                  <p className="text-[24px] md:text-4xl font-extrabold text-white whitespace-nowrap">
                    {upcomingTotalAmount.toLocaleString()}원
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
                      {remainingCount}건
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
                        <div className={cn(
                          "size-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-primary/5",
                          CATEGORY_COLORS[sub.categories?.[0] || sub.category] || CATEGORY_COLORS.Etc
                        )}>
                          {sub.service_name[0].toUpperCase()}
                        </div>
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
            </div>
          ) : (
            <div className="w-full py-12 flex items-center justify-center bg-tertiary/10 dark:bg-slate-800/20 border border-transparent dark:border-slate-700 rounded-[24px]">
              <p className="text-dark/30 dark:text-slate-500 text-base font-extrabold">이번 주에 예정된 결제 항목이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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
import Header from '../components/Header'
import SectionHeader from '../components/SectionHeader'
import useSubscriptionStore from '../store/useSubscriptionStore'

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']

const CATEGORY_COLORS = {
  OTT: 'bg-[#2563EB]',
  Work: 'bg-[#64748B]',
  Music: 'bg-[#FFD233]',
  Shopping: 'bg-[#FF5E57]',
  Cloud: 'bg-[#33D9B2]',
  Etc: 'bg-[#A0AEC0]'
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)

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

  // Calculate payments for the current week (Monday to Sunday)
  const upcomingThisWeek = useMemo(() => {
    const today = startOfDay(new Date())
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 })     // Sunday
    
    const weekInterval = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    return activeSubscriptions
      .map(sub => {
        const billingDay = extractDayFromBillingDate(sub.billing_date)
        // Find if the billing day falls within any date of the current week
        const matchDate = weekInterval.find(date => getDate(date) === billingDay)
        
        return {
          ...sub,
          thisWeekDate: matchDate ? startOfDay(matchDate) : null
        }
      })
      .filter(sub => sub.thisWeekDate !== null)
      .sort((a, b) => a.thisWeekDate - b.thisWeekDate)
  }, [activeSubscriptions])

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
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:rounded-[48px] px-0 md:p-[42px] flex flex-col gap-[24px] items-start w-full transition-colors duration-300">
        <SectionHeader title="결제 달력" />

        {/* Calendar Container */}
        <div className="w-full bg-white dark:bg-slate-900 md:bg-background md:dark:bg-slate-900 border border-primary dark:border-slate-700 rounded-[32px] overflow-hidden">
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between py-3 px-6 border-b border-tertiary dark:border-slate-800">
            <h2 className="text-xl md:text-2xl font-bold text-dark dark:text-white">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-tertiary dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-dark dark:text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
              >
                오늘
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-tertiary dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-dark dark:text-white"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Weekdays Header */}
          <div className="grid grid-cols-7 border-b border-tertiary dark:border-slate-800">
            {WEEK_DAYS.map((day, i) => (
              <div 
                key={day} 
                className={cn(
                  "py-4 text-center text-sm font-bold",
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
                    "min-h-[100px] md:min-h-[120px] p-2 border-b border-r border-tertiary dark:border-slate-800 cursor-pointer transition-all hover:bg-tertiary/30 dark:hover:bg-slate-800/50 flex flex-col items-start gap-1 relative",
                    (i + 1) % 7 === 0 && "border-r-0",
                    !isCurrentMonth && "opacity-20 grayscale",
                    isSelected && "bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  <span className={cn(
                    "size-8 flex items-center justify-center text-sm font-bold rounded-full transition-all",
                    isTodayDate ? "bg-primary text-white" : "text-dark dark:text-white",
                    isSelected && !isTodayDate && "ring-2 ring-primary"
                  )}>
                    {getDate(day)}
                  </span>
                  
                  {/* Subscription Items (Step 3) */}
                  <div className="w-full flex flex-col items-center md:items-start gap-1 overflow-hidden">
                    {getSubscriptionsForDay(day).slice(0, 3).map((sub) => (
                      <div 
                        key={sub.id} 
                        className="flex items-center justify-center md:justify-start gap-1 w-full"
                      >
                        <div className={cn(
                          "size-2 md:size-2.5 rounded-full shrink-0",
                          CATEGORY_COLORS[sub.categories?.[0] || sub.category] || CATEGORY_COLORS.Etc
                        )} />
                        <span className="hidden md:block text-[12px] font-bold text-dark/70 dark:text-slate-400 truncate">
                          {sub.service_name}
                        </span>
                      </div>
                    ))}
                    {getSubscriptionsForDay(day).length > 3 && (
                      <p className="text-[12px] font-bold text-dark/30 dark:text-slate-500 md:pl-1 text-center md:text-left">
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
        <div className="w-full mt-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg md:text-xl font-bold text-dark dark:text-white">
                {format(selectedDate, 'M월 d일', { locale: ko })} 결제 예정
              </h3>
              <span className="text-sm font-bold text-dark/40 dark:text-slate-500 bg-tertiary dark:bg-slate-800 px-2 py-0.5 rounded-full">
                총 {getSubscriptionsForDay(selectedDate).length}건
              </span>
            </div>
            
            <button 
              onClick={() => useSubscriptionStore.getState().openModal({ billing_date: `${getDate(selectedDate)}` })}
              className="h-[48px] px-6 bg-primary text-white rounded-[16px] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 cursor-pointer group active:scale-95 self-start md:self-auto"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              <span className="font-bold text-[14px] md:text-[15px]">이 날짜에 구독 추가하기</span>
            </button>
          </div>

          {getSubscriptionsForDay(selectedDate).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
              {getSubscriptionsForDay(selectedDate).map((sub) => (
                <div 
                  key={sub.id}
                  onClick={() => useSubscriptionStore.getState().openModal(sub)}
                  className="bg-white dark:bg-slate-900 border border-tertiary dark:border-slate-700 rounded-[20px] p-4 flex items-center justify-between hover:border-primary dark:hover:border-primary transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "size-10 rounded-xl flex items-center justify-center text-white font-bold text-lg",
                      CATEGORY_COLORS[sub.categories?.[0] || sub.category] || CATEGORY_COLORS.Etc
                    )}>
                      {sub.service_name[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-dark dark:text-white group-hover:text-primary transition-colors">
                        {sub.service_name}
                      </p>
                      <p className="text-xs text-dark/40 dark:text-slate-500 font-medium">
                        {sub.categories?.[0] || sub.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-bold text-dark dark:text-white">
                      {sub.price.toLocaleString()}원
                    </p>
                    <p className="text-[12px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">
                      {sub.payment_method}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Daily Total Summary Card */}
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/40 rounded-[20px] p-4 flex items-center justify-between">
                <p className="font-bold text-primary dark:text-primary-light">이날의 합계</p>
                <p className="text-xl font-black text-primary dark:text-primary-light">
                  {getSubscriptionsForDay(selectedDate).reduce((acc, sub) => acc + sub.price, 0).toLocaleString()}원
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-tertiary/20 dark:bg-slate-800/30 rounded-[32px] border-2 border-dashed border-tertiary dark:border-slate-800">
              <p className="text-dark/40 dark:text-slate-500 font-bold">이날은 결제 예정된 항목이 없습니다.</p>
            </div>
          )}
        </div>

        {/* Upcoming This Week (Step 5) - Fixed to Mon-Sun */}
        <div className="w-full mt-8 flex flex-col gap-4 border-t border-tertiary dark:border-slate-700 pt-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <CalendarIcon size={20} className="text-primary" />
              <h3 className="text-lg md:text-xl font-bold text-dark dark:text-white">
                이번 주 결제 일정
              </h3>
            </div>
            <span className="text-sm font-bold text-dark/40 dark:text-slate-500">
              {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'M.d')} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'M.d')}
            </span>
          </div>

          {upcomingThisWeek.length > 0 ? (
            <div className="flex flex-col gap-4 w-full">
              {/* Weekly Summary Card */}
              <div className="bg-dark dark:bg-slate-950 border border-transparent dark:border-slate-700 rounded-[24px] p-5 md:p-6 flex flex-row items-center justify-between gap-2 md:gap-4">
                <div className="space-y-0.5 md:space-y-1">
                  <p className="text-white/60 text-[11px] md:text-sm font-medium">이번 주 남은 결제 예정액</p>
                  <p className="text-[20px] md:text-3xl font-black text-white whitespace-nowrap">
                    {upcomingTotalAmount.toLocaleString()}원
                  </p>
                </div>
                <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                  <div className="px-2.5 py-1.5 md:px-4 md:py-2 bg-white/10 rounded-xl border border-white/5 text-center">
                    <p className="text-white/40 text-[12px] md:text-[10px] uppercase font-bold tracking-wider">전체</p>
                    <p className="text-white font-bold text-[15px] md:text-lg">{upcomingThisWeek.length}건</p>
                  </div>
                  <div className="px-2.5 py-1.5 md:px-4 md:py-2 bg-primary rounded-xl text-center">
                    <p className="text-white/60 text-[12px] md:text-[10px] uppercase font-bold tracking-wider">남은 건수</p>
                    <p className="text-white font-bold text-[15px] md:text-lg">
                      {remainingCount}건
                    </p>
                  </div>
                </div>
              </div>

              {/* Upcoming Subscriptions List - Vertical on Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                {upcomingThisWeek.map((sub) => {
                  const today = startOfDay(new Date())
                  const daysDiff = differenceInCalendarDays(sub.thisWeekDate, today)
                  const isPast = isBefore(sub.thisWeekDate, today) && !isSameDay(sub.thisWeekDate, today)
                  
                  let dDayText = daysDiff === 0 ? '오늘' : daysDiff === 1 ? '내일' : daysDiff < 0 ? '완료' : `${daysDiff}일 후`
                  
                  return (
                    <div 
                      key={sub.id}
                      onClick={() => useSubscriptionStore.getState().openModal(sub)}
                      className={cn(
                        "bg-white dark:bg-slate-900 border border-tertiary dark:border-slate-700 rounded-[20px] p-4 flex items-center justify-between hover:border-primary dark:hover:border-primary transition-all cursor-pointer group",
                        isPast && "opacity-50 grayscale-[0.5]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-10 rounded-xl flex items-center justify-center text-white font-bold text-lg",
                          CATEGORY_COLORS[sub.categories?.[0] || sub.category] || CATEGORY_COLORS.Etc
                        )}>
                          {sub.service_name[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-dark dark:text-white group-hover:text-primary transition-colors">
                              {sub.service_name}
                            </p>
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold",
                              daysDiff === 0 ? "bg-red-500 text-white" : 
                              isPast ? "bg-slate-200 dark:bg-slate-700 text-slate-500" :
                              "bg-primary/10 text-primary"
                            )}>
                              {dDayText}
                            </span>
                          </div>
                          <p className="text-xs text-dark/40 dark:text-slate-500 font-medium">
                            {format(sub.thisWeekDate, 'M월 d일 (EEEE)', { locale: ko })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="font-bold text-dark dark:text-white">
                          {sub.price.toLocaleString()}원
                        </p>
                        <p className="text-[12px] text-dark/40 dark:text-slate-500 font-medium">
                          {sub.payment_method}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="w-full py-8 flex items-center justify-center bg-tertiary/10 dark:bg-slate-800/20 border border-transparent dark:border-slate-700 rounded-[20px]">
              <p className="text-dark/40 dark:text-slate-500 text-sm font-medium">이번 주에 예정된 결제 항목이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

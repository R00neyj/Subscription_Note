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
import { isSubscriptionDueOnDate, getSubscriptionPaymentDateInMonth } from '../lib/dateUtils'
import { getWeeklyUpcomingPayments } from '../lib/notificationUtils'

import Header from '../components/Header'
import SectionHeader from '../components/SectionHeader'
import ServiceIcon from '../components/ServiceIcon'
import PaymentBriefing from '../components/PaymentBriefing'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORY_COLORS } from '../constants/categories'
import EmptyState from '../components/EmptyState'

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
    return activeSubscriptions.filter(sub => isSubscriptionDueOnDate(sub, day))
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-900 rounded-2xl md:rounded-3xl px-0 py-2 md:p-6 flex flex-col gap-4 md:gap-6 items-start w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <SectionHeader title="결제 달력" />

        {/* Calendar Container */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between py-3 px-4 md:px-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg md:text-xl font-bold text-dark dark:text-white">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h2>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={prevMonth}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-90 cursor-pointer text-dark dark:text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all active:scale-95 cursor-pointer"
              >
                오늘
              </button>
              <button 
                onClick={nextMonth}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-90 cursor-pointer text-dark dark:text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Weekdays Header */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
            {WEEK_DAYS.map((day, i) => (
              <div 
                key={day} 
                className={cn(
                  "py-2.5 text-center text-[12px] md:text-xs font-bold",
                  // 다크에서는 한 단계 밝은 쪽으로 간다. slate-500 은 slate-900 배경에서
                  // 대비 3.75:1 로 WCAG AA(4.5:1) 에 못 미쳐 회색으로 뭉개져 보였다.
                  i === 0 ? "text-red-500 dark:text-red-400"
                    : i === 6 ? "text-blue-500 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400"
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
                    "min-h-[64px] md:min-h-[96px] p-1.5 md:p-2 border-b border-r border-slate-100 dark:border-slate-800/80 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col items-start gap-0.5 relative group",
                    (i + 1) % 7 === 0 && "border-r-0",
                    !isCurrentMonth && "opacity-25 grayscale",
                    isSelected && "bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  <span className={cn(
                    "size-5 md:size-6 flex items-center justify-center text-[11px] md:text-xs font-bold rounded-full transition-all",
                    isTodayDate ? "bg-primary text-white shadow-xs" : "text-dark dark:text-white",
                    isSelected && !isTodayDate && "ring-1.5 ring-primary bg-white dark:bg-slate-800"
                  )}>
                    {getDate(day)}
                  </span>
                  
                  {/* Subscription Items */}
                  <div className="w-full flex flex-col items-center md:items-start gap-1 mt-0.5 overflow-hidden">
                    {getSubscriptionsForDay(day).slice(0, 2).map((sub) => (
                      <div 
                        key={sub.id} 
                        className="flex items-center justify-center md:justify-start gap-1 w-full"
                      >
                        <div className={cn(
                          "size-1.5 md:size-2 rounded-full shrink-0",
                          CATEGORY_COLORS[sub.categories?.[0] || sub.category] || CATEGORY_COLORS.Etc
                        )} />
                        <span className="hidden md:block text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                          {sub.service_name}
                        </span>
                      </div>
                    ))}
                    {getSubscriptionsForDay(day).length > 2 && (
                      <p className="text-[10px] font-bold text-slate-400 md:pl-0.5 text-center md:text-left">
                        +{getSubscriptionsForDay(day).length - 2}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Date Info */}
        <div className="w-full mt-2 flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between gap-2 px-1">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              <h3 className="text-base md:text-lg font-bold text-dark dark:text-white whitespace-nowrap">
                {format(selectedDate, 'M월 d일', { locale: ko })} 결제 예정
              </h3>
              <span className="text-[11px] md:text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full w-fit">
                총 {getSubscriptionsForDay(selectedDate).length}건
              </span>
            </div>
            
            <button 
              onClick={() => openModal({ billing_date: `${getDate(selectedDate)}` })}
              className="h-[36px] md:h-[38px] px-3.5 md:px-4 bg-primary text-white rounded-xl flex items-center justify-center gap-1 hover:bg-primary/90 transition-all shadow-xs shadow-primary/20 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
              <span className="font-bold text-[13px] md:text-[13.5px] whitespace-nowrap">추가</span>
            </button>
          </div>

          {getSubscriptionsForDay(selectedDate).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
              {getSubscriptionsForDay(selectedDate).map((sub) => (
                <div 
                  key={sub.id} 
                  onClick={() => openModal(sub)}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between hover:border-primary transition-all active:scale-[0.99] cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ServiceIcon 
                      serviceName={sub.service_name} 
                      category={sub.categories?.[0] || sub.category} 
                      size="md"
                      className="shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <p className="font-bold text-dark dark:text-white group-hover:text-primary transition-colors text-[14px] truncate">
                        {sub.service_name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {sub.categories?.[0] || sub.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <p className="font-bold text-dark dark:text-white text-[14px]">
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
              ))}
              
              {/* Daily Total Summary Card */}
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between">
                <p className="font-bold text-[13.5px] text-primary">이날의 합계</p>
                <p className="text-base md:text-lg font-extrabold text-primary">
                  {getSubscriptionsForDay(selectedDate).reduce((acc, sub) => acc + sub.price, 0).toLocaleString()}원
                </p>
              </div>
            </div>
          ) : (
            <EmptyState message="결제 예정된 항목이 없습니다." />
          )}
        </div>

        {/* Payment Briefing Section (Monthly / Weekly Toggle with Details List) */}
        <PaymentBriefing 
          currentDate={currentDate} 
          showDetailsList={true} 
          className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-6"
        />
      </div>
    </div>
  )
}



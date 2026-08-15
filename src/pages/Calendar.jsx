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
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {sub.billing_cycle === 'yearly' && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md font-extrabold">
                          연간
                        </span>
                      )}
                      <p className="text-[12px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-extrabold">
                        {sub.payment_method}
                      </p>
                    </div>
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

        {/* Payment Briefing Section (Monthly / Weekly Toggle with Details List) */}
        <PaymentBriefing 
          currentDate={currentDate} 
          showDetailsList={true} 
          className="mt-8 border-t border-tertiary dark:border-slate-700 pt-8"
        />
      </div>
    </div>
  )
}



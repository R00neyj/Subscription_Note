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
  isToday
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { extractDayFromBillingDate } from '../lib/dateUtils'
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
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg md:text-xl font-bold text-dark dark:text-white">
              {format(selectedDate, 'M월 d일', { locale: ko })} 결제 예정
            </h3>
            <span className="text-sm font-bold text-dark/40 dark:text-slate-500">
              총 {getSubscriptionsForDay(selectedDate).length}건
            </span>
          </div>

          {getSubscriptionsForDay(selectedDate).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
              {getSubscriptionsForDay(selectedDate).map((sub) => (
                <div 
                  key={sub.id}
                  onClick={() => useSubscriptionStore.getState().openModal(sub)}
                  className="bg-white dark:bg-slate-900 border border-tertiary dark:border-slate-800 rounded-[20px] p-4 flex items-center justify-between hover:border-primary dark:hover:border-primary transition-all cursor-pointer group"
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
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[20px] p-4 flex items-center justify-between">
                <p className="font-bold text-primary">이날의 합계</p>
                <p className="text-xl font-black text-primary">
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
      </div>
    </div>
  )
}
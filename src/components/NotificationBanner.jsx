import { useState, useEffect } from 'react'
import { X, BellRing } from 'lucide-react'
import { checkUpcomingPayments, requestNotificationPermission, sendBrowserNotification } from '../lib/notificationUtils'
import useSubscriptionStore from '../store/useSubscriptionStore'

export default function NotificationBanner() {
  const [upcomingItems, setUpcomingItems] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const notificationsEnabled = useSubscriptionStore((state) => state.notificationsEnabled)

  useEffect(() => {
    if (!notificationsEnabled) return

    const items = checkUpcomingPayments(subscriptions)
    setUpcomingItems(items)

    // 하루에 한 번만 체크 및 알림
    const lastCheck = localStorage.getItem('lastNotificationCheck')
    const today = new Date().toDateString()

    if (items.length > 0 && lastCheck !== today) {
      setIsVisible(true)
      localStorage.setItem('lastNotificationCheck', today)
      
      // 브라우저 알림 시도
      requestNotificationPermission().then(granted => {
        if (granted) {
          sendBrowserNotification(items)
        }
      })
    }
  }, [subscriptions])

  if (!isVisible || upcomingItems.length === 0) return null

  const totalAmount = upcomingItems.reduce((acc, item) => acc + item.price, 0)

  return (
    <div className="fixed top-20 right-4 md:right-8 z-50 animate-in slide-in-from-top-5 duration-500">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-primary/20 dark:border-primary/30 rounded-2xl shadow-lg shadow-primary/10 p-4 w-[calc(100vw-32px)] md:w-[360px] flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-full shrink-0 text-primary">
          <BellRing size={20} />
        </div>
        
        <div className="flex-1 space-y-1">
          <h4 className="font-bold text-dark dark:text-white text-sm">
            {upcomingItems.some(i => i.isToday) ? '오늘 결제 예정 알림' : '내일 결제 예정 알림'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold text-primary">{upcomingItems[0].service_name}</span>
            {upcomingItems.length > 1 && ` 외 ${upcomingItems.length - 1}건`}
            이(가) {upcomingItems[0].isToday ? '오늘' : '내일'} 결제될 예정입니다.
            <br />
            <span className="font-medium">예상 금액: {totalAmount.toLocaleString()}원</span>
          </p>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

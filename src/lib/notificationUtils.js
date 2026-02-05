import { addDays, isSameDay, differenceInCalendarDays, startOfDay } from 'date-fns'
import { extractDayFromBillingDate, getNextPaymentDate } from './dateUtils'

// 알림용: 오늘과 내일 결제 건 확인
export const checkUpcomingPayments = (subscriptions) => {
  const today = startOfDay(new Date())
  const tomorrow = addDays(today, 1)

  return subscriptions.filter(sub => {
    if (sub.status !== 'active') return false
    const nextDate = getNextPaymentDate(sub.billing_date)
    if (!nextDate) return false
    
    // 오늘 또는 내일 결제일인지 확인
    return isSameDay(nextDate, today) || isSameDay(nextDate, tomorrow)
  }).map(sub => {
    const nextDate = getNextPaymentDate(sub.billing_date)
    return {
      ...sub,
      isToday: isSameDay(nextDate, today)
    }
  })
}

// 대시보드용: 오늘 결제 건이 있으면 오늘, 없으면 이번주(향후 7일) 확인
export const getDashboardUpcomingInfo = (subscriptions) => {
  const today = startOfDay(new Date())
  
  // 1. 모든 활성 구독의 다음 결제일 계산
  const activeSubsWithNextDate = subscriptions
    .filter(sub => sub.status === 'active')
    .map(sub => ({
      ...sub,
      nextPaymentDate: getNextPaymentDate(sub.billing_date)
    }))
    .filter(sub => sub.nextPaymentDate !== null)

  // 2. 오늘 결제 건 확인
  const todayItems = activeSubsWithNextDate.filter(sub => 
    isSameDay(sub.nextPaymentDate, today)
  )

  if (todayItems.length > 0) {
    return { type: 'today', items: todayItems }
  }

  // 3. 오늘 건이 없으면 이번주(향후 7일 이내) 확인
  const weekItems = activeSubsWithNextDate
    .filter(sub => {
      const daysDiff = differenceInCalendarDays(sub.nextPaymentDate, today)
      return daysDiff > 0 && daysDiff <= 7
    })
    .sort((a, b) => a.nextPaymentDate - b.nextPaymentDate) // 가까운 날짜순 정렬

  if (weekItems.length > 0) {
    return { type: 'week', items: weekItems }
  }

  return null
}

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false
  
  if (Notification.permission === 'granted') return true
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

export const sendBrowserNotification = async (items) => {
  if (items.length === 0) return

  // 권한 확인
  if (Notification.permission !== 'granted') return

  const hasToday = items.some(item => item.isToday)
  const targetLabel = hasToday ? '오늘' : '내일'
  
  const title = items.length === 1 
    ? `${targetLabel} 결제 예정: ${items[0].service_name}`
    : `${targetLabel} ${items.length}건의 결제가 예정되어 있어요!`
  
  const body = items.length === 1
    ? `${items[0].price.toLocaleString()}원이 결제될 예정입니다.`
    : `총 ${items.reduce((acc, cur) => acc + cur.price, 0).toLocaleString()}원이 결제됩니다. 잔액을 확인하세요.`

  const options = {
    body,
    icon: `${window.location.origin}/favicon-96x96.png`,
    badge: `${window.location.origin}/favicon-96x96.png`,
    vibrate: [200, 100, 200],
    tag: 'subscription-payment-alert', // 동일 태그는 알림을 묶어줌
    renotify: true, // 새로운 알림이 오면 다시 진동/소리 발생
    data: {
      url: `${window.location.origin}/calendar`
    }
  }

  // 서비스 워커를 통한 알림 발송 (PWA 권장 방식)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      if (registration) {
        // 서비스 워커가 준비되었다면 전용 방식으로만 발송하고 종료
        await registration.showNotification(title, options)
        return 
      }
    } catch (err) {
      console.error('Service Worker notification failed:', err)
    }
  }

  // 서비스 워커를 지원하지 않는 환경(일반 데스크탑 브라우저 등)에서만 폴백 실행
  if (window.Notification && Notification.permission === 'granted') {
    try {
      new Notification(title, options)
    } catch (err) {
      console.error('Browser Notification fallback failed:', err)
    }
  }
}

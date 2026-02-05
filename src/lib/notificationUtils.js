import { addDays, getDate, isSameDay } from 'date-fns'
import { extractDayFromBillingDate } from './dateUtils'

// 알림용: 오늘과 내일 결제 건 확인
export const checkUpcomingPayments = (subscriptions) => {
  const today = new Date()
  const tomorrow = addDays(today, 1)
  
  const todayDate = getDate(today)
  const tomorrowDate = getDate(tomorrow)

  return subscriptions.filter(sub => {
    if (sub.status !== 'active') return false
    const billingDay = extractDayFromBillingDate(sub.billing_date)
    
    // 오늘 또는 내일 결제일인지 확인
    return billingDay === todayDate || billingDay === tomorrowDate
  }).map(sub => ({
    ...sub,
    isToday: extractDayFromBillingDate(sub.billing_date) === todayDate
  }))
}

// 대시보드용: 오늘 결제 건이 있으면 오늘, 없으면 이번주(향후 7일) 확인
export const getDashboardUpcomingInfo = (subscriptions) => {
  const today = new Date()
  const todayDate = getDate(today)
  
  // 1. 오늘 결제 건 확인
  const todayItems = subscriptions.filter(sub => {
    if (sub.status !== 'active') return false
    return extractDayFromBillingDate(sub.billing_date) === todayDate
  })

  if (todayItems.length > 0) {
    return { type: 'today', items: todayItems }
  }

  // 2. 오늘 건이 없으면 이번주(내일부터 7일간) 확인
  // 주의: 월말/월초 로직을 위해 단순 날짜 비교보다 날짜 생성이 안전함
  // 여기서는 간단히 향후 7일의 '일(day)'자만 체크 (매월 반복 가정)
  const upcomingDays = []
  for (let i = 1; i <= 7; i++) {
    upcomingDays.push(getDate(addDays(today, i)))
  }

  const weekItems = subscriptions.filter(sub => {
    if (sub.status !== 'active') return false
    const day = extractDayFromBillingDate(sub.billing_date)
    return upcomingDays.includes(day)
  })

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

export const sendBrowserNotification = (items) => {
  if (items.length === 0) return

  // 가장 급한 건(오늘)이 있는지 확인
  const hasToday = items.some(item => item.isToday)
  const targetLabel = hasToday ? '오늘' : '내일'
  
  const title = items.length === 1 
    ? `${targetLabel} 결제 예정: ${items[0].service_name}`
    : `${targetLabel} ${items.length}건의 결제가 예정되어 있어요!`
  
  const body = items.length === 1
    ? `${items[0].price.toLocaleString()}원이 결제될 예정입니다.`
    : `총 ${items.reduce((acc, cur) => acc + cur.price, 0).toLocaleString()}원이 결제됩니다. 잔액을 확인하세요.`

  new Notification(title, {
    body,
    icon: '/favicon-96x96.png',
    badge: '/favicon-96x96.png' // Android용 작은 아이콘
  })
}

import { addDays, getDate } from 'date-fns'
import { extractDayFromBillingDate } from './dateUtils'

export const checkUpcomingPayments = (subscriptions) => {
  const tomorrow = addDays(new Date(), 1)
  const tomorrowDay = getDate(tomorrow)

  return subscriptions.filter(sub => {
    if (sub.status !== 'active') return false
    const billingDay = extractDayFromBillingDate(sub.billing_date)
    return billingDay === tomorrowDay
  })
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

  const title = items.length === 1 
    ? `내일 결제 예정: ${items[0].service_name}`
    : `내일 ${items.length}건의 결제가 예정되어 있어요!`
  
  const body = items.length === 1
    ? `${items[0].price.toLocaleString()}원이 결제될 예정입니다.`
    : `총 ${items.reduce((acc, cur) => acc + cur.price, 0).toLocaleString()}원이 결제됩니다. 잔액을 확인하세요.`

  new Notification(title, {
    body,
    icon: '/favicon-96x96.png',
    badge: '/favicon-96x96.png' // Android용 작은 아이콘
  })
}

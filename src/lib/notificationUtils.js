import { addDays, isSameDay, differenceInCalendarDays, startOfDay, startOfWeek, endOfWeek, eachDayOfInterval, isBefore, getDate } from 'date-fns'
import { extractDayFromBillingDate, getNextPaymentDate } from './dateUtils'

/**
 * 이번 주(월-일)의 모든 결제 일정을 가져옵니다.
 */
export const getWeeklyUpcomingPayments = (subscriptions) => {
  const today = startOfDay(new Date())
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })     // Sunday
  
  const weekInterval = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  return subscriptions
    .filter(sub => sub.status === 'active')
    .map(sub => {
      const billingDay = extractDayFromBillingDate(sub.billing_date)
      const matchDate = weekInterval.find(date => getDate(date) === billingDay)
      
      return {
        ...sub,
        thisWeekDate: matchDate ? startOfDay(matchDate) : null
      }
    })
    .filter(sub => sub.thisWeekDate !== null)
    .sort((a, b) => a.thisWeekDate - b.thisWeekDate)
}

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

// 대시보드용 요약 정보 (동기화된 주간 로직 사용)
export const getDashboardUpcomingInfo = (subscriptions) => {
  const today = startOfDay(new Date())
  const weeklyPayments = getWeeklyUpcomingPayments(subscriptions)

  // 1. 오늘 결제 건 확인
  const todayItems = weeklyPayments.filter(sub => isSameDay(sub.thisWeekDate, today))
  if (todayItems.length > 0) {
    return { type: 'today', items: todayItems }
  }

  // 2. 이번 주 남은 결제 건 확인 (오늘 이후)
  const remainingItems = weeklyPayments.filter(sub => differenceInCalendarDays(sub.thisWeekDate, today) > 0)
  if (remainingItems.length > 0) {
    return { type: 'week', items: remainingItems }
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

  const todayItems = items.filter(item => item.isToday)
  const tomorrowItems = items.filter(item => !item.isToday)
  
  let title = ''
  let body = ''

  if (todayItems.length > 0 && tomorrowItems.length > 0) {
    title = `오늘과 내일 결제 예정 알림`
    const totalAmount = items.reduce((acc, cur) => acc + cur.price, 0)
    body = `오늘 ${todayItems.length}건, 내일 ${tomorrowItems.length}건 (총 ${totalAmount.toLocaleString()}원)이 예정되어 있어요.`
  } else if (todayItems.length > 0) {
    title = todayItems.length === 1 
      ? `오늘 결제 예정: ${todayItems[0].service_name}`
      : `오늘 ${todayItems.length}건의 결제가 예정되어 있어요!`
    
    body = todayItems.length === 1
      ? `${todayItems[0].price.toLocaleString()}원이 결제될 예정입니다.`
      : `총 ${todayItems.reduce((acc, cur) => acc + cur.price, 0).toLocaleString()}원이 결제됩니다. 잔액을 확인하세요.`
  } else {
    title = tomorrowItems.length === 1 
      ? `내일 결제 예정: ${tomorrowItems[0].service_name}`
      : `내일 ${tomorrowItems.length}건의 결제가 예정되어 있어요!`
    
    body = tomorrowItems.length === 1
      ? `${tomorrowItems[0].price.toLocaleString()}원이 결제될 예정입니다.`
      : `총 ${tomorrowItems.reduce((acc, cur) => acc + cur.price, 0).toLocaleString()}원이 결제됩니다. 잔액을 확인하세요.`
  }

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

// --- Web Push Implementation ---

const VAPID_PUBLIC_KEY = 'BB8kU2idNZuS0R1MnsbmtL_aGUDaON0eWoV4NyCZ3gLdgKVQ9xDPfOAsa1SmPsvah5RJ11_ZjUW44hCr-pm2jtc'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const subscribeToPush = async (userId) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported in this browser.')
    return null
  }

  try {
    // 2초 타임아웃 추가 (서비스 워커가 응답하지 않을 때 대비)
    const swPromise = navigator.serviceWorker.ready
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Service Worker registration timeout')), 2000)
    )

    const registration = await Promise.race([swPromise, timeoutPromise])
    
    // 기존 구독 확인
    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) {
      return existingSubscription
    }

    const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    
    // 새 구독 요청
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    })

    return subscription
  } catch (error) {
    if (error.message === 'Service Worker registration timeout') {
      alert('알림 서버 연결에 실패했습니다. 페이지를 새로고침(F5) 후 다시 시도해주세요.')
    } else {
      console.warn('Push subscription failed:', error)
    }
    return null
  }
}

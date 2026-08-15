import { setDate, addMonths, addYears, isBefore, startOfDay, getDaysInMonth, getDate, getMonth } from 'date-fns'

/**
 * 구독 객체 또는 billing_date 문자열과 billing_cycle 정보를 바탕으로
 * 결제 주기(isYearly), 결제 월(month: 1~12), 결제 일(day: 1~31)을 파싱합니다.
 * @param {Object|string} subOrDateStr 
 * @param {string} [cycle] 
 * @returns {{ isYearly: boolean, month: number|null, day: number|null }}
 */
export const parseBillingInfo = (subOrDateStr, cycle) => {
  let billingDateStr = ''
  let billingCycle = cycle || 'monthly'

  if (typeof subOrDateStr === 'object' && subOrDateStr !== null) {
    billingDateStr = subOrDateStr.billing_date || ''
    billingCycle = subOrDateStr.billing_cycle || (billingDateStr.includes('매년') ? 'yearly' : 'monthly')
  } else if (typeof subOrDateStr === 'string') {
    billingDateStr = subOrDateStr
    if (!cycle && billingDateStr.includes('매년')) {
      billingCycle = 'yearly'
    }
  }

  if (!billingDateStr) {
    return { isYearly: billingCycle === 'yearly', month: null, day: null }
  }

  const isYearly = billingCycle === 'yearly' || billingDateStr.includes('매년')

  if (isYearly) {
    // 1. "X월 Y일" 형태 (예: "매년 03월 15일", "매년 3월 5일", "3월 15일")
    const monthDayMatch = billingDateStr.match(/(\d+)\s*월\s*(\d+)\s*일?/)
    if (monthDayMatch) {
      return {
        isYearly: true,
        month: parseInt(monthDayMatch[1], 10),
        day: parseInt(monthDayMatch[2], 10)
      }
    }

    // 2. 여러 숫자 분리 (예: "2026-03-15", "03/15")
    const numbers = billingDateStr.match(/\d+/g)
    if (numbers && numbers.length >= 2) {
      if (numbers.length >= 3 && numbers[0].length === 4) {
        return {
          isYearly: true,
          month: parseInt(numbers[1], 10),
          day: parseInt(numbers[2], 10)
        }
      }
      return {
        isYearly: true,
        month: parseInt(numbers[0], 10),
        day: parseInt(numbers[1], 10)
      }
    }

    // 3. 4자리 숫자(MMDD) 또는 3자리 숫자(MDD)
    if (numbers && numbers.length === 1) {
      const numStr = numbers[0]
      if (numStr.length === 4) {
        return {
          isYearly: true,
          month: parseInt(numStr.slice(0, 2), 10),
          day: parseInt(numStr.slice(2), 10)
        }
      }
      if (numStr.length === 3) {
        return {
          isYearly: true,
          month: parseInt(numStr.slice(0, 1), 10),
          day: parseInt(numStr.slice(1), 10)
        }
      }
      // 숫자 1~2자리만 있는 경우
      return {
        isYearly: true,
        month: 1,
        day: parseInt(numStr, 10)
      }
    }

    return { isYearly: true, month: null, day: null }
  } else {
    // 월간 구독: 일(day)만 추출
    const match = billingDateStr.match(/\d+/)
    return {
      isYearly: false,
      month: null,
      day: match ? parseInt(match[0], 10) : null
    }
  }
}

/**
 * Extracts the day number from a billing date string.
 * @param {string|Object} billingDateStrOrSub 
 * @returns {number|null}
 */
export const extractDayFromBillingDate = (billingDateStrOrSub) => {
  const { day } = parseBillingInfo(billingDateStrOrSub)
  return day
}

/**
 * 특정 날짜(date: Date 객체)에 해당 구독의 결제가 발생하는지 판별합니다.
 * @param {Object} subscription 
 * @param {Date} date 
 * @returns {boolean}
 */
export const isSubscriptionDueOnDate = (subscription, date) => {
  if (!subscription || !date) return false
  const { isYearly, month, day } = parseBillingInfo(subscription)
  if (!day) return false

  const daysInMonth = getDaysInMonth(date)
  const effectiveDay = Math.min(day, daysInMonth)
  const currentDay = getDate(date)

  if (currentDay !== effectiveDay) return false

  if (isYearly) {
    if (!month) return false
    const currentMonth = getMonth(date) + 1 // 1~12
    return currentMonth === month
  }

  return true
}

/**
 * 특정 연/월(targetMonthDate: Date 객체)에 해당 구독의 결제일(Date 객체)을 반환합니다.
 * 해당 월에 결제가 없으면(연간 구독이 다른 달 결제인 경우) null을 반환합니다.
 * @param {Object} subscription 
 * @param {Date} targetMonthDate 
 * @returns {Date|null}
 */
export const getSubscriptionPaymentDateInMonth = (subscription, targetMonthDate) => {
  if (!subscription || !targetMonthDate) return null
  const { isYearly, month, day } = parseBillingInfo(subscription)
  if (!day) return null

  const targetYear = targetMonthDate.getFullYear()
  const targetMonth = targetMonthDate.getMonth() // 0~11

  if (isYearly) {
    if (!month || month !== targetMonth + 1) return null
  }

  const daysInMonth = getDaysInMonth(targetMonthDate)
  const effectiveDay = Math.min(day, daysInMonth)

  return startOfDay(new Date(targetYear, targetMonth, effectiveDay))
}

/**
 * 오늘 이후 가장 가까운 다음 결제일(Date 객체)을 반환합니다.
 * @param {Object|string} subOrBillingDate 
 * @param {string} [billingCycle] 
 * @returns {Date|null}
 */
export const getNextPaymentDate = (subOrBillingDate, billingCycle) => {
  const { isYearly, month, day } = parseBillingInfo(subOrBillingDate, billingCycle)
  if (!day) return null

  const today = startOfDay(new Date())
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() // 0~11

  if (isYearly) {
    const targetMonth = (month || 1) - 1 // 0~11
    const testDate = new Date(currentYear, targetMonth, 1)
    const effectiveDay = Math.min(day, getDaysInMonth(testDate))
    let nextDate = startOfDay(new Date(currentYear, targetMonth, effectiveDay))

    // 올해 결제일이 오늘보다 이전이면 내년 결제일로 설정
    if (isBefore(nextDate, today)) {
      const nextYearTest = new Date(currentYear + 1, targetMonth, 1)
      const nextYearDay = Math.min(day, getDaysInMonth(nextYearTest))
      nextDate = startOfDay(new Date(currentYear + 1, targetMonth, nextYearDay))
    }
    return nextDate
  } else {
    const effectiveDay = Math.min(day, getDaysInMonth(today))
    let nextDate = startOfDay(new Date(currentYear, currentMonth, effectiveDay))

    // 이번 달 결제일이 오늘보다 이전이면 다음 달로 설정
    if (isBefore(nextDate, today)) {
      const nextMonthDate = addMonths(today, 1)
      const nextMonthDay = Math.min(day, getDaysInMonth(nextMonthDate))
      nextDate = startOfDay(new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), nextMonthDay))
    }
    return nextDate
  }
}

/**
 * Checks if a subscription payment occurs on a specific day number
 * @param {Object} subscription 
 * @param {number} day 
 * @returns {boolean}
 */
export const isPaymentOnDay = (subscription, day) => {
  const billingDay = extractDayFromBillingDate(subscription)
  return billingDay === day
}

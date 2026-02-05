import { setDate, addMonths, isBefore, startOfDay } from 'date-fns'

/**
 * Extracts the day number from a billing date string like "매달 15일"
 * @param {string} billingDateStr 
 * @returns {number|null}
 */
export const extractDayFromBillingDate = (billingDateStr) => {
  if (!billingDateStr) return null
  const match = billingDateStr.match(/\d+/)
  return match ? parseInt(match[0], 10) : null
}

/**
 * Get the next occurrence of a monthly payment
 * @param {string} billingDateStr - e.g., "매달 15일"
 * @returns {Date|null}
 */
export const getNextPaymentDate = (billingDateStr) => {
  const day = extractDayFromBillingDate(billingDateStr)
  if (!day) return null

  const today = startOfDay(new Date())
  let nextDate = setDate(new Date(today), day)

  // 만약 이번 달의 결제일이 이미 지났다면 다음 달로 설정
  if (isBefore(nextDate, today)) {
    nextDate = addMonths(nextDate, 1)
  }

  return nextDate
}

/**
 * Checks if a subscription payment occurs on a specific date
 * @param {Object} subscription 
 * @param {number} day 
 * @returns {boolean}
 */
export const isPaymentOnDay = (subscription, day) => {
  const billingDay = extractDayFromBillingDate(subscription.billing_date)
  return billingDay === day
}

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
 * Checks if a subscription payment occurs on a specific date
 * @param {Object} subscription 
 * @param {number} day 
 * @returns {boolean}
 */
export const isPaymentOnDay = (subscription, day) => {
  const billingDay = extractDayFromBillingDate(subscription.billing_date)
  return billingDay === day
}

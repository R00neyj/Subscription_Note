import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  // Remove <, >, ", ', ` to prevent basic XSS and injection
  return input.replace(/[<>"'`]/g, '')
}

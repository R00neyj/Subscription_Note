import { useState, useRef, useEffect } from 'react'
import { X, ArrowUpRight, Calendar, CreditCard, Sparkles } from 'lucide-react'
import useSubscriptionStore from '../store/useSubscriptionStore'
import ServiceIcon from './ServiceIcon'
import { cn, sanitizeInput } from '../lib/utils'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

function PromoteModalContent({ item, onClose }) {
  const promoteToActive = useSubscriptionStore((state) => state.promoteToActive)

  const [formData, setFormData] = useState({
    billing_date: item.billing_date?.replace(/[^0-9]/g, '') || '',
    payment_method: item.payment_method || '',
    satisfaction: 5
  })

  // Mobile Back button support
  const pushedRef = useRef(false)
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (!isMobile) return

    if (!pushedRef.current) {
      window.history.pushState({ modal: 'promote' }, '', window.location.href)
      pushedRef.current = true
    }

    const handlePopState = () => {
      pushedRef.current = false
      onClose()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [onClose])

  const handleCloseInternal = () => {
    const isMobile = window.innerWidth < 768
    if (isMobile && pushedRef.current) {
      window.history.back()
    } else {
      onClose()
    }
  }

  const isMonthly = item.billing_cycle !== 'yearly'
  const isFormValid = formData.billing_date.trim() !== '' && 
    (isMonthly || formData.billing_date.length >= 3)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFormValid) return

    let formattedBillingDate = ''
    if (isMonthly) {
      formattedBillingDate = `매달 ${formData.billing_date}일`
    } else {
      const mm = formData.billing_date.padStart(4, '0').slice(0, 2)
      const dd = formData.billing_date.padStart(4, '0').slice(2)
      formattedBillingDate = `매년 ${mm}월 ${dd}일`
    }

    promoteToActive(item.id, {
      billing_date: formattedBillingDate,
      payment_method: formData.payment_method || '미지정',
      satisfaction: formData.satisfaction
    })

    handleCloseInternal()
  }

  return (
    <motion.div
      initial={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
      animate={window.innerWidth < 768 ? { y: 0 } : { scale: 1, opacity: 1 }}
      exit={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="bg-white dark:bg-slate-800 w-full md:max-w-[460px] rounded-t-[28px] md:rounded-[28px] overflow-hidden border-none md:border border-tertiary dark:border-slate-700 shadow-2xl flex flex-col transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-tertiary dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-[18px] md:text-[19px] font-bold text-dark dark:text-white">
            실제 구독으로 전환
          </h2>
        </div>
        <button
          onClick={handleCloseInternal}
          className="p-1.5 hover:bg-tertiary dark:hover:bg-slate-700 rounded-full transition-all active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5 text-dark dark:text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-4.5">
        {/* Service Info Summary Card */}
        <div className="flex items-center justify-between p-4 bg-tertiary/60 dark:bg-slate-700/50 rounded-[18px] border border-tertiary dark:border-slate-600">
          <div className="flex items-center gap-3">
            <ServiceIcon serviceName={item.service_name} category={item.category || item.categories?.[0]} size="md" />
            <div className="flex flex-col">
              <span className="font-bold text-dark dark:text-white text-[15px]">
                {item.service_name}
              </span>
              <span className="text-[12px] text-dark/50 dark:text-slate-400 font-medium">
                {item.category || item.categories?.[0]} · {isMonthly ? '월간 결제' : '연간 결제'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[16px] font-extrabold text-primary dark:text-blue-400">
              {item.price?.toLocaleString()}원
            </span>
            <span className="text-[11px] text-dark/40 dark:text-slate-400 block font-medium">
              /{isMonthly ? '월' : '년'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Billing Date Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13.5px] font-bold text-dark dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              결제일 ({isMonthly ? '매달 일자' : '매년 날짜'}) <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              min="1"
              max={isMonthly ? 31 : 1231}
              placeholder={isMonthly ? "일자 입력 (1 ~ 31)" : "MMDD 입력 (예: 0315)"}
              className="w-full h-[44px] px-4 bg-tertiary dark:bg-slate-700 rounded-[12px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[15px] font-bold placeholder:text-dark/40 dark:placeholder:text-slate-400"
              value={formData.billing_date}
              onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
              autoFocus
            />
          </div>

          {/* Payment Method Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13.5px] font-bold text-dark dark:text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" />
              결제 수단 (선택)
            </label>
            <input
              type="text"
              maxLength="20"
              placeholder="예: 신한카드, 카카오페이, 토스뱅크"
              className="w-full h-[44px] px-4 bg-tertiary dark:bg-slate-700 rounded-[12px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[14.5px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: sanitizeInput(e.target.value) })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCloseInternal}
              className="h-[46px] px-4 bg-tertiary dark:bg-slate-700 hover:bg-tertiary/80 text-dark/70 dark:text-slate-300 rounded-[14px] font-bold text-[15px] transition-all cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={cn(
                "flex-1 h-[46px] rounded-[14px] font-bold text-[15px] flex items-center justify-center gap-1.5 transition-all shadow-md",
                isFormValid
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-600/20"
                  : "bg-gray-200 dark:bg-slate-700 text-dark/30 dark:text-slate-500 cursor-not-allowed"
              )}
            >
              <span>구독 시작 및 활성화</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default function PromoteModal() {
  const promoteModal = useSubscriptionStore((state) => state.promoteModal)
  const closePromoteModal = useSubscriptionStore((state) => state.closePromoteModal)

  const item = promoteModal.item
  const isOpen = promoteModal.isOpen

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4"
        >
          <PromoteModalContent
            key={item.id}
            item={item}
            onClose={closePromoteModal}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

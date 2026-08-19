import { useState, useRef, useEffect, useMemo } from 'react'
import { X, ArrowUpRight, Calendar, CreditCard, Sparkles, RefreshCw, Globe, Ban, ExternalLink } from 'lucide-react'
import useSubscriptionStore from '../store/useSubscriptionStore'
import ServiceIcon from './ServiceIcon'
import { getServiceLinks } from '../constants/presets'
import { cn, sanitizeInput, createBackdropClose, closeModalViaHistory } from '../lib/utils'
import { formatYearlyBillingDate } from '../lib/dateUtils'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

function PromoteModalContent({ item, onClose }) {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const promoteToActive = useSubscriptionStore((state) => state.promoteToActive)

  // 이미 해지(disable)한 구독은 교체 대상이 될 수 없으므로 결제 중인 구독만 후보로 둔다
  const activeSubs = useMemo(() => {
    return subscriptions.filter(s => s.status === 'active')
  }, [subscriptions])

  // Detect matching target sub to replace
  const matchedExistingSub = useMemo(() => {
    if (item.upgrade_from_id) {
      const found = activeSubs.find(s => s.id === item.upgrade_from_id)
      if (found) return found
    }
    const itemNorm = item.service_name.trim().toLowerCase().replace(/\s+/g, '')
    return activeSubs.find(sub => {
      const subNorm = sub.service_name.trim().toLowerCase().replace(/\s+/g, '')
      return itemNorm.includes(subNorm) || subNorm.includes(itemNorm)
    })
  }, [item, activeSubs])

  const [shouldReplace, setShouldReplace] = useState(!!matchedExistingSub)
  const [selectedReplaceId, setSelectedReplaceId] = useState(matchedExistingSub?.id || null)

  const [formData, setFormData] = useState({
    billing_date: item.billing_date?.replace(/[^0-9]/g, '') || '',
    payment_method: item.payment_method || (matchedExistingSub?.payment_method || ''),
    satisfaction: 5
  })

  // Service Links
  const newServiceLinks = getServiceLinks(item.service_name)
  const oldServiceLinks = matchedExistingSub ? getServiceLinks(matchedExistingSub.service_name) : {}

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

    const formattedBillingDate = isMonthly
      ? `매달 ${formData.billing_date}일`
      : formatYearlyBillingDate(formData.billing_date)

    promoteToActive(item.id, {
      billing_date: formattedBillingDate,
      payment_method: formData.payment_method || '미지정',
      satisfaction: formData.satisfaction,
      replaceSubId: shouldReplace ? selectedReplaceId : null
    })

    handleCloseInternal()
  }

  return (
    <motion.div
      initial={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
      animate={window.innerWidth < 768 ? { y: 0 } : { scale: 1, opacity: 1 }}
      exit={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="bg-white dark:bg-slate-800 w-full md:max-w-[480px] rounded-t-[28px] md:rounded-[28px] overflow-hidden border-none md:border border-tertiary dark:border-slate-700 shadow-2xl flex flex-col transition-colors"
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
      <div className="p-6 flex flex-col gap-4">
        {/* Item Summary Card */}
        <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[20px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <ServiceIcon 
              serviceName={item.service_name} 
              category={item.categories?.[0] || item.category || 'Etc'} 
              size="md" 
            />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-[16px] text-dark dark:text-white truncate">
                {item.service_name}
              </span>
              <span className="text-[12.5px] text-emerald-600 dark:text-emerald-400 font-bold">
                {item.category || item.categories?.[0]} · {isMonthly ? '월간' : '연간'} 구독
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[18px] font-extrabold text-dark dark:text-white block">
              {item.price?.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* Quick Website Navigation Bar for Immediate Action */}
        {(newServiceLinks.subscribe_url || oldServiceLinks.cancel_url) && (
          <div className="grid grid-cols-2 gap-2">
            {newServiceLinks.subscribe_url ? (
              <a
                href={newServiceLinks.subscribe_url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-[38px] px-3 rounded-[12px] bg-primary/10 hover:bg-primary text-primary hover:text-white dark:bg-slate-700/80 dark:text-blue-300 dark:hover:bg-primary dark:hover:text-white border border-primary/20 hover:border-primary flex items-center justify-center gap-1.5 font-bold text-[12.5px] transition-all cursor-pointer group shrink-0"
                title={`${item.service_name} 공식 홈페이지 및 결제 페이지 새 창 열기`}
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">공식 결제 페이지</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
              </a>
            ) : (
              <div />
            )}

            {shouldReplace && (oldServiceLinks.cancel_url || oldServiceLinks.subscribe_url) ? (
              <a
                href={oldServiceLinks.cancel_url || oldServiceLinks.subscribe_url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-[38px] px-3 rounded-[12px] bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white dark:hover:text-white dark:bg-slate-700/80 border border-rose-500/20 hover:border-rose-500 flex items-center justify-center gap-1.5 font-bold text-[12.5px] transition-all cursor-pointer group shrink-0"
                title={`기존 ${matchedExistingSub?.service_name} 구독 해지/관리 페이지 새 창 열기`}
              >
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">기존 플랜 해지/관리</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
              </a>
            ) : (
              <div />
            )}
          </div>
        )}

        {/* Existing Sub Replacement Switcher (if detected) */}
        {matchedExistingSub && (
          <div className="p-3.5 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-[16px] flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shouldReplace}
                onChange={(e) => setShouldReplace(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-[13px] font-bold text-dark dark:text-white flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-primary dark:text-blue-400" />
                기존 구독 [{matchedExistingSub.service_name}] 요금제 교체
              </span>
            </label>
            {shouldReplace && (
              <p className="text-[11.5px] text-dark/60 dark:text-slate-400 font-medium pl-6 leading-tight">
                승격 완료 시 기존 <span className="font-bold text-dark dark:text-white">{matchedExistingSub.service_name}</span>({matchedExistingSub.price?.toLocaleString()}원)은 비활성화 처리되어 중복 결제를 방지합니다.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Billing Date Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13.5px] md:text-[14px] font-bold text-dark dark:text-white flex items-center gap-1.5 ml-0.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              결제일 지정 <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              min="1"
              max={isMonthly ? 31 : 1231}
              placeholder={isMonthly ? "결제 일자 (예: 25일이면 25)" : "MMDD 형식 (예: 0315)"}
              className="w-full h-[46px] px-4 bg-tertiary dark:bg-slate-700 rounded-[14px] outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-dark dark:text-white text-[15px] font-bold placeholder:text-dark/30 dark:placeholder:text-slate-500"
              value={formData.billing_date}
              onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
              autoFocus
            />
          </div>

          {/* Payment Method Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13.5px] md:text-[14px] font-bold text-dark dark:text-white flex items-center gap-1.5 ml-0.5">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              결제 수단 (선택)
            </label>
            <input
              type="text"
              maxLength="20"
              placeholder="예: 현대카드, 신한체크, 카카오페이"
              className="w-full h-[46px] px-4 bg-tertiary dark:bg-slate-700 rounded-[14px] outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-dark dark:text-white text-[15px] font-medium placeholder:text-dark/30 dark:placeholder:text-slate-500"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: sanitizeInput(e.target.value) })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCloseInternal}
              className="h-[48px] px-4 bg-tertiary dark:bg-slate-700 hover:bg-tertiary/80 text-dark/70 dark:text-slate-300 rounded-[14px] font-bold text-[15px] transition-all cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={cn(
                "flex-1 h-[48px] rounded-[14px] font-bold text-[15px] flex items-center justify-center gap-1.5 transition-all shadow-md",
                isFormValid
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-emerald-500/20 active:scale-98"
                  : "bg-gray-200 dark:bg-slate-700 text-dark/30 dark:text-slate-500 cursor-not-allowed"
              )}
            >
              <span>{shouldReplace ? '플랜 교체 및 구독 시작' : '구독 시작하기'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default function PromoteModal() {
  const isOpen = useSubscriptionStore((state) => state.promoteModal?.isOpen)
  const item = useSubscriptionStore((state) => state.promoteModal?.item)
  const closePromoteModal = useSubscriptionStore((state) => state.closePromoteModal)

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={createBackdropClose(() => closeModalViaHistory(closePromoteModal))}
          className="fixed inset-0 z-[120] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4"
        >
          <PromoteModalContent item={item} onClose={closePromoteModal} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

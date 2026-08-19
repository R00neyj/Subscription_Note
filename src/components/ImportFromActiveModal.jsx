import { useState } from 'react'
import { X, Check, CopyPlus, Sparkles } from 'lucide-react'
import useSubscriptionStore from '../store/useSubscriptionStore'
import ServiceIcon from './ServiceIcon'
import { cn, createBackdropClose } from '../lib/utils'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

export default function ImportFromActiveModal({ isOpen, onClose }) {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const addSubscription = useSubscriptionStore((state) => state.addSubscription)

  // Subscriptions currently active/disabled (not already in wishlist)
  const activeSubs = subscriptions.filter(s => s.status !== 'wishlist')
  const wishlistSubs = subscriptions.filter(s => s.status === 'wishlist')

  const [selectedIds, setSelectedIds] = useState([])

  const isAlreadyInWishlist = (serviceName) => {
    return wishlistSubs.some(w => w.service_name.trim().toLowerCase() === serviceName.trim().toLowerCase())
  }

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === activeSubs.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(activeSubs.map(s => s.id))
    }
  }

  const handleImport = async () => {
    if (selectedIds.length === 0) return

    const selectedSubs = activeSubs.filter(s => selectedIds.includes(s.id))

    // Import each selected sub as a new wishlist item
    for (const sub of selectedSubs) {
      await addSubscription({
        service_name: sub.service_name,
        category: sub.category || sub.categories?.[0] || 'Etc',
        categories: sub.categories || [sub.category || 'Etc'],
        price: Number(sub.price) || 0,
        billing_cycle: sub.billing_cycle || 'monthly',
        status: 'wishlist',
        billing_date: '',
        payment_method: ''
      })
    }

    setSelectedIds([])
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={createBackdropClose(onClose)}
          className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4"
        >
          <motion.div 
            initial={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
            animate={window.innerWidth < 768 ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="bg-white dark:bg-slate-800 w-full md:max-w-[500px] rounded-t-[28px] md:rounded-[28px] overflow-hidden border-none md:border border-tertiary dark:border-slate-700 shadow-2xl flex flex-col max-h-[85vh] transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-tertiary dark:border-slate-700 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary dark:text-blue-400 flex items-center justify-center">
                  <CopyPlus className="w-4 h-4" />
                </div>
                <h2 className="text-[18px] md:text-[20px] font-bold text-dark dark:text-white">
                  구독 목록에서 가져오기
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-tertiary dark:hover:bg-slate-700 rounded-full transition-all active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5 text-dark dark:text-white" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-[13.5px] text-dark/60 dark:text-slate-400 font-medium">
                  위시리스트(고민함)에 복제할 구독 항목을 선택하세요.
                </p>
                {activeSubs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[12.5px] font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer shrink-0 ml-2"
                  >
                    {selectedIds.length === activeSubs.length ? '전체 해제' : '전체 선택'}
                  </button>
                )}
              </div>

              {activeSubs.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-tertiary/40 dark:bg-slate-700/40 rounded-[20px]">
                  <Sparkles className="w-8 h-8 text-dark/30 dark:text-slate-500 mb-2" />
                  <p className="text-[14px] font-bold text-dark/60 dark:text-slate-400">
                    가져올 수 있는 정기 구독 서비스가 없습니다.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                  {activeSubs.map((sub) => {
                    const isSelected = selectedIds.includes(sub.id)
                    const alreadyExists = isAlreadyInWishlist(sub.service_name)
                    const isYearly = sub.billing_cycle === 'yearly'

                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleToggleSelect(sub.id)}
                        className={cn(
                          "p-3 rounded-[16px] border flex items-center justify-between gap-3 transition-all cursor-pointer select-none",
                          isSelected
                            ? "bg-primary/5 dark:bg-primary/10 border-primary shadow-xs"
                            : "bg-tertiary/30 dark:bg-slate-700/30 border-tertiary dark:border-slate-700 hover:bg-tertiary/60 dark:hover:bg-slate-700/60"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox Icon */}
                          <div className={cn(
                            "w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 transition-colors",
                            isSelected 
                              ? "bg-primary border-primary text-white" 
                              : "border-dark/20 dark:border-slate-500 bg-white dark:bg-slate-800"
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>

                          <ServiceIcon serviceName={sub.service_name} category={sub.category || sub.categories?.[0]} size="sm" />
                          
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-dark dark:text-white text-[14.5px] truncate">
                                {sub.service_name}
                              </span>
                              {alreadyExists && (
                                <span className="px-1.5 py-0.2 text-[10.5px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md shrink-0">
                                  담겨있음
                                </span>
                              )}
                            </div>
                            <span className="text-[12px] text-dark/40 dark:text-slate-400 font-medium">
                              {sub.category || sub.categories?.[0]} · {isYearly ? '연간' : '월간'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[14px] font-extrabold text-dark dark:text-white block">
                            {sub.price?.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-3 border-t border-tertiary dark:border-slate-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[46px] px-4 bg-tertiary dark:bg-slate-700 hover:bg-tertiary/80 text-dark/70 dark:text-slate-300 rounded-[14px] font-bold text-[14.5px] transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={selectedIds.length === 0}
                  onClick={handleImport}
                  className={cn(
                    "flex-1 h-[46px] rounded-[14px] font-bold text-[15px] flex items-center justify-center gap-1.5 transition-all shadow-md",
                    selectedIds.length > 0
                      ? "bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-primary/20"
                      : "bg-gray-200 dark:bg-slate-700 text-dark/30 dark:text-slate-500 cursor-not-allowed"
                  )}
                >
                  <span>{selectedIds.length > 0 ? `${selectedIds.length}개 항목 위시리스트에 담기` : '항목을 선택하세요'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

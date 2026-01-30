import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES } from '../constants/categories'
import { cn } from '../lib/utils'

export default function SubscriptionModal({ isOpen, onClose, initialData = null }) {
  const addSubscription = useSubscriptionStore((state) => state.addSubscription)
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription)
  const removeSubscription = useSubscriptionStore((state) => state.removeSubscription)
  
  const [formData, setFormData] = useState({
    service_name: initialData?.service_name || '',
    categories: initialData?.categories || (initialData?.category ? [initialData.category] : ['OTT']),
    billing_date: initialData?.billing_date.replace(/[^0-9]/g, '') || '',
    price: initialData?.price || '',
    payment_method: initialData?.payment_method || '',
    status: initialData?.status || 'active'
  })

  if (!isOpen) return null

  const toggleCategory = (categoryId) => {
    setFormData(prev => {
      const current = prev.categories
      if (current.includes(categoryId)) {
        // Prevent deselecting if it's the only one
        if (current.length <= 1) return prev
        return { ...prev, categories: current.filter(id => id !== categoryId) }
      } else {
        return { ...prev, categories: [...current, categoryId] }
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.service_name || !formData.price || formData.categories.length === 0) return
    
    const payload = {
      ...formData,
      price: Number(formData.price),
      billing_date: `매달 ${formData.billing_date}일`,
      payment_method: formData.payment_method || '미지정'
    }

    if (initialData) {
      updateSubscription(initialData.id, payload)
    } else {
      addSubscription(payload)
    }
    
    onClose()
  }

  const handleDelete = () => {
    if (initialData && window.confirm('정말로 이 구독을 삭제하시겠습니까?')) {
      removeSubscription(initialData.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-[480px] rounded-[32px] overflow-hidden border border-tertiary dark:border-slate-700 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-tertiary dark:border-slate-700 shrink-0">
          <h2 className="text-[22px] font-bold text-dark dark:text-white tracking-tight">
            {initialData ? '구독 정보 수정' : '구독 추가하기'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-tertiary dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-dark dark:text-white" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Service Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm md:text-[16px] font-bold text-dark dark:text-white ml-1">서비스 명</label>
              <input 
                required
                type="text" 
                placeholder="예: 넷플릭스, 유튜브 프리미엄"
                className="w-full h-[56px] px-6 bg-tertiary dark:bg-slate-700 rounded-[16px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[14px] md:text-[16px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              />
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <label className="text-sm md:text-[16px] font-bold text-dark dark:text-white">구독 상태</label>
                <p className="text-xs md:text-[13px] text-dark/40 dark:text-slate-400 font-medium">현재 구독을 유지하고 있나요?</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  status: formData.status === 'active' ? 'disable' : 'active' 
                })}
                className={cn(
                  "relative w-[76px] h-[32px] rounded-full transition-all duration-300 flex items-center px-1 shrink-0",
                  formData.status === 'active' ? "bg-[#34C759]" : "bg-gray-200 dark:bg-slate-600"
                )}
              >
                <div 
                  className={cn(
                    "absolute w-[26px] h-[26px] bg-white rounded-full transition-all duration-300 flex items-center justify-center",
                    formData.status === 'active' ? "translate-x-[42px]" : "translate-x-0"
                  )}
                />
                <span className={cn(
                  "z-10 w-full text-center text-[10px] font-medium transition-all",
                  formData.status === 'active' ? "pr-[26px] text-white" : "pl-[26px] text-dark/40 dark:text-slate-300"
                )}>
                  {formData.status === 'active' ? '활성' : '비활성'}
                </span>
              </button>
            </div>

            {/* Category Selection (Grid Layout) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm md:text-[16px] font-bold text-dark dark:text-white ml-1">카테고리 (복수 선택 가능)</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "h-[48px] rounded-[12px] font-bold text-[14px] md:text-[16px] transition-all border-2",
                      formData.categories.includes(cat.id)
                        ? "bg-primary text-white border-primary"
                        : "bg-tertiary dark:bg-slate-700 text-dark/60 dark:text-slate-300 border-transparent hover:bg-tertiary/80 dark:hover:bg-slate-600 hover:text-dark dark:hover:text-white"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div className="flex flex-col gap-2">
                <label className="text-sm md:text-[16px] font-bold text-dark dark:text-white ml-1">월 결제 금액</label>
                <input 
                  required
                  type="number" 
                  placeholder="금액 입력"
                  className="w-full h-[56px] px-6 bg-tertiary dark:bg-slate-700 rounded-[16px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[14px] md:text-[16px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              {/* Billing Date */}
               <div className="flex flex-col gap-2">
                <label className="text-sm md:text-[16px] font-bold text-dark dark:text-white ml-1">결제일 (매달)</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  max="31"
                  placeholder="일자 (1~31)"
                  className="w-full h-[56px] px-6 bg-tertiary dark:bg-slate-700 rounded-[16px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[14px] md:text-[16px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
                  value={formData.billing_date}
                  onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
                />
              </div>
            </div>

            {/* Payment Method */}
             <div className="flex flex-col gap-2">
              <label className="text-sm md:text-[16px] font-bold text-dark dark:text-white ml-1">결제 수단</label>
              <input 
                type="text" 
                placeholder="예: 현대카드, 카카오뱅크"
                className="w-full h-[56px] px-6 bg-tertiary dark:bg-slate-700 rounded-[16px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[14px] md:text-[16px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4 pt-4 border-t border-tertiary/50 dark:border-slate-700/50">
               {initialData && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="h-[64px] px-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-[24px] font-bold text-lg md:text-[20px] hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center shrink-0"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
               )}
              <button 
                type="submit"
                className="flex-1 h-[64px] bg-primary hover:bg-primary/90 text-white rounded-[24px] font-bold text-lg md:text-[20px] transition-all"
              >
                {initialData ? '수정 완료' : '추가 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

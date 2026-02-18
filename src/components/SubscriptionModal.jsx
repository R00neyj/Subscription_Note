import { useState, useRef, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES } from '../constants/categories'
import { SUBSCRIPTION_PRESETS } from '../constants/presets'
import { cn, sanitizeInput } from '../lib/utils'

export default function SubscriptionModal({ isOpen, onClose, initialData = null }) {
  const addSubscription = useSubscriptionStore((state) => state.addSubscription)
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription)
  const removeSubscription = useSubscriptionStore((state) => state.removeSubscription)
  
  // Determine if it's a true edit mode (has ID) or just pre-filling for a new entry
  const isEditMode = initialData && initialData.id

  const [formData, setFormData] = useState({
    service_name: initialData?.service_name || '',
    category: initialData?.category || initialData?.categories?.[0] || 'OTT',
    billing_date: initialData?.billing_date?.replace(/[^0-9]/g, '') || '',
    price: initialData?.price || '',
    payment_method: initialData?.payment_method || '',
    status: initialData?.status || 'active'
  })

  // Autocomplete State
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  // 1. Data Initialization Effect
  useEffect(() => {
    if (isOpen) {
      setFormData({
        service_name: initialData?.service_name || '',
        category: initialData?.category || initialData?.categories?.[0] || 'OTT',
        billing_date: initialData?.billing_date?.replace(/[^0-9]/g, '') || '',
        price: initialData?.price || '',
        payment_method: initialData?.payment_method || '',
        status: initialData?.status || 'active'
      })
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [isOpen, initialData])

  // 2. History Management Effect (Back Button Support)
  const pushedRef = useRef(false)
  
  useEffect(() => {
    // 사용자가 요청한 '모바일에서 뒤로가기로 닫기' 기능을 위해 모바일 환경(768px 미만)에서만 작동하도록 제한
    // PC에서 뒤로가기 시 창이 바로 닫히는 문제 해결
    const isMobile = window.innerWidth < 768
    if (!isOpen || !isMobile) return

    if (!pushedRef.current) {
      window.history.pushState({ modal: 'subscription' }, '', window.location.href)
      pushedRef.current = true
    }
    
    const handlePopState = (event) => {
      // 뒤로가기가 발생하면 pushedRef를 초기화하고 닫기 호출
      pushedRef.current = false
      onClose()
    }
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
      // cleanup에서 history.back()을 호출하면 React Strict Mode에서 
      // mount/unmount가 반복될 때 의도치 않게 창이 바로 닫힐 수 있으므로 제거합니다.
      // 대신 handleCloseInternal에서 명시적으로 처리합니다.
    }
  }, [isOpen])

  const handleCloseInternal = () => {
    const isMobile = window.innerWidth < 768
    // 모바일이고 히스토리를 우리가 밀어넣었다면 뒤로가기 호출
    if (isMobile && pushedRef.current) {
      window.history.back()
    } else {
      // 그 외(PC 등)는 바로 닫기
      onClose()
    }
  }

  if (!isOpen) return null

  const handleNameChange = (e) => {
    const value = sanitizeInput(e.target.value)
    setFormData({ ...formData, service_name: value })

    if (value.trim().length > 0) {
      const filtered = SUBSCRIPTION_PRESETS.filter(preset => 
        preset.nameKo.toLowerCase().includes(value.toLowerCase()) ||
        preset.nameEn.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelectSuggestion = (preset) => {
    setFormData(prev => ({
      ...prev,
      service_name: preset.nameKo,
      price: preset.price,
      category: preset.category
    }))
    setShowSuggestions(false)
  }

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({ ...prev, category: categoryId }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.service_name || !formData.price || !formData.category) return
    
    // eslint-disable-next-line no-unused-vars
    const { category, ...rest } = formData
    const payload = {
      ...rest,
      categories: [formData.category], // Compatibility with array-based views
      price: Number(formData.price),
      billing_date: `매달 ${formData.billing_date}일`,
      payment_method: formData.payment_method || '미지정'
    }

    if (isEditMode) {
      updateSubscription(initialData.id, payload)
    } else {
      addSubscription(payload)
    }
    
    handleCloseInternal()
  }

  const handleDelete = () => {
    if (isEditMode && window.confirm('정말로 이 구독을 삭제하시겠습니까?')) {
      removeSubscription(initialData.id)
      handleCloseInternal()
    }
  }

  const isFormValid = formData.service_name.trim() !== '' && 
                      formData.price !== '' && 
                      formData.billing_date !== '' &&
                      formData.category !== ''

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 w-full md:max-w-[480px] h-full md:h-auto rounded-none md:rounded-[32px] overflow-hidden border-none md:border border-tertiary dark:border-slate-700 animate-in fade-in slide-in-from-bottom-10 md:zoom-in duration-200 flex flex-col max-h-none md:max-h-[90vh] transition-colors duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-tertiary dark:border-slate-700 shrink-0">
          <h2 className="text-[22px] font-bold text-dark dark:text-white">
            {isEditMode ? '구독 정보 수정' : '구독 추가하기'}
          </h2>
          <button 
            onClick={handleCloseInternal}
            className="p-2 hover:bg-tertiary dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-dark dark:text-white" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Service Name with Autocomplete */}
            <div className="flex flex-col gap-2 relative" ref={wrapperRef}>
              <label className="text-sm md:text-[16px] font-bold text-dark dark:text-white ml-1">
                서비스 명 <span className="text-red-500">*</span>
              </label>
              <input 
                required
                type="text" 
                maxLength="30"
                placeholder="예: 넷플릭스, 유튜브 프리미엄"
                className="w-full h-[56px] px-6 bg-tertiary dark:bg-slate-700 rounded-[16px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[14px] md:text-[16px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
                value={formData.service_name}
                onChange={handleNameChange}
                onFocus={() => {
                   if (formData.service_name.trim().length > 0) {
                      const filtered = SUBSCRIPTION_PRESETS.filter(preset => 
                        preset.nameKo.toLowerCase().includes(formData.service_name.toLowerCase()) ||
                        preset.nameEn.toLowerCase().includes(formData.service_name.toLowerCase())
                      )
                      setSuggestions(filtered)
                      setShowSuggestions(true)
                   }
                }}
                autoComplete="off"
              />
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-slate-800 border border-tertiary dark:border-slate-600 rounded-[16px] shadow-lg max-h-[200px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                  {suggestions.map((preset, index) => (
                    <li 
                      key={index}
                      onClick={() => handleSelectSuggestion(preset)}
                      className="px-6 py-3 hover:bg-tertiary dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between border-b border-tertiary/50 dark:border-slate-700/50 last:border-none group"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-dark dark:text-white text-[14px] md:text-[16px]">
                          {preset.nameKo}
                        </span>
                        <span className="text-[11px] md:text-[12px] text-dark/40 dark:text-slate-400 font-medium">
                          {preset.nameEn}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] md:text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">
                          {preset.category}
                        </span>
                        <span className="text-[13px] md:text-[14px] font-bold text-dark/60 dark:text-slate-300">
                          {preset.price.toLocaleString()}원
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
                  "relative w-[76px] h-[32px] rounded-full transition-all duration-300 flex items-center px-1 shrink-0 cursor-pointer",
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
              <label className="text-sm md:text-[16px] font-bold text-dark dark:text-white ml-1">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={cn(
                      "h-[48px] rounded-[12px] font-bold text-[14px] md:text-[16px] transition-all border-2 cursor-pointer",
                      formData.category === cat.id
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
                <label className="text-sm md:text-[16px] font-bold text-dark dark:text-white ml-1">
                  월 결제 금액 <span className="text-red-500">*</span>
                </label>
                <input 
                  required
                  type="number" 
                  maxLength="12"
                  placeholder="금액 입력"
                  className="w-full h-[56px] px-6 bg-tertiary dark:bg-slate-700 rounded-[16px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[14px] md:text-[16px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              {/* Billing Date */}
               <div className="flex flex-col gap-2">
                <label className="text-sm md:text-[16px] font-bold text-dark dark:text-white ml-1">
                  결제일 (매달) <span className="text-red-500">*</span>
                </label>
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
                maxLength="20"
                placeholder="예: 현대카드, 카카오뱅크"
                className="w-full h-[56px] px-6 bg-tertiary dark:bg-slate-700 rounded-[16px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[14px] md:text-[16px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: sanitizeInput(e.target.value) })}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4 pt-4 border-t border-tertiary/50 dark:border-slate-700/50">
               {isEditMode && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="h-[64px] px-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-[24px] font-bold text-lg md:text-[20px] hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
               )}
              <button 
                type="submit"
                disabled={!isFormValid}
                className={cn(
                  "flex-1 h-[64px] rounded-[24px] font-bold text-lg md:text-[20px] transition-all",
                  isFormValid 
                    ? "bg-primary hover:bg-primary/90 text-white cursor-pointer" 
                    : "bg-gray-200 dark:bg-slate-700 text-dark/30 dark:text-slate-500 cursor-not-allowed"
                )}
              >
                {isEditMode ? '수정 완료' : '추가 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

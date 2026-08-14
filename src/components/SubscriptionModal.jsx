import { useState, useRef, useEffect } from 'react'
import { X, Trash2, Star, ExternalLink, Globe, Ban } from 'lucide-react'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES } from '../constants/categories'
import { SUBSCRIPTION_PRESETS, getServiceLinks } from '../constants/presets'
import { cn, sanitizeInput } from '../lib/utils'
import ServiceIcon from './ServiceIcon'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

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
    status: initialData?.status || 'active',
    is_free_trial: initialData?.is_free_trial || false,
    trial_end_date: initialData?.trial_end_date || '',
    satisfaction: initialData?.satisfaction || 5,
    is_essential: initialData?.is_essential || false,
    billing_cycle: initialData?.billing_cycle || 'monthly'
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
        status: initialData?.status || 'active',
        is_free_trial: initialData?.is_free_trial || false,
        trial_end_date: initialData?.trial_end_date || '',
        satisfaction: initialData?.satisfaction || 5,
        is_essential: initialData?.is_essential || false,
        billing_cycle: initialData?.billing_cycle || 'monthly'
      })
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [isOpen, initialData])

  // 2. History Management Effect (Back Button Support)
  const pushedRef = useRef(false)
  
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (!isOpen || !isMobile) return

    if (!pushedRef.current) {
      window.history.pushState({ modal: 'subscription' }, '', window.location.href)
      pushedRef.current = true
    }
    
    const handlePopState = (event) => {
      pushedRef.current = false
      onClose()
    }
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isOpen])

  const handleCloseInternal = () => {
    const isMobile = window.innerWidth < 768
    if (isMobile && pushedRef.current) {
      window.history.back()
    } else {
      onClose()
    }
  }

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
      category: preset.category,
      billing_cycle: preset.billing_cycle || 'monthly'
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
    
    let formattedBillingDate = ''
    if (formData.billing_cycle === 'monthly') {
      formattedBillingDate = `매달 ${formData.billing_date}일`
    } else {
      const mm = formData.billing_date.padStart(4, '0').slice(0, 2)
      const dd = formData.billing_date.padStart(4, '0').slice(2)
      formattedBillingDate = `매년 ${mm}월 ${dd}일`
    }

    const payload = {
      ...rest,
      categories: [formData.category], 
      price: Number(formData.price),
      billing_date: formattedBillingDate,
      payment_method: formData.payment_method || '미지정',
      trial_end_date: formData.is_free_trial ? formData.trial_end_date : null
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
                      (formData.billing_cycle === 'monthly' || formData.billing_date.length >= 3) &&
                      formData.category !== '' &&
                      (!formData.is_free_trial || formData.trial_end_date !== '')

  const serviceLinks = getServiceLinks(formData.service_name)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4"
        >
          <motion.div 
            initial={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
            animate={window.innerWidth < 768 ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="bg-white dark:bg-slate-800 w-full md:max-w-[520px] h-full md:h-auto rounded-none md:rounded-[32px] overflow-hidden border-none md:border border-tertiary dark:border-slate-700 ring-1 ring-black/5 shadow-2xl shadow-primary/10 flex flex-col max-h-none md:max-h-[95vh] transition-colors"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-tertiary dark:border-slate-700 shrink-0">
              <h2 className="text-[19px] md:text-[21px] font-bold text-dark dark:text-white">
                {isEditMode ? '구독 정보 수정' : '구독 추가하기'}
              </h2>
              <button 
                onClick={handleCloseInternal}
                className="p-1.5 hover:bg-tertiary dark:hover:bg-slate-700 rounded-full transition-all active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5 text-dark dark:text-white" />
              </button>
            </div>

            {/* Modal Body - Scrollable if needed, but designed for one-screen fit */}
            <div className="px-5 py-4 md:px-6 md:py-4.5 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-3.5">
                {/* 1. Service Name with Autocomplete */}
                <div className="flex flex-col gap-1.5 relative" ref={wrapperRef}>
                  <label className="text-[13px] md:text-[14.5px] font-bold text-dark dark:text-white ml-1">
                    서비스 명 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required
                    type="text" 
                    maxLength="30"
                    placeholder="예: 넷플릭스, 유튜브"
                    className="w-full h-[44px] px-4 bg-tertiary dark:bg-slate-700 rounded-[12px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[15px] md:text-[16px] font-bold placeholder:text-dark/30 dark:placeholder:text-slate-500"
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
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.ul 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-slate-800 border border-tertiary dark:border-slate-600 rounded-[14px] shadow-xl max-h-[190px] overflow-y-auto z-50 custom-scrollbar"
                      >
                        {suggestions.map((preset, index) => (
                          <li 
                            key={index}
                            onClick={() => handleSelectSuggestion(preset)}
                            className="px-4 py-2.5 hover:bg-tertiary dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between border-b border-tertiary/50 dark:border-slate-700/50 last:border-none group active:bg-tertiary transition-colors gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ServiceIcon 
                                serviceName={preset.nameKo} 
                                category={preset.category} 
                                size="sm" 
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-dark dark:text-white text-[14px] md:text-[15px] truncate">
                                  {preset.nameKo}
                                </span>
                                <span className="text-[12px] text-dark/40 dark:text-slate-400 font-medium truncate">
                                  {preset.nameEn}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                              <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">
                                {preset.category}
                              </span>
                              <span className="text-[12px] font-bold text-dark/70 dark:text-slate-200">
                                {preset.price.toLocaleString()}원
                              </span>
                            </div>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Category Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] md:text-[14.5px] font-bold text-dark dark:text-white ml-1">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                    {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={cn(
                          "h-[36px] rounded-[10px] font-bold text-[13px] md:text-[13.5px] transition-all border cursor-pointer",
                          formData.category === cat.id
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-tertiary dark:bg-slate-700 text-dark/60 dark:text-slate-300 border-transparent hover:bg-tertiary/80 dark:hover:bg-slate-600 hover:text-dark dark:hover:text-white"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Combined Row: Status, Free Trial, Essential Toggles */}
                <div className="grid grid-cols-3 gap-2 bg-tertiary/40 dark:bg-slate-700/40 p-2.5 rounded-[14px]">
                  {/* Status Toggle */}
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="text-[12px] md:text-[13px] font-bold text-dark/80 dark:text-slate-200">구독 상태</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        status: formData.status === 'active' ? 'disable' : 'active' 
                      })}
                      className={cn(
                        "relative w-[64px] h-[28px] rounded-full transition-colors duration-200 flex items-center px-1 shrink-0 cursor-pointer",
                        formData.status === 'active' ? "bg-emerald-500" : "bg-gray-300 dark:bg-slate-600"
                      )}
                    >
                      <motion.div 
                        animate={formData.status === 'active' ? { x: 34 } : { x: 0 }}
                        className="w-[22px] h-[22px] bg-white rounded-full shadow-sm"
                      />
                      <span className={cn(
                        "absolute w-full text-center text-[11px] font-extrabold left-0 pointer-events-none",
                        formData.status === 'active' ? "pr-[22px] text-white" : "pl-[22px] text-dark/50 dark:text-slate-300"
                      )}>
                        {formData.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </button>
                  </div>

                  {/* Free Trial Toggle */}
                  <div className="flex flex-col items-center justify-center gap-1.5 border-x border-dark/5 dark:border-slate-600">
                    <span className="text-[12px] md:text-[13px] font-bold text-dark/80 dark:text-slate-200">무료 체험</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        is_free_trial: !formData.is_free_trial 
                      })}
                      className={cn(
                        "relative w-[64px] h-[28px] rounded-full transition-colors duration-200 flex items-center px-1 shrink-0 cursor-pointer",
                        formData.is_free_trial ? "bg-blue-500" : "bg-gray-300 dark:bg-slate-600"
                      )}
                    >
                      <motion.div 
                        animate={formData.is_free_trial ? { x: 34 } : { x: 0 }}
                        className="w-[22px] h-[22px] bg-white rounded-full shadow-sm"
                      />
                      <span className={cn(
                        "absolute w-full text-center text-[11px] font-extrabold left-0 pointer-events-none",
                        formData.is_free_trial ? "pr-[22px] text-white" : "pl-[22px] text-dark/50 dark:text-slate-300"
                      )}>
                        {formData.is_free_trial ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>

                  {/* Essential Service Toggle */}
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="text-[12px] md:text-[13px] font-bold text-dark/80 dark:text-slate-200">필수 항목</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        is_essential: !formData.is_essential 
                      })}
                      className={cn(
                        "relative w-[64px] h-[28px] rounded-full transition-colors duration-200 flex items-center px-1 shrink-0 cursor-pointer",
                        formData.is_essential ? "bg-purple-500" : "bg-gray-300 dark:bg-slate-600"
                      )}
                    >
                      <motion.div 
                        animate={formData.is_essential ? { x: 34 } : { x: 0 }}
                        className="w-[22px] h-[22px] bg-white rounded-full shadow-sm"
                      />
                      <span className={cn(
                        "absolute w-full text-center text-[11px] font-extrabold left-0 pointer-events-none",
                        formData.is_essential ? "pr-[22px] text-white" : "pl-[22px] text-dark/50 dark:text-slate-300"
                      )}>
                        {formData.is_essential ? '필수' : '일반'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Trial End Date (Conditional) */}
                <AnimatePresence>
                  {formData.is_free_trial && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-1.5 overflow-hidden"
                    >
                      <label className="text-[13px] md:text-[14.5px] font-bold text-dark dark:text-white ml-1">
                        체험 종료일 <span className="text-red-500">*</span>
                      </label>
                      <input 
                        required
                        type="date" 
                        className="w-full h-[42px] px-4 bg-tertiary dark:bg-slate-700 rounded-[12px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[14px] md:text-[15px] font-medium"
                        value={formData.trial_end_date}
                        onChange={(e) => setFormData({ ...formData, trial_end_date: e.target.value })}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 4. Billing Cycle & Price & Billing Date Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Left: Billing Cycle + Price */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] md:text-[14.5px] font-bold text-dark dark:text-white ml-1">
                        {formData.billing_cycle === 'monthly' ? '월' : '연'} 결제 금액 <span className="text-red-500">*</span>
                      </label>
                      {/* Compact Cycle Switcher */}
                      <div className="flex bg-tertiary dark:bg-slate-700 p-0.5 rounded-[8px] text-[12px]">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, billing_cycle: 'monthly' })}
                          className={cn(
                            "px-2.5 py-0.5 rounded-[6px] font-bold transition-all cursor-pointer",
                            formData.billing_cycle === 'monthly'
                              ? "bg-white dark:bg-slate-600 text-primary shadow-xs"
                              : "text-dark/40 dark:text-slate-400"
                          )}
                        >
                          월간
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, billing_cycle: 'yearly' })}
                          className={cn(
                            "px-2.5 py-0.5 rounded-[6px] font-bold transition-all cursor-pointer",
                            formData.billing_cycle === 'yearly'
                              ? "bg-white dark:bg-slate-600 text-amber-500 shadow-xs"
                              : "text-dark/40 dark:text-slate-400"
                          )}
                        >
                          연간
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        required
                        type="number" 
                        maxLength="12"
                        placeholder="금액 입력"
                        className="w-full h-[44px] px-4 bg-tertiary dark:bg-slate-700 rounded-[12px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[15px] md:text-[16px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                      {formData.billing_cycle === 'yearly' && formData.price > 0 && (
                        <span className="absolute -bottom-4 right-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          월 약 {Math.floor(formData.price / 12).toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Billing Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] md:text-[14.5px] font-bold text-dark dark:text-white ml-1">
                      결제일 ({formData.billing_cycle === 'monthly' ? '매달' : '매년'}) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      max={formData.billing_cycle === 'monthly' ? 31 : 1231}
                      placeholder={formData.billing_cycle === 'monthly' ? '일자 (1~31)' : 'MMDD (예: 0305)'}
                      className="w-full h-[44px] px-4 bg-tertiary dark:bg-slate-700 rounded-[12px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[15px] md:text-[16px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
                      value={formData.billing_date}
                      onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* 5. Payment Method & Satisfaction Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-0.5">
                  {/* Payment Method */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] md:text-[14.5px] font-bold text-dark dark:text-white ml-1">결제 수단</label>
                    <input 
                      type="text" 
                      maxLength="20"
                      placeholder="예: 현대카드, 카카오뱅크"
                      className="w-full h-[42px] px-4 bg-tertiary dark:bg-slate-700 rounded-[12px] outline-none border-2 border-transparent focus:border-primary transition-all text-dark dark:text-white text-[14px] md:text-[15px] font-medium placeholder:text-dark/40 dark:placeholder:text-slate-400"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: sanitizeInput(e.target.value) })}
                    />
                  </div>

                  {/* Satisfaction Rating */}
                  <div className="flex flex-col gap-1.5 justify-center">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[13px] md:text-[14.5px] font-bold text-dark dark:text-white">사용 만족도</label>
                      <span className="text-[12px] font-bold text-primary dark:text-primary/80">
                        {['매우 불만족', '불만족', '보통', '만족', '매우 만족'][formData.satisfaction - 1]}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 h-[42px] bg-tertiary/50 dark:bg-slate-700/50 rounded-[12px] px-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, satisfaction: star })}
                          className="p-1 cursor-pointer hover:scale-110 transition-transform"
                        >
                          <Star 
                            className={cn(
                              "w-[22px] h-[22px] transition-colors duration-200",
                              star <= formData.satisfaction 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300 dark:text-slate-600"
                            )} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 6. Quick Official & Cancel Links Bar (Option 1) */}
                {(serviceLinks.subscribe_url || serviceLinks.cancel_url) && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {serviceLinks.subscribe_url ? (
                      <a
                        href={serviceLinks.subscribe_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-[40px] md:h-[42px] px-3 rounded-[12px] bg-primary/5 hover:bg-primary text-primary hover:text-white dark:bg-slate-700/50 dark:text-blue-300 dark:hover:bg-primary dark:hover:text-white border border-primary/20 hover:border-primary flex items-center justify-center gap-1.5 font-bold text-[13px] md:text-[14px] transition-all cursor-pointer shadow-xs group"
                        title="공식 홈페이지 새 창 열기"
                      >
                        <Globe className="w-4 h-4 shrink-0 text-primary group-hover:text-white dark:text-blue-300 dark:group-hover:text-white transition-colors" />
                        <span className="truncate">공식 홈페이지</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <div />
                    )}

                    {serviceLinks.cancel_url ? (
                      <a
                        href={serviceLinks.cancel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-[40px] md:h-[42px] px-3 rounded-[12px] bg-rose-500/5 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white dark:hover:text-white dark:bg-slate-700/50 border border-rose-500/20 hover:border-rose-500 flex items-center justify-center gap-1.5 font-bold text-[13px] md:text-[14px] transition-all cursor-pointer shadow-xs group"
                        title="구독 해지 / 관리 페이지 새 창 열기"
                      >
                        <Ban className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 group-hover:text-white dark:group-hover:text-white transition-colors" />
                        <span className="truncate">구독 해지/관리</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <div />
                    )}
                  </div>
                )}

                {/* 7. Action Buttons */}
                <div className="flex gap-2.5 pt-2.5 border-t border-tertiary dark:border-slate-700">
                  {isEditMode && (
                    <button 
                      type="button"
                      onClick={handleDelete}
                      className="h-[48px] px-4.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-[14px] font-bold text-[16px] hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={!isFormValid}
                    className={cn(
                      "flex-1 h-[48px] rounded-[14px] font-bold text-[16px] transition-all",
                      isFormValid 
                        ? "bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-md shadow-primary/20" 
                        : "bg-gray-200 dark:bg-slate-700 text-dark/30 dark:text-slate-500 cursor-not-allowed"
                    )}
                  >
                    {isEditMode ? '수정 완료' : '추가 완료'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}



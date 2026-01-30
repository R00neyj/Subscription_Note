import { useState, useMemo } from 'react'
import Header from '../components/Header'
import SubscriptionTable from '../components/SubscriptionTable'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES } from '../constants/categories'
import { cn } from '../lib/utils'
import SectionHeader from '../components/SectionHeader'

export default function SubscriptionList() {
  const [selectedCategories, setSelectedCategories] = useState(['all'])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  // Toggle Category Logic
  const toggleCategory = (categoryId) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all'])
      return
    }

    setSelectedCategories((prev) => {
      let next = [...prev]
      
      // If 'all' was selected, remove it first
      if (next.includes('all')) {
        next = [categoryId]
      } else {
        if (next.includes(categoryId)) {
          // Remove if already selected
          next = next.filter(id => id !== categoryId)
          // If nothing left, go back to 'all'
          if (next.length === 0) next = ['all']
        } else {
          // Add if not selected
          next.push(categoryId)
        }
      }
      return next
    })
  }

  // Filter and Sort subscriptions
  const sortedSubscriptions = useMemo(() => {
    let data = [...subscriptions]
    
    // 1. Category Filter
    if (!selectedCategories.includes('all')) {
      data = data.filter(sub => 
        sub.categories?.some(cat => selectedCategories.includes(cat)) ||
        (sub.category && selectedCategories.includes(sub.category))
      )
    }

    // 2. Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle numeric values (price)
        if (sortConfig.key === 'price') {
           return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        // Handle billing_date (extract day number)
        if (sortConfig.key === 'billing_date') {
            const getDay = (str) => parseInt(str.replace(/[^0-9]/g, '')) || 0
            aValue = getDay(aValue)
            bValue = getDay(bValue)
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        // Handle strings (default for service_name, category, payment_method)
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }
        
        return 0
      })
    }

    return data
  }, [subscriptions, selectedCategories, sortConfig])

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Calculate total cost for filtered items (active only)
  const totalCost = useMemo(() => {
    return sortedSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((acc, sub) => acc + sub.price, 0)
  }, [sortedSubscriptions])

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:rounded-[48px] px-0 md:p-[42px] flex flex-col gap-[24px] items-start w-full transition-colors duration-300">
        <div className="flex flex-col gap-2 w-full">
          <SectionHeader title="구독 목록" />
          
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2">
            {/* Mobile: Custom Dropdown */}
            <div className="md:hidden relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-[96px] h-[36px] bg-tertiary dark:bg-slate-700 border border-transparent dark:border-slate-600 text-dark dark:text-white font-bold text-[13px] px-3 rounded-full outline-none transition-all cursor-pointer"
              >
                <span className="truncate mr-1">
                  {selectedCategories.includes('all') 
                    ? '전체' 
                    : selectedCategories.length === 1 
                      ? CATEGORIES.find(c => c.id === selectedCategories[0])?.label 
                      : `${CATEGORIES.find(c => c.id === selectedCategories[0])?.label}..`}
                </span>
                <svg className={cn("h-4 w-4 transition-transform duration-200 shrink-0", isDropdownOpen && "rotate-180")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Dropdown Menu (The "Window") */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <ul className="absolute left-0 mt-2 w-full bg-white dark:bg-slate-800 border border-tertiary dark:border-slate-700 rounded-[16px] z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {CATEGORIES.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => {
                            toggleCategory(cat.id)
                            setIsDropdownOpen(false)
                          }}
                          className={cn(
                            "w-full px-4 py-3 text-left text-[14px] font-medium transition-colors flex items-center justify-between",
                            selectedCategories.includes(cat.id) 
                              ? "bg-primary text-white" 
                              : "text-dark dark:text-slate-300 hover:bg-tertiary dark:hover:bg-slate-700"
                          )}
                        >
                          <span>{cat.label}</span>
                          {selectedCategories.includes(cat.id) && (
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Desktop: Buttons */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[14px] font-bold transition-colors whitespace-nowrap",
                    selectedCategories.includes(cat.id)
                      ? "bg-primary text-white"
                      : "bg-tertiary dark:bg-slate-700 text-dark/60 dark:text-slate-300 hover:bg-tertiary/80 dark:hover:bg-slate-600 hover:text-dark dark:hover:text-white"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-background dark:bg-slate-900 border border-primary rounded-[20px] p-4 flex flex-col items-start gap-1 w-full max-w-[200px] shrink-0 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <p className="text-[14px] md:text-[18px] font-bold text-dark dark:text-slate-200 tracking-[-0.02em] leading-[1.4]">
            {selectedCategories.includes('all') 
              ? '총 구독료' 
              : selectedCategories.length === 1 
                ? `${CATEGORIES.find(c => c.id === selectedCategories[0])?.label} 구독료`
                : `${CATEGORIES.find(c => c.id === selectedCategories[0])?.label} 외 ${selectedCategories.length - 1} 구독료`}
          </p>
          <div className="flex items-center gap-[3px]">
            <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white tracking-[-0.02em] leading-[1.4]">
              {totalCost.toLocaleString()}
            </span>
            <div className="pt-1">
              <span className="text-[14px] md:text-[18px] font-medium text-dark dark:text-slate-200 tracking-[-0.02em] leading-[1.4]">원</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full mt-2">
            <SubscriptionTable 
              data={sortedSubscriptions} 
              onRowClick={(item) => openModal(item)}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
        </div>
      </div>
    </div>
  )
}
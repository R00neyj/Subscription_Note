import { useState, useMemo } from 'react'
import Header from '../components/Header'
import SubscriptionTable from '../components/SubscriptionTable'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES } from '../constants/categories'
import { cn } from '../lib/utils'

export default function SubscriptionList() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  // Filter and Sort subscriptions
  const sortedSubscriptions = useMemo(() => {
    let data = [...subscriptions]
    
    // 1. Filter
    if (selectedCategory !== 'all') {
      data = data.filter(sub => sub.category === selectedCategory)
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

        // Handle strings
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }
        
        return 0
      })
    }

    return data
  }, [subscriptions, selectedCategory, sortConfig])

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
    <div className="h-full flex flex-col">
      <Header />
      
      <div className="bg-white dark:bg-slate-800 rounded-[48px] p-8 md:p-[42px] flex-1 shadow-sm flex flex-col gap-[24px] items-start w-full overflow-hidden transition-colors duration-300">
        {/* Title Section (Custom per Figma Spec) */}
        <div className="w-full h-[64px] flex flex-row items-center py-2 shrink-0 justify-between">
          <h2 className="text-[22px] font-bold text-[#111111] dark:text-white tracking-[-0.02em] leading-[1.4]">
            구독 목록
          </h2>
          
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-[14px] font-bold transition-colors whitespace-nowrap",
                  selectedCategory === cat.id
                    ? "bg-primary text-white"
                    : "bg-tertiary dark:bg-slate-700 text-dark/60 dark:text-slate-300 hover:bg-tertiary/80 dark:hover:bg-slate-600 hover:text-dark dark:hover:text-white"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-background dark:bg-slate-900 border border-primary rounded-[24px] p-6 flex flex-col items-start gap-1 w-full max-w-[200px] shrink-0 transition-all hover:-translate-y-1 hover:shadow-lg">
          <p className="text-[18px] font-bold text-dark dark:text-slate-200 tracking-[-0.02em] leading-[1.4]">
            {selectedCategory === 'all' ? '총 구독료' : `${CATEGORIES.find(c => c.id === selectedCategory)?.label} 구독료`}
          </p>
          <div className="flex items-center gap-[3px]">
            <span className="text-[28px] font-bold text-dark dark:text-white tracking-[-0.02em] leading-[1.4]">
              {totalCost.toLocaleString()}
            </span>
            <div className="pt-1">
              <span className="text-[18px] font-medium text-dark dark:text-slate-200 tracking-[-0.02em] leading-[1.4]">원</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full mt-2 flex-1 overflow-hidden flex flex-col">
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

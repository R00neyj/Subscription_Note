import { useState, useMemo } from 'react'
import Header from '../components/Header'
import SubscriptionTable from '../components/SubscriptionTable'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES, CATEGORY_COLORS, TEXT_COLORS } from '../constants/categories'
import SectionHeader from '../components/SectionHeader'
import CategoryDistributionChart from '../components/CategoryDistributionChart'
import { Plus } from 'lucide-react'

export default function SubscriptionList() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  // Toggle Category Logic
  const toggleCategory = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  // Active Subscriptions only
  const activeSubs = useMemo(() => {
    return subscriptions.filter(s => s.status !== 'wishlist')
  }, [subscriptions])

  // Dynamic Category Data Calculation for Chart
  const categoryData = useMemo(() => {
    const targetSubs = activeSubs.filter(s => s.status === 'active')
    if (targetSubs.length === 0) return []

    const grouped = targetSubs.reduce((acc, sub) => {
      const cat = (sub.categories && sub.categories.length > 0) 
        ? sub.categories[0] 
        : (sub.category || 'Etc')
      
      const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
      acc[cat] = (acc[cat] || 0) + price
      return acc
    }, {})

    const total = Object.values(grouped).reduce((a, b) => a + b, 0)

    return Object.entries(grouped)
      .map(([label, value]) => ({
        id: label,
        label,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: CATEGORY_COLORS[label] || CATEGORY_COLORS.Etc,
        textColor: TEXT_COLORS[label] || 'text-white'
      }))
      .sort((a, b) => b.value - a.value)
  }, [activeSubs])

  // Filter and Sort subscriptions
  const sortedSubscriptions = useMemo(() => {
    let data = [...activeSubs]
    
    // 1. Category Filter
    if (selectedCategory !== 'all') {
      data = data.filter(sub => 
        sub.category === selectedCategory || 
        sub.categories?.includes(selectedCategory)
      )
    }

    // 2. Sort
    data.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'active' ? -1 : 1
      }

      if (sortConfig.key) {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'category') {
          aValue = a.category || a.categories?.[0] || ''
          bValue = b.category || b.categories?.[0] || ''
        }

        if (sortConfig.key === 'price') {
           return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        if (sortConfig.key === 'billing_date') {
            const getDay = (str) => parseInt(str?.replace(/[^0-9]/g, '') || '0') || 0
            aValue = getDay(aValue)
            bValue = getDay(bValue)
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }
      } else {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      }
      
      return 0
    })

    return data
  }, [activeSubs, selectedCategory, sortConfig])

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Active Total Cost
  const totalCost = useMemo(() => {
    return sortedSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((acc, sub) => {
        const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
        return acc + price
      }, 0)
  }, [sortedSubscriptions])

  // Yearly estimated cost
  const yearlyCost = totalCost * 12

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:rounded-[48px] px-0 py-4 md:p-8 flex flex-col gap-6 items-start w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        
        {/* Section Header with CTA */}
        <div className="flex items-center justify-between gap-4 w-full">
          <SectionHeader title="구독 목록" className="w-auto" />
          
          <button
            type="button"
            onClick={() => openModal(null, 'active')}
            className="h-[42px] px-4 rounded-[14px] font-bold text-[14px] bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>구독 추가</span>
          </button>
        </div>

        {/* Category Chart Section */}
        {categoryData.length > 0 && (
          <div className="w-full mb-2">
            <CategoryDistributionChart 
              categoryData={categoryData}
              selectedCategory={selectedCategory === 'all' ? null : selectedCategory}
              onCategoryClick={(id) => toggleCategory(id === selectedCategory ? 'all' : id)}
            />
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-4 items-start w-full">
          {/* 총 구독료 */}
          <div className="bg-background dark:bg-slate-900 border border-primary/20 dark:border-primary/40 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full md:max-w-[200px] transition-all duration-300">
            <p className="text-[13px] md:text-[16px] font-bold text-primary leading-[1.4]">
              {selectedCategory === 'all' 
                ? '총 구독료' 
                : `${CATEGORIES.find(c => c.id === selectedCategory)?.label || ''} 구독료`}
            </p>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[26px] font-bold text-dark dark:text-white leading-[1.4]">
                {totalCost.toLocaleString()}
              </span>
              <div className="pt-1">
                <span className="text-[13px] md:text-[16px] font-medium text-dark dark:text-slate-200 leading-[1.4]">원/월</span>
              </div>
            </div>
          </div>

          {/* 연간 예상 지출 */}
          <div className="bg-background dark:bg-slate-900 border border-primary/20 dark:border-primary/40 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full md:max-w-[240px] transition-all duration-300">
            <p className="text-[13px] md:text-[16px] font-bold text-primary leading-[1.4]">
              {selectedCategory === 'all' 
                ? '연간 예상 지출' 
                : `${CATEGORIES.find(c => c.id === selectedCategory)?.label || ''} 연간 지출`}
            </p>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[26px] font-bold text-dark dark:text-white leading-[1.4]">
                {yearlyCost.toLocaleString()}
              </span>
              <div className="pt-1">
                <span className="text-[13px] md:text-[16px] font-medium text-dark dark:text-slate-200 leading-[1.4]">원/년</span>
              </div>
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
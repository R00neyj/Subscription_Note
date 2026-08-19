import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import SubscriptionTable from '../components/SubscriptionTable'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES, CATEGORY_COLORS, TEXT_COLORS } from '../constants/categories'
import SectionHeader from '../components/SectionHeader'
import CategoryDistributionChart from '../components/CategoryDistributionChart'
import { Plus, X } from 'lucide-react'

export default function SubscriptionList() {
  // 홈 대시보드의 카테고리 차트에서 넘어온 드릴다운을 그대로 받는다 (/list?category=OTT)
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') || 'all'

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  // Toggle Category Logic
  const toggleCategory = (categoryId) => {
    if (!categoryId || categoryId === 'all') {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ category: categoryId }, { replace: true })
    }
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
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-900 rounded-2xl md:rounded-3xl px-0 py-2 md:p-6 flex flex-col gap-4 md:gap-6 items-start w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        
        {/* Section Header with CTA */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <SectionHeader title="구독 목록" className="w-auto" />

            {/* 홈에서 넘어온 필터가 걸려 있다는 걸 명시하고, 한 번에 해제할 수 있게 한다 */}
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => toggleCategory('all')}
                className="flex items-center gap-1 h-[28px] px-2.5 rounded-lg bg-primary/10 text-primary dark:text-blue-400 text-[12px] font-bold hover:bg-primary/15 transition-all cursor-pointer shrink-0"
              >
                <span className="truncate max-w-[100px]">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory}
                </span>
                <X className="w-3 h-3 stroke-[3px]" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => openModal(null, 'active')}
            className="h-[36px] md:h-[38px] px-3 md:px-3.5 rounded-xl font-bold text-[13px] md:text-[13.5px] bg-primary hover:bg-primary/90 shadow-xs shadow-primary/20 text-white flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
            <span>구독 추가</span>
          </button>
        </div>

        {/* Category Chart Section */}
        {categoryData.length > 0 && (
          <div className="w-full">
            <CategoryDistributionChart 
              categoryData={categoryData}
              selectedCategory={selectedCategory === 'all' ? null : selectedCategory}
              onCategoryClick={(id) => toggleCategory(id === selectedCategory ? 'all' : id)}
            />
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2.5 md:gap-3 items-start w-full">
          {/* 총 구독료 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-start gap-0.5 w-full md:max-w-[190px] shadow-xs transition-all duration-200">
            <p className="text-[12px] md:text-[13px] font-semibold text-primary">
              {selectedCategory === 'all' 
                ? '총 구독료' 
                : `${CATEGORIES.find(c => c.id === selectedCategory)?.label || ''} 구독료`}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[17px] md:text-[22px] font-bold text-dark dark:text-white">
                {totalCost.toLocaleString()}
              </span>
              <span className="text-[11.5px] md:text-[13px] font-medium text-slate-500 dark:text-slate-400">원/월</span>
            </div>
          </div>

          {/* 연간 예상 지출 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-start gap-0.5 w-full md:max-w-[220px] shadow-xs transition-all duration-200">
            <p className="text-[12px] md:text-[13px] font-semibold text-primary">
              {selectedCategory === 'all' 
                ? '연간 예상 지출' 
                : `${CATEGORIES.find(c => c.id === selectedCategory)?.label || ''} 연간 지출`}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[17px] md:text-[22px] font-bold text-dark dark:text-white">
                {yearlyCost.toLocaleString()}
              </span>
              <span className="text-[11.5px] md:text-[13px] font-medium text-slate-500 dark:text-slate-400">원/년</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full mt-1">
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
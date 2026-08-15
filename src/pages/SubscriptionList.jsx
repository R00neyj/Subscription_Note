import { useState, useMemo } from 'react'
import Header from '../components/Header'
import SubscriptionTable from '../components/SubscriptionTable'
import WishlistTable from '../components/WishlistTable'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES, CATEGORY_COLORS, TEXT_COLORS } from '../constants/categories'
import SectionHeader from '../components/SectionHeader'
import CategoryDistributionChart from '../components/CategoryDistributionChart'
import { Plus, Sparkles, Bookmark, TrendingUp, AlertCircle } from 'lucide-react'
import { cn } from '../lib/utils'

export default function SubscriptionList() {
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'wishlist'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  // Toggle Category Logic
  const toggleCategory = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  // Split Subscriptions by status
  const activeSubs = useMemo(() => {
    return subscriptions.filter(s => s.status !== 'wishlist')
  }, [subscriptions])

  const wishlistSubs = useMemo(() => {
    return subscriptions.filter(s => s.status === 'wishlist')
  }, [subscriptions])

  const currentTabSubs = activeTab === 'active' ? activeSubs : wishlistSubs

  // Dynamic Category Data Calculation for Chart
  const categoryData = useMemo(() => {
    const targetSubs = activeTab === 'active'
      ? activeSubs.filter(s => s.status === 'active')
      : wishlistSubs

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
  }, [activeTab, activeSubs, wishlistSubs])

  // Filter and Sort subscriptions
  const sortedSubscriptions = useMemo(() => {
    let data = [...currentTabSubs]
    
    // 1. Category Filter
    if (selectedCategory !== 'all') {
      data = data.filter(sub => 
        sub.category === selectedCategory || 
        sub.categories?.includes(selectedCategory)
      )
    }

    // 2. Sort
    data.sort((a, b) => {
      // 2.1. Primary Sort for Active: Status (Active first)
      if (activeTab === 'active' && a.status !== b.status) {
        return a.status === 'active' ? -1 : 1
      }

      // 2.2. Secondary Sort: User Configuration
      if (sortConfig.key) {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle category
        if (sortConfig.key === 'category') {
          aValue = a.category || a.categories?.[0] || ''
          bValue = b.category || b.categories?.[0] || ''
        }

        // Handle price
        if (sortConfig.key === 'price') {
           return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        // Handle priority
        if (sortConfig.key === 'wish_priority') {
          const priorityScore = { high: 3, medium: 2, low: 1 }
          const aScore = priorityScore[a.wish_priority] || 2
          const bScore = priorityScore[b.wish_priority] || 2
          return sortConfig.direction === 'asc' ? aScore - bScore : bScore - aScore
        }

        // Handle billing_date
        if (sortConfig.key === 'billing_date') {
            const getDay = (str) => parseInt(str?.replace(/[^0-9]/g, '') || '0') || 0
            aValue = getDay(aValue)
            bValue = getDay(bValue)
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        // Handle date (created_at)
        if (sortConfig.key === 'created_at') {
          const aTime = new Date(a.created_at || 0).getTime()
          const bTime = new Date(b.created_at || 0).getTime()
          return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime
        }

        // Handle strings
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }
      } else {
        // Default: Sort by newest
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      }
      
      return 0
    })

    return data
  }, [currentTabSubs, activeTab, selectedCategory, sortConfig])

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Active Total Cost
  const activeMonthlyTotal = useMemo(() => {
    return sortedSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((acc, sub) => {
        const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
        return acc + price
      }, 0)
  }, [sortedSubscriptions])

  // Wishlist Total Expected Cost
  const wishlistMonthlyTotal = useMemo(() => {
    return sortedSubscriptions.reduce((acc, sub) => {
      const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
      return acc + price
    }, 0)
  }, [sortedSubscriptions])

  const highPriorityWishCount = useMemo(() => {
    return wishlistSubs.filter(s => s.wish_priority === 'high').length
  }, [wishlistSubs])

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:rounded-[48px] px-0 py-4 md:p-8 flex flex-col gap-6 items-start w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        
        {/* Main Tab Controller & Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <SectionHeader title={activeTab === 'active' ? "구독 목록" : "위시리스트 (고민 보관함)"} />
          
          {/* Segmented Control Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-tertiary dark:bg-slate-700/80 rounded-[16px] w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('active')
                  setSortConfig({ key: null, direction: 'asc' })
                }}
                className={cn(
                  "flex-1 md:flex-none px-4 py-2 rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer",
                  activeTab === 'active'
                    ? "bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm"
                    : "text-dark/50 dark:text-slate-400 hover:text-dark dark:hover:text-white"
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span>구독 중</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-extrabold",
                  activeTab === 'active' ? "bg-primary/10 text-primary dark:text-blue-400" : "bg-dark/5 dark:bg-slate-600 text-dark/60 dark:text-slate-300"
                )}>
                  {activeSubs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('wishlist')
                  setSortConfig({ key: null, direction: 'asc' })
                }}
                className={cn(
                  "flex-1 md:flex-none px-4 py-2 rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer",
                  activeTab === 'wishlist'
                    ? "bg-white dark:bg-slate-800 text-amber-500 shadow-sm"
                    : "text-dark/50 dark:text-slate-400 hover:text-dark dark:hover:text-white"
                )}
              >
                <Bookmark className="w-4 h-4" />
                <span>위시리스트</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-extrabold",
                  activeTab === 'wishlist' ? "bg-amber-500/10 text-amber-500" : "bg-dark/5 dark:bg-slate-600 text-dark/60 dark:text-slate-300"
                )}>
                  {wishlistSubs.length}
                </span>
              </button>
            </div>

            {/* Quick Add CTA */}
            <button
              type="button"
              onClick={() => openModal(null, activeTab)}
              className={cn(
                "hidden md:flex h-[42px] px-4 rounded-[14px] font-bold text-[14px] items-center gap-1.5 transition-all cursor-pointer shadow-sm text-white",
                activeTab === 'wishlist' 
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" 
                  : "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'wishlist' ? '위시 추가' : '구독 추가'}</span>
            </button>
          </div>
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
        {activeTab === 'active' ? (
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
                  {activeMonthlyTotal.toLocaleString()}
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
                  {(activeMonthlyTotal * 12).toLocaleString()}
                </span>
                <div className="pt-1">
                  <span className="text-[13px] md:text-[16px] font-medium text-dark dark:text-slate-200 leading-[1.4]">원/년</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 items-start w-full">
            {/* 위시리스트 추가 예상 지출 */}
            <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full transition-all duration-300">
              <p className="text-[13px] md:text-[15px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                모두 구독 시 추가 월 지출
              </p>
              <div className="flex items-center gap-[3px]">
                <span className="text-[20px] md:text-[26px] font-bold text-dark dark:text-white leading-[1.4]">
                  +{wishlistMonthlyTotal.toLocaleString()}
                </span>
                <div className="pt-1">
                  <span className="text-[13px] md:text-[16px] font-medium text-dark dark:text-slate-200 leading-[1.4]">원/월</span>
                </div>
              </div>
            </div>

            {/* 고민 중인 서비스 수 */}
            <div className="bg-background dark:bg-slate-900 border border-tertiary dark:border-slate-700 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full transition-all duration-300">
              <p className="text-[13px] md:text-[15px] font-bold text-dark/60 dark:text-slate-400">
                담아둔 고민 항목
              </p>
              <div className="flex items-center gap-[3px]">
                <span className="text-[20px] md:text-[26px] font-bold text-dark dark:text-white leading-[1.4]">
                  {sortedSubscriptions.length}
                </span>
                <div className="pt-1">
                  <span className="text-[13px] md:text-[16px] font-medium text-dark dark:text-slate-200 leading-[1.4]">개</span>
                </div>
              </div>
            </div>

            {/* 우선순위 높음 항목 */}
            <div className="col-span-2 md:col-span-1 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full transition-all duration-300">
              <p className="text-[13px] md:text-[15px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                결제 임박 (우선순위 높음)
              </p>
              <div className="flex items-center gap-[3px]">
                <span className="text-[20px] md:text-[26px] font-bold text-rose-600 dark:text-rose-400 leading-[1.4]">
                  {highPriorityWishCount}
                </span>
                <div className="pt-1">
                  <span className="text-[13px] md:text-[16px] font-medium text-dark dark:text-slate-200 leading-[1.4]">개</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="w-full mt-2">
          {activeTab === 'active' ? (
            <SubscriptionTable 
              data={sortedSubscriptions} 
              onRowClick={(item) => openModal(item)}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          ) : (
            <WishlistTable 
              data={sortedSubscriptions} 
              onRowClick={(item) => openModal(item)}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          )}
        </div>
      </div>
    </div>
  )
}
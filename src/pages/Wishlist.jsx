import { useState, useMemo } from 'react'
import Header from '../components/Header'
import WishlistTable from '../components/WishlistTable'
import ImportFromActiveModal from '../components/ImportFromActiveModal'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES, CATEGORY_COLORS, TEXT_COLORS } from '../constants/categories'
import SectionHeader from '../components/SectionHeader'
import CategoryDistributionChart from '../components/CategoryDistributionChart'
import { Plus, TrendingUp, TrendingDown, Bookmark, Flame, CopyPlus } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Wishlist() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  const activeSubs = useMemo(() => {
    return subscriptions.filter(s => s.status !== 'wishlist')
  }, [subscriptions])

  const wishlistSubs = useMemo(() => {
    return subscriptions.filter(s => s.status === 'wishlist')
  }, [subscriptions])

  // Helper to calculate net delta for a wishlist item against existing subscriptions
  const getNetDelta = (wishItem) => {
    let matchedActive = null
    if (wishItem.upgrade_from_id) {
      matchedActive = activeSubs.find(s => s.id === wishItem.upgrade_from_id)
    } else {
      const itemNorm = wishItem.service_name.trim().toLowerCase().replace(/\s+/g, '')
      matchedActive = activeSubs.find(s => {
        const sNorm = s.service_name.trim().toLowerCase().replace(/\s+/g, '')
        return itemNorm.includes(sNorm) || sNorm.includes(itemNorm)
      })
    }

    const wishMonthly = wishItem.billing_cycle === 'yearly' 
      ? Math.floor(wishItem.price / 12) 
      : wishItem.price

    if (matchedActive) {
      const activeMonthly = matchedActive.billing_cycle === 'yearly'
        ? Math.floor(matchedActive.price / 12)
        : matchedActive.price
      return {
        delta: wishMonthly - activeMonthly,
        matchedActive,
        isUpgrade: true
      }
    }

    return {
      delta: wishMonthly,
      matchedActive: null,
      isUpgrade: false
    }
  }

  // Toggle Category Logic
  const toggleCategory = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  // Category Distribution for Wishlist
  const categoryData = useMemo(() => {
    if (wishlistSubs.length === 0) return []

    const grouped = wishlistSubs.reduce((acc, sub) => {
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
  }, [wishlistSubs])

  // Filter and Sort Wishlist items
  const sortedWishlist = useMemo(() => {
    let data = [...wishlistSubs]
    
    // 1. Category Filter
    if (selectedCategory !== 'all') {
      data = data.filter(sub => 
        sub.category === selectedCategory || 
        sub.categories?.includes(selectedCategory)
      )
    }

    // 2. Sort
    data.sort((a, b) => {
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

        if (sortConfig.key === 'created_at') {
          const aTime = new Date(a.created_at || 0).getTime()
          const bTime = new Date(b.created_at || 0).getTime()
          return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime
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
  }, [wishlistSubs, selectedCategory, sortConfig])

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Precision Net Delta Monthly Total (avoiding duplicate count for plan upgrades)
  const wishlistNetMonthlyTotal = useMemo(() => {
    return sortedWishlist.reduce((acc, sub) => {
      const { delta } = getNetDelta(sub)
      return acc + delta
    }, 0)
  }, [sortedWishlist, activeSubs])

  // Current Active Total Monthly Cost
  const currentActiveMonthlyTotal = useMemo(() => {
    return activeSubs
      .filter(s => s.status === 'active')
      .reduce((acc, sub) => {
        const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
        return acc + price
      }, 0)
  }, [activeSubs])

  // Expected Total Monthly Cost After Wishlist
  const expectedTotalMonthly = useMemo(() => {
    return Math.max(0, currentActiveMonthlyTotal + wishlistNetMonthlyTotal)
  }, [currentActiveMonthlyTotal, wishlistNetMonthlyTotal])

  // Max expense wishlist item
  const maxExpenseWishItem = useMemo(() => {
    if (wishlistSubs.length === 0) return null
    return [...wishlistSubs].sort((a, b) => {
      const aPrice = a.billing_cycle === 'yearly' ? Math.floor(a.price / 12) : a.price
      const bPrice = b.billing_cycle === 'yearly' ? Math.floor(b.price / 12) : b.price
      return bPrice - aPrice
    })[0]
  }, [wishlistSubs])

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:rounded-[48px] px-0 py-4 md:p-8 flex flex-col gap-6 items-start w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        
        {/* Section Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <SectionHeader title="위시리스트 (고민 보관함)" className="w-auto" />
          
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Import from active subscription CTA */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="h-[42px] px-3.5 rounded-[14px] font-bold text-[13.5px] bg-tertiary dark:bg-slate-700/80 hover:bg-tertiary/80 text-dark/75 dark:text-slate-200 border border-dark/5 dark:border-slate-600 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
              title="현재 구독 중인 항목을 위시리스트로 복제하여 고민하기"
            >
              <CopyPlus className="w-4 h-4 text-primary dark:text-blue-400" />
              <span>구독 목록 불러오기</span>
            </button>

            {/* Direct Add CTA */}
            <button
              type="button"
              onClick={() => openModal(null, 'wishlist')}
              className="h-[42px] px-4 rounded-[14px] font-bold text-[14px] bg-amber-500 hover:bg-amber-600 shadow-sm shadow-amber-500/20 text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>위시 추가</span>
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 items-start w-full">
          {/* 모두 구독 시 추가/절감 월 지출 및 예상 총 지출량 */}
          {(() => {
            const isSaving = wishlistNetMonthlyTotal < 0
            return (
              <div className={cn(
                "border rounded-[24px] p-4 md:p-6 flex flex-col justify-between items-start gap-2.5 w-full transition-all duration-300",
                isSaving 
                  ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" 
                  : "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20"
              )}>
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center justify-between w-full">
                    <p className={cn(
                      "text-[13px] md:text-[15px] font-bold flex items-center gap-1.5",
                      isSaving ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    )}>
                      {isSaving ? (
                        <>
                          <TrendingDown className="w-4 h-4" />
                          모두 구독 시 월 지출 절감
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          모두 구독 시 순 추가 지출
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-[3px]">
                    <span className={cn(
                      "text-[22px] md:text-[28px] font-extrabold leading-[1.3]",
                      isSaving ? "text-emerald-600 dark:text-emerald-400" : "text-dark dark:text-white"
                    )}>
                      {wishlistNetMonthlyTotal > 0 ? `+${wishlistNetMonthlyTotal.toLocaleString()}` : `${wishlistNetMonthlyTotal.toLocaleString()}`}
                    </span>
                    <div className="pt-1">
                      <span className={cn(
                        "text-[13px] md:text-[16px] font-medium leading-[1.4]",
                        isSaving ? "text-emerald-700/80 dark:text-emerald-300/80" : "text-dark dark:text-slate-200"
                      )}>
                        원/월
                      </span>
                    </div>
                  </div>
                </div>

                {/* Before / After Total Amount Flow */}
                <div className={cn(
                  "w-full pt-2.5 border-t flex flex-wrap items-center justify-between gap-1 text-[12px] md:text-[13px]",
                  isSaving ? "border-emerald-500/15" : "border-amber-500/15"
                )}>
                  <span className="text-dark/50 dark:text-slate-400 font-medium">예상 총 월 지출:</span>
                  <div className="flex items-center gap-1 font-bold">
                    <span className="text-dark/60 dark:text-slate-400">{currentActiveMonthlyTotal.toLocaleString()}원</span>
                    <span className="text-dark/40 dark:text-slate-500 font-normal">➔</span>
                    <span className={cn(
                      "font-extrabold text-[13px] md:text-[14px]",
                      isSaving ? "text-emerald-600 dark:text-emerald-400" : "text-primary dark:text-blue-400"
                    )}>
                      {expectedTotalMonthly.toLocaleString()}원/월
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* 담아둔 고민 항목 수 */}
          <div className="bg-background dark:bg-slate-900 border border-tertiary dark:border-slate-700 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full transition-all duration-300">
            <p className="text-[13px] md:text-[15px] font-bold text-dark/60 dark:text-slate-400 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-amber-500" />
              담아둔 고민 항목
            </p>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[26px] font-bold text-dark dark:text-white leading-[1.4]">
                {sortedWishlist.length}
              </span>
              <div className="pt-1">
                <span className="text-[13px] md:text-[16px] font-medium text-dark dark:text-slate-200 leading-[1.4]">개</span>
              </div>
            </div>
          </div>

          {/* 가장 큰 고민 항목 (최대 지출 후보) */}
          <div className="col-span-2 md:col-span-1 bg-background dark:bg-slate-900 border border-tertiary dark:border-slate-700 rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full transition-all duration-300">
            <p className="text-[13px] md:text-[15px] font-bold text-dark/60 dark:text-slate-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              최대 지출 고민 항목
            </p>
            {maxExpenseWishItem ? (
              <div className="flex items-baseline gap-2 w-full truncate">
                <span className="text-[18px] md:text-[22px] font-bold text-dark dark:text-white truncate">
                  {maxExpenseWishItem.service_name}
                </span>
                <span className="text-[13px] md:text-[15px] font-extrabold text-primary shrink-0">
                  {maxExpenseWishItem.price?.toLocaleString()}원
                </span>
              </div>
            ) : (
              <span className="text-[16px] font-bold text-dark/30 dark:text-slate-500">
                -
              </span>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full mt-2">
          <WishlistTable 
            data={sortedWishlist} 
            activeSubs={activeSubs}
            onRowClick={(item) => openModal(item)}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>
      </div>

      {/* Import from Active Modal */}
      <ImportFromActiveModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  )
}

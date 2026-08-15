import { useState, useMemo, useEffect } from 'react'
import Header from '../components/Header'
import WishlistTable from '../components/WishlistTable'
import ActiveCutDietSection from '../components/ActiveCutDietSection'
import ImportFromActiveModal from '../components/ImportFromActiveModal'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES, CATEGORY_COLORS, TEXT_COLORS } from '../constants/categories'
import SectionHeader from '../components/SectionHeader'
import CategoryDistributionChart from '../components/CategoryDistributionChart'
import { Plus, TrendingUp, TrendingDown, Scissors, Bookmark, Flame, CopyPlus, Wallet, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Wishlist() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  
  // Interactive Simulation State
  const [excludedActiveIds, setExcludedActiveIds] = useState([])
  const [selectedWishlistIds, setSelectedWishlistIds] = useState([])

  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  const activeSubs = useMemo(() => {
    return subscriptions.filter(s => s.status !== 'wishlist')
  }, [subscriptions])

  const wishlistSubs = useMemo(() => {
    return subscriptions.filter(s => s.status === 'wishlist')
  }, [subscriptions])

  // Sync default selected wishlist items on initial load or count change
  useEffect(() => {
    setSelectedWishlistIds(wishlistSubs.map(w => w.id))
  }, [wishlistSubs.length])

  const handleToggleExcludeActive = (id) => {
    setExcludedActiveIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleToggleSelectWish = (id) => {
    setSelectedWishlistIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAllWish = () => {
    if (selectedWishlistIds.length === sortedWishlist.length) {
      setSelectedWishlistIds([])
    } else {
      setSelectedWishlistIds(sortedWishlist.map(w => w.id))
    }
  }

  // Helper to calculate net delta for a wishlist item against existing subscriptions
  const getNetDelta = (wishItem) => {
    let matchedActive = null
    if (wishItem.upgrade_from_id) {
      matchedActive = activeSubs.find(s => s.id === wishItem.upgrade_from_id)
    } else {
      const wishNorm = wishItem.service_name.trim().toLowerCase().replace(/\s+/g, '')
      matchedActive = activeSubs.find(sub => {
        const subNorm = sub.service_name.trim().toLowerCase().replace(/\s+/g, '')
        return wishNorm.includes(subNorm) || subNorm.includes(wishNorm)
      })
    }

    const isYearly = wishItem.billing_cycle === 'yearly'
    const wishMonthly = isYearly ? Math.floor(wishItem.price / 12) : wishItem.price

    if (matchedActive) {
      const activeMonthly = matchedActive.billing_cycle === 'yearly'
        ? Math.floor(matchedActive.price / 12)
        : matchedActive.price
      return {
        matchedActive,
        delta: wishMonthly - activeMonthly,
        wishMonthly,
        activeMonthly
      }
    }

    return {
      matchedActive: null,
      delta: wishMonthly,
      wishMonthly,
      activeMonthly: 0
    }
  }

  // Dynamic Category Distribution Data for Wishlist
  const categoryData = useMemo(() => {
    if (wishlistSubs.length === 0) return []

    const grouped = wishlistSubs.reduce((acc, sub) => {
      const cat = sub.category || sub.categories?.[0] || 'Etc'
      const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
      acc[cat] = (acc[cat] || 0) + price
      return acc
    }, {})

    const total = Object.values(grouped).reduce((a, b) => a + b, 0)
    if (total === 0) return []

    return Object.entries(grouped)
      .map(([label, value]) => ({
        id: label,
        label,
        value,
        percentage: (value / total) * 100,
        color: CATEGORY_COLORS[label] || CATEGORY_COLORS.Etc,
        textColor: TEXT_COLORS[label] || 'text-white'
      }))
      .sort((a, b) => b.value - a.value)
  }, [wishlistSubs])

  const toggleCategory = (id) => {
    setSelectedCategory(current => current === id ? 'all' : id)
  }

  // Filtered & Sorted Wishlist Data
  const sortedWishlist = useMemo(() => {
    let data = wishlistSubs

    if (selectedCategory !== 'all') {
      data = data.filter((sub) => {
        const cat = sub.category || sub.categories?.[0] || 'Etc'
        return cat === selectedCategory
      })
    }

    if (sortConfig.key) {
      data = [...data].sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        if (sortConfig.key === 'category') {
          aVal = a.category || a.categories?.[0] || 'Etc'
          bVal = b.category || b.categories?.[0] || 'Etc'
        }

        if (sortConfig.key === 'price') {
          aVal = a.billing_cycle === 'yearly' ? Math.floor(a.price / 12) : a.price
          bVal = b.billing_cycle === 'yearly' ? Math.floor(b.price / 12) : b.price
        }

        if (sortConfig.key === 'created_at') {
          aVal = new Date(a.created_at || 0).getTime()
          bVal = new Date(b.created_at || 0).getTime()
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    } else {
      data = [...data].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    }

    return data
  }, [wishlistSubs, selectedCategory, sortConfig])

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // 1. Current Active Total Monthly Cost
  const currentActiveMonthlyTotal = useMemo(() => {
    return activeSubs
      .filter(s => s.status === 'active')
      .reduce((acc, sub) => {
        const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
        return acc + price
      }, 0)
  }, [activeSubs])

  // 2. Simulated Wishlist Add Total (Selected only)
  const simulatedWishlistAdd = useMemo(() => {
    return wishlistSubs
      .filter(sub => selectedWishlistIds.includes(sub.id))
      .reduce((acc, sub) => {
        const { delta } = getNetDelta(sub)
        return acc + delta
      }, 0)
  }, [wishlistSubs, selectedWishlistIds, activeSubs])

  // 3. Simulated Active Cut (Diet Savings)
  const simulatedActiveCut = useMemo(() => {
    return activeSubs
      .filter(sub => excludedActiveIds.includes(sub.id))
      .reduce((acc, sub) => {
        const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
        return acc + price
      }, 0)
  }, [activeSubs, excludedActiveIds])

  // 4. Simulated Net Change
  const simulatedNetChange = simulatedWishlistAdd - simulatedActiveCut

  // 5. Simulated Final Total Monthly Cost
  const simulatedFinalTotal = Math.max(0, currentActiveMonthlyTotal + simulatedNetChange)

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
          <div className="flex flex-col">
            <SectionHeader title="위시리스트 & 지출 시뮬레이터" className="w-auto" />
            <p className="text-[13px] md:text-[14px] text-dark/50 dark:text-slate-400 font-medium">
              새 구독 추가와 기존 구독 덜어내기를 조합하여 최적의 월 지출 균형을 찾아보세요.
            </p>
          </div>
          
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

        {/* 4-Split Live Balanced Simulator Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-start w-full">
          
          {/* 1. 가상 도입 (위시 추가액) */}
          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-[24px] p-4 md:p-6 flex flex-col justify-between items-start gap-2 w-full h-full min-h-[120px] md:min-h-[140px] transition-all duration-300">
            <div className="flex items-center justify-between w-full">
              <p className="text-[13px] md:text-[16px] font-bold leading-[1.4] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 truncate">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="truncate">가상 도입 (위시)</span>
              </p>
            </div>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white leading-[1.4]">
                +{simulatedWishlistAdd.toLocaleString()}
              </span>
              <div className="pt-1">
                <span className="text-[13px] md:text-[16px] font-medium text-dark dark:text-slate-200 leading-[1.4]">
                  원/월
                </span>
              </div>
            </div>
            <span className="text-[11px] md:text-[12px] text-amber-700/60 dark:text-amber-300/60 font-medium truncate">
              {selectedWishlistIds.length}개 항목 선택됨
            </span>
          </div>

          {/* 2. 가상 덜어내기 (구독 다이어트 절감액) */}
          <div className={cn(
            "rounded-[24px] p-4 md:p-6 flex flex-col justify-between items-start gap-2 w-full h-full min-h-[120px] md:min-h-[140px] transition-all duration-300 border",
            simulatedActiveCut > 0
              ? "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30"
              : "bg-background dark:bg-slate-900 border-tertiary dark:border-slate-700"
          )}>
            <div className="flex items-center justify-between w-full">
              <p className={cn(
                "text-[13px] md:text-[16px] font-bold leading-[1.4] flex items-center gap-1.5 truncate",
                simulatedActiveCut > 0 ? "text-rose-600 dark:text-rose-400" : "text-dark/60 dark:text-slate-400"
              )}>
                <Scissors className="w-4 h-4 shrink-0" />
                <span className="truncate">가상 덜어내기</span>
              </p>
            </div>
            <div className="flex items-center gap-[3px]">
              <span className={cn(
                "text-[20px] md:text-[28px] font-bold leading-[1.4]",
                simulatedActiveCut > 0 ? "text-rose-600 dark:text-rose-400" : "text-dark/40 dark:text-slate-500"
              )}>
                {simulatedActiveCut > 0 ? `-${simulatedActiveCut.toLocaleString()}` : '0'}
              </span>
              <div className="pt-1">
                <span className="text-[13px] md:text-[16px] font-medium text-dark dark:text-slate-200 leading-[1.4]">
                  원/월
                </span>
              </div>
            </div>
            <span className={cn(
              "text-[11px] md:text-[12px] font-medium truncate",
              simulatedActiveCut > 0 ? "text-rose-700/70 dark:text-rose-300/70" : "text-dark/40 dark:text-slate-500"
            )}>
              {excludedActiveIds.length > 0 ? `${excludedActiveIds.length}개 해지 시뮬레이션 중` : '아래에서 해지할 항목 선택'}
            </span>
          </div>

          {/* 3. 최종 순 변동액 (Net Delta) */}
          {(() => {
            const isSaving = simulatedNetChange < 0
            const isZero = simulatedNetChange === 0
            return (
              <div className={cn(
                "border rounded-[24px] p-4 md:p-6 flex flex-col justify-between items-start gap-2 w-full h-full min-h-[120px] md:min-h-[140px] transition-all duration-300",
                isSaving 
                  ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" 
                  : isZero
                    ? "bg-background dark:bg-slate-900 border-tertiary dark:border-slate-700"
                    : "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20"
              )}>
                <div className="flex items-center justify-between w-full">
                  <p className={cn(
                    "text-[13px] md:text-[16px] font-bold leading-[1.4] flex items-center gap-1.5 truncate",
                    isSaving ? "text-emerald-600 dark:text-emerald-400" : isZero ? "text-dark/60 dark:text-slate-400" : "text-amber-600 dark:text-amber-400"
                  )}>
                    {isSaving ? (
                      <>
                        <TrendingDown className="w-4 h-4 shrink-0" />
                        <span className="truncate">최종 월 절감액</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 shrink-0" />
                        <span className="truncate">최종 순 추가 지출</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-[3px]">
                  <span className={cn(
                    "text-[20px] md:text-[28px] font-bold leading-[1.4]",
                    isSaving ? "text-emerald-600 dark:text-emerald-400" : isZero ? "text-dark dark:text-white" : "text-dark dark:text-white"
                  )}>
                    {simulatedNetChange > 0 ? `+${simulatedNetChange.toLocaleString()}` : `${simulatedNetChange.toLocaleString()}`}
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
                <span className={cn(
                  "text-[11px] md:text-[12px] font-medium truncate",
                  isSaving ? "text-emerald-700/60 dark:text-emerald-300/60" : "text-amber-700/60 dark:text-amber-300/60"
                )}>
                  {isSaving ? '도입 후에도 총 지출 감소' : '덜어내기 상쇄 반영 완료'}
                </span>
              </div>
            )
          })()}

          {/* 4. 예상 총 월 지출 */}
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/40 rounded-[24px] p-4 md:p-6 flex flex-col justify-between items-start gap-2 w-full h-full min-h-[120px] md:min-h-[140px] transition-all duration-300">
            <div className="flex items-center justify-between w-full">
              <p className="text-[13px] md:text-[16px] font-bold text-primary dark:text-blue-400 leading-[1.4] flex items-center gap-1.5 truncate">
                <Wallet className="w-4 h-4 shrink-0" />
                <span className="truncate">예상 총 월 지출</span>
              </p>
            </div>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[28px] font-bold text-primary dark:text-blue-400 leading-[1.4]">
                {simulatedFinalTotal.toLocaleString()}
              </span>
              <div className="pt-1">
                <span className="text-[13px] md:text-[16px] font-medium text-dark dark:text-slate-200 leading-[1.4]">
                  원/월
                </span>
              </div>
            </div>
            <span className="text-[11px] md:text-[12px] text-dark/50 dark:text-slate-400 font-medium truncate">
              현재 {currentActiveMonthlyTotal.toLocaleString()}원 대비
            </span>
          </div>
        </div>

        {/* Section 1: Wishlist Table (가상 도입 목록) */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] md:text-[18px] font-bold text-dark dark:text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              가상 도입 위시리스트
            </h3>
            <span className="text-[12px] text-dark/40 dark:text-slate-400 font-medium">
              체크박스를 끄면 시뮬레이션 총액에서 제외됩니다.
            </span>
          </div>
          <WishlistTable 
            data={sortedWishlist} 
            activeSubs={activeSubs}
            selectedWishlistIds={selectedWishlistIds}
            onToggleSelectWish={handleToggleSelectWish}
            onToggleSelectAllWish={handleToggleSelectAllWish}
            onRowClick={(item) => openModal(item)}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>

        {/* Section 2: Active Cut Diet Section (기존 구독 덜어내기 패널) */}
        <div className="w-full mt-2">
          <ActiveCutDietSection 
            activeSubs={activeSubs}
            excludedActiveIds={excludedActiveIds}
            onToggleExclude={handleToggleExcludeActive}
            wishlistAddTotal={simulatedWishlistAdd}
          />
        </div>

      </div>

      {/* Modals */}
      <ImportFromActiveModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  )
}

import { useState, useMemo, useEffect, useRef } from 'react'
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

  // 차액 계산·교체 후보는 실제로 결제 중인 구독만 대상으로 한다.
  // status !== 'wishlist' 에는 이미 해지(disable)한 구독도 섞여 있어,
  // 그대로 쓰면 결제하지 않는 금액을 차감해 시뮬레이션 총액이 과소 계산된다.
  const replaceableSubs = useMemo(() => {
    return activeSubs.filter(s => s.status === 'active')
  }, [activeSubs])

  const wishlistIdsKey = wishlistSubs.map(w => w.id).join(',')
  const knownWishlistIdsRef = useRef(null)

  // 새로 추가된 항목은 기본 선택하고 삭제된 항목만 정리한다.
  // (목록 개수만 보면 사용자가 직접 해제한 선택이 되돌아가거나, 추가/삭제가 상쇄될 때 갱신을 놓친다)
  useEffect(() => {
    const currentIds = wishlistSubs.map(w => w.id)
    const knownIds = knownWishlistIdsRef.current
    knownWishlistIdsRef.current = new Set(currentIds)

    if (knownIds === null) {
      setSelectedWishlistIds(currentIds)
      return
    }

    const addedIds = currentIds.filter(id => !knownIds.has(id))
    setSelectedWishlistIds(prev => [
      ...prev.filter(id => knownWishlistIdsRef.current.has(id)),
      ...addedIds
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistIdsKey])

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

  // 전체 선택은 화면에 보이는(카테고리 필터가 적용된) 목록만 대상으로 하고,
  // 필터에 가려진 다른 카테고리의 선택은 그대로 유지한다.
  const handleToggleSelectAllWish = () => {
    const visibleIds = sortedWishlist.map(w => w.id)
    const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedWishlistIds.includes(id))

    setSelectedWishlistIds(prev => {
      const hiddenSelected = prev.filter(id => !visibleIds.includes(id))
      return isAllVisibleSelected ? hiddenSelected : [...hiddenSelected, ...visibleIds]
    })
  }

  // Helper to calculate net delta for a wishlist item against existing subscriptions
  const getNetDelta = (wishItem) => {
    let matchedActive = null
    if (wishItem.upgrade_from_id) {
      matchedActive = replaceableSubs.find(s => s.id === wishItem.upgrade_from_id)
    } else {
      const wishNorm = wishItem.service_name.trim().toLowerCase().replace(/\s+/g, '')
      matchedActive = replaceableSubs.find(sub => {
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
    return replaceableSubs
      .reduce((acc, sub) => {
        const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
        return acc + price
      }, 0)
  }, [replaceableSubs])

  // 2. Simulated Wishlist Add Total (Selected only)
  const simulatedWishlistAdd = useMemo(() => {
    return wishlistSubs
      .filter(sub => selectedWishlistIds.includes(sub.id))
      .reduce((acc, sub) => {
        const { delta } = getNetDelta(sub)
        return acc + delta
      }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistSubs, selectedWishlistIds, replaceableSubs])

  // 3. Simulated Active Cut (Diet Savings)
  // 이미 비활성화된 구독은 currentActiveMonthlyTotal에 포함되지 않으므로
  // 여기서도 제외해야 같은 금액이 두 번 차감되지 않는다.
  const simulatedActiveCut = useMemo(() => {
    return replaceableSubs
      .filter(sub => excludedActiveIds.includes(sub.id))
      .reduce((acc, sub) => {
        const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
        return acc + price
      }, 0)
  }, [replaceableSubs, excludedActiveIds])

  // 화면 표기는 실제로 절감액에 반영된 항목 수와 일치시킨다
  const excludedCutCount = useMemo(() => {
    return replaceableSubs.filter(sub => excludedActiveIds.includes(sub.id)).length
  }, [replaceableSubs, excludedActiveIds])

  // 4. Simulated Net Change
  const simulatedNetChange = simulatedWishlistAdd - simulatedActiveCut

  // 5. Simulated Final Total Monthly Cost
  const simulatedFinalTotal = Math.max(0, currentActiveMonthlyTotal + simulatedNetChange)


  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-900 rounded-2xl md:rounded-3xl px-0 py-2 md:p-6 flex flex-col gap-4 md:gap-6 items-start w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        
        {/* Section Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
          <div className="flex flex-col">
            <SectionHeader title="구독 다이어트 시뮬레이터" className="w-auto" />
            <p className="text-[12px] md:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              새 구독 추가와 기존 구독 덜어내기를 조합하여 최적의 월 지출 균형을 찾아보세요.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            {/* Import from active subscription CTA */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="h-[36px] md:h-[38px] px-3 rounded-xl font-bold text-[12.5px] md:text-[13px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-xs"
              title="현재 구독 중인 항목을 위시리스트로 복제하여 고민하기"
            >
              <CopyPlus className="w-3.5 h-3.5 text-primary dark:text-blue-400" />
              <span>구독 불러오기</span>
            </button>

            {/* Direct Add CTA */}
            <button
              type="button"
              onClick={() => openModal(null, 'wishlist')}
              className="h-[36px] md:h-[38px] px-3 md:px-3.5 rounded-xl font-bold text-[13px] md:text-[13.5px] bg-amber-500 hover:bg-amber-600 shadow-xs shadow-amber-500/20 text-white flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
              <span>위시 추가</span>
            </button>
          </div>
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

        {/* 4-Split Live Balanced Simulator Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3 items-start w-full">
          
          {/* 1. 가상 도입 (위시 추가액) */}
          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col justify-between items-start gap-1 w-full h-full min-h-[90px] md:min-h-[110px] transition-all duration-200">
            <p className="text-[11.5px] md:text-[13px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 truncate">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">가상 도입 (위시)</span>
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[17px] md:text-[22px] font-bold text-dark dark:text-white">
                +{simulatedWishlistAdd.toLocaleString()}
              </span>
              <span className="text-[11.5px] md:text-[13px] font-medium text-slate-500 dark:text-slate-400">원/월</span>
            </div>
            <span className="text-[10px] md:text-[11.5px] text-amber-700/60 dark:text-amber-300/60 font-medium truncate">
              {selectedWishlistIds.length}개 항목 선택됨
            </span>
          </div>

          {/* 2. 가상 덜어내기 (구독 다이어트 절감액) */}
          <div className={cn(
            "rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col justify-between items-start gap-1 w-full h-full min-h-[90px] md:min-h-[110px] transition-all duration-200 border",
            simulatedActiveCut > 0
              ? "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
          )}>
            <p className={cn(
              "text-[11.5px] md:text-[13px] font-bold flex items-center gap-1 truncate",
              simulatedActiveCut > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
            )}>
              <Scissors className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">가상 덜어내기</span>
            </p>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-[17px] md:text-[22px] font-bold",
                simulatedActiveCut > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-slate-500"
              )}>
                {simulatedActiveCut > 0 ? `-${simulatedActiveCut.toLocaleString()}` : '0'}
              </span>
              <span className="text-[11.5px] md:text-[13px] font-medium text-slate-500 dark:text-slate-400">원/월</span>
            </div>
            <span className={cn(
              "text-[10px] md:text-[11.5px] font-medium truncate",
              simulatedActiveCut > 0 ? "text-rose-700/70 dark:text-rose-300/70" : "text-slate-400 dark:text-slate-500"
            )}>
              {excludedCutCount > 0 ? `${excludedCutCount}개 해지 중` : '아래에서 선택'}
            </span>
          </div>

          {/* 3. 최종 순 변동액 (Net Delta) */}
          {(() => {
            const isSaving = simulatedNetChange < 0
            const isZero = simulatedNetChange === 0
            return (
              <div className={cn(
                "border rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col justify-between items-start gap-1 w-full h-full min-h-[90px] md:min-h-[110px] transition-all duration-200",
                isSaving 
                  ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" 
                  : isZero
                    ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                    : "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20"
              )}>
                <p className={cn(
                  "text-[11.5px] md:text-[13px] font-bold flex items-center gap-1 truncate",
                  isSaving ? "text-emerald-600 dark:text-emerald-400" : isZero ? "text-slate-500 dark:text-slate-400" : "text-amber-600 dark:text-amber-400"
                )}>
                  {isSaving ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">최종 월 절감액</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">최종 순 추가 지출</span>
                    </>
                  )}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-[17px] md:text-[22px] font-bold",
                    isSaving ? "text-emerald-600 dark:text-emerald-400" : isZero ? "text-dark dark:text-white" : "text-dark dark:text-white"
                  )}>
                    {simulatedNetChange > 0 ? `+${simulatedNetChange.toLocaleString()}` : `${simulatedNetChange.toLocaleString()}`}
                  </span>
                  <span className={cn(
                    "text-[11.5px] md:text-[13px] font-medium",
                    isSaving ? "text-emerald-700/80 dark:text-emerald-300/80" : "text-slate-500 dark:text-slate-400"
                  )}>
                    원/월
                  </span>
                </div>
                <span className={cn(
                  "text-[10px] md:text-[11.5px] font-medium truncate",
                  isSaving ? "text-emerald-700/60 dark:text-emerald-300/60" : "text-amber-700/60 dark:text-amber-300/60"
                )}>
                  {isSaving ? '도입 후에도 총 지출 감소' : '덜어내기 상쇄 반영'}
                </span>
              </div>
            )
          })()}

          {/* 4. 예상 총 월 지출 */}
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/40 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col justify-between items-start gap-1 w-full h-full min-h-[90px] md:min-h-[110px] transition-all duration-200">
            <p className="text-[11.5px] md:text-[13px] font-bold text-primary dark:text-blue-400 flex items-center gap-1 truncate">
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">예상 총 월 지출</span>
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[17px] md:text-[22px] font-bold text-primary dark:text-blue-400">
                {simulatedFinalTotal.toLocaleString()}
              </span>
              <span className="text-[11.5px] md:text-[13px] font-medium text-slate-500 dark:text-slate-400">원/월</span>
            </div>
            <span className="text-[10px] md:text-[11.5px] text-slate-400 font-medium truncate">
              현재 {currentActiveMonthlyTotal.toLocaleString()}원 대비
            </span>
          </div>
        </div>

        {/* Section 1: Wishlist Table (가상 도입 목록) */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] md:text-[17px] font-bold text-dark dark:text-white flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
              가상 도입 위시리스트
            </h3>
            <span className="text-[12px] text-dark/40 dark:text-slate-400 font-medium">
              체크박스를 끄면 시뮬레이션 총액에서 제외됩니다.
            </span>
          </div>
          <WishlistTable
            data={sortedWishlist}
            activeSubs={replaceableSubs}
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

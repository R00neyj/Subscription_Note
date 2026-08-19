import { useMemo } from 'react'
import { Scissors, Check, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react'
import ServiceIcon from './ServiceIcon'
import { cn } from '../lib/utils'
import useSubscriptionStore from '../store/useSubscriptionStore'

export default function ActiveCutDietSection({ 
  activeSubs, 
  excludedActiveIds, 
  onToggleExclude, 
  wishlistAddTotal 
}) {
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription)

  // Subscriptions currently active
  const actualActiveSubs = useMemo(() => {
    return activeSubs.filter(s => s.status === 'active')
  }, [activeSubs])

  // Smart Recommendations: Low satisfaction (<=3) or non-essential items
  // is_essential의 기본값이 false라 !is_essential 단독으로는 사실상 전체가 추천되므로,
  // 만족도를 매긴 항목 중 4점 이상은 배너 문구("낮은 만족도/비필수")에 맞게 제외한다.
  const recommendedDietSubs = useMemo(() => {
    return actualActiveSubs
      .filter(s => {
        const isRated = typeof s.satisfaction === 'number' && s.satisfaction > 0
        if (isRated && s.satisfaction >= 4) return false
        return (isRated && s.satisfaction <= 3) || !s.is_essential
      })
      .sort((a, b) => (a.satisfaction || 3) - (b.satisfaction || 3))
  }, [actualActiveSubs])

  // Total potential savings from recommended items
  const recommendedSavingTotal = useMemo(() => {
    return recommendedDietSubs.reduce((acc, sub) => {
      const price = sub.billing_cycle === 'yearly' ? Math.floor(sub.price / 12) : sub.price
      return acc + price
    }, 0)
  }, [recommendedDietSubs])

  const handleApplyRecommended = () => {
    const recIds = recommendedDietSubs.map(s => s.id)
    recIds.forEach(id => {
      if (!excludedActiveIds.includes(id)) {
        onToggleExclude(id)
      }
    })
  }

  const handleResetExclusions = () => {
    excludedActiveIds.forEach(id => onToggleExclude(id))
  }

  // Batch actual deactivation
  const handleBatchDeactivate = async () => {
    const targetIds = [...excludedActiveIds]
    if (targetIds.length === 0) return
    if (!window.confirm(`가상 덜어내기로 선택한 ${targetIds.length}개 서비스를 실제 구독 비활성화(정지) 처리하시겠습니까?`)) return

    const succeededIds = []
    for (const id of targetIds) {
      if (await updateSubscription(id, { status: 'disable' })) succeededIds.push(id)
    }

    // 실제로 비활성화된 항목은 시뮬레이션 선택에서도 해제해야 한다.
    // 그러지 않으면 상단 총액에서 빠진 금액이 절감액으로 한 번 더 차감된다.
    succeededIds.forEach(id => onToggleExclude(id))

    if (succeededIds.length === targetIds.length) {
      alert(`${succeededIds.length}개 구독이 비활성화 처리되었습니다.`)
    } else {
      alert(`${targetIds.length}개 중 ${succeededIds.length}개만 비활성화되었습니다. 잠시 후 다시 시도해 주세요.`)
    }
  }

  if (actualActiveSubs.length === 0) {
    return null
  }

  return (
    <div className="w-full flex flex-col gap-2.5 transition-all duration-300">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Scissors className="w-4 h-4 text-rose-500 shrink-0" />
          <h3 className="text-[15px] md:text-[17px] font-bold text-dark dark:text-white">
            기존 구독 덜어내기 (지출 다이어트)
          </h3>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {excludedActiveIds.length > 0 && (
            <button
              type="button"
              onClick={handleResetExclusions}
              className="px-2.5 py-1 rounded-lg text-[11.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-dark dark:hover:text-white transition-all cursor-pointer"
            >
              선택 초기화
            </button>
          )}
          {excludedActiveIds.length > 0 && (
            <button
              type="button"
              onClick={handleBatchDeactivate}
              className="px-2.5 py-1 rounded-lg text-[11.5px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
              title="가상 덜어내기 선택된 항목을 실제 비활성화 처리"
            >
              선택 항목 실제 비활성화
            </button>
          )}
        </div>
      </div>

      <p className="text-[12px] text-dark/40 dark:text-slate-400 font-medium -mt-1">
        해지를 고려 중인 항목을 체크하면 상단 총액에서 실시간으로 절감액이 차감됩니다.
      </p>

      {/* Smart Offset Recommendation Banner (Compact) */}
      {recommendedDietSubs.length > 0 && (
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-2 min-w-0">
            <div className="p-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0 mt-0.5 sm:mt-0">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12.5px] md:text-[13.5px] font-bold text-emerald-700 dark:text-emerald-300">
                스마트 다이어트 추천: <span className="underline decoration-emerald-500/40">{recommendedDietSubs.map(s => s.service_name).slice(0, 2).join(', ')}</span> 등 {recommendedDietSubs.length}개
              </span>
              <span className="text-[11.5px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                낮은 만족도/비필수 항목 덜어내기 시 월 최대 <span className="font-extrabold">{recommendedSavingTotal.toLocaleString()}원</span> 절감
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyRecommended}
            className="h-[30px] px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[12px] flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-xs shadow-emerald-500/20 active:scale-95 self-end sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>추천 1클릭 덜어내기</span>
          </button>
        </div>
      )}

      {/* 1. Mobile List View (md 미만: 중첩 없는 일체형 divide-y 리스트) */}
      <div className="md:hidden flex flex-col w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs">
        {actualActiveSubs.map((sub) => {
          const isExcluded = excludedActiveIds.includes(sub.id)
          const isYearly = sub.billing_cycle === 'yearly'
          const monthlyPrice = isYearly ? Math.floor(sub.price / 12) : sub.price

          return (
            <div
              key={sub.id}
              onClick={() => onToggleExclude(sub.id)}
              className={cn(
                "flex items-center justify-between p-3 transition-colors cursor-pointer select-none",
                isExcluded
                  ? "bg-rose-500/5 dark:bg-rose-500/10"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                {/* Custom Cut Checkbox */}
                <div className={cn(
                  "w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                  isExcluded
                    ? "bg-rose-500 border-rose-500 text-white"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                )}>
                  {isExcluded ? (
                    <Check className="w-3 h-3 stroke-[3px]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  )}
                </div>

                <ServiceIcon serviceName={sub.service_name} category={sub.category || sub.categories?.[0]} size="sm" />
                
                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "font-bold text-[14px] truncate transition-colors",
                    isExcluded ? "line-through text-rose-600 dark:text-rose-400 opacity-80" : "text-dark dark:text-white"
                  )}>
                    {sub.service_name}
                  </span>
                  <span className="text-[11.5px] text-slate-400 dark:text-slate-500 font-medium truncate">
                    {sub.category || sub.categories?.[0]}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={cn(
                  "text-[13.5px] font-extrabold block",
                  isExcluded ? "text-rose-600 dark:text-rose-400" : "text-dark dark:text-white"
                )}>
                  {isExcluded ? `-${monthlyPrice.toLocaleString()}원` : `${monthlyPrice.toLocaleString()}원`}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {isExcluded ? '절감 예정' : (isYearly ? '월 환산' : '/월')}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 2. Desktop Grid View (md 이상: 널널한 그리드 카드 유지) */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {actualActiveSubs.map((sub) => {
          const isExcluded = excludedActiveIds.includes(sub.id)
          const isYearly = sub.billing_cycle === 'yearly'
          const monthlyPrice = isYearly ? Math.floor(sub.price / 12) : sub.price

          return (
            <div
              key={sub.id}
              onClick={() => onToggleExclude(sub.id)}
              className={cn(
                "p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none relative group",
                isExcluded
                  ? "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/40 shadow-xs ring-1 ring-rose-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Custom Cut Checkbox */}
                <div className={cn(
                  "w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                  isExcluded
                    ? "bg-rose-500 border-rose-500 text-white"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-slate-400"
                )}>
                  {isExcluded ? (
                    <Check className="w-3 h-3 stroke-[3px]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  )}
                </div>

                <ServiceIcon serviceName={sub.service_name} category={sub.category || sub.categories?.[0]} size="sm" />
                
                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "font-bold text-[13.5px] truncate transition-colors",
                    isExcluded ? "line-through text-rose-600 dark:text-rose-400 opacity-75" : "text-dark dark:text-white"
                  )}>
                    {sub.service_name}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                    {sub.category || sub.categories?.[0]}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={cn(
                  "text-[13px] font-extrabold block",
                  isExcluded ? "text-rose-600 dark:text-rose-400" : "text-dark dark:text-white"
                )}>
                  {isExcluded ? `-${monthlyPrice.toLocaleString()}원` : `${monthlyPrice.toLocaleString()}원`}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {isExcluded ? '절감 예정' : (isYearly ? '월 환산' : '/월')}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

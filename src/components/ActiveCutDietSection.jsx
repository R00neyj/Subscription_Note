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
  const recommendedDietSubs = useMemo(() => {
    return actualActiveSubs
      .filter(s => (s.satisfaction && s.satisfaction <= 3) || !s.is_essential)
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
    if (excludedActiveIds.length === 0) return
    const count = excludedActiveIds.length
    if (window.confirm(`가상 덜어내기로 선택한 ${count}개 서비스를 실제 구독 비활성화(정지) 처리하시겠습니까?`)) {
      for (const id of excludedActiveIds) {
        await updateSubscription(id, { status: 'disable' })
      }
      alert(`${count}개 구독이 비활성화 처리되었습니다.`)
    }
  }

  if (actualActiveSubs.length === 0) {
    return null
  }

  return (
    <div className="w-full flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-[28px] md:rounded-[36px] border border-tertiary dark:border-slate-700 p-5 md:p-7 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[17px] md:text-[19px] font-bold text-dark dark:text-white flex items-center gap-2">
              기존 구독 덜어내기 (지출 다이어트)
            </h3>
            <p className="text-[12.5px] md:text-[13.5px] text-dark/50 dark:text-slate-400 font-medium">
              해지를 고려 중인 항목을 체크하면 상단 총액에서 실시간으로 절감액이 차감됩니다.
            </p>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {excludedActiveIds.length > 0 && (
            <button
              type="button"
              onClick={handleResetExclusions}
              className="px-3 py-1.5 rounded-[10px] text-[12px] font-bold bg-tertiary dark:bg-slate-700 text-dark/60 dark:text-slate-300 hover:text-dark dark:hover:text-white transition-all cursor-pointer"
            >
              선택 초기화
            </button>
          )}
          {excludedActiveIds.length > 0 && (
            <button
              type="button"
              onClick={handleBatchDeactivate}
              className="px-3 py-1.5 rounded-[10px] text-[12px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
              title="가상 덜어내기 선택된 항목을 실제 비활성화 처리"
            >
              선택 항목 실제 비활성화
            </button>
          )}
        </div>
      </div>

      {/* Smart Offset Recommendation Banner */}
      {recommendedDietSubs.length > 0 && (
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[20px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0 mt-0.5 sm:mt-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] md:text-[14px] font-bold text-emerald-700 dark:text-emerald-300">
                스마트 다이어트 추천: <span className="underline decoration-emerald-500/40">{recommendedDietSubs.map(s => s.service_name).slice(0, 2).join(', ')}</span> 등 {recommendedDietSubs.length}개 항목
              </span>
              <span className="text-[12px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                만족도가 낮거나 비필수인 항목들을 덜어내면 월 최대 <span className="font-extrabold">{recommendedSavingTotal.toLocaleString()}원</span>의 지출을 방어할 수 있어요.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyRecommended}
            className="h-[34px] px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[10px] font-bold text-[12.5px] flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm shadow-emerald-500/20 active:scale-95 self-end sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>추천 항목 1클릭 덜어내기</span>
          </button>
        </div>
      )}

      {/* Active Subscriptions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
        {actualActiveSubs.map((sub) => {
          const isExcluded = excludedActiveIds.includes(sub.id)
          const isYearly = sub.billing_cycle === 'yearly'
          const monthlyPrice = isYearly ? Math.floor(sub.price / 12) : sub.price

          return (
            <div
              key={sub.id}
              onClick={() => onToggleExclude(sub.id)}
              className={cn(
                "p-3.5 rounded-[18px] border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none relative group",
                isExcluded
                  ? "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/40 shadow-xs ring-1 ring-rose-500/20"
                  : "bg-tertiary/40 dark:bg-slate-700/40 border-tertiary dark:border-slate-700 hover:bg-tertiary/70 dark:hover:bg-slate-700/70"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Custom Cut Checkbox */}
                <div className={cn(
                  "w-5 h-5 rounded-[7px] border flex items-center justify-center shrink-0 transition-colors",
                  isExcluded
                    ? "bg-rose-500 border-rose-500 text-white"
                    : "border-dark/20 dark:border-slate-500 bg-white dark:bg-slate-800 group-hover:border-dark/40"
                )}>
                  {isExcluded ? (
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  )}
                </div>

                <ServiceIcon serviceName={sub.service_name} category={sub.category || sub.categories?.[0]} size="sm" />
                
                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "font-bold text-[14px] truncate transition-colors",
                    isExcluded ? "line-through text-rose-600 dark:text-rose-400 opacity-75" : "text-dark dark:text-white"
                  )}>
                    {sub.service_name}
                  </span>
                  <span className="text-[11.5px] text-dark/40 dark:text-slate-400 font-medium truncate">
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
                <span className="text-[10px] text-dark/40 dark:text-slate-500 font-medium">
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

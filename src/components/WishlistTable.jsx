import { useAutoAnimate } from "@formkit/auto-animate/react"
import { cn } from "../lib/utils"
import { CATEGORY_COLORS, TEXT_COLORS } from "../constants/categories"
import { Sparkles, Trash2, ArrowUpRight, Clock, RefreshCw, Globe, Check } from "lucide-react"
import { getServiceLinks } from "../constants/presets"
import ServiceIcon from "./ServiceIcon"
import useSubscriptionStore from "../store/useSubscriptionStore"

const SortableHeader = ({ label, sortKey, width, sortConfig, onSort, isLast = false }) => {
  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return <span className="text-white/30 text-[11px] ml-1">⇅</span>
    return sortConfig.direction === "asc" ? <span className="text-white text-[11px] ml-1">▲</span> : <span className="text-white text-[11px] ml-1">▼</span>
  }

  return (
    <th
      className={cn(
        "px-2 text-center font-bold text-[13px] md:text-[14px] text-white leading-tight cursor-pointer hover:bg-white/10 transition-colors select-none",
        width,
        !isLast && "border-r border-white/20 dark:border-slate-800"
      )}
      onClick={() => onSort && onSort(sortKey)}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {getSortIcon(sortKey)}
      </div>
    </th>
  )
}

export default function WishlistTable({ 
  data, 
  activeSubs = [], 
  selectedWishlistIds = [], 
  onToggleSelectWish, 
  onToggleSelectAllWish,
  onRowClick, 
  sortConfig, 
  onSort 
}) {
  const [parent] = useAutoAnimate()
  const openPromoteModal = useSubscriptionStore((state) => state.openPromoteModal)
  const removeSubscription = useSubscriptionStore((state) => state.removeSubscription)
  const openModal = useSubscriptionStore((state) => state.openModal)

  const getDaysAgo = (createdAt) => {
    if (!createdAt) return 1
    const diffTime = Math.abs(new Date() - new Date(createdAt))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays)
  }

  const getMatchedUpgrade = (item) => {
    if (item.upgrade_from_id) {
      const found = activeSubs.find(s => s.id === item.upgrade_from_id)
      if (found) return found
    }
    const itemNorm = item.service_name.trim().toLowerCase().replace(/\s+/g, '')
    return activeSubs.find(sub => {
      const subNorm = sub.service_name.trim().toLowerCase().replace(/\s+/g, '')
      return itemNorm.includes(subNorm) || subNorm.includes(itemNorm)
    })
  }

  // 카테고리 필터가 걸리면 선택 목록에는 화면 밖 항목도 남아 있으므로,
  // 전체 선택 상태와 카운터는 모두 현재 보이는 목록(data) 기준으로 계산한다.
  const visibleSelectedCount = data.filter(item => selectedWishlistIds.includes(item.id)).length
  const isAllSelected = data.length > 0 && visibleSelectedCount === data.length

  if (data.length === 0) {
    return (
      <div className="w-full py-12 px-4 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2.5">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-[16px] font-bold text-dark dark:text-white mb-1">
          담아둔 위시리스트가 없습니다
        </h3>
        <p className="text-[13px] text-dark/50 dark:text-slate-400 max-w-sm mb-4">
          아직 결제하지 않았지만 구독을 고민 중인 서비스를 추가하고 지출 영향을 미리 확인해보세요.
        </p>
        <button
          type="button"
          onClick={() => openModal(null, 'wishlist')}
          className="h-[38px] px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[13.5px] flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
        >
          <span>위시리스트 담기</span>
        </button>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      {/* 1. Mobile List View (md 미만: 가로 스크롤 없는 콤팩트 카드 리스트) */}
      <div className="md:hidden flex flex-col w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs" ref={parent}>
        {/* Mobile Header Toolbar for Bulk Select */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div 
            onClick={() => onToggleSelectAllWish && onToggleSelectAllWish()}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className={cn(
              "w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors",
              isAllSelected 
                ? "bg-amber-500 border-amber-500 text-white" 
                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            )}>
              {isAllSelected && <Check className="w-3 h-3 stroke-[3px]" />}
            </div>
            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">
              전체 선택 ({visibleSelectedCount}/{data.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-400">시뮬레이션 반영</span>
        </div>

        {data.map((item) => {
          const daysAgo = getDaysAgo(item.created_at)
          const isYearly = item.billing_cycle === 'yearly'
          const monthlyPrice = isYearly ? Math.floor(item.price / 12) : item.price
          const matchedUpgrade = getMatchedUpgrade(item)
          const isChecked = selectedWishlistIds.includes(item.id)

          let netDelta = null
          if (matchedUpgrade) {
            const activeMonthly = matchedUpgrade.billing_cycle === 'yearly'
              ? Math.floor(matchedUpgrade.price / 12)
              : matchedUpgrade.price
            netDelta = monthlyPrice - activeMonthly
          }

          return (
            <div
              key={item.id}
              onClick={() => onRowClick && onRowClick(item)}
              className={cn(
                "flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer",
                !isChecked && "opacity-60 grayscale-30 bg-slate-50/40 dark:bg-slate-900/40"
              )}
            >
              {/* Left: Checkbox + Icon + Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <div 
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleSelectWish && onToggleSelectWish(item.id)
                  }}
                  className="p-1 shrink-0 cursor-pointer"
                >
                  <div className={cn(
                    "w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors",
                    isChecked 
                      ? "bg-amber-500 border-amber-500 text-white" 
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  )}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3px]" />}
                  </div>
                </div>

                <ServiceIcon 
                  serviceName={item.service_name} 
                  category={item.categories?.[0] || item.category || "Etc"} 
                  size="md"
                  className="shrink-0"
                />

                <div className="flex flex-col min-w-0 gap-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-dark dark:text-white text-[14px] truncate">
                      {item.service_name}
                    </span>
                    {(item.category || item.categories?.[0]) && (
                      <span className={cn(
                        "inline-block px-1.5 py-0.5 rounded text-[10px] font-bold leading-none shrink-0",
                        CATEGORY_COLORS[item.category || item.categories?.[0]] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                        TEXT_COLORS[item.category || item.categories?.[0]] || "text-dark dark:text-white"
                      )}>
                        {item.category || item.categories?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11.5px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                      {daysAgo === 1 ? '오늘' : `${daysAgo}일째`}
                    </span>
                    {matchedUpgrade && (
                      <span className="text-blue-600 dark:text-blue-400 font-bold truncate">
                        플랜 교체
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Price & Quick Action */}
              <div className="flex flex-col items-end shrink-0 gap-1.5">
                <div className="flex flex-col items-end">
                  <span className="font-bold text-dark dark:text-white text-[14px]">
                    {item.price?.toLocaleString()}원
                  </span>
                  {netDelta !== null ? (
                    <span className={cn(
                      "text-[10px] font-bold",
                      netDelta >= 0 ? "text-primary dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {netDelta >= 0 ? `(+${netDelta.toLocaleString()}원)` : `(${netDelta.toLocaleString()}원)`}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      {isYearly ? `(월 ${monthlyPrice.toLocaleString()}원)` : '/월'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => openPromoteModal(item)}
                    className="h-[28px] px-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-lg text-[11.5px] font-bold flex items-center gap-0.5 transition-all cursor-pointer active:scale-95"
                    title="실제 구독으로 전환"
                  >
                    <span>승격</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`${item.service_name} 위시리스트를 삭제하시겠습니까?`)) {
                        removeSubscription(item.id)
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 2. Desktop Table View (md 이상: 슬림 모던 테이블) */}
      <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 shadow-xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[750px] table-fixed border-collapse">
            <thead className="bg-dark dark:bg-slate-950">
              <tr className="h-[44px]">
                {/* Checkbox for Bulk Toggle */}
                <th className="w-[5%] border-r border-white/10 dark:border-slate-800 px-2 text-center">
                  <div 
                    onClick={() => onToggleSelectAllWish && onToggleSelectAllWish()}
                    className={cn(
                      "w-4.5 h-4.5 mx-auto rounded border flex items-center justify-center cursor-pointer transition-colors",
                      isAllSelected 
                        ? "bg-amber-500 border-amber-500 text-white" 
                        : "border-white/40 bg-white/10 hover:bg-white/20"
                    )}
                    title="전체 위시 선택/해제"
                  >
                    {isAllSelected && <Check className="w-3 h-3 stroke-[3px]" />}
                  </div>
                </th>
                <SortableHeader label="서비스명" sortKey="service_name" width="w-[28%]" sortConfig={sortConfig} onSort={onSort} />
                <SortableHeader label="카테고리" sortKey="category" width="w-[16%]" sortConfig={sortConfig} onSort={onSort} />
                <SortableHeader label="예상 구독료" sortKey="price" width="w-[21%]" sortConfig={sortConfig} onSort={onSort} />
                <SortableHeader label="고민 기간" sortKey="created_at" width="w-[14%]" sortConfig={sortConfig} onSort={onSort} />
                <th className="w-[16%] text-center font-bold text-[13px] text-white/80">
                  구독 전환 / 삭제
                </th>
              </tr>
            </thead>
            <tbody ref={parent}>
              {data.map((item) => {
                const daysAgo = getDaysAgo(item.created_at)
                const isYearly = item.billing_cycle === 'yearly'
                const monthlyPrice = isYearly ? Math.floor(item.price / 12) : item.price
                const matchedUpgrade = getMatchedUpgrade(item)
                const serviceLinks = getServiceLinks(item.service_name)
                const isChecked = selectedWishlistIds.includes(item.id)

                let netDelta = null
                if (matchedUpgrade) {
                  const activeMonthly = matchedUpgrade.billing_cycle === 'yearly'
                    ? Math.floor(matchedUpgrade.price / 12)
                    : matchedUpgrade.price
                  netDelta = monthlyPrice - activeMonthly
                }

                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-slate-100 dark:border-slate-800/60 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer h-[52px]",
                      !isChecked && "opacity-50 grayscale-40 bg-slate-50/40 dark:bg-slate-900/40"
                    )}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {/* Individual Checkbox */}
                    <td 
                      className="w-[5%] border-r border-slate-100 dark:border-slate-800/60 text-center px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSelectWish && onToggleSelectWish(item.id)
                      }}
                    >
                      <div className={cn(
                        "w-4.5 h-4.5 mx-auto rounded border flex items-center justify-center cursor-pointer transition-colors",
                        isChecked 
                          ? "bg-amber-500 border-amber-500 text-white" 
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-amber-500"
                      )}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3px]" />}
                      </div>
                    </td>

                    {/* 서비스명 */}
                    <td className="w-[28%] border-r border-slate-100 dark:border-slate-800/60 px-4">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ServiceIcon 
                            serviceName={item.service_name} 
                            category={item.categories?.[0] || item.category || "Etc"} 
                            size="sm"
                            className="group-hover:scale-105 shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-dark dark:text-white text-[14px] truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {item.service_name}
                            </span>
                            {matchedUpgrade && (
                              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate flex items-center gap-1">
                                <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                                {matchedUpgrade.service_name} 플랜 교체
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Official Links */}
                        {serviceLinks.subscribe_url && (
                          <a
                            href={serviceLinks.subscribe_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all shrink-0"
                            title={`${item.service_name} 공식 홈페이지 새 창 열기`}
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* 카테고리 */}
                    <td className="w-[16%] border-r border-slate-100 dark:border-slate-800/60 px-2 text-center">
                      <span className={cn(
                        "inline-block px-2.5 py-0.5 rounded-full text-[11.5px] font-bold",
                        CATEGORY_COLORS[item.category || item.categories?.[0]] || "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200",
                        TEXT_COLORS[item.category || item.categories?.[0]] || "text-dark dark:text-white"
                      )}>
                        {item.category || item.categories?.[0] || 'Etc'}
                      </span>
                    </td>

                    {/* 예상 금액 및 순차액 */}
                    <td className="w-[21%] border-r border-slate-100 dark:border-slate-800/60 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-dark dark:text-white text-[13.5px]">
                          {item.price?.toLocaleString()}원
                        </span>
                        {netDelta !== null ? (
                          <span className={cn(
                            "text-[10.5px] font-bold",
                            netDelta >= 0 ? "text-primary dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                          )}>
                            {netDelta >= 0 ? `(+${netDelta.toLocaleString()}원)` : `(${netDelta.toLocaleString()}원)`}
                          </span>
                        ) : (
                          <span className="text-[10.5px] text-slate-400 dark:text-slate-500">
                            {isYearly ? `(월 ${monthlyPrice.toLocaleString()}원)` : '/월'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 고민 기간 */}
                    <td className="w-[14%] border-r border-slate-100 dark:border-slate-800/60 px-2 text-center">
                      <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-slate-600 dark:text-slate-300">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {daysAgo === 1 ? '오늘' : `${daysAgo}일차`}
                      </span>
                    </td>

                    {/* 액션 */}
                    <td className="w-[16%] px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openPromoteModal(item)}
                          className="h-[30px] px-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-lg text-[12px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                          title="실제 구독으로 전환"
                        >
                          <span>{matchedUpgrade ? '교체 승격' : '구독 시작'}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`${item.service_name} 위시리스트를 삭제하시겠습니까?`)) {
                              removeSubscription(item.id)
                            }
                          }}
                          className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { useAutoAnimate } from "@formkit/auto-animate/react"
import { cn } from "../lib/utils"
import { CATEGORY_COLORS, TEXT_COLORS } from "../constants/categories"
import { Sparkles, Trash2, ArrowUpRight, Clock, RefreshCw, Globe, Ban, Check } from "lucide-react"
import { getServiceLinks } from "../constants/presets"
import ServiceIcon from "./ServiceIcon"
import useSubscriptionStore from "../store/useSubscriptionStore"

const SortableHeader = ({ label, sortKey, width, sortConfig, onSort, isLast = false }) => {
  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return <span className="text-white/30 text-[12px] ml-1">⇅</span>
    return sortConfig.direction === "asc" ? <span className="text-white text-[12px] ml-1">▲</span> : <span className="text-white text-[12px] ml-1">▼</span>
  }

  return (
    <th
      className={cn(
        "px-2 text-center font-bold text-[14px] md:text-[15px] text-white leading-[1.4] cursor-pointer hover:bg-white/10 transition-colors select-none",
        width,
        !isLast && "border-r border-white/30 dark:border-slate-700"
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

  const isAllSelected = data.length > 0 && selectedWishlistIds.length === data.length

  if (data.length === 0) {
    return (
      <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-[24px] border border-tertiary dark:border-slate-700">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-[17px] font-bold text-dark dark:text-white mb-1">
          담아둔 위시리스트가 없습니다
        </h3>
        <p className="text-[14px] text-dark/50 dark:text-slate-400 max-w-sm mb-5">
          아직 결제하지 않았지만 구독을 고민 중인 서비스를 추가하고 지출 영향을 미리 확인해보세요.
        </p>
        <button
          type="button"
          onClick={() => openModal(null, 'wishlist')}
          className="h-[42px] px-5 rounded-[14px] bg-amber-500 hover:bg-amber-600 text-white font-bold text-[14px] flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
        >
          <span>위시리스트 담기</span>
        </button>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      <div className="w-full overflow-hidden rounded-[24px] border border-tertiary dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-300 shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[720px] md:min-w-[880px] table-fixed border-collapse">
            <thead className="bg-dark dark:bg-slate-950">
              <tr className="h-[54px]">
                {/* Checkbox for Bulk Toggle */}
                <th className="w-[45px] md:w-[5%] border-r border-white/10 dark:border-slate-800 px-2 text-center">
                  <div 
                    onClick={() => onToggleSelectAllWish && onToggleSelectAllWish()}
                    className={cn(
                      "w-5 h-5 mx-auto rounded-[6px] border flex items-center justify-center cursor-pointer transition-colors",
                      isAllSelected 
                        ? "bg-amber-500 border-amber-500 text-white" 
                        : "border-white/40 bg-white/10 hover:bg-white/20"
                    )}
                    title="전체 위시 선택/해제"
                  >
                    {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                  </div>
                </th>
                <SortableHeader label="서비스명" sortKey="service_name" width="w-[200px] md:w-[28%]" sortConfig={sortConfig} onSort={onSort} />
                <SortableHeader label="카테고리" sortKey="category" width="w-[120px] md:w-[16%]" sortConfig={sortConfig} onSort={onSort} />
                <SortableHeader label="예상 구독료" sortKey="price" width="w-[150px] md:w-[22%]" sortConfig={sortConfig} onSort={onSort} />
                <SortableHeader label="고민 기간" sortKey="created_at" width="w-[110px] md:w-[14%]" sortConfig={sortConfig} onSort={onSort} />
                <th className="w-[130px] md:w-[15%] text-center font-extrabold text-[13px] md:text-[15px] text-white">
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
                      "border-b border-black/5 dark:border-slate-700/5 group hover:bg-amber-500/5 dark:hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer h-[66px]",
                      !isChecked && "opacity-50 grayscale-40 bg-gray-50/50 dark:bg-slate-900/40"
                    )}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {/* Individual Simulation Checkbox */}
                    <td 
                      className="w-[45px] md:w-[5%] border-r border-black/5 dark:border-slate-700/50 text-center px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSelectWish && onToggleSelectWish(item.id)
                      }}
                    >
                      <div className={cn(
                        "w-5 h-5 mx-auto rounded-[6px] border flex items-center justify-center cursor-pointer transition-colors",
                        isChecked 
                          ? "bg-amber-500 border-amber-500 text-white" 
                          : "border-dark/20 dark:border-slate-500 bg-white dark:bg-slate-800 group-hover:border-amber-500"
                      )}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </div>
                    </td>

                    {/* 서비스명 + 링크 바로가기 */}
                    <td className="w-[200px] md:w-[28%] border-r border-black/5 dark:border-slate-700/50 px-4 md:px-5">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <ServiceIcon 
                            serviceName={item.service_name} 
                            category={item.categories?.[0] || item.category || "Etc"} 
                            className="group-hover:scale-105 shrink-0 transition-transform"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-dark dark:text-white text-[14.5px] md:text-[15.5px] truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {item.service_name}
                            </span>
                            {matchedUpgrade && (
                              <span className="text-[11.5px] text-blue-600 dark:text-blue-400 font-bold truncate flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 shrink-0" />
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
                            className="p-1.5 text-dark/30 hover:text-amber-600 dark:text-slate-500 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-[8px] transition-all shrink-0"
                            title={`${item.service_name} 공식 홈페이지 새 창 열기`}
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* 카테고리 */}
                    <td className="w-[120px] md:w-[16%] border-r border-black/5 dark:border-slate-700/50 px-2 text-center">
                      <span className={cn(
                        "inline-block px-3 py-1 rounded-full text-[12px] font-bold",
                        CATEGORY_COLORS[item.category || item.categories?.[0]] || "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200",
                        TEXT_COLORS[item.category || item.categories?.[0]] || "text-dark dark:text-white"
                      )}>
                        {item.category || item.categories?.[0] || 'Etc'}
                      </span>
                    </td>

                    {/* 예상 금액 및 순차액(Delta) */}
                    <td className="w-[150px] md:w-[22%] border-r border-black/5 dark:border-slate-700/50 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-extrabold text-dark dark:text-white text-[14.5px] md:text-[15.5px]">
                          {item.price?.toLocaleString()}원
                        </span>
                        {netDelta !== null ? (
                          <span className={cn(
                            "text-[11px] font-extrabold",
                            netDelta >= 0 ? "text-primary dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                          )}>
                            {netDelta >= 0 ? `(실제 추가: +${netDelta.toLocaleString()}원)` : `(절감: ${netDelta.toLocaleString()}원)`}
                          </span>
                        ) : (
                          <span className="text-[11px] text-dark/40 dark:text-slate-400">
                            {isYearly ? `(월 약 ${monthlyPrice.toLocaleString()}원)` : '/월'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 고민 기간 */}
                    <td className="w-[110px] md:w-[14%] border-r border-black/5 dark:border-slate-700/50 px-2 text-center">
                      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-dark/70 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {daysAgo === 1 ? '오늘 담음' : `${daysAgo}일차`}
                      </span>
                    </td>

                    {/* 액션 (구독 전환 / 삭제) */}
                    <td className="w-[130px] md:w-[15%] px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openPromoteModal(item)}
                          className="h-[34px] px-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-[10px] text-[12.5px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                          title="실제 구독으로 전환 및 결제일 입력"
                        >
                          <span>{matchedUpgrade ? '교체 승격' : '구독 시작'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`${item.service_name} 위시리스트를 삭제하시겠습니까?`)) {
                              removeSubscription(item.id)
                            }
                          }}
                          className="p-2 hover:bg-rose-500/10 text-dark/40 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 rounded-[10px] transition-all cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
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

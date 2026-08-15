import { useAutoAnimate } from "@formkit/auto-animate/react"
import { cn } from "../lib/utils"
import { CATEGORY_COLORS, TEXT_COLORS } from "../constants/categories"
import { Sparkles, Trash2, ArrowUpRight, MessageSquare, Clock } from "lucide-react"
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

export default function WishlistTable({ data, onRowClick, sortConfig, onSort }) {
  const [parent] = useAutoAnimate()
  const openPromoteModal = useSubscriptionStore((state) => state.openPromoteModal)
  const removeSubscription = useSubscriptionStore((state) => state.removeSubscription)

  const getDaysAgo = (createdAt) => {
    if (!createdAt) return 1
    const diffTime = Math.abs(new Date() - new Date(createdAt))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays)
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded-full text-[12px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            높음
          </span>
        )
      case 'low':
        return (
          <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            낮음
          </span>
        )
      case 'medium':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            보통
          </span>
        )
    }
  }

  const openModal = useSubscriptionStore((state) => state.openModal)

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
          <table className="w-full min-w-[750px] md:min-w-[900px] table-fixed border-collapse">
            <thead className="bg-dark dark:bg-slate-950">
              <tr className="h-[54px]">
                <th className="w-[45px] md:w-[5%] border-r border-white/10 dark:border-slate-800 px-2 text-center font-extrabold text-[13px] md:text-[15px] text-white">
                  #
                </th>
                <SortableHeader label="서비스명" sortKey="service_name" width="w-[180px] md:w-[22%]" sortConfig={sortConfig} onSort={onSort} />
                <SortableHeader label="카테고리" sortKey="category" width="w-[100px] md:w-[13%]" sortConfig={sortConfig} onSort={onSort} />
                <SortableHeader label="예상 구독료" sortKey="price" width="w-[120px] md:w-[15%]" sortConfig={sortConfig} onSort={onSort} />
                <SortableHeader label="우선순위" sortKey="wish_priority" width="w-[100px] md:w-[12%]" sortConfig={sortConfig} onSort={onSort} />
                <SortableHeader label="고민 기간" sortKey="created_at" width="w-[110px] md:w-[13%]" sortConfig={sortConfig} onSort={onSort} />
                <th className="w-[140px] md:w-[20%] text-center font-extrabold text-[13px] md:text-[15px] text-white">
                  구독 전환 / 관리
                </th>
              </tr>
            </thead>
            <tbody ref={parent}>
              {data.map((item, index) => {
                const daysAgo = getDaysAgo(item.created_at)
                const isYearly = item.billing_cycle === 'yearly'
                const monthlyPrice = isYearly ? Math.floor(item.price / 12) : item.price

                return (
                  <tr
                    key={item.id}
                    className="border-b border-black/5 dark:border-slate-700/5 group hover:bg-amber-500/5 dark:hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer h-[66px]"
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {/* 순번 */}
                    <td className="w-[45px] md:w-[5%] border-r border-black/5 dark:border-slate-700/50 text-center font-medium text-dark/40 dark:text-slate-500 text-[13px] md:text-[15px]">
                      {index + 1}
                    </td>

                    {/* 서비스명 + 메모 툴팁/아이콘 */}
                    <td className="w-[180px] md:w-[22%] border-r border-black/5 dark:border-slate-700/50 px-4 md:px-5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ServiceIcon 
                          serviceName={item.service_name} 
                          category={item.categories?.[0] || item.category || "Etc"} 
                          className="group-hover:scale-105 shrink-0 transition-transform"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-dark dark:text-white text-[14px] md:text-[15px] truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.service_name}
                          </span>
                          {item.memo && (
                            <span className="text-[12px] text-dark/40 dark:text-slate-400 truncate flex items-center gap-1 font-normal">
                              <MessageSquare className="w-3 h-3 shrink-0 opacity-60" />
                              {item.memo}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 카테고리 */}
                    <td className="w-[100px] md:w-[13%] border-r border-black/5 dark:border-slate-700/50 px-2 text-center">
                      <span className={cn(
                        "inline-block px-2.5 py-1 rounded-full text-[12px] font-bold",
                        CATEGORY_COLORS[item.category || item.categories?.[0]] || "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200",
                        TEXT_COLORS[item.category || item.categories?.[0]] || "text-dark dark:text-white"
                      )}>
                        {item.category || item.categories?.[0] || 'Etc'}
                      </span>
                    </td>

                    {/* 예상 금액 */}
                    <td className="w-[120px] md:w-[15%] border-r border-black/5 dark:border-slate-700/50 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-extrabold text-dark dark:text-white text-[14px] md:text-[15px]">
                          {item.price?.toLocaleString()}원
                        </span>
                        <span className="text-[11px] text-dark/40 dark:text-slate-400">
                          {isYearly ? `(월 약 ${monthlyPrice.toLocaleString()}원)` : '/월'}
                        </span>
                      </div>
                    </td>

                    {/* 우선순위 */}
                    <td className="w-[100px] md:w-[12%] border-r border-black/5 dark:border-slate-700/50 px-2 text-center">
                      {getPriorityBadge(item.wish_priority)}
                    </td>

                    {/* 고민 기간 */}
                    <td className="w-[110px] md:w-[13%] border-r border-black/5 dark:border-slate-700/50 px-2 text-center">
                      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-dark/60 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {daysAgo === 1 ? '오늘 담음' : `${daysAgo}일차`}
                      </span>
                    </td>

                    {/* 액션 (구독 전환 / 삭제) */}
                    <td className="w-[140px] md:w-[20%] px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openPromoteModal(item)}
                          className="h-[34px] px-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-[10px] text-[12.5px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                          title="실제 구독으로 전환 및 결제일 입력"
                        >
                          <span>구독 시작</span>
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

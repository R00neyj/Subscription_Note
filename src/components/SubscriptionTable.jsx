import { cn } from "../lib/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CATEGORY_COLORS, TEXT_COLORS } from "../constants/categories";
import { Timer, ShieldCheck, CalendarDays, Check, Minus } from "lucide-react";
import ServiceIcon from "./ServiceIcon";

const SortableHeader = ({ label, sortKey, width, sortConfig, onSort, isLast = false }) => {
    const getSortIcon = (key) => {
        if (sortConfig?.key !== key) return <span className="text-white/30 text-[12px] ml-1">⇅</span>;
        return sortConfig.direction === "asc" ? <span className="text-white text-[12px] ml-1">▲</span> : <span className="text-white text-[12px] ml-1">▼</span>;
    };

    return (
        <th
            className={cn("px-2 text-center font-bold text-[14px] md:text-[16px] text-white leading-[1.4] cursor-pointer hover:bg-white/10 transition-colors select-none", width, !isLast && "border-r border-white/30 dark:border-slate-700")}
            onClick={() => onSort && onSort(sortKey)}
        >
            <div className="flex items-center justify-center gap-1.5">
                {label}
                {getSortIcon(sortKey)}
            </div>
        </th>
    );
};

export default function SubscriptionTable({ data, onRowClick, sortConfig, onSort }) {
    // eslint-disable-next-line no-unused-vars
    const [parent] = useAutoAnimate(/* config */);

    return (
        <div className="w-full relative">
            <div className="w-full overflow-hidden rounded-[24px] border border-tertiary dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-300 shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[700px] md:min-w-[850px] table-fixed border-collapse">
                        <thead className="bg-dark dark:bg-slate-950">
                            <tr className="h-[56px]">
                                {/* head__item: 순번 */}
                                <th className="w-[45px] md:w-[6%] border-r border-white/10 dark:border-slate-800 px-2 text-center font-extrabold text-[12px] md:text-[16px] text-white leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis">
                                    #
                                </th>

                                {/* Sortable Columns */}
                                <SortableHeader label="서비스명" sortKey="service_name" width="w-[180px] md:w-[22%]" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="카테고리" sortKey="category" width="w-[100px] md:w-[15%]" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="결제일" sortKey="billing_date" width="w-[110px] md:w-[14%]" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="결제 수단" sortKey="payment_method" width="w-[110px] md:w-[14%] text-center" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="금액" sortKey="price" width="w-[110px] md:w-[14%]" sortConfig={sortConfig} onSort={onSort} />

                                {/* head__item: 상태 */}
                                <th className="w-[110px] md:w-[15%] text-center font-extrabold text-[14px] md:text-[16px] text-white leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis">상태</th>
                            </tr>
                        </thead>
                        <tbody ref={parent}>
                            {data.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-black/5 dark:border-slate-700/5 group hover:bg-tertiary/50 dark:hover:bg-slate-700/50 transition-colors duration-300 cursor-pointer h-[64px]"
                                    onClick={() => onRowClick && onRowClick(item)}
                                >
                                    {/* 순번 */}
                                    <td className="w-[45px] md:w-[6%] border-r border-black/5 dark:border-slate-700/50 text-center font-medium text-dark/40 dark:text-slate-500 text-[13px] md:text-[16px] leading-[1.4]">{index + 1}</td>

                                    {/* 서비스명 */}
                                    <td className="w-[180px] md:w-[22%] border-r border-black/5 dark:border-slate-700/50 px-4 md:px-6">
                                        <div className="flex items-center gap-2 md:gap-3 justify-start">
                                            <ServiceIcon 
                                                serviceName={item.service_name} 
                                                category={item.categories?.[0] || item.category || "Etc"} 
                                                className="group-hover:scale-110"
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <p className="font-bold text-dark dark:text-white text-[14px] md:text-[16px] leading-[1.4] truncate group-hover:text-primary transition-colors">{item.service_name}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* 카테고리 */}
                                    <td className="w-[100px] md:w-[15%] border-r border-black/5 dark:border-slate-700/50 text-center px-1 md:px-2">
                                        <div className="flex flex-wrap items-center justify-center gap-1 md:gap-1.5">
                                            {item.categories?.map((cat) => (
                                                <div
                                                    key={cat}
                                                    className="inline-flex items-center justify-center px-2 py-[4px] md:px-3 md:py-[6px] rounded-full bg-slate-100 dark:bg-slate-700 text-dark dark:text-slate-200 text-[11px] md:text-[13px] font-bold leading-none transition-all group-hover:bg-primary group-hover:text-white"
                                                >
                                                    {cat}
                                                </div>
                                            ))}
                                            {!item.categories && item.category && (
                                                <div className="inline-flex items-center justify-center px-2 py-[4px] md:px-3 md:py-[6px] rounded-full bg-slate-100 dark:bg-slate-700 text-dark dark:text-slate-200 text-[11px] md:text-[13px] font-bold leading-none transition-all group-hover:bg-primary group-hover:text-white">
                                                    {item.category}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* 결제일 */}
                                    <td className="w-[110px] md:w-[14%] border-r border-black/5 dark:border-slate-700/50 text-center font-semibold text-dark dark:text-white text-[13px] md:text-[16px] leading-[1.4]">{item.billing_date}</td>

                                    {/* 결제 수단 */}
                                    <td className="w-[110px] md:w-[14%] border-r border-black/5 dark:border-slate-700/50 text-center font-semibold text-dark dark:text-white text-[13px] md:text-[16px] leading-[1.4]">
                                        {item.payment_method}
                                    </td>

                                    {/* 금액 */}
                                    <td className="w-[110px] md:w-[14%] border-r border-black/5 dark:border-slate-700/50 text-center font-bold text-dark dark:text-white text-[13px] md:text-[16px] leading-[1.4]">
                                        <div className="flex flex-col">
                                            <span>{item.price.toLocaleString()}원</span>
                                            {item.billing_cycle === "yearly" && <span className="text-[10px] md:text-[12px] text-dark/40 dark:text-slate-500 font-medium">(월 {Math.floor(item.price / 12).toLocaleString()}원)</span>}
                                        </div>
                                    </td>

                                    {/* 상태 - 모든 상태 아이콘 스타일 통일 (Soft Badge Style) */}
                                    <td className="w-[110px] md:w-[15%] text-center px-4 md:px-6">
                                        <div className="flex items-center justify-center gap-1 md:gap-1.5">
                                            {item.is_free_trial && (
                                                <div title="무료 체험 중" className="flex items-center justify-center size-[24px] md:size-[28px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-[8px] shrink-0">
                                                    <Timer size={16} md:size={18} strokeWidth={2.5} />
                                                </div>
                                            )}
                                            {item.is_essential && (
                                                <div title="필수 구독 항목" className="flex items-center justify-center size-[24px] md:size-[28px] bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-[8px] shrink-0">
                                                    <ShieldCheck size={16} md:size={18} strokeWidth={2.5} />
                                                </div>
                                            )}
                                            {item.billing_cycle === "yearly" && (
                                                <div title="연간 결제 상품" className="flex items-center justify-center size-[24px] md:size-[28px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-[8px] shrink-0">
                                                    <CalendarDays size={16} md:size={18} strokeWidth={2.5} />
                                                </div>
                                            )}
                                            {/* 활성화/비활성화 상태도 동일한 사각형 배지 스타일로 통일 */}
                                            <div
                                                title={item.status === "active" ? "구독 중" : "비활성"}
                                                className={cn(
                                                    "flex items-center justify-center size-[24px] md:size-[28px] rounded-[8px] transition-all duration-300 shrink-0",
                                                    item.status === "active" 
                                                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                                                )}
                                            >
                                                {item.status === "active" ? (
                                                    <Check size={16} md:size={18} strokeWidth={3} />
                                                ) : (
                                                    <Minus size={16} md:size={18} strokeWidth={3} />
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Status Legend (Guide) - 범례 스타일도 사각형 배지로 통일 */}
                <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-black/5 dark:border-slate-700/50 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                        <div className="size-6 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md flex items-center justify-center">
                            <Timer size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-[12px] md:text-[14px] font-bold text-slate-500 dark:text-slate-400">무료 체험</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-6 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md flex items-center justify-center">
                            <ShieldCheck size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-[12px] md:text-[14px] font-bold text-slate-500 dark:text-slate-400">필수 구독</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-6 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md flex items-center justify-center">
                            <CalendarDays size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-[12px] md:text-[14px] font-bold text-slate-500 dark:text-slate-400">연간 결제</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-6 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center justify-center">
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="text-[12px] md:text-[14px] font-bold text-slate-500 dark:text-slate-400">구독 중</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

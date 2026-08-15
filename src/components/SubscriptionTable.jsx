import { cn } from "../lib/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CATEGORY_COLORS, TEXT_COLORS } from "../constants/categories";
import { Timer, ShieldCheck, CalendarDays, Check, Minus, Globe, Ban } from "lucide-react";
import { getServiceLinks } from "../constants/presets";
import ServiceIcon from "./ServiceIcon";

const SortableHeader = ({ label, sortKey, width, sortConfig, onSort, isLast = false }) => {
    const getSortIcon = (key) => {
        if (sortConfig?.key !== key) return <span className="text-white/30 text-[11px] ml-1">⇅</span>;
        return sortConfig.direction === "asc" ? <span className="text-white text-[11px] ml-1">▲</span> : <span className="text-white text-[11px] ml-1">▼</span>;
    };

    return (
        <th
            className={cn("px-3 text-center font-bold text-[13px] md:text-[14px] text-white leading-tight cursor-pointer hover:bg-white/10 transition-colors select-none", width, !isLast && "border-r border-white/20 dark:border-slate-800")}
            onClick={() => onSort && onSort(sortKey)}
        >
            <div className="flex items-center justify-center gap-1">
                {label}
                {getSortIcon(sortKey)}
            </div>
        </th>
    );
};

export default function SubscriptionTable({ data, onRowClick, sortConfig, onSort }) {
    const [parent] = useAutoAnimate(/* config */);

    return (
        <div className="w-full relative">
            {/* 1. Mobile List View (md 미만: 가로 스크롤 없이 100% 폭에 딱 맞는 콤팩트 카드 리스트) */}
            <div className="md:hidden flex flex-col w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs" ref={parent}>
                {data.map((item, index) => {
                    const links = getServiceLinks(item.service_name);
                    return (
                        <div
                            key={item.id}
                            onClick={() => onRowClick && onRowClick(item)}
                            className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer"
                        >
                            {/* Left: Icon + Service Info */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                                <ServiceIcon 
                                    serviceName={item.service_name} 
                                    category={item.categories?.[0] || item.category || "Etc"} 
                                    size="md"
                                    className="shrink-0"
                                />
                                <div className="flex flex-col min-w-0 gap-0.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="font-bold text-dark dark:text-white text-[14px] leading-snug truncate">
                                            {item.service_name}
                                        </p>
                                        {(item.categories?.[0] || item.category) && (
                                            <span
                                                className={cn(
                                                    "inline-block px-1.5 py-0.5 rounded text-[10px] font-bold leading-none shrink-0",
                                                    CATEGORY_COLORS[item.categories?.[0] || item.category] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                                                    TEXT_COLORS[item.categories?.[0] || item.category] || "text-dark dark:text-white"
                                                )}
                                            >
                                                {item.categories?.[0] || item.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400 dark:text-slate-500 font-medium">
                                        <span>{item.billing_date}</span>
                                        {item.payment_method && (
                                            <>
                                                <span>·</span>
                                                <span className="truncate max-w-[100px]">{item.payment_method}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Price & Status */}
                            <div className="flex flex-col items-end shrink-0 gap-0.5">
                                <span className="font-bold text-dark dark:text-white text-[14px]">
                                    {item.price.toLocaleString()}원
                                </span>
                                {item.billing_cycle === 'yearly' && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        (월 {Math.floor(item.price / 12).toLocaleString()}원)
                                    </span>
                                )}
                                <div className="flex items-center gap-1 mt-0.5">
                                    {item.is_free_trial && (
                                        <span title="무료 체험" className="px-1 py-0.2 rounded text-[9.5px] font-extrabold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                            체험
                                        </span>
                                    )}
                                    {item.is_essential && (
                                        <span title="필수 구독" className="px-1 py-0.2 rounded text-[9.5px] font-extrabold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                            필수
                                        </span>
                                    )}
                                    {item.billing_cycle === 'yearly' && (
                                        <span title="연간 결제" className="px-1 py-0.2 rounded text-[9.5px] font-extrabold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                            연간
                                        </span>
                                    )}
                                    <div
                                        className={cn(
                                            "size-2 rounded-full",
                                            item.status === "active" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                                        )}
                                        title={item.status === "active" ? "구독 중" : "비활성"}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 2. Desktop Table View (md 이상: 슬림하고 모던한 정렬 테이블) */}
            <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 shadow-xs">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[750px] table-fixed border-collapse">
                        <thead className="bg-dark dark:bg-slate-950">
                            <tr className="h-[44px]">
                                {/* head__item: 순번 */}
                                <th className="w-[5%] border-r border-white/10 dark:border-slate-800 px-2 text-center font-bold text-[13px] text-white/80 whitespace-nowrap">
                                    #
                                </th>

                                {/* Sortable Columns */}
                                <SortableHeader label="서비스명" sortKey="service_name" width="w-[24%]" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="카테고리" sortKey="category" width="w-[15%]" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="결제일" sortKey="billing_date" width="w-[14%]" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="결제 수단" sortKey="payment_method" width="w-[14%] text-center" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="금액" sortKey="price" width="w-[14%]" sortConfig={sortConfig} onSort={onSort} />

                                {/* head__item: 상태 */}
                                <th className="w-[14%] text-center font-bold text-[13px] text-white/80 whitespace-nowrap">상태</th>
                            </tr>
                        </thead>
                        <tbody ref={parent}>
                            {data.map((item, index) => {
                                const links = getServiceLinks(item.service_name);
                                return (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-100 dark:border-slate-800/60 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer h-[50px]"
                                    onClick={() => onRowClick && onRowClick(item)}
                                >
                                    {/* 순번 */}
                                    <td className="w-[5%] border-r border-slate-100 dark:border-slate-800/60 text-center font-medium text-slate-400 text-[13px]">{index + 1}</td>

                                    {/* 서비스명 */}
                                    <td className="w-[24%] border-r border-slate-100 dark:border-slate-800/60 px-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <ServiceIcon 
                                                    serviceName={item.service_name} 
                                                    category={item.categories?.[0] || item.category || "Etc"} 
                                                    size="sm"
                                                    className="group-hover:scale-105 shrink-0"
                                                />
                                                <p className="font-bold text-dark dark:text-white text-[14px] leading-tight truncate group-hover:text-primary transition-colors">{item.service_name}</p>
                                            </div>

                                            {/* Official & Cancel Links Icons */}
                                            {(links.subscribe_url || links.cancel_url) && (
                                                <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {links.subscribe_url && (
                                                        <a
                                                            href={links.subscribe_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-1 text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-primary/10 rounded transition-all"
                                                            title="공식 홈페이지 새 창 열기"
                                                        >
                                                            <Globe className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                    {links.cancel_url && (
                                                        <a
                                                            href={links.cancel_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                                                            title="구독 해지 / 관리 새 창 열기"
                                                        >
                                                            <Ban className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* 카테고리 */}
                                    <td className="w-[15%] border-r border-slate-100 dark:border-slate-800/60 text-center px-2">
                                        <div className="flex flex-wrap items-center justify-center gap-1">
                                            {item.categories && item.categories.length > 0 ? (
                                                item.categories.map((cat) => (
                                                    <span
                                                        key={cat}
                                                        className={cn(
                                                            "inline-block px-2.5 py-0.5 rounded-full text-[11.5px] font-bold leading-tight",
                                                            CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200",
                                                            TEXT_COLORS[cat] || "text-dark dark:text-white"
                                                        )}
                                                    >
                                                        {cat}
                                                    </span>
                                                ))
                                            ) : (
                                                <span
                                                    className={cn(
                                                        "inline-block px-2.5 py-0.5 rounded-full text-[11.5px] font-bold leading-tight",
                                                        CATEGORY_COLORS[item.category] || "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200",
                                                        TEXT_COLORS[item.category] || "text-dark dark:text-white"
                                                    )}
                                                >
                                                    {item.category || "Etc"}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* 결제일 */}
                                    <td className="w-[14%] border-r border-slate-100 dark:border-slate-800/60 text-center font-medium text-dark dark:text-white text-[13.5px]">{item.billing_date}</td>

                                    {/* 결제 수단 */}
                                    <td className="w-[14%] border-r border-slate-100 dark:border-slate-800/60 text-center font-medium text-dark dark:text-white text-[13.5px]">
                                        {item.payment_method || '-'}
                                    </td>

                                    {/* 금액 */}
                                    <td className="w-[14%] border-r border-slate-100 dark:border-slate-800/60 text-center font-bold text-dark dark:text-white text-[13.5px]">
                                        <div className="flex flex-col">
                                            <span>{item.price.toLocaleString()}원</span>
                                            {item.billing_cycle === "yearly" && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">(월 {Math.floor(item.price / 12).toLocaleString()}원)</span>}
                                        </div>
                                    </td>

                                    {/* 상태 */}
                                    <td className="w-[14%] text-center px-3">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {item.is_free_trial && (
                                                <div title="무료 체험 중" className="flex items-center justify-center size-6 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md shrink-0">
                                                    <Timer size={14} strokeWidth={2.5} />
                                                </div>
                                            )}
                                            {item.is_essential && (
                                                <div title="필수 구독 항목" className="flex items-center justify-center size-6 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md shrink-0">
                                                    <ShieldCheck size={14} strokeWidth={2.5} />
                                                </div>
                                            )}
                                            {item.billing_cycle === "yearly" && (
                                                <div title="연간 결제 상품" className="flex items-center justify-center size-6 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md shrink-0">
                                                    <CalendarDays size={14} strokeWidth={2.5} />
                                                </div>
                                            )}
                                            <div
                                                title={item.status === "active" ? "구독 중" : "비활성"}
                                                className={cn(
                                                    "flex items-center justify-center size-6 rounded-md transition-all duration-200 shrink-0",
                                                    item.status === "active" 
                                                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                                                )}
                                            >
                                                {item.status === "active" ? (
                                                    <Check size={14} strokeWidth={2.5} />
                                                ) : (
                                                    <Minus size={14} strokeWidth={2.5} />
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>

                {/* Status Legend (Guide) */}
                <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                        <div className="size-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded flex items-center justify-center">
                            <Timer size={10} strokeWidth={2.5} />
                        </div>
                        <span>무료 체험</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="size-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded flex items-center justify-center">
                            <ShieldCheck size={10} strokeWidth={2.5} />
                        </div>
                        <span>필수 구독</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="size-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded flex items-center justify-center">
                            <CalendarDays size={10} strokeWidth={2.5} />
                        </div>
                        <span>연간 결제</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="size-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded flex items-center justify-center">
                            <Check size={10} strokeWidth={2.5} />
                        </div>
                        <span>구독 중</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

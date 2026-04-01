import { useState } from "react";
import { cn } from "../lib/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CATEGORY_COLORS, TEXT_COLORS } from "../constants/categories";
import { Timer, ShieldCheck, CalendarDays, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SortableHeader = ({ label, sortKey, width, sortConfig, onSort, isLast = false, children }) => {
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
                {children}
            </div>
        </th>
    );
};

export default function SubscriptionTable({ data, onRowClick, sortConfig, onSort }) {
    // eslint-disable-next-line no-unused-vars
    const [parent] = useAutoAnimate(/* config */);
    const [showGuide, setShowGuide] = useState(false);

    return (
        <div className="w-full relative">
            {/* Icon Guide Tooltip - Absolute Positioning */}
            <AnimatePresence>
                {showGuide && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-[-10px] left-4 md:left-20 z-[60] -translate-y-full">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-2xl border border-tertiary dark:border-slate-700 min-w-[280px] ring-1 ring-black/5">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[15px] font-extrabold text-dark dark:text-white flex items-center gap-2">
                                    <Info size={16} className="text-primary" /> 아이콘 안내
                                </h4>
                                <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-dark dark:hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                                        <Timer size={16} strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-dark dark:text-white">무료 체험 중</span>
                                        <span className="text-[11px] text-slate-500">곧 유료로 전환될 예정인 서비스입니다.</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-8 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center shrink-0">
                                        <ShieldCheck size={16} strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-dark dark:text-white">필수 구독 항목</span>
                                        <span className="text-[11px] text-slate-500">분석 및 해지 제안에서 제외되는 항목입니다.</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-8 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center shrink-0">
                                        <CalendarDays size={16} strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-dark dark:text-white">연간 결제 상품</span>
                                        <span className="text-[11px] text-slate-500">1년 단위로 결제되는 서비스입니다.</span>
                                    </div>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute bottom-[-6px] left-6 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-tertiary dark:border-slate-700 rotate-45" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full overflow-hidden rounded-[24px] border border-tertiary dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-300 shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[700px] md:min-w-[800px] table-fixed border-collapse">
                        <thead className="bg-dark dark:bg-slate-950">
                            <tr className="h-[56px]">
                                {/* head__item: 순번 */}
                                <th className="w-[45px] md:w-[6%] border-r border-white/10 dark:border-slate-800 px-2 text-center font-extrabold text-[12px] md:text-[16px] text-white leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis">
                                    #
                                </th>

                                {/* Sortable Columns */}
                                <SortableHeader label="서비스명" sortKey="service_name" width="w-[180px] md:w-[25%]" sortConfig={sortConfig} onSort={onSort}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowGuide(!showGuide);
                                        }}
                                        className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                                        title="아이콘 가이드 보기"
                                    >
                                        <Info size={14} className="text-white/60" />
                                    </button>
                                </SortableHeader>
                                <SortableHeader label="카테고리" sortKey="category" width="w-[100px] md:w-[15%]" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="결제일" sortKey="billing_date" width="w-[110px] md:w-[14%]" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="결제 수단" sortKey="payment_method" width="w-[110px] md:w-[14%]" sortConfig={sortConfig} onSort={onSort} />
                                <SortableHeader label="금액" sortKey="price" width="w-[110px] md:w-[14%]" sortConfig={sortConfig} onSort={onSort} />

                                {/* head__item: 상태 */}
                                <th className="w-[80px] md:w-[12%] text-center font-extrabold text-[14px] md:text-[16px] text-white leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis">상태</th>
                            </tr>
                        </thead>
                        <tbody ref={parent}>
                            {data.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-black/5 dark:border-slate-700/50 group hover:bg-tertiary/50 dark:hover:bg-slate-700/50 transition-colors duration-300 cursor-pointer h-[64px]"
                                    onClick={() => onRowClick && onRowClick(item)}
                                >
                                    {/* 순번 */}
                                    <td className="w-[45px] md:w-[6%] border-r border-black/5 dark:border-slate-700/50 text-center font-bold text-dark/40 dark:text-slate-500 text-[13px] md:text-[17px] leading-[1.4]">{index + 1}</td>

                                    {/* 서비스명 */}
                                    <td className="w-[180px] md:w-[25%] border-r border-black/5 dark:border-slate-700/50 px-4 md:px-6">
                                        <div className="flex items-center gap-2 md:gap-3 justify-start">
                                            <div
                                                className={cn(
                                                    "w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-[8px] md:rounded-[10px] flex items-center justify-center text-[12px] md:text-[16px] font-extrabold transition-all group-hover:scale-110 shadow-sm shrink-0",
                                                    CATEGORY_COLORS[item.categories?.[0] || item.category || "Etc"],
                                                    TEXT_COLORS[item.categories?.[0] || item.category || "Etc"],
                                                )}
                                            >
                                                {item.service_name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="font-extrabold text-dark dark:text-white text-[14px] md:text-[17px] leading-[1.4] truncate group-hover:text-primary transition-colors">{item.service_name}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* 카테고리 */}
                                    <td className="w-[100px] md:w-[15%] border-r border-black/5 dark:border-slate-700/50 text-center px-1 md:px-2">
                                        <div className="flex flex-wrap items-center justify-center gap-1 md:gap-1.5">
                                            {item.categories?.map((cat) => (
                                                <div
                                                    key={cat}
                                                    className="inline-flex items-center justify-center px-2 py-[4px] md:px-3 md:py-[6px] rounded-full bg-slate-100 dark:bg-slate-700 text-dark dark:text-slate-200 text-[11px] md:text-[14px] font-extrabold leading-none transition-all group-hover:bg-primary group-hover:text-white"
                                                >
                                                    {cat}
                                                </div>
                                            ))}
                                            {!item.categories && item.category && (
                                                <div className="inline-flex items-center justify-center px-2 py-[4px] md:px-3 md:py-[6px] rounded-full bg-slate-100 dark:bg-slate-700 text-dark dark:text-slate-200 text-[11px] md:text-[14px] font-extrabold leading-none transition-all group-hover:bg-primary group-hover:text-white">
                                                    {item.category}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* 결제일 */}
                                    <td className="w-[110px] md:w-[14%] border-r border-black/5 dark:border-slate-700/50 text-center font-extrabold text-dark dark:text-white text-[13px] md:text-[17px] leading-[1.4]">{item.billing_date}</td>

                                    {/* 결제 수단 */}
                                    <td className="w-[110px] md:w-[14%] border-r border-black/5 dark:border-slate-700/50 text-center font-extrabold text-dark dark:text-white text-[13px] md:text-[17px] leading-[1.4]">
                                        {item.payment_method}
                                    </td>

                                    {/* 금액 */}
                                    <td className="w-[110px] md:w-[14%] border-r border-black/5 dark:border-slate-700/50 text-center font-extrabold text-dark dark:text-white text-[13px] md:text-[17px] leading-[1.4]">
                                        <div className="flex flex-col">
                                            <span>{item.price.toLocaleString()}원</span>
                                            {item.billing_cycle === "yearly" && <span className="text-[10px] md:text-[12px] text-dark/40 dark:text-slate-500 font-bold">(월 {Math.floor(item.price / 12).toLocaleString()}원)</span>}
                                        </div>
                                    </td>

                                    {/* 상태 */}
                                    <td className="w-[80px] md:w-[12%] text-center px-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="flex items-center gap-1">
                                                {item.is_free_trial && (
                                                    <div title="무료 체험 중" className="flex items-center justify-center p-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md shrink-0">
                                                        <Timer size={16} strokeWidth={3} />
                                                    </div>
                                                )}
                                                {item.is_essential && (
                                                    <div title="필수 구독 항목" className="flex items-center justify-center p-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md shrink-0">
                                                        <ShieldCheck size={16} strokeWidth={3} />
                                                    </div>
                                                )}
                                                {item.billing_cycle === "yearly" && (
                                                    <div title="연간 결제 상품" className="flex items-center justify-center p-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md shrink-0">
                                                        <CalendarDays size={16} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className={cn(
                                                    "w-[10px] h-[10px] md:w-[12px] md:h-[12px] rounded-full shadow-sm transition-all duration-500 shrink-0",
                                                    item.status === "active" ? "bg-emerald-500 scale-125" : "bg-gray-300 dark:bg-slate-600",
                                                )}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Status Legend (Guide) */}
                <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-black/5 dark:border-slate-700/50 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                            <Timer size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[12px] md:text-[14px] font-bold text-slate-500 dark:text-slate-400">무료 체험 중</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md">
                            <ShieldCheck size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[12px] md:text-[14px] font-bold text-slate-500 dark:text-slate-400">필수 구독</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md">
                            <CalendarDays size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[12px] md:text-[14px] font-bold text-slate-500 dark:text-slate-400">연간 결제 상품</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { cn } from '../lib/utils'

const SortableHeader = ({ label, sortKey, width, sortConfig, onSort, isLast = false }) => {
  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return <span className="text-white/30 text-[10px] ml-1">⇅</span>
    return sortConfig.direction === 'asc' 
      ? <span className="text-white text-[10px] ml-1">▲</span> 
      : <span className="text-white text-[10px] ml-1">▼</span>
  }

  return (
    <th 
      className={cn(
        "px-2 text-center font-bold text-[14px] md:text-[16px] text-white tracking-[-0.03em] leading-[1.4] cursor-pointer hover:bg-white/10 transition-colors select-none",
        width,
        !isLast && "border-r border-white/30 dark:border-slate-700"
      )}
      onClick={() => onSort && onSort(sortKey)}
    >
      <div className="flex items-center justify-center">
        {label}
        {getSortIcon(sortKey)}
      </div>
    </th>
  )
}

export default function SubscriptionTable({ data, onRowClick, sortConfig, onSort }) {
  return (
    <div className="w-full overflow-hidden rounded-[16px] border border-tertiary dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-300">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[800px] table-fixed border-collapse">
          <thead>
            <tr className="bg-[#1E293B] dark:bg-slate-950 h-[48px] transition-colors duration-300">
            {/* head__item: 순번 */}
            <th className="w-[6%] border-r border-white/30 dark:border-slate-700 px-2 text-center font-bold text-[12px] md:text-[16px] text-white tracking-[-0.03em] leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis">
              순번
            </th>

            {/* Sortable Columns */}
            <SortableHeader label="서비스명" sortKey="service_name" width="w-[28%]" sortConfig={sortConfig} onSort={onSort} />
            <SortableHeader label="카테고리" sortKey="category" width="w-[15%]" sortConfig={sortConfig} onSort={onSort} />
            <SortableHeader label="결제일" sortKey="billing_date" width="w-[15%]" sortConfig={sortConfig} onSort={onSort} />
            <SortableHeader label="결제 수단" sortKey="payment_method" width="w-[15%]" sortConfig={sortConfig} onSort={onSort} />
            <SortableHeader label="금액" sortKey="price" width="w-[15%]" sortConfig={sortConfig} onSort={onSort} />
            
            {/* head__item: 상태 */}
            <th className="w-[6%] text-center font-bold text-[14px] md:text-[16px] text-white tracking-[-0.03em] leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={item.id} 
              className="border-b border-black/10 dark:border-slate-700 group hover:bg-tertiary/30 dark:hover:bg-slate-700 transition-colors cursor-pointer h-[52px]"
              onClick={() => onRowClick && onRowClick(item)}
            >
              {/* 순번 */}
              <td className="w-[6%] border-r border-black/10 dark:border-slate-700 text-center font-medium text-black dark:text-white text-[13px] md:text-[17px] tracking-[-0.02em] leading-[1.4]">
                {index + 1}
              </td>
              
              {/* 서비스명 */}
              <td className="w-[28%] border-r border-black/10 dark:border-slate-700 px-6">
                <div className="flex items-center gap-2 justify-start">
                  <div className="w-[24px] h-[24px] rounded-[6px] bg-[#DBEAFE] dark:bg-slate-700 flex items-center justify-center text-[12px] md:text-[15px] font-medium text-black dark:text-white shrink-0 tracking-[-0.04em] transition-colors">
                    {item.service_name.charAt(0)}
                  </div>
                  <p className="font-medium text-black dark:text-white text-[14px] md:text-[17px] tracking-[-0.04em] leading-[1.4] truncate">
                    {item.service_name}
                  </p>
                </div>
              </td>

              {/* 카테고리 */}
              <td className="w-[15%] border-r border-black/10 dark:border-slate-700 text-center px-1">
                 <div className="flex flex-wrap items-center justify-center gap-1">
                    {item.categories?.map((cat) => (
                      <div key={cat} className="inline-flex items-center justify-center px-2 py-[4px] min-h-[24px] rounded-[45px] bg-[rgba(37,99,235,0.1)] dark:bg-slate-700 text-black dark:text-white text-[12px] md:text-[14px] font-medium tracking-[-0.04em] leading-[1.2] transition-colors whitespace-nowrap">
                        {cat}
                      </div>
                    ))}
                    {/* Fallback for old data if any */}
                    {!item.categories && item.category && (
                      <div className="inline-flex items-center justify-center px-2 py-[4px] min-h-[24px] rounded-[45px] bg-[rgba(37,99,235,0.1)] dark:bg-slate-700 text-black dark:text-white text-[12px] md:text-[14px] font-medium tracking-[-0.04em] leading-[1.2] transition-colors whitespace-nowrap">
                        {item.category}
                      </div>
                    )}
                 </div>
              </td>

              {/* 결제일 */}
              <td className="w-[15%] border-r border-black/10 dark:border-slate-700 text-center font-medium text-black dark:text-white text-[14px] md:text-[17px] tracking-[-0.04em] leading-[1.4]">
                {item.billing_date}
              </td>

              {/* 결제 수단 */}
              <td className="w-[15%] border-r border-black/10 dark:border-slate-700 text-center font-medium text-black dark:text-white text-[14px] md:text-[17px] tracking-[-0.04em] leading-[1.4]">
                {item.payment_method}
              </td>

              {/* 금액 */}
              <td className="w-[15%] border-r border-black/10 dark:border-slate-700 text-center font-medium text-black dark:text-white text-[14px] md:text-[17px] tracking-[-0.04em] leading-[1.4]">
                {item.price.toLocaleString()}원
              </td>

              {/* 상태 */}
              <td className="w-[6%] text-center">
                <div 
                  className={cn(
                    "w-[18px] h-[18px] rounded-full mx-auto",
                    item.status === 'active' ? 'bg-[#34C759]' : 'bg-gray-300 dark:bg-slate-600'
                  )} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
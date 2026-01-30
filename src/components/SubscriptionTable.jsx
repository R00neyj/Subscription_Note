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
        "px-2 text-center font-bold text-[16px] text-white tracking-[-0.03em] leading-[1.4] cursor-pointer hover:bg-white/10 transition-colors select-none",
        width,
        !isLast && "border-r border-white/30"
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
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-[#1E293B] h-[48px]">
            {/* head__item: 순번 (No sort) */}
            <th className="w-[6%] border-r border-white/30 px-2 text-center font-bold text-[16px] text-white tracking-[-0.03em] leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis">
              순번
            </th>

            {/* Sortable Columns */}
            <SortableHeader label="서비스명" sortKey="service_name" width="w-[22%]" sortConfig={sortConfig} onSort={onSort} />
            <SortableHeader label="카테고리" sortKey="category" width="w-[22%]" sortConfig={sortConfig} onSort={onSort} />
            <SortableHeader label="결제일" sortKey="billing_date" width="w-[22%]" sortConfig={sortConfig} onSort={onSort} />
            <SortableHeader label="금액" sortKey="price" width="w-[22%]" sortConfig={sortConfig} onSort={onSort} />
            
            {/* head__item: 상태 (No sort) */}
            <th className="w-[6%] text-center font-bold text-[16px] text-white tracking-[-0.03em] leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={item.id} 
              className="border-b border-black/10 dark:border-white/10 group hover:bg-tertiary/30 dark:hover:bg-slate-700 transition-colors cursor-pointer h-[52px]"
              onClick={() => onRowClick && onRowClick(item)}
            >
              {/* 순번: 12px, border-r */}
              <td className="w-[6%] border-r border-black/10 dark:border-white/10 text-center font-medium text-black dark:text-white text-[12px] tracking-[-0.02em] leading-[1.4]">
                {index + 1}
              </td>
              
              {/* 서비스명: 16px, gap-8, 42x42 icon box, border-r */}
              <td className="w-[22%] border-r border-black/10 dark:border-white/10 px-6">
                <div className="flex items-center gap-2 justify-start">
                  <div className="w-[42px] h-[42px] rounded-[12px] bg-[#DBEAFE] dark:bg-slate-700 flex items-center justify-center text-[16px] font-medium text-black dark:text-white shrink-0 tracking-[-0.04em] transition-colors">
                    {item.service_name.charAt(0)}
                  </div>
                  <p className="font-medium text-black dark:text-white text-[16px] tracking-[-0.04em] leading-[1.4] truncate">
                    {item.service_name}
                  </p>
                </div>
              </td>

              {/* 카테고리: 14px pill, border-r */}
              <td className="w-[22%] border-r border-black/10 dark:border-white/10 text-center">
                 <div className="inline-flex items-center justify-center px-3 py-[6px] h-[32px] rounded-[45px] bg-[rgba(37,99,235,0.1)] dark:bg-slate-700 text-black dark:text-white text-[14px] font-medium tracking-[-0.04em] leading-[1.4] transition-colors">
                    {item.category}
                 </div>
              </td>

              {/* 결제일: 16px, border-r */}
              <td className="w-[22%] border-r border-black/10 dark:border-white/10 text-center font-medium text-black dark:text-white text-[16px] tracking-[-0.04em] leading-[1.4]">
                {item.billing_date}
              </td>

              {/* 금액: 16px, border-r */}
              <td className="w-[22%] border-r border-black/10 dark:border-white/10 text-center font-medium text-black dark:text-white text-[16px] tracking-[-0.04em] leading-[1.4]">
                {item.price.toLocaleString()}원
              </td>

              {/* 상태: 18x18 indicator */}
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
  )
}
import { useState } from 'react'
import { cn } from '../lib/utils'
import EmptyState from './EmptyState'

export default function CategoryDistributionChart({ 
  categoryData, 
  selectedCategory, 
  onCategoryClick 
}) {
  const [hoveredCategory, setHoveredCategory] = useState(null)

  if (categoryData.length === 0) {
    return (
      <EmptyState message="구독 데이터가 없습니다." />
    )
  }

  const handleCategoryClick = (categoryId) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId)
    }
  }

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 md:gap-x-5 md:gap-y-2 mb-2.5 md:mb-3 justify-start">
        {categoryData.map((item) => {
          const isSelected = selectedCategory === item.id
          const isDimmed = selectedCategory && !isSelected
          const isHovered = hoveredCategory === item.id
          
          return (
            <div 
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className={cn(
                "flex items-center gap-1.5 cursor-pointer transition-all duration-200",
                isDimmed && "opacity-30",
                !selectedCategory && hoveredCategory && !isHovered && "opacity-30"
              )}
              onMouseEnter={() => setHoveredCategory(item.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className={cn("shrink-0 size-2.5 md:size-3 rounded-full", item.color, isSelected && "ring-2 ring-offset-1 ring-primary dark:ring-offset-slate-800")} />
              <p className={cn(
                "font-bold text-[12px] md:text-[13px]",
                isSelected ? "text-primary dark:text-blue-400" : "text-slate-700 dark:text-slate-200"
              )}>
                {item.label} <span className="text-[11px] md:text-[12px] font-medium text-slate-400">({Math.round(item.percentage)}%)</span>
              </p>
            </div>
          )
        })}
      </div>

      {/* Bar Chart */}
      <div className="h-[28px] md:h-[36px] w-full rounded-full flex overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900/60 p-0.5">
        {categoryData.map((item) => {
          const isSelected = selectedCategory === item.id
          const isDimmed = selectedCategory && !isSelected
          const isHovered = hoveredCategory === item.id

          return (
            <div 
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className={cn(
                "h-full flex items-center justify-center font-bold text-[11px] md:text-[13px] transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap rounded-xs first:rounded-l-full last:rounded-r-full",
                item.color,
                item.textColor,
                isDimmed && "opacity-30",
                !selectedCategory && hoveredCategory && !isHovered && "opacity-30"
              )}
              style={{ width: `${item.percentage}%` }}
              onMouseEnter={() => setHoveredCategory(item.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              title={`${item.label}: ${Math.round(item.percentage)}%`}
            >
              {item.percentage > 5 && `${Math.round(item.percentage)}%`}
            </div>
          )
        })}
      </div>
    </div>
  )
}

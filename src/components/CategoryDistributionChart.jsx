import { useState } from 'react'
import { cn } from '../lib/utils'

export default function CategoryDistributionChart({ 
  categoryData, 
  selectedCategory, 
  onCategoryClick 
}) {
  const [hoveredCategory, setHoveredCategory] = useState(null)

  if (categoryData.length === 0) {
    return (
      <div className="w-full h-[100px] flex items-center justify-center bg-tertiary dark:bg-slate-900 rounded-[24px] text-dark/40 dark:text-slate-500">
        구독 데이터가 없습니다.
      </div>
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
      <div className="flex flex-wrap gap-6 mb-4 justify-start">
        {categoryData.map((item) => {
          const isSelected = selectedCategory === item.id
          const isDimmed = selectedCategory && !isSelected
          const isHovered = hoveredCategory === item.id
          
          return (
            <div 
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className={cn(
                "flex items-center gap-2 cursor-pointer transition-all duration-200",
                isDimmed && "opacity-30",
                !selectedCategory && hoveredCategory && !isHovered && "opacity-30"
              )}
              onMouseEnter={() => setHoveredCategory(item.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className={cn("shrink-0 size-[24px] rounded-[8px]", item.color, isSelected && "ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-800")} />
              <p className={cn(
                "font-medium text-[16px]",
                isSelected ? "text-primary dark:text-blue-400 font-bold" : "text-black dark:text-white"
              )}>
                {item.label} ({Math.round(item.percentage)}%)
              </p>
            </div>
          )
        })}
      </div>

      {/* Bar Chart */}
      <div className="h-[42px] w-full rounded-full flex overflow-hidden">
        {categoryData.map((item) => {
          const isSelected = selectedCategory === item.id
          const isDimmed = selectedCategory && !isSelected
          const isHovered = hoveredCategory === item.id

          return (
            <div 
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className={cn(
                "h-full flex items-center justify-center font-bold text-xs transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap",
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

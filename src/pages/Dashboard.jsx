import { useState, useMemo, useEffect } from 'react'
import Header from '../components/Header'
import SubscriptionTable from '../components/SubscriptionTable'
import SectionHeader from '../components/SectionHeader'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'
import useSubscriptionStore from '../store/useSubscriptionStore'

const CATEGORY_COLORS = {
  OTT: 'bg-[#2563EB]',     // Primary Blue
  Work: 'bg-[#111111]',    // Dark
  Music: 'bg-[#FFD233]',   // Yellow
  Shopping: 'bg-[#FF5E57]',// Red
  Cloud: 'bg-[#33D9B2]',   // Teal
  Etc: 'bg-[#A0AEC0]'      // Gray
}

const TEXT_COLORS = {
  OTT: 'text-white',
  Work: 'text-white',
  Music: 'text-dark',
  Shopping: 'text-white',
  Cloud: 'text-dark',
  Etc: 'text-white'
}

export default function Dashboard() {
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  
  // Store Data
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const isTutorialOpen = useSubscriptionStore((state) => state.isTutorialOpen)
  const setTutorialOpen = useSubscriptionStore((state) => state.setTutorialOpen)
  const hasSeenTutorial = useSubscriptionStore((state) => state.hasSeenTutorial)

  useEffect(() => {
    // 튜토리얼을 보지 않았다면 자동으로 시작 (약간의 지연 후)
    if (!hasSeenTutorial && !isTutorialOpen) {
      const timer = setTimeout(() => setTutorialOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [hasSeenTutorial, isTutorialOpen, setTutorialOpen])

  // Sort Logic (Same as SubscriptionList)
  const sortedSubscriptions = useMemo(() => {
    let data = [...subscriptions]

    if (sortConfig.key) {
      data.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'price') {
           return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }
        if (sortConfig.key === 'billing_date') {
            const getDay = (str) => parseInt(str.replace(/[^0-9]/g, '')) || 0
            aValue = getDay(aValue)
            bValue = getDay(bValue)
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }
        // Handle strings (service_name, category, payment_method)
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }
        return 0
      })
    }
    return data
  }, [subscriptions, sortConfig])

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }
  
  const totalCost = useSubscriptionStore((state) => 
    state.subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((acc, sub) => acc + sub.price, 0)
  )

  const activeCount = useSubscriptionStore((state) => 
    state.subscriptions.filter(sub => sub.status === 'active').length
  )

  const maxExpenseService = useSubscriptionStore((state) => {
    const subs = state.subscriptions.filter(sub => sub.status === 'active')
    if (subs.length === 0) return '-'
    return subs.sort((a, b) => b.price - a.price)[0]?.service_name || '-'
  })
  
  const openModal = useSubscriptionStore((state) => state.openModal)

  // Dynamic Category Data Calculation
  const categoryData = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'active')
    if (activeSubs.length === 0) return []

    const grouped = activeSubs.reduce((acc, sub) => {
      // Use the first category if multiple exist, fallback to single category or 'Etc'
      const cat = (sub.categories && sub.categories.length > 0) 
        ? sub.categories[0] 
        : (sub.category || 'Etc')
      
      acc[cat] = (acc[cat] || 0) + sub.price
      return acc
    }, {})

    const total = Object.values(grouped).reduce((a, b) => a + b, 0)

    return Object.entries(grouped)
      .map(([label, value]) => ({
        id: label,
        label,
        value,
        percentage: (value / total) * 100,
        color: CATEGORY_COLORS[label] || CATEGORY_COLORS.Etc,
        textColor: TEXT_COLORS[label] || 'text-white'
      }))
      .sort((a, b) => b.value - a.value) // Sort by biggest expense
  }, [subscriptions])

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:rounded-[48px] px-0 md:p-[42px] flex flex-col gap-[16px] items-start w-full transition-colors duration-300">
        {/* Title Section */}
        <div className="flex justify-start w-full">
           <SectionHeader title="월간 구독 리포트" />
        </div>

        {/* Summary Cards */}
        <div id="step-summary" className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-[10px] items-start w-full">
          {/* 총 구독료 */}
          <div className="bg-background dark:bg-slate-900 border border-primary rounded-[20px] md:rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full md:max-w-[200px] transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <p className="text-[14px] md:text-[18px] font-bold text-dark dark:text-slate-200 tracking-[-0.54px] leading-[1.4]">총 구독료</p>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white tracking-[-0.84px] leading-[1.4]">
                {totalCost.toLocaleString()}
              </span>
              <div className="pt-1">
                <span className="text-[14px] md:text-[18px] font-medium text-dark dark:text-slate-200 tracking-[-0.54px] leading-[1.4]">원</span>
              </div>
            </div>
          </div>
          
          {/* 구독중인 서비스 */}
          <div className="bg-background dark:bg-slate-900 border border-primary rounded-[20px] md:rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full md:max-w-[200px] transition-all duration-300 hover:-translate-y-1 cursor-pointer">
             <p className="text-[14px] md:text-[18px] font-bold text-dark dark:text-slate-200 tracking-[-0.54px] leading-[1.4]">구독중인 서비스</p>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white tracking-[-0.84px] leading-[1.4]">
                {activeCount}
              </span>
              <div className="pt-1">
                <span className="text-[14px] md:text-[18px] font-medium text-dark dark:text-slate-200 tracking-[-0.54px] leading-[1.4]">개</span>
              </div>
            </div>
          </div>

          {/* 가장 지출이 큰 곳 */}
          <div className="col-span-2 md:col-auto bg-background dark:bg-slate-900 border border-primary rounded-[20px] md:rounded-[24px] p-4 md:p-6 flex flex-col items-start gap-1 w-full md:min-w-[200px] md:w-fit transition-all duration-300 hover:-translate-y-1 cursor-pointer">
             <p className="text-[14px] md:text-[18px] font-bold text-dark dark:text-slate-200 tracking-[-0.54px] leading-[1.4]">가장 지출이 큰 곳</p>
            <div className="flex items-center gap-[3px]">
              <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white tracking-[-0.84px] leading-[1.4] whitespace-nowrap">
                {maxExpenseService}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Table */}
        <div id="step-recent" className="flex flex-col gap-4 mt-4 w-full">
            <SubscriptionTable 
              data={sortedSubscriptions.slice(0, 5)} 
              onRowClick={(item) => openModal(item)}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
            
            <Link to="/list" className="self-center flex items-center gap-1 px-4 py-2 bg-background dark:bg-slate-700 rounded-xl text-dark dark:text-white font-medium hover:bg-tertiary dark:hover:bg-slate-600 transition-colors group">
              더 보기
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
        
        {/* Chart Section */}
         <div className="mt-8 flex flex-col items-start w-full">
            <SectionHeader title="카테고리별 비중" className="mb-4" />
            
            {categoryData.length > 0 ? (
              <div className="w-full">
                {/* Legend */}
                <div className="flex flex-wrap gap-6 mb-4 justify-start">
                  {categoryData.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer transition-opacity duration-200",
                        hoveredCategory && hoveredCategory !== item.id ? "opacity-30" : "opacity-100"
                      )}
                      onMouseEnter={() => setHoveredCategory(item.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className={cn("shrink-0 size-[24px] rounded-[8px]", item.color)} />
                      <p className="font-medium text-[16px] text-black dark:text-white tracking-[-0.48px]">
                        {item.label} ({Math.round(item.percentage)}%)
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bar Chart */}
                <div className="h-[42px] w-full rounded-full flex overflow-hidden">
                  {categoryData.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "h-full flex items-center justify-center font-bold text-xs transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap",
                        item.color,
                        item.textColor,
                        hoveredCategory && hoveredCategory !== item.id ? "opacity-30" : "opacity-100"
                      )}
                      style={{ width: `${item.percentage}%` }}
                      onMouseEnter={() => setHoveredCategory(item.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      title={`${item.label}: ${Math.round(item.percentage)}%`}
                    >
                      {item.percentage > 5 && `${Math.round(item.percentage)}%`}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-[100px] flex items-center justify-center bg-tertiary rounded-[24px] text-dark/40">
                구독 데이터가 없습니다.
              </div>
            )}
         </div>

      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import Header from '../components/Header'
import SubscriptionTable from '../components/SubscriptionTable'
import useSubscriptionStore from '../store/useSubscriptionStore'
import { CATEGORIES, CATEGORY_COLORS, TEXT_COLORS } from '../constants/categories'
import SectionHeader from '../components/SectionHeader'
import CategoryDistributionChart from '../components/CategoryDistributionChart'

export default function SubscriptionList() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  // Toggle Category Logic
  const toggleCategory = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  // Dynamic Category Data Calculation for Chart
  const categoryData = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'active')
    if (activeSubs.length === 0) return []

    const grouped = activeSubs.reduce((acc, sub) => {
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
      .sort((a, b) => b.value - a.value)
  }, [subscriptions])

  // Filter and Sort subscriptions
  const sortedSubscriptions = useMemo(() => {
    let data = [...subscriptions]
    
    // 1. Category Filter
    if (selectedCategory !== 'all') {
      data = data.filter(sub => 
        sub.category === selectedCategory || 
        sub.categories?.includes(selectedCategory)
      )
    }

    // 2. Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle category specially (might be in categories array)
        if (sortConfig.key === 'category') {
          aValue = a.category || a.categories?.[0] || ''
          bValue = b.category || b.categories?.[0] || ''
        }

        // Handle numeric values (price)
        if (sortConfig.key === 'price') {
           return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        // Handle billing_date (extract day number)
        if (sortConfig.key === 'billing_date') {
            const getDay = (str) => parseInt(str.replace(/[^0-9]/g, '')) || 0
            aValue = getDay(aValue)
            bValue = getDay(bValue)
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        // Handle strings (default for service_name, payment_method)
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }
        
        return 0
      })
    }

    return data
  }, [subscriptions, selectedCategory, sortConfig])

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Calculate total cost for filtered items (active only)
  const totalCost = useMemo(() => {
    return sortedSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((acc, sub) => acc + sub.price, 0)
  }, [sortedSubscriptions])

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:rounded-[48px] px-0 md:p-[42px] flex flex-col gap-[24px] items-start w-full transition-colors duration-300">
        <div className="flex flex-col gap-2 w-full">
          <SectionHeader title="구독 목록" />
          
          <div className="w-full mb-6">
            <CategoryDistributionChart 
              categoryData={categoryData}
              selectedCategory={selectedCategory === 'all' ? null : selectedCategory}
              onCategoryClick={(id) => toggleCategory(id === selectedCategory ? 'all' : id)}
            />
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-background dark:bg-slate-900 border border-primary rounded-[20px] p-4 flex flex-col items-start gap-1 w-full max-w-[200px] shrink-0 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <p className="text-[14px] md:text-[18px] font-bold text-dark dark:text-slate-200 leading-[1.4]">
            {selectedCategory === 'all' 
              ? '총 구독료' 
              : `${CATEGORIES.find(c => c.id === selectedCategory)?.label} 구독료`}
          </p>
          <div className="flex items-center gap-[3px]">
            <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white leading-[1.4]">
              {totalCost.toLocaleString()}
            </span>
            <div className="pt-1">
              <span className="text-[14px] md:text-[18px] font-medium text-dark dark:text-slate-200 leading-[1.4]">원</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full mt-2">
            <SubscriptionTable 
              data={sortedSubscriptions} 
              onRowClick={(item) => openModal(item)}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
        </div>
      </div>
    </div>
  )
}
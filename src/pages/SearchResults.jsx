import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import SubscriptionTable from '../components/SubscriptionTable'
import useSubscriptionStore from '../store/useSubscriptionStore'
import SectionHeader from '../components/SectionHeader'
import { Search } from 'lucide-react'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const openModal = useSubscriptionStore((state) => state.openModal)

  // Filter subscriptions based on URL query
  const filteredSubscriptions = useMemo(() => {
    if (!query.trim()) return []
    
    const searchLower = query.toLowerCase().trim()
    return subscriptions.filter(sub => 
      sub.service_name.toLowerCase().includes(searchLower) ||
      (sub.payment_method && sub.payment_method.toLowerCase().includes(searchLower)) ||
      (sub.categories && sub.categories.some(cat => cat.toLowerCase().includes(searchLower)))
    )
  }, [subscriptions, query])

  const totalCost = useMemo(() => {
    return filteredSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((acc, sub) => acc + sub.price, 0)
  }, [filteredSubscriptions])

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:rounded-[48px] px-0 md:p-[42px] flex flex-col gap-[24px] items-start w-full transition-colors duration-300">
        {/* Results Header */}
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <SectionHeader title={`'${query}' 검색 결과`} />
            <p className="text-dark/40 dark:text-slate-400 font-medium text-sm md:text-base ml-1">
              총 {filteredSubscriptions.length}건의 구독 정보가 검색되었습니다.
            </p>
          </div>

          {/* Result Summary Card */}
          {filteredSubscriptions.length > 0 && (
            <div className="bg-background dark:bg-slate-900 border border-primary rounded-[20px] p-4 flex flex-col items-start gap-1 w-full max-w-[200px] shrink-0 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <p className="text-[14px] md:text-[18px] font-bold text-dark dark:text-slate-200 tracking-[-0.02em] leading-[1.4]">
                검색 결과 합계
              </p>
              <div className="flex items-center gap-[3px]">
                <span className="text-[20px] md:text-[28px] font-bold text-dark dark:text-white tracking-[-0.02em] leading-[1.4]">
                  {totalCost.toLocaleString()}
                </span>
                <div className="pt-1">
                  <span className="text-[14px] md:text-[18px] font-medium text-dark dark:text-slate-200 tracking-[-0.02em] leading-[1.4]">원</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="w-full mt-2">
          {filteredSubscriptions.length > 0 ? (
            <SubscriptionTable 
              data={filteredSubscriptions} 
              onRowClick={(item) => openModal(item)}
            />
          ) : (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4 bg-background dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-tertiary dark:border-slate-700">
              <div className="w-16 h-16 bg-tertiary dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-dark/20 dark:text-white/20" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-dark dark:text-white">검색 결과가 없습니다</p>
                <p className="text-sm text-dark/40 dark:text-slate-400 mt-1">다른 키워드로 검색해 보세요.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

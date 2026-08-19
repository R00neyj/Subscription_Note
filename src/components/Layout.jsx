import { Outlet, useLocation } from 'react-router-dom'
import Navigation from './Navigation'
import SubscriptionModal from './SubscriptionModal'
import PromoteModal from './PromoteModal'
import FloatingActionButton from './FloatingActionButton'
import useSubscriptionStore from '../store/useSubscriptionStore'

export default function Layout() {
  const location = useLocation()
  const modalOpen = useSubscriptionStore((state) => state.modal.isOpen)
  const modalData = useSubscriptionStore((state) => state.modal.data)
  const closeModal = useSubscriptionStore((state) => state.closeModal)

  const showFAB = location.pathname === '/' || location.pathname === '/list' || location.pathname === '/wishlist'

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[14px] md:text-[16px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
      {/* Sidebar Navigation */}
      <Navigation />
      
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col items-center w-full">
        <main className="px-3.5 py-3 pb-[92px] md:p-8 md:pb-10 relative max-w-[1440px] w-full">
          <Outlet />
        </main>
      </div>

      {/* Extended FAB */}
      {showFAB && <FloatingActionButton />}

      {/*
        Global Modal
        여기에 key 를 걸지 말 것. closeModal 이 data 를 null 로 만드는 순간 key 가
        edit-N -> new 로 바뀌어 React 가 내부 AnimatePresence 째로 갈아끼우고,
        닫힘 트랜지션이 재생되지 않는다. 폼 상태 초기화는 SubscriptionModal 안에서
        SubscriptionModalContent 에 건 key 가 담당한다.
      */}
      <SubscriptionModal 
        isOpen={modalOpen} 
        onClose={closeModal} 
        initialData={modalData}
      />

      {/* Promote Modal (Wishlist -> Active) */}
      <PromoteModal />
    </div>
  )
}

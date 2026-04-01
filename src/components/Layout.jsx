import { Outlet, useLocation } from 'react-router-dom'
import Navigation from './Navigation'
import SubscriptionModal from './SubscriptionModal'
import FloatingActionButton from './FloatingActionButton'
import useSubscriptionStore from '../store/useSubscriptionStore'

export default function Layout() {
  const location = useLocation()
  const modalOpen = useSubscriptionStore((state) => state.modal.isOpen)
  const modalData = useSubscriptionStore((state) => state.modal.data)
  const closeModal = useSubscriptionStore((state) => state.closeModal)

  const showFAB = location.pathname === '/' || location.pathname === '/list'

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[14px] md:text-[16px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
      {/* Sidebar Navigation */}
      <Navigation />
      
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col items-center w-full">
        <main className="px-4 py-6 pb-[100px] md:p-8 md:pb-10 relative max-w-[1440px] w-full">
          <Outlet />
        </main>
      </div>

      {/* Extended FAB */}
      {showFAB && <FloatingActionButton />}

      {/* Global Modal */}
      <SubscriptionModal 
        isOpen={modalOpen} 
        onClose={closeModal} 
        initialData={modalData}
        key={modalData ? `edit-${modalData.id}` : 'new'} 
      />
    </div>
  )
}

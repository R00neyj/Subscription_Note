import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[14px] md:text-[16px] transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Navigation />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center w-full">
        <main className="px-4 py-4 pb-[100px] md:p-6 md:pb-8 relative max-w-[1440px] w-full">
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

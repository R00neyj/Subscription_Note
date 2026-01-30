import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Navigation from './Navigation'
import SubscriptionModal from './SubscriptionModal'
import useSubscriptionStore from '../store/useSubscriptionStore'

export default function Layout() {
  const modalOpen = useSubscriptionStore((state) => state.modal.isOpen)
  const modalData = useSubscriptionStore((state) => state.modal.data)
  const closeModal = useSubscriptionStore((state) => state.closeModal)

  return (
    <div className="flex w-full h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Navigation />
      
      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-hidden relative max-w-[1440px] mx-auto w-full">
        <Outlet />
      </main>

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

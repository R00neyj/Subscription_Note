import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const SAMPLE_DATA = [
  { id: 1, service_name: 'Netflix', category: 'OTT', billing_date: '매달 15일', price: 17000, payment_method: '현대카드', status: 'active' },
  { id: 2, service_name: 'YouTube Premium', category: 'OTT', billing_date: '매달 20일', price: 14900, payment_method: '카카오뱅크', status: 'active' },
  { id: 3, service_name: 'Adobe Creative Cloud', category: 'Work', billing_date: '매달 5일', price: 62000, payment_method: '법인카드', status: 'active' },
  { id: 4, service_name: 'Coupang WOW', category: 'Shopping', billing_date: '매달 1일', price: 4990, payment_method: '쿠페이', status: 'active' },
  { id: 5, service_name: 'Notion', category: 'Work', billing_date: '매달 10일', price: 12000, payment_method: '법인카드', status: 'disable' },
]

const useSubscriptionStore = create(
  persist(
    (set) => ({
      subscriptions: SAMPLE_DATA,

      // Actions
      addSubscription: (subscription) => set((state) => ({
        subscriptions: [
          ...state.subscriptions,
          { ...subscription, id: Date.now() } // Simple ID generation
        ]
      })),

      updateSubscription: (id, updates) => set((state) => ({
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === id ? { ...sub, ...updates } : sub
        )
      })),

      removeSubscription: (id) => set((state) => ({
        subscriptions: state.subscriptions.filter((sub) => sub.id !== id)
      })),
      
      resetToSample: () => set({ subscriptions: SAMPLE_DATA }),

      // Modal State (UI only, not persisted)
      modal: {
        isOpen: false,
        data: null // null for create, object for update
      },

      openModal: (data = null) => set(() => ({ 
        modal: { isOpen: true, data } 
      })),

      closeModal: () => set(() => ({ 
        modal: { isOpen: false, data: null } 
      })),

      // Theme State
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'subscription-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        subscriptions: state.subscriptions,
        isDarkMode: state.isDarkMode 
      }), 
    }
  )
)

export default useSubscriptionStore

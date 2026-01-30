import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const SAMPLE_DATA = [
  { id: 1, service_name: 'Netflix', categories: ['OTT'], billing_date: '매달 15일', price: 17000, payment_method: '현대카드', status: 'active' },
  { id: 2, service_name: 'YouTube Premium', categories: ['OTT'], billing_date: '매달 20일', price: 14900, payment_method: '카카오뱅크', status: 'active' },
  { id: 3, service_name: 'Adobe Creative Cloud', categories: ['Work'], billing_date: '매달 5일', price: 62000, payment_method: '법인카드', status: 'active' },
  { id: 4, service_name: 'Coupang WOW', categories: ['Shopping'], billing_date: '매달 1일', price: 4990, payment_method: '쿠페이', status: 'active' },
  { id: 5, service_name: 'Notion', categories: ['Work'], billing_date: '매달 10일', price: 12000, payment_method: '법인카드', status: 'disable' },
]

const useSubscriptionStore = create(
  persist(
    (set) => ({
      subscriptions: SAMPLE_DATA,
      searchQuery: '',

      // Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      
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
      
      resetSubscriptions: () => set({ subscriptions: [] }),

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

      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Tutorial State
      hasSeenTutorial: false,
      isTutorialOpen: false,
      currentStep: 0,

      // Tutorial Actions
      setTutorialOpen: (val) => set({ isTutorialOpen: val }),
      setCurrentStep: (step) => set({ currentStep: step }),
      completeTutorial: () => set({ hasSeenTutorial: true, isTutorialOpen: false, currentStep: 0 }),
      resetTutorial: () => set({ hasSeenTutorial: false, isTutorialOpen: true, currentStep: 0 }),
    }),
    {
      name: 'subscription-storage', // unique name for localStorage key
      version: 1, // Add version for migration
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migration from version 0 to 1: category (string) -> categories (array)
          const state = persistedState
          state.subscriptions = state.subscriptions.map(sub => ({
            ...sub,
            categories: sub.category ? [sub.category] : (sub.categories || []),
            category: undefined // remove old field
          }))
          return state
        }
        return persistedState
      },
      partialize: (state) => ({ 
        subscriptions: state.subscriptions,
        isDarkMode: state.isDarkMode,
        hasSeenTutorial: state.hasSeenTutorial
      }), 
    }
  )
)

export default useSubscriptionStore

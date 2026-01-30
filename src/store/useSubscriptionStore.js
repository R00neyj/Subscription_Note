import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

const useSubscriptionStore = create(
  persist(
    (set, get) => ({
      subscriptions: [],
      searchQuery: '',
      isLoading: false,
      user: null,

      // Auth Actions
      setUser: (user) => set({ user }),
      
      signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        })
        if (error) console.error('Error signing in:', error)
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (!error) {
          set({ user: null, subscriptions: [] })
        }
      },

      // Cloud Actions
      fetchSubscriptions: async () => {
        const currentUser = get().user
        if (!currentUser) return

        set({ isLoading: true })
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUser.id) // 본인의 데이터만 가져옴
          .order('created_at', { ascending: true })
        
        if (!error && data) {
          set({ subscriptions: data, isLoading: false })
        } else {
          set({ isLoading: false })
        }
      },

      addSubscription: async (subscription) => {
        const currentUser = get().user
        if (!currentUser) return

        const { data, error } = await supabase
          .from('subscriptions')
          .insert([{ ...subscription, user_id: currentUser.id }])
          .select()
        
        if (!error && data) {
          set((state) => ({ subscriptions: [...state.subscriptions, data[0]] }))
        }
      },

      updateSubscription: async (id, updates) => {
        const { error } = await supabase
          .from('subscriptions')
          .update(updates)
          .eq('id', id)
        
        if (!error) {
          set((state) => ({
            subscriptions: state.subscriptions.map((sub) =>
              sub.id === id ? { ...sub, ...updates } : sub
            )
          }))
        }
      },

      removeSubscription: async (id) => {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', id)
        
        if (!error) {
          set((state) => ({
            subscriptions: state.subscriptions.filter((sub) => sub.id !== id)
          }))
        }
      },
      
      resetSubscriptions: async () => {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
        
        if (!error) {
          set({ subscriptions: [] })
        }
      },

      // UI State
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Modal State
      modal: { isOpen: false, data: null },
      openModal: (data = null) => set(() => ({ modal: { isOpen: true, data } })),
      closeModal: () => set(() => ({ modal: { isOpen: false, data: null } })),

      // Theme State
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
      name: 'subscription-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isDarkMode: state.isDarkMode,
        hasSeenTutorial: state.hasSeenTutorial
      }), 
    }
  )
)

export default useSubscriptionStore

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
        const redirectUrl = window.location.origin
        console.log('Attempting to sign in with redirect URL:', redirectUrl)
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
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

        // 중복 호출 방지를 위한 간단한 락 (isLoading이 true면 중단하지는 않고, 로컬 동기화만 조심스럽게 처리)
        // 하지만 여기서는 확실하게 로컬 데이터를 먼저 비우는 방식을 사용

        set({ isLoading: true })

        // 1. Sync Local Data (비로그인 상태에서 생성된 데이터 동기화)
        // 중요: 읽어온 후 즉시 상태에서 제거하여 중복 업로드를 방지함
        const currentSubs = get().subscriptions
        const localSubs = currentSubs.filter(sub => sub.user_id === 'local-user')
        
        if (localSubs.length > 0) {
          // 상태에서 먼저 제거 (낙관적 처리)
          set((state) => ({
            subscriptions: state.subscriptions.filter(sub => sub.user_id !== 'local-user')
          }))

          const subsToUpload = localSubs.map(sub => {
            // eslint-disable-next-line no-unused-vars
            const { id, user_id, ...rest } = sub 
            return {
              ...rest,
              user_id: currentUser.id
            }
          })
          
          const { error: uploadError } = await supabase
            .from('subscriptions')
            .insert(subsToUpload)
          
          if (uploadError) {
            console.error('Failed to sync local subscriptions:', uploadError)
            // 실패 시 다시 복구하는 로직이 이상적이나, 
            // 현재는 콘솔 에러 후 서버 데이터를 다시 불러오는 것으로 대체
          } else {
            console.log('Successfully synced local subscriptions')
          }
        }

        // 2. Fetch All Data
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
        
        // Optimistic update / Local-only update
        const tempId = crypto.randomUUID()
        const newSub = { 
          ...subscription, 
          id: tempId, 
          user_id: currentUser?.id || 'local-user',
          created_at: new Date().toISOString()
        }

        // 먼저 로컬 상태 업데이트
        set((state) => ({ subscriptions: [...state.subscriptions, newSub] }))

        // 로그인 상태라면 서버에 저장
        if (currentUser) {
          const { data, error } = await supabase
            .from('subscriptions')
            .insert([{ ...subscription, user_id: currentUser.id }])
            .select()
          
          if (!error && data) {
            // 서버에서 생성된 ID로 교체 (Optional: 간단하게는 목록 재조회를 할 수도 있지만, UX를 위해 ID 교체)
            set((state) => ({
              subscriptions: state.subscriptions.map(sub => 
                sub.id === tempId ? data[0] : sub
              )
            }))
          } else {
            // 에러 발생 시 롤백 로직이 필요할 수 있으나, 여기서는 일단 콘솔 출력
            console.error('Failed to sync addSubscription:', error)
          }
        }
      },

      updateSubscription: async (id, updates) => {
        const currentUser = get().user

        // 먼저 로컬 상태 업데이트
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updates } : sub
          )
        }))

        // 로그인 상태라면 서버에 업데이트
        if (currentUser) {
          const { error } = await supabase
            .from('subscriptions')
            .update(updates)
            .eq('id', id)
          
          if (error) console.error('Failed to sync updateSubscription:', error)
        }
      },

      removeSubscription: async (id) => {
        const currentUser = get().user

        // 먼저 로컬 상태 업데이트
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id)
        }))

        // 로그인 상태라면 서버에서 삭제
        if (currentUser) {
          const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id)
          
          if (error) console.error('Failed to sync removeSubscription:', error)
        }
      },
      
      resetSubscriptions: async () => {
        const currentUser = get().user
        
        // 로컬 상태 초기화
        set({ subscriptions: [] })

        if (currentUser) {
          const { error } = await supabase
            .from('subscriptions')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
          
          if (error) console.error('Failed to sync resetSubscriptions:', error)
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
      themeMode: 'system', // 'light' | 'dark' | 'system'
      setThemeMode: (mode) => set({ themeMode: mode }),

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
        subscriptions: state.subscriptions,
        user: state.user,
        themeMode: state.themeMode,
        hasSeenTutorial: state.hasSeenTutorial
      }), 
    }
  )
)

export default useSubscriptionStore

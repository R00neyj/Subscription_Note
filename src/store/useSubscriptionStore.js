import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { DEFAULT_WAGE_PRESET_ID, getWagePreset } from '../constants/laborCost'
import { supabase } from '../lib/supabase'

// DB 컬럼 화이트리스트. 서버로 보내는 모든 경로(추가/수정/로컬 동기화)가 이 목록을 공유해야
// 한 경로에만 필터가 빠져 스키마 에러로 데이터가 유실되는 일이 생기지 않는다.
const CORE_DB_FIELDS = [
  'service_name', 'categories', 'price', 'billing_date', 'payment_method',
  'status', 'is_free_trial', 'trial_end_date', 'satisfaction', 'is_essential',
  'billing_cycle', 'created_at', 'user_id'
]

// 마이그레이션이 아직 적용되지 않은 프로젝트가 있을 수 있는 컬럼.
// 스키마 에러가 한 번이라도 발생하면 자동으로 제외하고 재시도한다.
const OPTIONAL_DB_FIELDS = ['upgrade_from_id']

let optionalFieldsSupported = true

const pickDbFields = (source, includeOptional) => {
  const allowed = includeOptional ? [...CORE_DB_FIELDS, ...OPTIONAL_DB_FIELDS] : CORE_DB_FIELDS
  return Object.keys(source).reduce((acc, key) => {
    if (allowed.includes(key)) acc[key] = source[key]
    return acc
  }, {})
}

// PostgREST가 존재하지 않는 컬럼을 거부했는지 판별 (PGRST204: 스키마 캐시, 42703: undefined_column)
const isUnknownColumnError = (error) =>
  !!error && (error.code === 'PGRST204' || error.code === '42703')

// 선택 컬럼 때문에 실패한 경우 해당 컬럼을 빼고 한 번만 재시도한다.
const withOptionalFieldFallback = async (run) => {
  const includeOptional = optionalFieldsSupported
  const result = await run(includeOptional)

  if (!includeOptional || !isUnknownColumnError(result.error)) return result

  console.warn(
    `DB에 ${OPTIONAL_DB_FIELDS.join(', ')} 컬럼이 없어 제외하고 재시도합니다. 마이그레이션이 필요합니다.`
  )
  optionalFieldsSupported = false
  return run(false)
}

const useSubscriptionStore = create(
  persist(
    (set, get) => ({
      subscriptions: [],
      isLoading: false,
      isAuthLoading: true,
      user: null,
      isGuest: typeof window !== 'undefined' ? sessionStorage.getItem('sublist_guest_access') === 'true' : false,

      // Auth Actions
      setUser: (user) => set({ user }),
      setAuthLoading: (val) => set({ isAuthLoading: val }),
      setGuestAccess: (val) => {
        if (typeof window !== 'undefined') {
          if (val) {
            sessionStorage.setItem('sublist_guest_access', 'true')
          } else {
            sessionStorage.removeItem('sublist_guest_access')
          }
        }
        set({ isGuest: !!val })
      },
      
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
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('sublist_guest_access')
          }
          set({ user: null, subscriptions: [], isGuest: false })
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

        // 업로드에 실패한 로컬 데이터. 서버 조회 결과로 상태를 덮어쓸 때 함께 되살려
        // 다음 동기화 기회를 남긴다 (실패해도 사용자 데이터가 사라지지 않도록).
        let unsyncedLocalSubs = []

        if (localSubs.length > 0) {
          // 상태에서 먼저 제거 (낙관적 처리)
          set((state) => ({
            subscriptions: state.subscriptions.filter(sub => sub.user_id !== 'local-user')
          }))

          const { error: uploadError } = await withOptionalFieldFallback((includeOptional) =>
            supabase
              .from('subscriptions')
              .insert(localSubs.map(sub => ({
                ...pickDbFields(sub, includeOptional),
                user_id: currentUser.id
              })))
          )

          if (uploadError) {
            console.error('Failed to sync local subscriptions:', uploadError)
            unsyncedLocalSubs = localSubs
          } else {
            console.log('Successfully synced local subscriptions')
          }
        }

        // 2. Fetch All Data
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUser.id) // 본인의 데이터만 가져옴
          .order('created_at', { ascending: false }) // 최신순으로 가져옴

        if (!error && data) {
          set({ subscriptions: [...unsyncedLocalSubs, ...data], isLoading: false })
        } else {
          set((state) => ({
            subscriptions: [...unsyncedLocalSubs, ...state.subscriptions],
            isLoading: false
          }))
        }
      },

      addSubscription: async (subscription) => {
        const currentUser = get().user
        
        // Optimistic update
        const tempId = crypto.randomUUID()
        const newSub = { 
          ...subscription, 
          id: tempId, 
          user_id: currentUser?.id || 'local-user',
          created_at: new Date().toISOString()
        }

        // 로컬 상태에 즉시 추가 (최신순이므로 앞에 추가)
        set((state) => ({ subscriptions: [newSub, ...state.subscriptions] }))

        // 로그인 상태라면 서버에 저장 (DB 컬럼 화이트리스트 필터링으로 스키마 에러 방지)
        if (currentUser) {
          const { data, error } = await withOptionalFieldFallback((includeOptional) =>
            supabase
              .from('subscriptions')
              .insert([{ ...pickDbFields(subscription, includeOptional), user_id: currentUser.id }])
              .select()
          )

          if (!error && data && data[0]) {
            // 서버에서 생성된 실제 데이터(ID 포함)와 로컬 전용 필드를 결합하여 업데이트
            set((state) => ({
              subscriptions: state.subscriptions.map(sub => 
                sub.id === tempId ? { ...newSub, ...data[0] } : sub
              )
            }))
          } else {
            if (error) console.error('Failed to sync addSubscription:', error)
            // 에러 발생 시 롤백 (로컬에서 추가했던 항목 제거)
            set((state) => ({
              subscriptions: state.subscriptions.filter(sub => sub.id !== tempId)
            }))
          }
        }
      },

      updateSubscription: async (id, updates) => {
        const currentUser = get().user

        // 먼저 로컬 상태 업데이트 (낙관적)
        const previousSubs = get().subscriptions
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updates } : sub
          )
        }))

        // 로그인 상태라면 서버에 업데이트 (DB 컬럼 화이트리스트 필터링)
        if (currentUser) {
          const { error } = await withOptionalFieldFallback((includeOptional) => {
            const dbUpdates = pickDbFields(updates, includeOptional)
            // 서버에 보낼 컬럼이 하나도 없으면 요청 자체를 건너뛴다 (빈 update는 에러)
            if (Object.keys(dbUpdates).length === 0) return Promise.resolve({ error: null })

            return supabase
              .from('subscriptions')
              .update(dbUpdates)
              .eq('id', id)
              .eq('user_id', currentUser.id)
          })

          if (error) {
            console.error('Failed to sync updateSubscription:', error)
            // 실패 시 롤백
            set({ subscriptions: previousSubs })
            return false
          }
        }

        return true
      },

      removeSubscription: async (id) => {
        const currentUser = get().user

        // 먼저 로컬 상태 업데이트 (낙관적)
        const previousSubs = get().subscriptions
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id)
        }))

        // 로그인 상태라면 서버에서 삭제
        if (currentUser) {
          const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id)
            .eq('user_id', currentUser.id)

          if (error) {
            console.error('Failed to sync removeSubscription:', error)
            // 실패 시 롤백
            set({ subscriptions: previousSubs })
            return false
          }
        }

        return true
      },

      resetSubscriptions: async () => {
        const currentUser = get().user
        const previousSubs = get().subscriptions

        // 로컬 상태 초기화
        set({ subscriptions: [] })

        if (currentUser) {
          const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('user_id', currentUser.id) // 반드시 본인 데이터만 삭제 (RLS에만 의존하지 않음)

          if (error) {
            console.error('Failed to sync resetSubscriptions:', error)
            // 실패 시 롤백 — 성공했다고 잘못 안내하지 않기 위해 실패를 호출부에 알린다
            set({ subscriptions: previousSubs })
            return false
          }
        }

        return true
      },

      // Wishlist Actions
      promoteToActive: async (id, { billing_date, payment_method, replaceSubId, ...additionalUpdates }) => {
        // 교체 대상 기존 구독이 있으면 비활성화(disable) 처리
        if (replaceSubId) {
          await get().updateSubscription(replaceSubId, { status: 'disable' })
        }

        return get().updateSubscription(id, {
          status: 'active',
          billing_date: String(billing_date || '1'),
          payment_method: payment_method || '기타',
          upgrade_from_id: null,
          ...additionalUpdates
        })
      },

      // UI State
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Modal State
      modal: { isOpen: false, data: null, defaultTab: 'active' },
      openModal: (data = null, defaultTab = 'active') => set(() => ({ modal: { isOpen: true, data, defaultTab } })),
      closeModal: () => set(() => ({ modal: { isOpen: false, data: null, defaultTab: 'active' } })),

      // Promote Modal State (위시리스트 -> 구독 승격 전용)
      promoteModal: { isOpen: false, item: null },
      openPromoteModal: (item) => set(() => ({ promoteModal: { isOpen: true, item } })),
      closePromoteModal: () => set(() => ({ promoteModal: { isOpen: false, item: null } })),

      // Theme State
      themeMode: 'system', // 'light' | 'dark' | 'system'
      setThemeMode: (mode) => set({ themeMode: mode }),

      // Landing / Guest State (하위 호환 유지)
      hasSeenLanding: false,
      setHasSeenLanding: (val) => {
        get().setGuestAccess(val)
        set({ hasSeenLanding: !!val })
      },

      // Tutorial State
      hasSeenTutorial: false,
      isTutorialOpen: false,
      currentStep: 0,

      // Tutorial Actions
      setTutorialOpen: (val) => set({ isTutorialOpen: val }),
      setCurrentStep: (step) => set({ currentStep: step }),
      completeTutorial: () => set({ hasSeenTutorial: true, isTutorialOpen: false, currentStep: 0 }),
      resetTutorial: () => set({ hasSeenTutorial: false, isTutorialOpen: true, currentStep: 0 }),

      // Notification Settings
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      // 햅틱(진동) 피드백 — 안드로이드에서만 실제로 울리고, 미지원 기기에서는 값과 무관하게 무시된다
      hapticsEnabled: true,
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),

      // 노동 시간 환산 기준 시급 (미설정 시 최저시급으로 폴백)
      wagePresetId: DEFAULT_WAGE_PRESET_ID,
      hourlyWage: null,
      setWagePreset: (presetId) => set({
        wagePresetId: presetId,
        hourlyWage: getWagePreset(presetId).hourly
      }),

      // Duplicate Optimization Exceptions
      ignoredDuplicates: [],
      ignoreDuplicateGroup: (groupKey) => set((state) => ({
        ignoredDuplicates: state.ignoredDuplicates.includes(groupKey)
          ? state.ignoredDuplicates
          : [...state.ignoredDuplicates, groupKey]
      })),
      resetIgnoredDuplicates: () => set({ ignoredDuplicates: [] }),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        subscriptions: state.subscriptions,
        user: state.user,
        themeMode: state.themeMode,
        hasSeenTutorial: state.hasSeenTutorial,
        notificationsEnabled: state.notificationsEnabled,
        hapticsEnabled: state.hapticsEnabled,
        ignoredDuplicates: state.ignoredDuplicates,
        wagePresetId: state.wagePresetId,
        hourlyWage: state.hourlyWage
      }), 
    }
  )
)

export default useSubscriptionStore

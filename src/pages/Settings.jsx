import useSubscriptionStore from '../store/useSubscriptionStore'
import { WAGE_PRESETS, MINIMUM_WAGE } from '../constants/laborCost'
import { cn } from '../lib/utils'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Github } from 'lucide-react'
import Header from '../components/Header'
import SectionHeader from '../components/SectionHeader'
import { subscribeToPush } from '../lib/notificationUtils'
import { supabase } from '../lib/supabase'
import GoogleIcon from '../components/GoogleIcon'

export default function Settings() {
  const navigate = useNavigate()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  
  const user = useSubscriptionStore((state) => state.user)
  const signInWithGoogle = useSubscriptionStore((state) => state.signInWithGoogle)
  const signOut = useSubscriptionStore((state) => state.signOut)
  const resetSubscriptions = useSubscriptionStore((state) => state.resetSubscriptions)
  const themeMode = useSubscriptionStore((state) => state.themeMode) || 'system'
  const setThemeMode = useSubscriptionStore((state) => state.setThemeMode)
  const resetTutorial = useSubscriptionStore((state) => state.resetTutorial)
  const setHasSeenLanding = useSubscriptionStore((state) => state.setHasSeenLanding)
  const wagePresetId = useSubscriptionStore((state) => state.wagePresetId) || 'minimum'
  const setWagePreset = useSubscriptionStore((state) => state.setWagePreset)
  const notificationsEnabled = useSubscriptionStore((state) => state.notificationsEnabled)
  const setNotificationsEnabled = useSubscriptionStore((state) => state.setNotificationsEnabled)

  const handleToggleNotifications = async () => {
    const newState = !notificationsEnabled
    
    if (newState) {
      // 1. 브라우저 알림 권한 요청 및 푸시 구독
      const subscription = await subscribeToPush()
      
      if (subscription) {
        // 2. 로그인된 유저라면 DB에 저장
        if (user) {
          try {
            const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))
            const auth = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
            
            const { error } = await supabase.from('push_subscriptions').upsert({
              user_id: user.id,
              endpoint: subscription.endpoint,
              p256dh: p256dh,
              auth: auth
            }, { onConflict: 'endpoint' })
            
            if (error) throw error
          } catch (err) {
            console.error('Notification sync failed:', err)
          }
        }
        setNotificationsEnabled(true)
      } else {
        // 권한 거부됨
        alert('알림 권한이 차단되어 있습니다. 브라우저 설정에서 알림을 허용해주세요.')
        setNotificationsEnabled(false)
      }
    } else {
      // 끄기 (로컬 상태만 변경, 필요시 DB 삭제 로직 추가 가능)
      setNotificationsEnabled(false)
    }
  }

  const handleReset = async () => {
    if (confirmText !== '초기화') return

    const succeeded = await resetSubscriptions()
    if (succeeded) {
      alert('초기화가 완료되었습니다.')
      setShowResetConfirm(false)
      setConfirmText('')
    } else {
      alert('초기화에 실패했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.')
    }
  }

  const handleRestartTutorial = () => {
    resetTutorial()
    navigate('/')
  }

  const handleRestartLanding = () => {
    setHasSeenLanding(false)
    navigate('/landing')
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header />

      <div className="bg-transparent md:bg-white dark:md:bg-slate-900 rounded-2xl md:rounded-3xl px-0 py-2 md:p-6 flex flex-col gap-4 md:gap-6 items-start w-full transition-colors duration-200">
        <div className="flex flex-col gap-0.5 w-full">
          <SectionHeader title="설정" />
          <p className="text-[12px] md:text-sm text-slate-500 dark:text-slate-400 ml-0.5">앱 환경설정 및 데이터를 관리합니다.</p>
        </div>

        {/* Unified Settings Card */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
        
          {/* 사용자 계정 설정 */}
          <div className="p-3.5 md:p-5 flex items-center justify-between transition-colors">
            <div className="space-y-0.5">
              <h3 className="text-[14.5px] md:text-base font-bold text-dark dark:text-white">계정</h3>
              <p className="text-[11.5px] md:text-xs text-slate-500 dark:text-slate-400">
                {user ? `${user.email} 계정으로 로그인됨` : '로그인하여 데이터를 동기화하세요.'}
              </p>
            </div>
            {user ? (
              <button
                onClick={signOut}
                className="h-[32px] md:h-[34px] px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-xs md:text-[13px] font-bold transition-all cursor-pointer"
              >
                로그아웃
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="h-[32px] md:h-[34px] px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-dark dark:text-white rounded-lg text-xs md:text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <GoogleIcon size={16} />
                구글 로그인
              </button>
            )}
          </div>

          {/* 알림 설정 */}
          <div className="p-3.5 md:p-5 flex items-center justify-between transition-colors">
            <div className="space-y-0.5">
              <h3 className="text-[14.5px] md:text-base font-bold text-dark dark:text-white">알림 설정</h3>
              <p className="text-[11.5px] md:text-xs text-slate-500 dark:text-slate-400">결제 예정일 하루 전에 알림을 받습니다.</p>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={cn(
                "relative w-[44px] h-[26px] rounded-full transition-colors duration-200 cursor-pointer shrink-0",
                notificationsEnabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <div 
                className={cn(
                  "absolute top-[2px] left-[2px] size-[22px] bg-white rounded-full shadow-xs transition-transform duration-200",
                  notificationsEnabled ? "translate-x-[18px]" : "translate-x-0"
                )} 
              />
            </button>
          </div>

          {/* 노동 시간 환산 기준 */}
          <div className="p-3.5 md:p-5 flex flex-col gap-3 transition-colors">
            <div className="space-y-0.5">
              <h3 className="text-[14.5px] md:text-base font-bold text-dark dark:text-white">노동 시간 환산 기준</h3>
              <p className="text-[11.5px] md:text-xs text-slate-500 dark:text-slate-400">
                구독료를 근무 시간으로 바꿔 보여줄 때 쓰는 기준입니다. 기본값은 {MINIMUM_WAGE.year}년 최저시급 {MINIMUM_WAGE.hourly.toLocaleString()}원입니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {WAGE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setWagePreset(preset.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                    wagePresetId === preset.id
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:text-dark dark:hover:text-white"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 테마 설정 */}
          <div className="p-3.5 md:p-5 flex items-center justify-between transition-colors">
            <div className="space-y-0.5">
              <h3 className="text-[14.5px] md:text-base font-bold text-dark dark:text-white">테마 설정</h3>
              <p className="text-[11.5px] md:text-xs text-slate-500 dark:text-slate-400">화면 테마를 변경합니다.</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
              {[
                { value: 'light', label: '라이트' },
                { value: 'dark', label: '다크' },
                { value: 'system', label: '시스템' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setThemeMode(option.value)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
                    themeMode === option.value
                      ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-dark dark:hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 소개 페이지 다시보기 */}
          <div className="p-3.5 md:p-5 flex items-center justify-between transition-colors">
            <div className="space-y-0.5">
              <h3 className="text-[14.5px] md:text-base font-bold text-dark dark:text-white">소개 페이지</h3>
              <p className="text-[11.5px] md:text-xs text-slate-500 dark:text-slate-400">앱의 핵심 가치와 소개를 다시 확인합니다.</p>
            </div>
            <button
              onClick={handleRestartLanding}
              className="h-[32px] md:h-[34px] px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs md:text-[13px] font-bold transition-all cursor-pointer"
            >
              다시보기
            </button>
          </div>

          {/* 튜토리얼 다시보기 */}
          <div className="p-3.5 md:p-5 flex items-center justify-between transition-colors">
            <div className="space-y-0.5">
              <h3 className="text-[14.5px] md:text-base font-bold text-dark dark:text-white">튜토리얼 가이드</h3>
              <p className="text-[11.5px] md:text-xs text-slate-500 dark:text-slate-400">앱 사용법 안내를 다시 확인합니다.</p>
            </div>
            <button
              onClick={handleRestartTutorial}
              className="h-[32px] md:h-[34px] px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs md:text-[13px] font-bold transition-all cursor-pointer"
            >
              다시보기
            </button>
          </div>

          {/* GitHub 리포지토리 */}
          <div className="p-3.5 md:p-5 flex items-center justify-between transition-colors">
            <div className="space-y-0.5">
              <h3 className="text-[14.5px] md:text-base font-bold text-dark dark:text-white">오픈 소스</h3>
              <p className="text-[11.5px] md:text-xs text-slate-500 dark:text-slate-400">GitHub에서 소스 코드를 확인하세요.</p>
            </div>
            <a
              href="https://github.com/R00neyj/Subscription_Note"
              target="_blank"
              rel="noopener noreferrer"
              className="h-[32px] md:h-[34px] px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs md:text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Github size={16} />
              GitHub
            </a>
          </div>

          {/* 데이터 초기화 */}
          <div className="p-3.5 md:p-5 flex flex-col gap-3 transition-colors">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-[14.5px] md:text-base font-bold text-red-600 dark:text-red-400">데이터 초기화</h3>
                <p className="text-[11.5px] md:text-xs text-slate-500 dark:text-slate-400">모든 구독 정보를 삭제하고 초기화합니다.</p>
              </div>
              {!showResetConfirm && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="h-[32px] md:h-[34px] px-3 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-xs md:text-[13px] font-bold transition-all cursor-pointer"
                >
                  초기화
                </button>
              )}
            </div>

            {showResetConfirm && (
              <div className="flex flex-col md:flex-row gap-2.5 p-3.5 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 animate-in slide-in-from-top-2 duration-200">
                <div className="flex-1 space-y-1.5">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">
                    정말로 삭제하시겠습니까? 확인을 위해 아래에 '초기화'를 입력해주세요.
                  </p>
                  <input
                    type="text"
                    placeholder="'초기화' 입력"
                    className="w-full h-9 px-3 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 rounded-lg outline-none focus:ring-1 focus:ring-red-500 text-xs font-medium text-dark dark:text-white"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                    autoFocus
                  />
                </div>
                <div className="flex items-end gap-1.5">
                  <button
                    onClick={() => {
                      setShowResetConfirm(false)
                      setConfirmText('')
                    }}
                    className="px-3 h-9 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={confirmText !== '초기화'}
                    className={cn(
                      "px-4 h-9 rounded-lg text-xs font-bold transition-all",
                      confirmText === '초기화'
                        ? "bg-red-600 text-white hover:bg-red-700 shadow-xs cursor-pointer"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    )}
                  >
                    확인
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

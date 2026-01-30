import useSubscriptionStore from '../store/useSubscriptionStore'
import { cn } from '../lib/utils'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

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

  const handleReset = () => {
    if (confirmText === '초기화') {
      resetSubscriptions()
      alert('초기화가 완료되었습니다.')
      setShowResetConfirm(false)
      setConfirmText('')
    }
  }

  const handleRestartTutorial = () => {
    resetTutorial()
    navigate('/')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[800px] mx-auto p-0">
      <div className="flex flex-col gap-2">
        <h2 className="text-[32px] md:text-[42px] font-bold text-dark dark:text-white tracking-[-0.04em] leading-[1.2]">
          설정
        </h2>
        <p className="text-slate-500 dark:text-slate-400">앱의 환경설정 및 데이터를 관리합니다.</p>
      </div>

      {/* Unified Settings Card */}
      <div className="bg-transparent md:bg-white dark:md:bg-slate-800 rounded-[24px] md:border md:border-tertiary dark:md:border-slate-700 overflow-hidden transition-colors divide-y divide-tertiary dark:divide-slate-700">
        
        {/* 사용자 계정 설정 */}
        <div className="py-6 md:p-6 flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-dark dark:text-white">계정</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user ? `${user.email} 계정으로 로그인됨` : '로그인하여 데이터를 동기화하세요.'}
            </p>
          </div>
          {user ? (
            <button
              onClick={signOut}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl text-sm font-bold transition-all"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-dark dark:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              구글 로그인
            </button>
          )}
        </div>

        {/* 테마 설정 */}
        {/* 테마 설정 */}
        <div className="py-4 md:p-6 flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-dark dark:text-white">테마 설정</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">화면 테마를 변경합니다.</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 gap-1">
            {[
              { value: 'light', label: '라이트' },
              { value: 'dark', label: '다크' },
              { value: 'system', label: '시스템' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setThemeMode(option.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-bold rounded-lg transition-all",
                  themeMode === option.value
                    ? "bg-white dark:bg-slate-600 text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 튜토리얼 다시보기 */}
        {/* 테마 설정 */}
        <div className="py-4 md:p-6 flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-dark dark:text-white">튜토리얼 가이드</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">앱 사용법 안내를 다시 확인합니다.</p>
          </div>
          <button
            onClick={handleRestartTutorial}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl text-sm font-bold transition-all"
          >
            다시보기
          </button>
        </div>

        {/* 데이터 초기화 */}
        <div className="py-4 md:p-6 flex flex-col gap-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">데이터 초기화</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">모든 구독 정보를 삭제하고 초기화합니다.</p>
            </div>
            {!showResetConfirm && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-all"
              >
                초기화
              </button>
            )}
          </div>

          {showResetConfirm && (
            <div className="flex flex-col md:flex-row gap-3 p-4 bg-red-50/50 dark:bg-red-900/10 rounded-2xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  정말로 삭제하시겠습니까? 확인을 위해 아래에 '초기화'를 입력해주세요.
                </p>
                <input
                  type="text"
                  placeholder="'초기화' 입력"
                  className="w-full h-10 px-4 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-900/50 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-medium text-dark dark:text-white"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  autoFocus
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    setShowResetConfirm(false)
                    setConfirmText('')
                  }}
                  className="px-4 h-10 text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleReset}
                  disabled={confirmText !== '초기화'}
                  className={cn(
                    "px-6 h-10 rounded-lg text-sm font-bold transition-all",
                    confirmText === '초기화'
                      ? "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
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
  )
}
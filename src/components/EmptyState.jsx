import { cn } from '../lib/utils'

/**
 * 빈 상태 공용 박스.
 *
 * "데이터가 없다"는 신호는 시선을 끌면 안 된다. 그래서 강조색(bg-tertiary) 대신
 * 중립 배경 + 옅은 테두리로 뒤로 물러나게 한다. 대시보드 안에서 빈 상태 박스가
 * 각자 다른 배경·높이·말투로 하드코딩돼 있던 것을 이 컴포넌트로 통일한다.
 *
 * 말투는 앱 전체에서 우세한 "~없습니다" 로 맞춘다.
 */
export default function EmptyState({ message, className, children }) {
  return (
    <div
      className={cn(
        'w-full py-8 px-4 flex flex-col items-center justify-center gap-3 text-center',
        'bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl',
        className
      )}
    >
      <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">{message}</p>
      {children}
    </div>
  )
}

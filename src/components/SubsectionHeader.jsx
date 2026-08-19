import { cn } from '../lib/utils'

/**
 * 하위 섹션 제목의 단일 기준.
 *
 * 아이콘·뱃지·토글을 제목 줄에 같이 얹는 섹션(결제 브리핑)은 자기 레이아웃이
 * 필요해서 컴포넌트를 통째로 못 쓴다. 그래서 클래스만 따로 내보낸다.
 */
export const subsectionTitleClass =
  'text-base md:text-lg font-extrabold text-dark dark:text-white'

/**
 * 페이지 안의 하위 섹션 제목.
 *
 * SectionHeader(그라디언트 대제목)는 페이지당 하나, 페이지 제목으로만 쓴다.
 * 그 아래 섹션들은 전부 이걸 쓴다. 예전에는 대시보드 한 화면에서
 * "카테고리별 비중"만 대제목이고 "결제 브리핑"은 font-bold,
 * "최근 등록한 구독"은 font-extrabold 로 셋이 제각각이었다.
 *
 * 오른쪽에 "전체 보기" 같은 링크를 붙일 때는 action 에 넘긴다.
 */
export default function SubsectionHeader({ title, action, className }) {
  return (
    <div className={cn('flex items-center justify-between w-full gap-3', className)}>
      <h3 className={subsectionTitleClass}>{title}</h3>
      {action}
    </div>
  )
}

# 🎨 Sub-list Dashboard Design System (v2.2 Final Masterpiece)

본 문서는 시각적 조화, 마이크로 인터랙션, 접근성을 아우르는 최상위 디자인 원칙입니다.

## 1. 여백 및 그리드 (8px Spacing System)

| Level | Size | Class | Context |
| :--- | :--- | :--- | :--- |
| **Section (L)** | 32px / 24px | `p-6 md:p-8` | 메인 레이아웃 및 대형 섹션 |
| **Content (M)** | 24px / 16px | `p-4 md:p-6` | 표준 카드, 모달, 리스트 내역 |
| **Compact (S)** | 16px / 12px | `p-3 md:p-4` | 정보 칩, 배지, 미니 요소 |

*   **Rule:** 인접 요소 간 간격은 `gap-4(16px)`를 기본으로 하되, 연관 데이터는 `gap-2(8px)`로 묶습니다.

## 2. 모션 및 애니메이션 (Motion & Easing)

사용자에게 "쫀득하고" 반응성 좋은 느낌을 주기 위해 표준 곡선을 사용합니다.

*   **Duration:** 
    *   `Fast (150ms)`: 툴팁, 호버 상태 변화
    *   `Normal (300ms)`: 페이지 전환, 모달 등장, 리스트 확장
*   **Easing:** `transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)`
    *   **Premium Ease:** `ease-[cubic-bezier(0.34,1.56,0.64,1)]` (소폭의 탄성을 가진 입체적 움직임)

## 3. 시각적 보정 (Optical Correction)

아이콘과 텍스트 정렬 시 기계적 중앙이 아닌 **시각적 중앙**을 맞춥니다.

*   **Icon Alignment:** 아이콘 옆의 텍스트가 `14px` 이하일 경우 아이콘을 `1px` 위로 올리거나(`-translate-y-[1px]`), `leading-none`을 활용해 시각적 수평을 맞춥니다.
*   **Content Truncation:** 긴 텍스트는 `truncate` 또는 `line-clamp-1`을 적용하여 레이아웃 파괴를 방지합니다.

## 4. 중첩 곡률 공식 (Nested Radius)

*   **Formula:** `Outer R = Inner R + Padding`
*   **Layout:** `rounded-[32px] md:rounded-[48px]`
*   **Card:** `rounded-[24px]`
*   **Small Item:** `rounded-[12px] md:rounded-[16px]`

## 5. 계층 및 다크 모드 (Hierarchy & Dark A11y)

*   **Shadow:** Flat 디자인 원칙에 따라 그림자를 지양하되, 최상위 레이어(Modal)는 `ring-1 ring-black/5`와 `shadow-2xl shadow-primary/10`를 혼합하여 깊이감을 줍니다.
*   **Dark Contrast:** 다크 모드 배경은 `#0F172A (Slate-900)`, 카드는 `#1E293B (Slate-800)`를 사용하여 레이어를 분리합니다. 텍스트는 `Slate-50`을 사용하여 눈의 피로도를 최소화합니다.

## 6. 시맨틱 컬러 및 차트 (Semantic Colors)

| State | Color (Light) | Color (Dark) | Usage |
| :--- | :--- | :--- | :--- |
| **Success** | `Emerald-500` | `Emerald-400` | 결제 완료, 활성화 |
| **Warning** | `Amber-500` | `Amber-400` | 결제 예정(D-Day) |
| **Error** | `Rose-500` | `Rose-400` | 결제 실패, 비활성, 삭제 |
| **Info** | `Blue-500` | `Blue-400` | 일반 정보, 알림 |

## 7. 빈 상태 및 로딩 (Empty & Loading States)

*   **Empty State:** 아이콘 크기는 `w-16 h-16`으로 고정하며, 색상은 `text-slate-200 dark:text-slate-700`을 사용하여 데이터가 없음을 시각적으로 명시합니다.
*   **Skeleton:** 스켈레톤 UI는 실제 컴포넌트의 `Border-radius`를 그대로 계승하며, `animate-pulse`를 적용합니다.

## 8. 인터랙션 피드백 (Interaction)

*   **Scale Down:** 모든 버튼은 클릭 시 `active:scale-95` 피드백을 필수 적용합니다.
*   **Focus Ring:** 키보드 접근성을 위해 `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`를 적용합니다.

# 애니메이션 및 인터랙션 개선 계획 (Animation & Interaction Plan)

## 1. 개요
현재 '구독노트'는 Tailwind CSS의 기본 애니메이션 클래스를 사용하여 기초적인 전환 효과를 제공하고 있습니다. 사용자 경험(UX)을 한 단계 높이기 위해, 부드러운 흐름과 생동감 있는 인터랙션을 추가하는 '애니메이션 고도화' 작업을 추진합니다.

## 2. 핵심 원칙 (Core Principles)
- **부드러운 가감속 (Smooth Easing)**: 모든 전환은 `cubic-bezier(0.4, 0, 0.2, 1)` 또는 `cubic-bezier(0.34, 1.56, 0.64, 1)` (Bounce)를 사용하여 기계적이지 않은 느낌을 줍니다.
- **의미 있는 움직임 (Meaningful Motion)**: 단순한 장식이 아닌, 정보의 위계와 상태 변화를 설명하는 움직임을 지향합니다.
- **성능 최적화 (Performance)**: 레이아웃 리플로우를 유발하는 속성(width, height) 대신 GPU 가속이 가능한 `transform`, `opacity` 속성을 주로 활용합니다.

## 3. 세부 개선 항목

### 3.1. 대시보드 리포트 (Dashboard Insights)
- **[ ] 순차적 등장 (Staggered Entrance)**: 대시보드 진입 시 요약 카드와 최적화 리포트 카드가 아래에서 위로 순차적으로 나타나는 효과 적용.
- **[ ] 마이크로 호버 효과 (Micro-hover Feedback)**: 카드 호버 시 단순히 `-translate-y-1` 뿐만 아니라, `ring` 효과와 그림자(shadow)의 미세한 변화를 추가하여 입체감 부여.
- **[ ] 수치 카운팅 애니메이션 (Number Odometer)**: 총 구독료 등의 중요 지표가 변경될 때 숫자가 부드럽게 올라가는 효과 검토.

### 3.2. 리스트 및 테이블 (List & Table)
- **[ ] 행 추가/삭제 애니메이션**: 구독 항목이 추가되거나 필터링될 때 슬라이드와 페이드가 결합된 부드러운 전환 적용.
- **[ ] 필터 탭 전환**: 카테고리 탭 클릭 시 선택 바(Selection Indicator)가 부드럽게 이동하는 레이아웃 애니메이션 구현.

### 3.3. 모달 및 팝업 (Modals & Popups)
- **[ ] 바텀 시트 전환 (Bottom Sheet for Mobile)**: 모바일 환경에서 모달이 화면 하단에서 슬라이드 업되는 인터랙션 강화.
- **[ ] 장기 지출 분석 팝업**: 카드 클릭 시 내부 요소들이 0.1초 간격으로 순차적으로 등장하여 가독성 집중 유도.

### 3.4. 페이지 전환 (Page Transitions)
- **[ ] 공유 요소 전환 (Shared Element)**: 네비게이션 이동 시 메인 콘텐츠 영역이 페이드아웃/인 되는 부드러운 화면 전환 처리.

## 4. 확정 기술 스택 (Confirmed Tech Stack)
- **Tailwind CSS v4 (기본)**: CSS 변수와 Utility 클래스를 통한 경량 애니메이션 (`transition`, `duration`, `ease-bounce` 등).
- **Framer Motion (핵심 도입)**: React 최적화 애니메이션 엔진. Layout 애니메이션(`layoutId`), 모달 전환(`AnimatePresence`), 리스트 스태거 효과 구현.
- **AutoAnimate (보조 도입)**: 제로 설정(Zero-config) 리스트 전환 라이브러리. 단순 행 추가/삭제/이동에 사용.

## 5. 구현 가이드라인 (Implementation Guidelines)
- **접근성 고려**: `prefers-reduced-motion` 미디어를 존중하여, 시스템 설정에서 애니메이션을 끈 사용자에게는 움직임을 최소화하거나 제거함.
- **성능 우선**: 가능한 한 `transform`과 `opacity` 속성만 사용하여 GPU 가속을 유도함. Layout 리플로우(width, height) 애니메이션은 지양함.
- **일관된 Easing**:
  - 기본: `cubic-bezier(0.4, 0, 0.2, 1)` (Quart)
  - 액션/피드백: `cubic-bezier(0.34, 1.56, 0.64, 1)` (Bounce)

## 6. 단계별 로드맵 (Updated Roadmap)
1. **1단계 (기초/확산)**: [진행중]
   - 전역 CSS에 Bounce Easing 변수 등록 및 카드 호버 인터랙션 통일.
   - 대시보드 카드에 Framer Motion `initial/animate` 스태거 효과 적용.
2. **2단계 (발전/목록)**:
   - 구독 리스트에 `AutoAnimate` 적용하여 필터링 시 부드러운 재배치.
   - 카테고리 탭 전환 시 `framer-motion`의 `layoutId`를 활용한 슬라이딩 인디케이터 구현.
3. **3단계 (심화/전환)**:
   - 페이지 전환 시 `AnimatePresence`를 활용한 페이드 및 슬라이드 효과.
   - 모바일 바텀 시트 스와이프-투-클로즈(Swipe-to-close) 인터랙션 고도화.

---
작성일: 2026-04-01
작성자: Gemini CLI

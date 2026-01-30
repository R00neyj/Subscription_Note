# 프로젝트 컨텍스트: Sub-list Dashboard

## 프로젝트 개요
이 프로젝트는 **React**와 **Vite**를 사용하여 구축된 웹 애플리케이션입니다. 구독 서비스를 관리하는 대시보드 애플리케이션으로, **다크 모드**를 지원하며 반응형 웹 디자인이 적용되어 있습니다.

## 기술 스택

-   **프레임워크:** React (v19)
-   **빌드 도구:** Vite (v7)
-   **언어:** JavaScript (ES Modules)
-   **상태 관리:** Zustand (Persist middleware 사용, Supabase 연동).
-   **스타일링:** Tailwind CSS v4, Lucide React (아이콘).
-   **라우팅:** React Router v7.
-   **백엔드/인증:** Supabase (Cloud DB, Google OAuth 연동).

## 프로젝트 구조

-   `src/`: 소스 코드
    -   `lib/`: 외부 라이브러리 설정 (`supabase.js`, `utils.js`).
    -   `components/`: 재사용 가능한 UI 컴포넌트.
        -   `TutorialGuide.jsx`: SVG Mask 기반의 인터랙티브 온보딩 가이드.
        -   `FloatingActionButton.jsx`: 모바일 전용 추가 버튼 (스크롤 애니메이션).
        -   `Layout.jsx`: 사이드바 네비게이션 및 메인 영역 레이아웃 (`max-w-[1440px]`).
        -   `Header.jsx`: 상단 헤더 (검색 기능).
        -   `Navigation.jsx`: 사이드바 네비게이션 (다크 모드 토글 포함).
        -   `SubscriptionTable.jsx`: 구독 목록 테이블 (정렬 및 행 클릭 이벤트).
        -   `SubscriptionModal.jsx`: 구독 추가/수정 모달.
    -   `constants/`: 상수 데이터 (`categories.js` 등).
    -   `store/`: Zustand 스토어 (`useSubscriptionStore.js` - 데이터 및 테마 상태 관리).
    -   `pages/`: 페이지 컴포넌트.
        -   `Dashboard.jsx`: 요약 카드, 차트, 최근 목록.
        -   `SubscriptionList.jsx`: 전체 구독 목록 및 필터링.
        -   `Calendar.jsx`: 결제 달력 (예정).
        -   `Settings.jsx`: 설정 (데이터 초기화 등).

## 주요 기능 및 UI

-   **대시보드**:
    -   구독 요약 (총 구독료, 구독 수, 최대 지출 항목).
    -   카테고리별 지출 비중 바 차트 및 범례.
    -   최근 구독 리스트 (상위 5개).

-   **구독 목록**:
    -   카테고리별 필터링 (탭).
    -   테이블 뷰: 서비스명, 카테고리, 결제일, **결제 수단**, 금액, 상태 표시.
    -   컬럼별 오름차순/내림차순 정렬 지원.

-   **구독 관리 (CRUD)**:
    -   모달을 통한 구독 추가 및 수정 (PC 16px 폰트 최적화).
    -   구독 상태 토글 (활성/비활성).
    -   데이터 삭제 및 전체 초기화.

-   **클라우드 동기화 및 인증**:
    -   **구글 로그인**: Supabase Auth를 통한 소셜 로그인 지원.
    -   **보안 (RLS)**: Row Level Security를 적용하여 본인 데이터만 접근 가능.
    -   **실시간 연동**: 기기 간 데이터 자동 동기화.

-   **온보딩 튜토리얼**:
    -   **SVG Mask 스포트라이트**: 주요 기능을 강조하는 전문적인 가이드 UI.
    -   **동적 타겟팅**: PC 사이드바와 모바일 FAB 등 기기별 최적화된 하이라이트 위치 제공.

-   **UI/UX**:
    -   **다크 모드**: 시스템 설정 연동 및 수동 토글 지원.
    -   **플랫 디자인**: 모든 그림자(shadow)를 제거한 미니멀하고 현대적인 UI.
    -   **반응형 레이아웃**: 모바일 상단 고정 헤더 및 하단 네비게이션 최적화.
    -   **PWA**: 설치 가능한 웹 앱 (맞춤형 아이콘, 데스크탑/모바일 전용 스크린샷 포함).

## 개발 워크플로우

### 주요 명령어

-   **개발 서버 시작:**
    ```bash
    npm run dev
    ```

-   **프로덕션 빌드:**
    ```bash
    npm run build
    ```

-   **코드 린트:**
    ```bash
    npm run lint
    ```

## 개발 규칙

-   **컴포넌트 구조:** 함수형 컴포넌트와 Hooks 사용.
-   **스타일링:** Tailwind CSS 활용. 다크 모드 스타일(`dark:`) 적극 활용.
-   **상태 관리:** 전역 상태는 Zustand 스토어 사용, 로컬 UI 상태는 `useState` 사용.
-   **데이터 지속성:** `localStorage`를 통해 구독 데이터와 테마 설정 유지.
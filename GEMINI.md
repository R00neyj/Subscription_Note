# 프로젝트 컨텍스트: Sub-list Dashboard

## 프로젝트 개요
이 프로젝트는 **React**와 **Vite**를 사용하여 구축된 웹 애플리케이션입니다. 구독 서비스를 관리하는 대시보드 애플리케이션으로, **다크 모드**를 지원하며 반응형 웹 디자인이 적용되어 있습니다.

## 기술 스택

-   **프레임워크:** React (v19)
-   **빌드 도구:** Vite (v7)
-   **언어:** JavaScript (ES Modules)
-   **상태 관리:** Zustand (Persist middleware 사용)
-   **스타일링:** Tailwind CSS v4, Lucide React (아이콘)
-   **라우팅:** React Router v7

## 프로젝트 구조

-   `src/`: 소스 코드
    -   `App.jsx`: 다크 모드 클래스(`dark`) 제어 및 라우팅 설정.
    -   `main.jsx`: 진입점(Entry point).
    -   `assets/`: 정적 자원.
    -   `components/`: 재사용 가능한 UI 컴포넌트.
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
    -   모달을 통한 구독 추가 및 수정.
    -   구독 상태 토글 (활성/비활성).
    -   삭제 기능.

-   **UI/UX**:
    -   **다크 모드**: 시스템 설정과 무관하게 버튼으로 토글 가능 (네비게이션 바 하단).
    -   **반응형 레이아웃**: Tailwind CSS 기반의 유연한 디자인.
    -   **일관된 스타일**: 헤더 및 테이블 보더 색상 등 다크 모드 최적화.

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
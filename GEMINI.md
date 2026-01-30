# 프로젝트 컨텍스트: Sub-list Dashboard

## 프로젝트 개요
이 프로젝트는 **React**와 **Vite**를 사용하여 구축된 웹 애플리케이션입니다. 현재 Vite 템플릿 구조를 기반으로 초기 설정 단계에 있으며, 대시보드 애플리케이션으로 개발될 예정입니다.

## 기술 스택

-   **프레임워크:** React (v19)

-   **빌드 도구:** Vite (v7)

-   **언어:** JavaScript (ES Modules)

-   **린팅:** ESLint

-   **스타일링:** Tailwind CSS v4



## 프로젝트 구조

-   `src/`: 소스 코드가 위치합니다.

    -   `App.jsx`: 메인 애플리케이션 컴포넌트입니다.

    -   `main.jsx`: App을 렌더링하는 진입점(Entry point)입니다.

    -   `assets/`: 이미지와 같은 정적 자원을 보관합니다.

    -   `components/`: 재사용 가능한 UI 컴포넌트 (Table, Header, Modal 등).

    -   `constants/`: 상수 데이터 (`categories.js` 등).

    -   `store/`: Zustand 스토어 (`useSubscriptionStore.js`).

    -   `pages/`: 페이지 컴포넌트 (`Dashboard.jsx`, `SubscriptionList.jsx`).

-   `public/`: 공용 정적 자원 폴더입니다.

-   `vite.config.js`: Vite 설정 파일입니다.

-   `eslint.config.js`: ESLint 설정 파일입니다.



## 주요 기능 및 UI

-   **대시보드**: 구독 요약, 카테고리별 지출 차트, 최근 구독 리스트(정렬 가능).

-   **구독 목록**: 카테고리 필터링(탭), 다중 컬럼 정렬(서비스명, 금액 등), 테이블 뷰.

-   **구독 관리**: 모달을 통한 추가/수정/삭제. (상태 토글 스위치, 그리드 형태 카테고리 선택)



## 개발 워크플로우



### 주요 명령어

-   **개발 서버 시작:**

    ```bash

    npm run dev

    ```

    HMR(Hot Module Replacement)이 적용된 로컬 개발 서버를 시작합니다.



-   **프로덕션 빌드:**

    ```bash

    npm run build

    ```

    프로덕션 배포를 위해 애플리케이션을 빌드합니다.



-   **코드 린트:**

    ```bash

    npm run lint

    ```

    ESLint를 실행하여 코드 품질과 스타일 문제를 확인합니다.



-   **프로덕션 빌드 미리보기:**

    ```bash

    npm run preview

    ```

    프로덕션 빌드 결과를 로컬에서 미리 확인합니다.



## 개발 규칙

-   **컴포넌트 구조:** 함수형 컴포넌트와 Hooks를 사용합니다 (예: `App.jsx`의 `useState` 사용).

-   **스타일링:** Tailwind CSS를 주력으로 사용하며, 복잡한 로직이 필요한 경우 `cn` 유틸리티를 활용합니다.

-   **설정:** 빌드 설정은 `vite.config.js`를, 린팅 규칙은 `eslint.config.js`를 따릅니다.



## Gemini를 위한 참고 사항

-   새로운 기능을 추가할 때는 `src/components/`와 같이 구조화된 방식으로 새 컴포넌트를 생성하는 것을 권장합니다.

-   기존 린팅 규칙을 준수해야 합니다.

-   React 19를 사용하므로 최신 React 패턴을 활용하십시오.

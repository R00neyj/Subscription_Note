# 📋 구독노트 (Subscription Note)

나의 모든 구독 서비스를 한눈에 관리하고 고정 지출을 스마트하게 모니터링하는 대시보드 웹 애플리케이션입니다.

## ✨ 주요 기능

-   📊 **통합 대시보드**: 월간 총 구독료, 활성 구독 수, 최대 지출 항목 요약 및 카테고리별 지출 비중 분석
-   🗓️ **결제 달력**: 월별 결제 일정을 달력 형태로 시각화하고 일자별 상세 내역 확인
-   🔍 **전역 검색**: 서비스명, 결제 수단, 카테고리 키워드로 원하는 구독 정보 즉시 검색
-   📝 **구독 관리 (CRUD)**: 간편한 추가/수정/삭제 및 프리셋을 활용한 자동 입력 지원
-   🔔 **스마트 알림**: 결제일 하루 전 브라우저 및 앱 내 배너 알림 제공
-   🌓 **다크 모드**: 시스템 설정 연동 및 수동 토글 가능한 완벽한 다크/라이트 테마
-   📲 **PWA 지원**: 모바일 및 데스크탑에서 앱처럼 설치하여 사용 가능
-   🔒 **클라우드 동기화**: Supabase & Google Auth 연동으로 기기 간 데이터 실시간 동기화

## 🛠️ 기술 스택

-   **Frontend**: React v19, Vite v7
-   **Styling**: Tailwind CSS v4 (Flat Design)
-   **State Management**: Zustand (with Persist middleware)
-   **Backend/Auth**: Supabase (PostgreSQL, RLS)
-   **Routing**: React Router v7
-   **Icons**: Lucide React
-   **Date Library**: date-fns

## 🚀 시작하기

### 환경 변수 설정
`.env` 파일을 생성하고 Supabase 프로젝트 정보를 입력하세요.
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 설치 및 실행
```bash
npm install
npm run dev
```

## 📸 스크린샷
*(여기에 스크린샷 이미지를 추가할 수 있습니다)*

## 📄 라이선스
MIT License.
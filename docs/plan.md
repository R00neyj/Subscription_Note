# [Project] 구독 관리 웹앱 : 구독노트 (Subscription Note)

**작성일**: 2026. 01. 30 (최종 업데이트: 2026. 02. 02)
**문서 버전**: v1.2

---

## 1. 프로젝트 개요 (Overview)

### 1.1. 배경 및 목적

- **배경**: OTT, 소프트웨어, 쇼핑 등 구독 서비스의 범람으로 인한 고정 지출 관리의 어려움 증대.
- **목적**: 사용자가 직접 입력(Manual Input)한 데이터를 기반으로 흩어진 구독 내역을 시각화하고, 불필요한 지출을 방지하는 **'고정 지출 모니터링 대시보드'** 구축.
- **핵심 가치**: **"구독 관리의 모든 것 | 정확하고 간결하게"**

### 1.2. 타겟 사용자

- 매월 나가는 고정비를 한눈에 파악하고 싶은 2030 스마트 유저.
- 자동 연동의 보안 이슈나 복잡함보다, 직관적이고 가벼운 수기 관리를 선호하는 사용자.

---

## 2. 기술 스택 및 아키텍처 (Tech Stack)

### 2.1. 프론트엔드 (Frontend)

- **Framework**: React.js (v19, Vite v7).
- **State Management**: Zustand (Persist middleware 사용).
- **Styling**: Tailwind CSS v4 (Flat Design 적용).
- **Hosting**: Vercel (빠른 배포 및 CI/CD).

### 2.2. 백엔드 및 데이터베이스 (Backend & DB)

- **Platform**: Supabase (BaaS).
- **Database**: PostgreSQL (PostgREST API 사용).
- **Authentication**: Supabase Auth (Google OAuth 연동).
- **Security**: Row Level Security (RLS) 정책을 통한 사용자 데이터 격리.

---

## 3. 주요 기능 명세 (Functional Requirements)

### 3.1. 통합 대시보드 (Dashboard)

- **지출 요약**: 당월 결제 예정 총액 및 전월 대비 변동액 표시.
- **시각화**: 카테고리별 지출 비중 바 차트 및 범례 제공.
- **최근 내역**: 최근 추가된 구독 항목 상단 노출.

### 3.2. 구독 목록 관리 (Subscription Management)

- **CRUD**: 서비스 추가, 수정, 삭제 기능 (통합 모달 활용).
- **멀티 카테고리**: 하나의 서비스에 여러 카테고리(예: 쇼핑, OTT) 중복 지정 가능.
- **정렬 및 필터**: 컬럼별 정렬(금일, 금액 등) 및 카테고리별 탭 필터링.
- **전역 검색**: 서비스명, 결제 수단, 카테고리 기반의 실시간 검색 페이지 제공.

### 3.3. 분석 및 캘린더 (Analytics & Calendar)

- **캘린더 뷰**: 월간 달력 형태의 결제일 타임라인 제공 (구현 예정).
- **PWA**: 모바일 및 데스크탑 설치 지원, 오프라인 대응 및 맞춤 아이콘 적용.

---

## 4. 데이터베이스 설계 (Schema Strategy)

**전략**: Supabase RLS를 활용한 사용자별 데이터 보안 및 실시간 동기화.

### 4.1. Table: `subscriptions`

| 컬럼명           | 데이터 타입 | 설명         | 비고               |
| ---------------- | ----------- | ------------ | ------------------ |
| **id**           | UUID        | 고유 식별자  | PK                 |
| **user_id**      | UUID        | 사용자 식별  | Supabase Auth 연동 |
| **service_name** | Text        | 서비스명     | 사용자 입력        |
| **price**        | Numeric     | 결제 금액    | -                  |
| **billing_date** | Integer     | 결제일       | 1~31 (Int형 저장)  |
| **categories**   | Text[]      | 카테고리     | 배열 형태 (다중 선택) |
| **payment_method**| Text       | 결제 수단    | 카드, 계좌 등      |
| **status**       | Text        | 구독 상태    | active / inactive  |

### 4.2. 입출력 최적화 (Optimization)

1. **Persist & Sync**: Zustand Persist로 로컬 데이터를 관리하며, Supabase와 실시간 양방향 동기화.
2. **Global Search**: URL 파라미터를 활용한 검색 결과 페이지 분리로 성능 및 공유 편의성 증대.
3. **Flat UI**: 그림자 제거 및 Border 중심의 미니멀 디자인으로 렌더링 부하 최소화.

---

# [Project] 구독 관리 웹앱 : 구독노트 (Page 2/2)

---

## 5. UI/UX 디자인 가이드 (Design System)

### 5.1. 디자인 컨셉

- **Tone & Manner**: 신뢰(Trust), 명료함(Clarity), 전문성(Professional).
- **Keyword**: 플랫 디자인(Flat), 다크 모드 완벽 지원, 16px 모바일 그리드.

### 5.2. 컬러 팔레트 (Color Palette) - Trust Blue Theme

- **Primary**: `#2563EB` (Royal Blue) - 주요 버튼, 활성화 상태.
- **Background**: `#F8FAFC` (Light) / `#0F172A` (Dark) - 전체 배경색.
- **Surface**: `#FFFFFF` (Light) / `#1E293B` (Dark) - 카드 및 섹션 배경.

---

## 6. 정보 구조 및 유저 플로우 (IA & User Flow)

### 6.1. 메뉴 구조 (Sitemap)

1. **Dashboard**: 지출 통계 및 최근 목록.
2. **List**: 전체 목록 및 필터링.
3. **Search**: 검색 결과 전용 페이지.
4. **Calendar**: 월별 결제일 시각화.
5. **Settings**: 데이터 관리 및 로그아웃.

---

## 7. 개발 단계별 마일스톤 (Milestones)

- [x] **Step 3: Add Subscription Feature (Advanced)**
    - [x] Integrated Multi-Category selection (Array based).
    - [x] CRUD logic with Supabase Realtime synchronization.
    - [x] Advanced Filtering & Multi-Column Sorting.

- [x] **Step 4: Dashboard & Search Optimization**
    - [x] Dynamic Bar Chart & Summary Analytics.
    - [x] Global Search System with dedicated Result Page (`/search?q=...`).
    - [x] Interactive Onboarding Tutorial (SVG Mask Spotlight).

- [x] **Step 5: Supabase & Auth Integration**
    - [x] Google OAuth social login implementation.
    - [x] Row Level Security (RLS) for data privacy.
    - [x] Cloud DB connection & Environment variable security.

- [x] **Step 5.5: UX/UI Enhancements**
    - [x] Advanced Notification Logic (Today/Tomorrow differentiation).
    - [x] Category Distribution Chart on Subscription List.
    - [x] Mobile UX: Modal close on back button (History management).

- [x] **Step 6: Server-side Web Push Implementation**
    - [x] Supabase Edge Function (`send-push-notification`) deployment.
    - [x] Web Push integration with Service Worker and VAPID keys.
    - [x] Database schema for `push_subscriptions` and RLS policies.
    - [x] Client-side subscription logic in Settings page.

- [x] **Step 7: Final Polish & Deployment**
    - [x] Implementation of `Calendar.jsx` (Visual Timeline).
    - [x] Cron Job scheduling for daily automated alerts.
    - [ ] Production Deployment (Netlify/Vercel).

- [x] **Step 8: Service Value Optimization (Cost Reduction)**
    - [x] Free Trial tracking & proactive cancellation alerts.
    - [x] Satisfaction-based service recommendation engine.
    - [x] Long-term cumulative cost visualizer.
    - [x] Duplicate category spend insights.


---

**[비고]**
본 기획서는 Supabase의 무료 플랜 정책을 준수하면서도 최신 웹 표준(PWA, 다크모드)과 높은 보안성(RLS)을 갖춘 프로덕션 급 앱을 목표로 함.

**[승인]**
**베테랑 개발자 (시각디자인 전공)** (서명)

---

## 8. 코드 리뷰 및 향후 개선 과제 (Code Review & Future Tasks)

### 8.1. 아키텍처 및 상태 관리
- [ ] **Zustand 스토어 분리**: ``useAuthStore``, ``useUIStore``, ``useSubscriptionStore``로 로직 분리하여 유지보수성 향상.
- [ ] **에러 핸들링 강화**: API 호출 실패 시 사용자에게 알림(Toast UI 등)을 제공하는 전역 에러 핸들러 도입.

### 8.2. 성능 및 코드 품질
- [ ] **로직 통합 (Selectors)**: ``Dashboard``와 ``List``에서 중복 계산되는 ``categoryData`` 로직을 별도 selector 함수로 공통화.
- [ ] **TypeScript 전환**: 데이터 인터페이스 정의(``Subscription``, ``User`` 등)를 통해 타입 안정성 확보.

### 8.3. 백엔드 및 알림 정교화
- [ ] **타임존 처리 최적화**: Edge Function의 수동 시간 보정 로직을 ``date-fns-tz`` 등을 사용한 표준 타임존 처리로 변경.
- [ ] **푸시 알림 개인화**: 유저별 선호 알림 시간 설정 기능 추가.

---

**[비고]**
최근 완료된 **Step 6(Web Push)**를 통해 서비스의 핵심 기능인 ''자동 알림'' 환경이 완벽히 구축되었습니다.

**[담당 개발자]**
**Gemini CLI (10년차 베테랑 개발자)**

---

## 9. 서비스 가치 제안 및 고도화 (Service Value & Enhancements)
**목표**: 단순 관리를 넘어 사용자의 실질적인 구독 지출을 줄이는 '비용 최적화' 가치 제공.

### 9.1. 비용 절감 핵심 기능
- [ ] **무료 체험(Free Trial) 추적**: 무료 체험 종료 3일 전/1일 전 강력 알림을 통해 원치 않는 자동 결제 방지.
- [ ] **만족도 기반 해지 추천**: 각 구독 항목에 '만족도 별점'을 도입, 점수가 낮은 서비스를 '해지 후보'로 분류하여 제안.
- [ ] **중복 카테고리 인사이트**: 동일 카테고리(예: OTT) 내 과다 구독 시 "월 OO원을 절약할 수 있습니다"와 같은 요약 카드 노출.

### 9.2. 시각적 인지 강화
- [ ] **누적 지출 시각화**: 월/연간 금액을 넘어 '5년/10년 유지 시 총 지출액'을 표시하여 장기적 비용 인식 유도.
- [ ] **결제 주기 최적화**: 월결제와 연결제 금액 비교 데이터를 기반으로 최적의 결제 수단 및 주기 제안.

---

**[최종 목표]**
사용자가 매월 고정비를 10% 이상 절감할 수 있도록 돕는 스마트한 구독 비서로 진화.

---

## 10. UX/UI 폴리싱 및 데이터 정렬 (UX/UI Polishing & Data Sorting)
**목표**: 사소한 불편함을 제거하고 시각적 일관성을 확보하여 사용자 경험 고도화.

### 10.1. 데이터 정렬 및 시각화
- [x] **비활성 구독 하단 배치**: 목록 및 대시보드에서 비활성화(inactive)된 구독 항목들이 항상 최하단에 위치하도록 정렬 로직 개선.
- [x] **필수 구독 배지 추가**: 목록 테이블에서 '필수 구독'으로 체크된 항목에 'ESSENTIAL' 배지 표시 (TRIAL 배지와 동일 스타일).

### 10.2. 인터페이스 최적화
- [x] **모달 크기 통일 및 스크롤 최소화**: 추가/수정 및 상세 분석 모달의 너비를 통일하고, PC 환경에서 불필요한 세로 스크롤이 발생하지 않도록 레이아웃 조정.
- [x] **커서 스타일 정리**: '총 구독료' 카드 등 클릭이 불가능한 요소에서 `cursor-pointer` 속성을 제거하여 오인지 방지.


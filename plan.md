# [Project] 구독 관리 웹앱 : 구독노트 (Subscription Note)

**작성일**: 2026. 01. 30
**문서 버전**: v1.0

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

- **Framework**: React.js 또는 Vue.js (SPA 아키텍처, 반응형 UI 최적화).
- **State Management**: Context API 또는 Zustand (전역 상태 관리로 DB 호출 최소화).
- **Hosting**: Vercel (빠른 배포 및 CI/CD).

### 2.2. 백엔드 및 데이터베이스 (Backend & DB)

- **Platform**: Supabase (Baas).
- **Database**: PostgreSQL.
- **Policy**: 무료 플랜(Free Tier) 한계 내 운용을 위한 **'Client-side Computation'** 전략 채택.
- 서버 연산 최소화, 데이터 조회 후 프론트엔드에서 필터링/계산 처리.

---

## 3. 주요 기능 명세 (Functional Requirements)

### 3.1. 통합 대시보드 (Dashboard)

- **지출 요약**: 당월 결제 예정 총액 및 전월 대비 변동액 표시.
- **시각화**: 카테고리별(OTT, 쇼핑 등) 지출 비중 도넛 차트 제공.
- **결제 임박 알림**: 금일 기준 7일 이내 결제 예정 항목 상단 노출.

### 3.2. 구독 목록 관리 (Subscription Management)

- **CRUD**: 서비스 추가, 수정, 삭제 기능 (모달 팝업 활용).
- **프리셋(Preset)**: 넷플릭스, 유튜브 등 주요 서비스 선택 시 로고/기본 금액 자동 입력.
- **연/월 환산**: 연 결제 항목 등록 시 월평균 금액 자동 계산 표기.

### 3.3. 분석 및 캘린더 (Analytics & Calendar)

- **캘린더 뷰**: 월간 달력 형태의 결제일 타임라인 제공.
- **연간 리포트**: "1년 뒤 당신의 지출" 등 장기적 관점의 고정비 누적액 산출.

---

## 4. 데이터베이스 설계 (Schema Strategy)

**전략**: 단일 테이블 구성으로 JOIN 연산 배제, 입출력 효율 극대화.

### 4.1. Table: `subscriptions`

| 컬럼명           | 데이터 타입 | 설명         | 비고               |
| ---------------- | ----------- | ------------ | ------------------ |
| **id**           | UUID        | 고유 식별자  | PK                 |
| **user_id**      | UUID        | 사용자 식별  | Supabase Auth 연동 |
| **service_name** | Text        | 서비스명     | 사용자 입력        |
| **price**        | Numeric     | 결제 금액    | -                  |
| **billing_date** | Integer     | 결제일       | 1~31 (Int형 저장)  |
| **category**     | Text        | 카테고리     | 태그 형식          |
| **is_annual**    | Boolean     | 연 결제 여부 | True/False         |

### 4.2. 입출력 최적화 (Optimization)

1. **Single Fetch**: 앱 구동 시 `user_id` 기준 전체 데이터를 1회 호출(`SELECT *`).
2. **Local Logic**: '결제 완료 여부', 'D-Day', '총합' 등은 DB 컬럼 대신 JS 로직으로 실시간 계산.
3. **Static Data**: 서비스 로고 이미지 등의 에셋은 DB가 아닌 프론트엔드 코드 내 정적 파일(JSON)로 관리.

---

# [Project] 구독 관리 웹앱 : 구독노트 (Page 2/2)

---

## 5. UI/UX 디자인 가이드 (Design System)

### 5.1. 디자인 컨셉

- **Tone & Manner**: 신뢰(Trust), 명료함(Clarity), 전문성(Professional).
- **Keyword**: 과장 없는, 딱딱하지만 정확한, 데이터 중심의.

### 5.2. 컬러 팔레트 (Color Palette) - Trust Blue Theme

- **Primary (핵심)**: `#2563EB` (Royal Blue) - 주요 버튼, 활성화 상태.
- **Secondary (보조)**: `#60A5FA` (Light Blue) - 보조 차트 데이터, 호버 효과.
- **Tertiary (배경 강조)**: `#DBEAFE` (Pale Blue) - 카드 UI 테두리, 배지 배경.
- **Background (기본)**: `#F8FAFC` (Off White) - 전체 배경색.

---

## 6. 정보 구조 및 유저 플로우 (IA & User Flow)

### 6.1. 메뉴 구조 (Sitemap)

1. **Home (Dashboard)**: 현황 요약, 임박 리스트, 그래프.
2. **List (Manage)**: 전체 목록 조회, 등록/수정/삭제 액션.
3. **Calendar**: 월별 결제일 시각화.
4. **Settings**: 프로필, 데이터 초기화, 다크모드 등.

### 6.2. 핵심 시나리오 (Main Flow)

1. **진입**: 대시보드에서 이번 달 총 지출액(예: 150,000원) 확인.
2. **인지**: '결제 임박' 카드에서 내일 결제될 서비스(예: 넷플릭스) 확인.
3. **관리**: 불필요 판단 시 리스트 메뉴 이동 → 해당 항목 클릭 → [삭제] 또는 [수정].
4. **확장**: [추가하기] 버튼 클릭 → 프리셋 선택 → 금액 입력 → 저장 완료.

---

## 7. 개발 단계별 마일스톤 (Milestones)

- [x] **Step 3: Add Subscription Feature (Manual)**
    - [x] Create `SubscriptionModal.jsx` (Service Name, Category, Price, Billing Cycle, Payment Method).
    - [x] Implement Validation & Store Update.
    - [x] **Refactor**: Support Edit and Delete operations within the same modal.
    - [x] **Enhancement**: Add 'Payment Method' field and 'Billing Date' display.
    - [x] **Fix**: Resolve infinite render loop in Layout and correct selector usage in store.
    - [x] **Advanced List**: Implement Category Filtering (Tabs) and Column Sorting.
    - [x] **UI Polish**: Improve Modal UI (Status Switch, Category Grid) and Table consistency.

- [ ] **Step 4: Dashboard Visualization**
    - [x] Implement Summary Cards (Total Cost, Active Subscriptions, Max Expense).
    - [x] **UI Polish**: Auto-expand 'Max Expense' card for long text.
    - [x] Dynamic Category Distribution Chart (Bar Chart with Legend).
    - [ ] Monthly Billing Calendar (Simple List or Calendar View).

- [ ] **Step 5: Supabase Integration (Future)**
    - [ ] Set up Supabase Project & Table (`subscriptions`).
    - [ ] Implement Supabase Client & Auth (if needed).
    - [ ] Sync Local State with Supabase DB.


---

**[비고]**
본 기획서는 Supabase의 무료 플랜 정책(Database Size, Egress Limit)을 준수하기 위해 **API 호출 횟수를 엄격히 제한**하는 구조로 설계되었음. 향후 사용자 증가 시 캐싱 전략(React Query 등)의 도입을 고려할 수 있음.

**[승인]**
**\*\***\_\_\_\_**\*\*** (서명)

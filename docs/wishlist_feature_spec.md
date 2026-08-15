# 구독 위시리스트(Wishlist) 기능 명세서 (방안 1: 초간편 폼 적용)

---

### 1. 개요 및 목적
- **목적**: 결제 전 고민 중인 구독 서비스 후보군을 별도 트래킹하고, 충동 결제 방지 및 가상 지출 파악 지원
- **핵심 원칙**:
  - **입력 마찰 제로 (Zero Friction)**: 우선순위·메모 등 부가 입력을 전면 배제하고, `서비스명`, `카테고리`, `예상 금액(월/연)` 3가지만으로 2초 컷 찜 등록
  - 기존 실구독 데이터(`status: 'active'`)와 격리된 위시리스트 상태 관리
  - 고민 완료 시 결제일·결제수단만 입력하여 실제 구독으로 1초 승격(Promote) 지원

---

### 2. 데이터 스키마 명세

#### 1) `subscriptions` 객체 필드 확장
| 필드명 | 타입 | 필수 여부 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `status` | `string` | **필수** | `'active'` | `'active'` \| `'inactive'` \| **`'wishlist'`** (추가) |
| `service_name` | `string` | **필수** | `''` | 서비스명 (프리셋 자동완성 지원) |
| `category` | `string` | **필수** | `'OTT'` | 카테고리 ID |
| `price` | `number` | **필수** | `0` | 예상 구독료 (원화 기준) |
| `billing_cycle` | `string` | 선택 | `'monthly'` | `'monthly'` \| `'yearly'` |
| `billing_date` | `string` | 선택 (위시리스트 시 불필요) | `''` | 위시리스트 등록 시 빈 문자열 |
| `payment_method`| `string` | 선택 (위시리스트 시 불필요) | `''` | 위시리스트 등록 시 빈 문자열 |
| `created_at` | `string` | **필수** | `ISOString` | 등록 일자 (경과 일수 `D+N` 계산용) |

---

### 3. 상태 관리 (Store) 명세 (`useSubscriptionStore.js`)

#### 1) 파생 셀렉터 (Selectors)
- `activeSubscriptions`: `subscriptions.filter(s => s.status === 'active')`
- `wishlistSubscriptions`: `subscriptions.filter(s => s.status === 'wishlist')`
- `wishlistMonthlyTotal`: 위시리스트 항목 전부 구독 시 추가 예상 월 지출액 합산
  - `billing_cycle === 'yearly'`인 경우 `Math.floor(price / 12)`로 월 환산

#### 2) 신규 액션 (Actions)
| 액션 함수명 | 파라미터 | 동작 내용 |
| :--- | :--- | :--- |
| `promoteToActive` | `id, { billing_date, payment_method }` | 지정 항목의 `status`를 `'active'`로 갱신하고 결제일/수단 저장 |
| `openPromoteModal` | `item` | 위시리스트 ➔ 실구독 전환 전용 승격 모달 오픈 |
| `openModal` | `data, defaultTab` | `defaultTab: 'wishlist'` 전달 시 위시리스트 모드로 즉시 오픈 |

---

### 4. UI / UX 화면 구성 명세

#### 1) 독립 1급 라우트 (`src/pages/Wishlist.jsx`)
- **경로**: `/wishlist`
- **네비게이션**: 사이드바 및 모바일 하단바 `[홈]`, `[구독목록]`, **`[위시리스트]`**, `[캘린더]`, `[설정]` 5개 탭 연동
- **상단 브리핑 카드 (3개)**:
  1. `모두 구독 시 추가 월 지출: +XX,XXX원/월`
  2. `담아둔 고민 항목: N개`
  3. `최대 지출 고민 항목: [서비스명] XX,XXX원`
- **카테고리 분포 차트**: 위시리스트 항목 대상 도넛/바 차트 및 필터링

#### 2) 위시리스트 테이블 (`WishlistTable.jsx`)
- **컬럼 구성**:
  - `#` (순번)
  - `서비스명` (아이콘 + 서비스 라벨)
  - `카테고리` (배지)
  - `예상 구독료` (월/연 주기 표시)
  - `고민 기간` (`오늘 담음` 또는 `N일차 고민 중`)
  - `구독 전환 / 삭제` (`[구독 시작]` 승격 버튼 + 삭제 아이콘)
- **빈 상태 (Empty State)**: 위시 항목 0건 시 일러스트 및 `[위시리스트 담기]` CTA 버튼 제공

#### 3) 위시리스트 등록 모달 (`SubscriptionModal.jsx`)
- **초간편 필드**:
  - `서비스명` (자동완성)
  - `카테고리`
  - `예상 구독료` (월간 / 연간 스위처)
- **제거된 마찰 요소**: `우선순위`, `메모`, `결제일`, `결제수단`, `만족도`, `무료체험` 입력 완전 생략

#### 5) 구독 목록 불러오기 모달 (`ImportFromActiveModal.jsx`)
- **트리거**: 위시리스트 상단 `[구독 목록 불러오기]` 버튼 클릭
- **동작**:
  - 현재 구독 중인 서비스 목록을 체크박스 리스트로 렌더링
  - 전체 선택/해제 및 다중 선택 지원
  - 선택 항목들을 일괄 `status: 'wishlist'`로 복제 생성하여 위시리스트에 담기

#### 6) 플랜 업그레이드/교체 및 순차액(Delta) 연동
- **차액 계산**: 기존에 동일/유사 서비스를 구독 중인 경우(예: Claude Pro ➔ Claude Team), `신규 금액 - 기존 금액 = 순차액(Delta)`을 계산하여 상단 총액 및 테이블에 정밀 반영 (중복 과대 계산 방지)
- **승격 교체**: [구독 시작] 승격 시 기존 플랜을 자동 비활성화(`status: 'disable'`)하고 신규 플랜을 활성화하여 중복 결제 방지

---

### 5. 구현 진행 현황 및 특이사항

- [x] **Phase 1: 데이터 레이어 및 스토어 확장 (`useSubscriptionStore.js`)**
  - 상태: 완료
  - 특이사항: `promoteToActive(id, { replaceSubId })` 액션 확장 완료
- [x] **Phase 2: 모달 확장 및 승격 모달 구현 (`SubscriptionModal.jsx`, `PromoteModal.jsx`)**
  - 상태: 완료
  - 특이사항: 플랜 교체 스위처, 차액 프리뷰 및 승격 시 기존 항목 비활성화 연동 완료
- [x] **Phase 3: 독립 1급 페이지 및 네비게이션 연동 (`Wishlist.jsx`, `WishlistTable.jsx`, `Navigation.jsx`)**
  - 상태: 완료
  - 특이사항: 독립 1급 라우트 (`/wishlist`), [구독 목록 불러오기], **[플랜 교체 순차액(Delta) 계산 및 뱃지]** 완료
- [x] **Phase 4: 전체 시스템 검증 및 빌드/린트 점검**
  - 상태: 완료
  - 특이사항: 대시보드 총액/스마트 진단/결제 달력과의 데이터 격리 확인, Vite 프로덕션 번들 빌드(`npm run build`) 통과 완료

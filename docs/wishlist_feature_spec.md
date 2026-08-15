# 구독 위시리스트(Wishlist) 기능 명세서

---

### 1. 개요 및 목적
- **목적**: 결제 전 고민 중인 구독 서비스 후보군을 별도 트래킹하고, 충동 결제 방지 및 가상 지출 파악 지원
- **핵심 목표**:
  - 기존 실구독 데이터(`status: 'active'`)와 격리된 위시리스트 상태 관리
  - 위시리스트 항목의 예상 추가 지출액 합산 및 카테고리별 후보 비교
  - 고민 완료 시 결제일·결제수단만 입력하여 실제 구독으로 1초 승격(Promote) 지원

---

### 2. 데이터 스키마 명세

#### 1) `subscriptions` 객체 필드 확장
| 필드명 | 타입 | 필수 여부 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `status` | `string` | **필수** | `'active'` | `'active'` \| `'inactive'` \| **`'wishlist'`** (추가) |
| `service_name` | `string` | **필수** | `''` | 서비스명 |
| `category` | `string` | **필수** | `'OTT'` | 카테고리 ID |
| `price` | `number` | **필수** | `0` | 예상 구독료 (원화 기준) |
| `billing_cycle` | `string` | 선택 | `'monthly'` | `'monthly'` \| `'yearly'` |
| `billing_date` | `string` | 선택 (위시리스트 시 불필요) | `''` | 위시리스트 등록 시 빈 문자열 허용 |
| `payment_method`| `string` | 선택 (위시리스트 시 불필요) | `''` | 위시리스트 등록 시 빈 문자열 허용 |
| `wish_priority` | `string` | 선택 | `'medium'` | 우선순위: `'high'`(높음) \| `'medium'`(보통) \| `'low'`(낮음) |
| `memo` | `string` | 선택 | `''` | 고민 사유, 프로모션 조건 등 메모 (최대 100자) |
| `created_at` | `string` | **필수** | `ISOString` | 등록 일자 (경과 일수 계산용) |

> [!NOTE]
> Supabase DB 스키마는 기존 `subscriptions` 테이블을 그대로 활용하며, `billing_date`, `payment_method`의 nullable 처리 및 `wish_priority`, `memo` 컬럼 추가(또는 metadata JSON 활용)로 하위 호환성 유지.

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
| `addWishlistItem` | `itemObject` | `status: 'wishlist'` 부여 후 스토어 및 Supabase insert |
| `promoteToActive` | `id, { billing_date, payment_method }` | 지정 항목의 `status`를 `'active'`로 갱신하고 결제일/수단 저장 |
| `updateWishlistItem` | `id, updates` | 기존 `updateSubscription` 재사용 가능 |
| `removeWishlistItem` | `id` | 기존 `removeSubscription` 재사용 가능 |

---

### 4. UI / UX 화면 구성 명세

#### 1) 구독 목록 페이지 탭 확장 (`SubscriptionList.jsx`)
- **상단 탭 바**:
  - `구독 중 (N개)` / `위시리스트 (M개)` 세그먼트 컨트롤 탭 배치
- **위시리스트 상단 요약 브리핑 바**:
  - `위시리스트 N건` | `모두 구독 시 예상 월 지출: +XX,XXX원/월` | `최고 우선순위 X건`
- **우측 상단 CTA 버튼**:
  - 위시리스트 탭 활성화 시 `+ 위시 항목 추가` 버튼 노출

#### 2) 위시리스트 카드/테이블 뷰
- **표시 컬럼/카드 항목**:
  - `서비스명` (아이콘 + 서비스 라벨)
  - `카테고리` (배지)
  - `예상 금액` (주기 뱃지 포함: `월 15,000원` / `연 120,000원`)
  - `우선순위` (`높음` - 빨강 / `보통` - 파랑 / `낮음` - 회색)
  - `등록 경과일` (예: `등록 12일차`)
  - `메모` (툴팁 또는 카드 하단 텍스트)
- **행/카드 단위 액션**:
  - **`구독 시작 (승격)` 버튼**: 승격 팝업 트리거
  - **`수정 / 삭제` 메뉴**: 모달 오픈 및 삭제

#### 3) 위시리스트 등록/수정 모달 UI (`SubscriptionModal.jsx`)
- **모드 전환**:
  - 모달 상단 `구독 등록` / `위시리스트 등록` 토글 라디오 제공
- **입력 필드 조건부 렌더링**:
  - `위시리스트 등록` 선택 시:
    - **숨김/비활성화**: `결제일`, `결제 수단`, `만족도`, `무료체험 여부`
    - **노출/활성화**: `서비스명`, `카테고리`, `예상 금액`, `결제 주기(월/연)`, `우선순위(상/중/하)`, `고민 메모`

#### 4) 실제 구독 승격(Promote) 모달 UI
- **트리거**: 위시리스트 항목에서 `구독 시작` 버튼 클릭
- **입력 요구사항**:
  - 기존 입력된 `서비스명`, `카테고리`, `금액`은 읽기 전용/프리필
  - `결제일(1~31일)` 및 `결제 수단(카드/페이 등)`만 필수 입력
  - 확인 클릭 시 `status: 'active'`로 즉시 전환되고 성공 토스트 노출

---

### 5. 핵심 비즈니스 로직 & 인터랙션 플로우

```
[사용자 행동]
      │
      ├─► [1. 위시리스트 등록] ──► status: 'wishlist'로 저장
      │                             └─► 대시보드 총액/결제 달력에 미반영 (격리)
      │
      ├─► [2. 위시 탭 조회] ────► 경과 일수, 우선순위, 추가 예상 지출 브리핑 확인
      │
      ├─► [3. 구독 승격 결정] ──► '구독 시작' 클릭
      │                             ├─► 결제일/결제수단 입력 팝업
      │                             └─► status: 'active'로 변경
      │                                   └─► 대시보드/캘린더 즉시 자동 편입
      │
      └─► [4. 위시 삭제] ──────► 불필요 판단 시 1클릭 삭제 (스마트 다이어트 성공)
```

---

### 6. 기존 시스템 영향도 분석 및 안전장치

| 기존 영역 | 영향도 | 안전장치 및 격리 방안 |
| :--- | :--- | :--- |
| **대시보드 총 지출** | **영향 없음** | `Dashboard.jsx`는 `s.status === 'active'`만 필터링하므로 수식 불변 |
| **스마트 진단 (중복/만족도)** | **영향 없음** | `insights` 연산 대상이 `activeSubs`로 한정되어 있어 위시 항목 오탐 없음 |
| **결제 달력 (`Calendar.jsx`)** | **영향 없음** | 달력 렌더링 시 `status === 'active' && billing_date` 조건으로만 날짜 매핑 |
| **알림 배너** | **영향 없음** | 결제 D-Day 알림 연산 대상에서 `wishlist` 자동 제외 |

---

### 7. 구현 진행 현황 및 특이사항

- [x] **Phase 1: 데이터 레이어 및 스토어 확장 (`useSubscriptionStore.js`)**
  - 상태: 완료
  - 특이사항: `promoteToActive`, `promoteModal`, `openModal(data, defaultTab)` 액션 및 스토어 상태 확장 완료
- [x] **Phase 2: 모달 확장 및 승격 모달 구현 (`SubscriptionModal.jsx`, `PromoteModal.jsx`)**
  - 상태: 완료
  - 특이사항: `SubscriptionModal.jsx`에 [정기 구독 / 위시리스트] 모드 전환 토글 및 우선순위/메모 필드 추가, `PromoteModal.jsx` 1초 승격 컴포넌트 구현 및 `Layout.jsx` 연동 완료
- [x] **Phase 3: 구독 목록 페이지 탭 확장 및 위시리스트 뷰 구현 (`SubscriptionList.jsx`, `WishlistTable.jsx`)**
  - 상태: 완료
  - 특이사항: `SubscriptionList.jsx` 상단 [구독 중 / 위시리스트] 세그먼트 탭, 위시리스트 전용 추가 지출 브리핑 카드, `WishlistTable.jsx` 컴포넌트 제작 및 연결 완료
- [x] **Phase 4: 전체 시스템 검증 및 빌드/린트 점검**
  - 상태: 완료
  - 특이사항: 대시보드 총액/스마트 진단/결제 달력과의 데이터 격리 확인, Vite 프로덕션 번들 빌드(`npm run build`) 통과 완료

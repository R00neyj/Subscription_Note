# 🚀 Sub-list Dashboard 배포 전 최종 체크리스트

배포 크레딧을 아끼고 한 번에 성공하기 위해, 아래 항목들을 최종 점검하세요. (베테랑 개발자 Gemini가 1차 검수를 완료했습니다.)

---

### 1. ⚙️ 기능 및 환경 설정 (Supabase & Auth) - **[사용자 확인 필요]**

- [x] **Google OAuth Redirect URL:** Supabase Dashboard > Auth > URL Configuration에 Netlify 도메인(`https://your-app.netlify.app`)이 추가되어 있는가?
- [x] **Row Level Security (RLS):** 모든 테이블의 RLS가 활성화되어 있고, 본인 데이터만 수정 가능한 정책이 적용되었는가? (Supabase 연동 검사 완료 ✅)
- [x] **환경 변수:** Netlify Site Settings > Build & deploy > Environment variables에 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`가 정확히 등록되어 있는가?

### 2. 📱 PWA 및 모바일 UX - **[검사 완료 ✅]**

- [x] **알림 클릭 핸들링:** `sw.js`에서 알림 클릭 시 `/calendar`로 이동하는 로직이 정상 작동하는가? (수정 및 검증 완료)
- [x] **iOS 안내 문구:** 설정(Settings) 화면 하단에 iOS 사용자를 위한 '홈 화면에 추가' 안내가 표시되는가? (수정 완료)
- [x] **PWA Manifest:** `manifest.json`의 아이콘 경로와 이름이 실제 파일과 일치하는가? (검증 완료)
- [x] **iOS 노치 대응:** `index.html`에 `viewport-fit=cover` 설정이 되어 있는가? (추가 완료)

### 3. 🎨 스타일 및 다크 모드 - **[검사 완료 ✅]**

- [x] **배너 스타일:** 대시보드 '내일 결제 예정' 배너가 `border-primary`와 `bg-background` 스타일로 잘 적용되었는가? (수정 완료)
- [x] **다크 모드 일관성:** 모든 컴포넌트에 `dark:` 접두사가 누락 없이 적용되어 가독성에 문제가 없는가? (검증 완료)
- [x] **텍스트 줄바꿈:** 설정 화면의 안내 문구 등 긴 텍스트가 작은 화면에서 `whitespace-nowrap` 등으로 의도치 않은 줄바꿈이 방지되었는가? (수정 완료)

### 4. 🧹 빌드 최적화 및 보안 - **[검사 완료 ✅]**

- [x] **로컬 빌드 테스트:** 터미널에서 `npm run build`를 실행했을 때 에러 없이 `dist` 폴더가 생성되는가? (성공 확인)
- [x] **디버깅 코드 제거:** 코드 내부에 불필요한 `console.log`나 테스트용 `alert`가 남아있지 않은가? (제거 완료)
- [x] **SQL Injection:** 모든 데이터 요청이 Supabase SDK의 Query Builder를 통해 안전하게 처리되고 있는가? (검증 완료)

### 5. 🚨 Netlify 배포 설정 (SPA 필수) - **[검사 완료 ✅]**

- [x] **SPA 리다이렉트:** `public/_redirects` 파일에 `/* /index.html 200` 내용이 포함되어 있는가? (확인 완료)
- [x] **빌드 설정:**
  - Build command: `npm run build`
  - Publish directory: `dist`

---

**마지막 단계:** 1번 항목(Supabase 설정)만 대시보드에서 직접 확인한 후 `git push`를 통해 배포를 진행하세요! 🚀

/**
 * 사이트 전역 상수. 배포 도메인이 바뀌면 여기 한 곳만 고치면 된다.
 *
 * 사용처
 *  - vite.config.js  : index.html 의 __SITE_URL__ 치환 (canonical / og:url / twitter:url)
 *  - scripts/generate-guides.mjs : 해지 가이드 페이지의 canonical, sitemap.xml, robots.txt
 *
 * 앱 런타임 코드는 window.location.origin 을 쓰므로 이 값에 의존하지 않는다.
 */
export const SITE_URL = 'https://gudoknote.netlify.app'
export const BRAND = '구독노트'

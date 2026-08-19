/**
 * OG 이미지(1200x630) 생성기.
 *
 *   npm run og:image
 *
 * 랜딩 히어로 카피를 그대로 옮긴 정적 템플릿을 Playwright 로 렌더링해
 * public/og-image.png 로 저장한다. public/ 에 두는 이유는 Netlify 빌드 환경에
 * Playwright 브라우저를 설치하지 않기 위해서다. 카피가 바뀌면 이 스크립트의
 * COPY 상수만 고치고 다시 실행한 뒤 결과물을 커밋하면 된다.
 *
 * 카피 원본: src/pages/Landing.jsx 히어로 섹션
 */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL, BRAND } from '../site.config.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/og-image.png')

const WIDTH = 1200
const HEIGHT = 630

// 도메인은 스킴을 뺀 표시용으로만 쓴다.
const DISPLAY_HOST = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')

const COPY = {
  badge: '계좌 연동 없이 30초',
  titleLine1: '안 쓰는 구독,',
  titleAccent: '30초 만에',
  titleTail: '찾아냅니다',
  desc: '월 지출 · 연간 지출 · 3년 누적 금액까지 바로 계산',
  tags: ['계좌·카드 연동 없음', '회원가입 없이 바로 사용', '광고 없는 오픈소스'],
}

const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
  body {
    font-family: "Pretendard", "Malgun Gothic", system-ui, sans-serif;
    background: #F8FAFC;
    color: #0F172A;
    display: flex; flex-direction: column;
    padding: 68px 76px 60px;
    position: relative; overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }
  /* 랜딩과 같은 계열의 은은한 블루 글로우 */
  .glow-a, .glow-b { position: absolute; border-radius: 50%; filter: blur(90px); }
  .glow-a { width: 620px; height: 620px; right: -180px; top: -230px; background: rgba(37,99,235,0.16); }
  .glow-b { width: 480px; height: 480px; left: -190px; bottom: -240px; background: rgba(44,37,235,0.10); }
  .content { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; }

  .badge {
    align-self: flex-start;
    display: inline-flex; align-items: center; gap: 10px;
    padding: 12px 22px; border-radius: 999px;
    background: rgba(37,99,235,0.10); border: 1px solid rgba(37,99,235,0.22);
    color: #2563EB; font-weight: 800; font-size: 25px; letter-spacing: -0.01em;
  }
  .badge svg { display: block; }

  h1 {
    margin-top: 34px;
    font-size: 92px; font-weight: 900; line-height: 1.16; letter-spacing: -0.035em;
  }
  .accent {
    background: linear-gradient(100deg, #2563EB 0%, #3B82F6 45%, #4F46E5 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }

  .desc {
    margin-top: 26px;
    font-size: 32px; font-weight: 600; color: #475569; letter-spacing: -0.02em;
  }

  .footer {
    margin-top: auto;
    display: flex; align-items: flex-end; justify-content: space-between; gap: 32px;
  }
  .tags { display: flex; flex-wrap: wrap; gap: 14px; }
  .tag {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 12px 20px; border-radius: 14px;
    background: #FFFFFF; border: 1px solid #E2E8F0;
    font-size: 23px; font-weight: 700; color: #334155; letter-spacing: -0.02em;
  }
  .tag svg { display: block; flex: none; }

  .brand { text-align: right; flex: none; }
  .brand-name { font-size: 36px; font-weight: 900; letter-spacing: -0.03em; color: #0F172A; }
  .brand-host { margin-top: 8px; font-size: 22px; font-weight: 700; color: #94A3B8; letter-spacing: -0.01em; }
</style></head>
<body>
  <div class="glow-a"></div><div class="glow-b"></div>
  <div class="content">
    <div class="badge">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/></svg>
      <span>${COPY.badge}</span>
    </div>

    <h1>
      ${COPY.titleLine1}<br />
      <span class="accent">${COPY.titleAccent}</span> ${COPY.titleTail}
    </h1>

    <p class="desc">${COPY.desc}</p>

    <div class="footer">
      <div class="tags">
        ${COPY.tags.map((t) => `<span class="tag">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          ${t}
        </span>`).join('')}
      </div>
      <div class="brand">
        <div class="brand-name">${BRAND}</div>
        <div class="brand-host">${DISPLAY_HOST}</div>
      </div>
    </div>
  </div>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
})
await page.setContent(html, { waitUntil: 'networkidle' })
// 웹폰트가 실제로 적용된 뒤에 찍어야 fallback 폰트로 캡처되는 사고를 막는다.
await page.evaluate(() => document.fonts.ready)

const buffer = await page.screenshot({ type: 'png' })
await browser.close()

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, buffer)

console.log(`[og] ${OUT} (${WIDTH}x${HEIGHT}, ${(buffer.length / 1024).toFixed(1)}KB)`)

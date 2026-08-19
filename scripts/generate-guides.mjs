/**
 * 서비스별 구독 해지 가이드 페이지를 빌드 시점에 정적 HTML로 생성한다.
 *
 * SPA 라우트로 만들지 않는 이유:
 *  - 검색 유입이 목적인 콘텐츠 페이지라 JS 없이도 완결된 HTML이어야 한다.
 *  - Netlify는 실제 파일을 SPA 폴백(`/* /index.html`)보다 먼저 서빙하므로 그대로 동작한다.
 *
 * 실행: vite build 이후 (`npm run build`)
 */
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SUBSCRIPTION_PRESETS, getPriceVerifiedAt, USD_KRW } from '../src/constants/presets.js'
import { SITE_URL as SITE, BRAND } from '../site.config.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const GUIDE_DIR = path.join(DIST, 'guide')

// 요금 정보의 기준 시점. 서비스 요금은 수시로 바뀌므로 페이지에 명시한다.
const BUILT_AT = new Date()
const BUILT_ISO = BUILT_AT.toISOString().slice(0, 10)

const CATEGORY_LABELS = {
  OTT: 'OTT · 영상',
  Music: '음악',
  Shopping: '쇼핑 · 멤버십',
  Work: '업무 · 생산성',
  Cloud: '클라우드 · 저장공간',
  Etc: '기타',
}

// ─────────────────────────────────────────────────────────────
// 서비스 그룹핑
// ─────────────────────────────────────────────────────────────

// 영문명 뒤에 붙는 요금제 수식어. 같은 서비스의 플랜들을 한 페이지로 모으기 위해 떼어낸다.
const PLAN_TOKEN = /^(premium|basic|standard|standerd|plus|pro|max|yearly|annual|monthly|lite|light|individual|family|duo|student|personal|business|team|starter|essential|unlimited|advanced|with|ads|ad-supported|\d+(gb|tb))$/i

const baseName = (nameEn) => {
  const words = nameEn.trim().split(/\s+/)
  while (words.length > 1 && PLAN_TOKEN.test(words[words.length - 1])) words.pop()
  return words.join(' ')
}

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/\+/g, '-plus')
    .replace(/&/g, '-and-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'service'

const commonPrefix = (values) =>
  values.reduce((acc, value) => {
    let i = 0
    while (i < acc.length && i < value.length && acc[i] === value[i]) i++
    return acc.slice(0, i)
  })

/**
 * 그룹을 대표할 한글명.
 * 최단명을 그냥 쓰면 "넷플릭스 프리미엄 / 넷플릭스 광고형"에서 "넷플릭스 광고형"이 뽑히므로,
 * 요금제 이름을 걷어낸 공통 브랜드명을 우선한다.
 */
const displayName = (plans) => {
  const names = plans.map((p) => p.nameKo.replace(/\s*\([^)]*\)\s*$/, '').trim())
  if (names.length === 1) return names[0]

  let prefix = commonPrefix(names)
  // 단어 중간에서 잘렸으면 마지막 공백까지 되돌린다
  if (names.some((n) => n.length > prefix.length && !/\s/.test(n[prefix.length]))) {
    prefix = prefix.slice(0, prefix.lastIndexOf(' ') + 1)
  }
  prefix = prefix.trim()

  return prefix.length >= 2 ? prefix : [...names].sort((a, b) => a.length - b.length)[0]
}

const buildServices = () => {
  const groups = new Map()

  for (const plan of SUBSCRIPTION_PRESETS) {
    const key = baseName(plan.nameEn).toLowerCase()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(plan)
  }

  const services = []
  const usedSlugs = new Set()

  for (const [key, plans] of groups) {
    let slug = slugify(key)
    // 서로 다른 서비스가 같은 슬러그로 충돌하면 순번을 붙인다
    let suffix = 2
    while (usedSlugs.has(slug)) slug = `${slugify(key)}-${suffix++}`
    usedSlugs.add(slug)

    const monthly = plans.map(toMonthly)

    services.push({
      slug,
      name: displayName(plans),
      nameEn: baseName(plans[0].nameEn),
      category: plans[0].category || 'Etc',
      cancelUrl: plans[0].cancel_url,
      subscribeUrl: plans[0].subscribe_url,
      plans,
      minMonthly: Math.min(...monthly),
      maxMonthly: Math.max(...monthly),
      // 이 서비스에 속한 플랜들의 가격 기준일 중 가장 오래된 것 (가장 보수적인 표기)
      priceDate: oldestVerifiedAt(plans),
    })
  }

  return services.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}

const toMonthly = (plan) =>
  plan.billing_cycle === 'yearly' ? Math.floor(plan.price / 12) : plan.price

const won = (n) => n.toLocaleString('ko-KR')

// 프리셋 목록의 가격 기준일 중 가장 오래된 것을 고른다.
// verifiedAt/PRICE_BASE_DATE 모두 'YYYY-MM-DD' 형식이라 문자열 정렬만으로 최소값을 구할 수 있다.
const oldestVerifiedAt = (presets) => presets.map((p) => getPriceVerifiedAt(p)).sort()[0]

// 'YYYY-MM-DD' → '2026년 8월 기준'
const priceDateLabel = (isoDate) => {
  const [y, m] = isoDate.split('-')
  return `${y}년 ${Number(m)}월 기준`
}

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// ─────────────────────────────────────────────────────────────
// 페이지 셸
// ─────────────────────────────────────────────────────────────

const STYLES = `
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f8fafc;--surface:#fff;--border:#e2e8f0;--text:#0f172a;--muted:#64748b;
  --primary:#2563eb;--primary-soft:#eff6ff;--accent:#e11d48;--accent-soft:#fff1f2;
}
@media (prefers-color-scheme:dark){:root{
  --bg:#0f172a;--surface:#1e293b;--border:#334155;--text:#f1f5f9;--muted:#94a3b8;
  --primary:#60a5fa;--primary-soft:#1e3a8a33;--accent:#fb7185;--accent-soft:#88113733;
}}
html{-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--text);font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;line-height:1.7;font-size:16px}
.wrap{max-width:760px;margin:0 auto;padding:0 20px}
header.site{border-bottom:1px solid var(--border);background:var(--surface)}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
.logo{display:flex;align-items:center;gap:8px;font-weight:800;font-size:17px;color:var(--text);text-decoration:none}
.logo img{width:28px;height:28px;border-radius:8px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 16px;border-radius:12px;font-weight:700;font-size:14px;text-decoration:none;transition:opacity .15s}
.btn:hover{opacity:.88}
.btn-primary{background:var(--primary);color:#fff}
.btn-accent{background:var(--accent);color:#fff}
.btn-ghost{background:var(--surface);color:var(--text);border:1px solid var(--border)}
.btn-lg{padding:14px 22px;font-size:16px;border-radius:14px}
nav.crumb{font-size:13px;color:var(--muted);padding:20px 0 0}
nav.crumb a{color:var(--muted);text-decoration:none}
nav.crumb a:hover{text-decoration:underline}
main{padding:8px 0 56px}
h1{font-size:30px;line-height:1.3;font-weight:800;letter-spacing:-.02em;margin:14px 0 12px}
h2{font-size:20px;font-weight:800;margin:36px 0 12px;letter-spacing:-.01em}
.lede{color:var(--muted);font-size:16px;margin-bottom:24px}
.cta-box{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px;margin:24px 0}
.cta-box p{font-size:14px;color:var(--muted);margin-top:10px}
/* 좁은 화면에서 칸이 세로로 뭉개지지 않도록 최소 폭을 주고 .scroller 안에서 가로로 넘긴다 */
table{width:100%;min-width:580px;border-collapse:collapse;font-size:14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
th,td{padding:11px 12px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
th{background:var(--primary-soft);font-weight:700;font-size:13px}
tbody tr:last-child td{border-bottom:none}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
.scroller{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:12px}
.scroller+.note::before{content:"← 표를 옆으로 밀어 볼 수 있습니다 · "}
@media(min-width:680px){.scroller+.note::before{content:none}}
.save{background:var(--accent-soft);border:1px solid var(--accent);border-radius:16px;padding:20px;margin:20px 0}
.save strong{color:var(--accent);font-size:22px}
ol,ul{padding-left:20px}
li{margin:7px 0}
.note{font-size:13px;color:var(--muted);margin-top:10px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;padding:0;list-style:none}
.chips li{margin:0}
.chips a{display:inline-block;padding:7px 13px;border-radius:999px;background:var(--surface);border:1px solid var(--border);font-size:13px;font-weight:600;color:var(--text);text-decoration:none}
.chips a:hover{border-color:var(--primary);color:var(--primary)}
footer.site{border-top:1px solid var(--border);padding:28px 0 40px;font-size:13px;color:var(--muted)}
footer.site a{color:var(--muted)}
.group{margin:28px 0}
.group h3{font-size:15px;font-weight:800;margin-bottom:8px;color:var(--muted)}
@media(min-width:640px){h1{font-size:36px}}
`

const shell = ({ title, description, canonical, jsonLd, body }) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="robots" content="index,follow">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:locale" content="ko_KR">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<style>${STYLES}</style>
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<header class="site"><div class="wrap">
  <a class="logo" href="/"><img src="/favicon-96x96.png" alt="">${BRAND}</a>
  <a class="btn btn-primary" href="/landing">내 구독료 계산하기</a>
</div></header>
${body}
<footer class="site"><div class="wrap">
  <p><a href="/guide/">구독 해지 가이드 전체 보기</a> · <a href="/landing">${BRAND} 홈</a></p>
  <p style="margin-top:8px">실제 금액과 해지 절차는 각 서비스 공식 페이지에서 확인해 주세요.</p>
  <p style="margin-top:8px">© ${BUILT_AT.getFullYear()} ${BRAND}</p>
</div></footer>
</body>
</html>
`

// ─────────────────────────────────────────────────────────────
// 서비스 상세 페이지
// ─────────────────────────────────────────────────────────────

const servicePage = (service, siblings) => {
  const { name, slug, category, cancelUrl, subscribeUrl, plans, minMonthly, maxMonthly, priceDate } = service
  const canonical = `${SITE}/guide/${slug}/`
  const catLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS.Etc
  const priceLabel = priceDateLabel(priceDate)

  const priceRange =
    minMonthly === maxMonthly ? `월 ${won(minMonthly)}원` : `월 ${won(minMonthly)}~${won(maxMonthly)}원`

  const title = `${name} 해지 방법과 구독료 정리 (${priceLabel}) | ${BRAND}`
  const description = `${name} 공식 해지 페이지 바로가기와 요금제별 금액을 정리했습니다. ${priceRange}, 해지하면 3년간 최대 ${won(maxMonthly * 36)}원을 아낄 수 있습니다.`

  const rows = plans
    .map((plan) => {
      const monthly = toMonthly(plan)
      const cycle = plan.billing_cycle === 'yearly' ? '연간 결제' : '월간 결제'
      const listed = plan.billing_cycle === 'yearly' ? `연 ${won(plan.price)}원` : `월 ${won(plan.price)}원`
      return `<tr>
      <td>${esc(plan.nameKo)}</td>
      <td>${cycle}</td>
      <td class="num">${listed}</td>
      <td class="num">${won(monthly)}원</td>
      <td class="num">${won(monthly * 12)}원</td>
      <td class="num">${won(monthly * 36)}원</td>
    </tr>`
    })
    .join('\n')

  const siblingChips = siblings.length
    ? `<h2>같은 카테고리의 다른 구독</h2>
  <ul class="chips">
    ${siblings.map((s) => `<li><a href="/guide/${s.slug}/">${esc(s.name)} 해지</a></li>`).join('\n    ')}
  </ul>`
    : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/landing` },
          { '@type': 'ListItem', position: 2, name: '구독 해지 가이드', item: `${SITE}/guide/` },
          { '@type': 'ListItem', position: 3, name: `${name} 해지`, item: canonical },
        ],
      },
      {
        '@type': 'WebPage',
        name: title,
        description,
        url: canonical,
        inLanguage: 'ko-KR',
        dateModified: BUILT_ISO,
        isPartOf: { '@type': 'WebSite', name: BRAND, url: SITE },
      },
    ],
  }

  const body = `
<div class="wrap">
  <nav class="crumb"><a href="/landing">${BRAND}</a> › <a href="/guide/">구독 해지 가이드</a> › ${esc(name)}</nav>
  <main>
    <h1>${esc(name)} 해지 방법과 구독료 정리</h1>
    <p class="lede">${esc(catLabel)} · ${esc(priceRange)}</p>

    <div class="cta-box">
      <a class="btn btn-accent btn-lg" href="${esc(cancelUrl)}" target="_blank" rel="noopener nofollow">${esc(name)} 해지 페이지 열기 ↗</a>
      <p>${esc(name)}의 공식 구독·결제 관리 페이지로 바로 이동합니다. 해지 메뉴는 로그인 후 계정·멤버십 설정 안에 있습니다.</p>
    </div>

    <h2>요금제별 금액</h2>
    <p class="note">${esc(priceLabel)} · 요금은 변경될 수 있으니 정확한 금액은 공식 페이지에서 다시 확인해 주세요.</p>
    ${plans.some((p) => p.priceUsd != null) ? `<p class="note">이 서비스는 달러로 청구됩니다. 표의 원화 금액은 1달러 = ${won(USD_KRW)}원으로 환산한 값이며, 실제 청구액은 카드사 환율에 따라 달라집니다.</p>` : ''}
    <div class="scroller">
      <table>
        <thead>
          <tr>
            <th>요금제</th><th>결제 주기</th><th class="num">표시 요금</th>
            <th class="num">월 환산</th><th class="num">1년</th><th class="num">3년</th>
          </tr>
        </thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </div>
    <p class="note">연간 결제 상품은 월 단위로 환산해 비교했습니다.</p>

    <div class="save">
      <p>지금 해지하면 3년간</p>
      <strong>최대 ${won(maxMonthly * 36)}원</strong>
      <p>${esc(name)} 한 건만 정리해도 1년에 ${won(maxMonthly * 12)}원이 남습니다.</p>
    </div>

    <h2>해지 전에 확인할 것</h2>
    <ul>
      <li><strong>남은 이용 기간</strong> — 대부분 결제 주기가 끝날 때까지는 그대로 이용할 수 있지만, 서비스마다 다르므로 해지 화면의 안내를 확인하세요.</li>
      <li><strong>결제 경로</strong> — 앱스토어·구글플레이·통신사 결합으로 가입했다면 해당 스토어의 구독 관리에서 해지해야 합니다. 공식 홈페이지에서는 해지 버튼이 보이지 않을 수 있습니다.</li>
      <li><strong>가족 계정·공유</strong> — 함께 쓰는 사람이 있다면 해지 시점을 미리 알려주세요.</li>
      <li><strong>재구독 조건</strong> — 프로모션 요금으로 가입했다면 재구독 시 정가가 적용될 수 있습니다.</li>
    </ul>

    <h2>다시 가입하고 싶다면</h2>
    <p><a href="${esc(subscribeUrl)}" target="_blank" rel="noopener nofollow">${esc(name)} 공식 가입 페이지 ↗</a></p>

    ${siblingChips}

    <h2>해지 전에, 전체 구독료부터 확인해 보세요</h2>
    <p>${esc(name)} 하나만 놓고 보면 부담이 작아 보입니다. 문제는 이런 구독이 몇 개나 더 있는지 대부분 정확히 모른다는 점입니다.</p>
    <p style="margin-top:14px">
      <a class="btn btn-primary btn-lg" href="/landing">30초 만에 내 구독료 계산하기</a>
    </p>
    <p class="note">계좌 연동도, 앱 설치도, 회원가입도 필요 없습니다.</p>
  </main>
</div>`

  return shell({ title, description, canonical, jsonLd, body })
}

// ─────────────────────────────────────────────────────────────
// 인덱스 페이지
// ─────────────────────────────────────────────────────────────

const indexPage = (services) => {
  const canonical = `${SITE}/guide/`
  const title = `구독 해지 방법 모음 — ${services.length}개 서비스 해지 페이지 바로가기 | ${BRAND}`
  const description = `넷플릭스, 유튜브 프리미엄, 쿠팡 와우 등 ${services.length}개 구독 서비스의 공식 해지 페이지와 요금을 한곳에 정리했습니다.`

  const byCategory = new Map()
  for (const s of services) {
    if (!byCategory.has(s.category)) byCategory.set(s.category, [])
    byCategory.get(s.category).push(s)
  }

  const sections = [...byCategory]
    .sort((a, b) => Object.keys(CATEGORY_LABELS).indexOf(a[0]) - Object.keys(CATEGORY_LABELS).indexOf(b[0]))
    .map(
      ([cat, list]) => `
    <div class="group">
      <h3>${esc(CATEGORY_LABELS[cat] || cat)} (${list.length})</h3>
      <ul class="chips">
        ${list.map((s) => `<li><a href="/guide/${s.slug}/">${esc(s.name)}</a></li>`).join('\n        ')}
      </ul>
    </div>`
    )
    .join('\n')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    inLanguage: 'ko-KR',
    dateModified: BUILT_ISO,
    isPartOf: { '@type': 'WebSite', name: BRAND, url: SITE },
  }

  const body = `
<div class="wrap">
  <nav class="crumb"><a href="/landing">${BRAND}</a> › 구독 해지 가이드</nav>
  <main>
    <h1>구독 해지 방법 모음</h1>
    <p class="lede">${services.length}개 서비스의 공식 해지 페이지와 요금제별 금액을 정리했습니다.</p>
    <p class="note">${esc(priceDateLabel(oldestVerifiedAt(SUBSCRIPTION_PRESETS)))} · 요금은 변경될 수 있으니 정확한 금액은 각 서비스 공식 페이지에서 확인해 주세요.</p>

    <div class="cta-box">
      <a class="btn btn-primary btn-lg" href="/landing">30초 만에 내 구독료 계산하기</a>
      <p>해지할지 말지 고민된다면, 먼저 전체 구독료가 얼마인지부터 확인해 보세요. 계좌 연동·회원가입 없이 바로 계산됩니다.</p>
    </div>
${sections}
  </main>
</div>`

  return shell({ title, description, canonical, jsonLd, body })
}

// ─────────────────────────────────────────────────────────────
// 실행
// ─────────────────────────────────────────────────────────────

const sitemap = (services) => {
  const urls = [
    { loc: `${SITE}/`, priority: '1.0' },
    { loc: `${SITE}/landing`, priority: '0.9' },
    { loc: `${SITE}/guide/`, priority: '0.8' },
    ...services.map((s) => ({ loc: `${SITE}/guide/${s.slug}/`, priority: '0.6' })),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${BUILT_ISO}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`
}

const run = async () => {
  if (!existsSync(DIST)) {
    console.error('[guides] dist/ 가 없습니다. vite build 를 먼저 실행하세요.')
    process.exit(1)
  }

  // 프리셋에서 사라진 서비스의 페이지가 남지 않도록 매번 새로 만든다
  if (existsSync(GUIDE_DIR)) await rm(GUIDE_DIR, { recursive: true })
  await mkdir(GUIDE_DIR, { recursive: true })

  const services = buildServices()

  for (const service of services) {
    const siblings = services
      .filter((s) => s.category === service.category && s.slug !== service.slug)
      .slice(0, 8)

    const dir = path.join(GUIDE_DIR, service.slug)
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'index.html'), servicePage(service, siblings), 'utf8')
  }

  await writeFile(path.join(GUIDE_DIR, 'index.html'), indexPage(services), 'utf8')
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap(services), 'utf8')
  await writeFile(
    path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
    'utf8'
  )

  const count = (await readdir(GUIDE_DIR, { withFileTypes: true })).filter((d) => d.isDirectory()).length
  console.log(`[guides] ${count}개 서비스 페이지 + 목차 + sitemap.xml + robots.txt 생성 완료`)
}

run().catch((err) => {
  console.error('[guides] 생성 실패:', err)
  process.exit(1)
})

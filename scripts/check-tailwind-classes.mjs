// Tailwind 에 존재하지 않는 색상 단계를 잡는다.
//
// Tailwind 는 모르는 클래스를 조용히 무시한다. CSS 규칙이 아예 생성되지 않는데
// 에러도, 경고도 없다. 실제로 bg-slate-850 이 3곳, slate-750 이 2곳 있었고
// 그중 캘린더 요일 헤더는 배경이 통째로 빠진 채 배포까지 갔다.
//
// 색 팔레트는 50,100~900,950 단계만 존재한다. 750/850 같은 중간값은 없다.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOTS = ['src', 'index.html']
const EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.html', '.css'])

const VALID_SHADES = new Set(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'])
const COLORS = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const UTILS = 'bg|text|border|from|to|via|ring|divide|shadow|outline|decoration|accent|caret|fill|stroke|placeholder'
const PATTERN = new RegExp(`\\b(?:${UTILS})-(?:${COLORS})-(\\d{2,3})\\b`, 'g')

const walk = (p, out = []) => {
  if (statSync(p).isFile()) { if (EXT.has(extname(p))) out.push(p); return out }
  for (const name of readdirSync(p)) walk(join(p, name), out)
  return out
}

const problems = []
for (const root of ROOTS) {
  for (const file of walk(root)) {
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
      for (const m of line.matchAll(PATTERN)) {
        if (!VALID_SHADES.has(m[1])) problems.push({ file, line: i + 1, cls: m[0] })
      }
    })
  }
}

if (problems.length) {
  console.error(`Tailwind 에 없는 색상 단계 ${problems.length}건. CSS 가 생성되지 않는다.\n`)
  for (const p of problems) console.error(`  ${p.file}:${p.line}  ${p.cls}`)
  console.error('\n유효한 단계: 50, 100~900(100 단위), 950')
  process.exit(1)
}
console.log('[check-tailwind] 색상 단계 이상 없음')

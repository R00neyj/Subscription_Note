import { useMemo } from 'react'
import { cn } from '../lib/utils'
import { CATEGORY_COLORS, TEXT_COLORS } from '../constants/categories'

/**
 * 서비스명 기반 브랜드 식별
 */
export function getServiceBrand(name) {
  if (!name || typeof name !== 'string') return null
  const lower = name.toLowerCase().replace(/[\s\-_+()]/g, '')

  if (lower.includes('구글') || lower.includes('google') || lower.includes('제미나이') || lower.includes('gemini')) return 'google'
  if (lower.includes('챗gpt') || lower.includes('chatgpt') || lower.includes('openai') || lower.includes('gpt')) return 'chatgpt'
  if (lower.includes('클로드') || lower.includes('claude') || lower.includes('anthropic')) return 'claude'
  if (lower.includes('퍼플렉시티') || lower.includes('perplexity')) return 'perplexity'
  if (lower.includes('미드저니') || lower.includes('midjourney')) return 'midjourney'
  if (lower.includes('넷플릭스') || lower.includes('netflix')) return 'netflix'
  if (lower.includes('유튜브') || lower.includes('youtube')) return 'youtube'
  if (lower.includes('디즈니') || lower.includes('disney')) return 'disney'
  if (lower.includes('티빙') || lower.includes('tving')) return 'tving'
  if (lower.includes('웨이브') || lower.includes('wavve')) return 'wavve'
  if (lower.includes('왓챠') || lower.includes('watcha')) return 'watcha'
  if (lower.includes('쿠팡') || lower.includes('coupang')) return 'coupang'
  if (lower.includes('라프텔') || lower.includes('laftel')) return 'laftel'
  if (lower.includes('스포티파이') || lower.includes('spotify')) return 'spotify'
  if (lower.includes('멜론') || lower.includes('melon')) return 'melon'
  if (lower.includes('지니') || lower.includes('genie')) return 'genie'
  if (lower.includes('플로') || lower.includes('flo')) return 'flo'
  if (lower.includes('벅스') || lower.includes('bugs')) return 'bugs'
  if (lower.includes('바이브') || lower.includes('vibe')) return 'vibe'
  if (lower.includes('사운드클라우드') || lower.includes('soundcloud')) return 'soundcloud'
  if (lower.includes('애플') || lower.includes('apple') || lower.includes('아이클라우드') || lower.includes('icloud')) return 'apple'
  if (lower.includes('네이버') || lower.includes('naver') || lower.includes('마이박스') || lower.includes('mybox') || lower.includes('시리즈온')) return 'naver'
  if (lower.includes('카카오') || lower.includes('kakao') || lower.includes('톡서랍') || lower.includes('이모티콘')) return 'kakao'
  if (lower.includes('노션') || lower.includes('notion')) return 'notion'
  if (lower.includes('피그마') || lower.includes('figma')) return 'figma'
  if (lower.includes('어도비') || lower.includes('adobe') || lower.includes('포토샵') || lower.includes('photoshop') || lower.includes('일러스트') || lower.includes('illustrator') || lower.includes('프리미어') || lower.includes('premiere') || lower.includes('애크로뱃') || lower.includes('acrobat')) return 'adobe'
  if (lower.includes('마이크로소프트') || lower.includes('microsoft') || lower.includes('오피스') || lower.includes('office') || lower.includes('원드라이브') || lower.includes('onedrive') || lower.includes('m365')) return 'microsoft'
  if (lower.includes('깃허브') || lower.includes('github') || lower.includes('코파일럿') || lower.includes('copilot')) return 'github'
  if (lower.includes('슬랙') || lower.includes('slack')) return 'slack'
  if (lower.includes('줌') || lower.includes('zoom')) return 'zoom'
  if (lower.includes('드롭박스') || lower.includes('dropbox')) return 'dropbox'
  if (lower.includes('캔바') || lower.includes('canva')) return 'canva'
  if (lower.includes('딥엘') || lower.includes('deepl')) return 'deepl'
  if (lower.includes('젯브레인') || lower.includes('jetbrains')) return 'jetbrains'
  if (lower.includes('그래머리') || lower.includes('grammarly')) return 'grammarly'
  if (lower.includes('배민') || lower.includes('baemin') || lower.includes('배달의민족')) return 'baemin'
  if (lower.includes('요기요') || lower.includes('요기패스') || lower.includes('yogiyo') || lower.includes('yogipass')) return 'yogiyo'
  if (lower.includes('토스') || lower.includes('toss')) return 'toss'
  if (lower.includes('컬리') || lower.includes('kurly')) return 'kurly'
  if (lower.includes('밀리') || lower.includes('millie')) return 'millie'
  if (lower.includes('리디') || lower.includes('ridi')) return 'ridi'
  if (lower.includes('쏘카') || lower.includes('socar')) return 'socar'
  if (lower.includes('엑스박스') || lower.includes('xbox')) return 'xbox'
  if (lower.includes('플레이스테이션') || lower.includes('playstation') || lower.includes('플스') || lower.includes('psplus')) return 'playstation'
  if (lower.includes('닌텐도') || lower.includes('nintendo')) return 'nintendo'
  if (lower.includes('무신사') || lower.includes('musinsa')) return 'musinsa'
  if (lower.includes('올리브영') || lower.includes('oliveyoung')) return 'oliveyoung'
  if (lower.includes('프레이머') || lower.includes('framer')) return 'framer'
  if (lower.includes('넷리파이') || lower.includes('netlify')) return 'netlify'
  if (lower.includes('재피어') || lower.includes('zapier')) return 'zapier'

  return null
}

/**
 * 브랜드별 SVG 아이콘 및 배경 스타일 정의
 */
const BRAND_ICONS = {
  // Google / Gemini
  google: {
    bg: 'bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10',
    render: () => (
      <svg viewBox="0 0 24 24" className="w-[65%] h-[65%]">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
      </svg>
    )
  },

  // ChatGPT / OpenAI
  chatgpt: {
    bg: 'bg-[#10A37F] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M22.28 9.87a5.985 5.985 0 0 0-.52-4.9 6.05 6.05 0 0 0-6.61-2.82 6.002 6.002 0 0 0-4.57-2.07c-2.48 0-4.66 1.51-5.55 3.73a6.046 6.046 0 0 0-3.95 2.87 6.012 6.012 0 0 0 .74 7.15 5.98 5.98 0 0 0 .52 4.9 6.05 6.05 0 0 0 6.61 2.82 5.992 5.992 0 0 0 4.57 2.07c2.48 0 4.66-1.51 5.55-3.73a6.046 6.046 0 0 0 3.95-2.87 6.012 6.012 0 0 0-.74-7.15zM13.2 21.84c-1.53 0-2.96-.65-3.97-1.74l.15-.09 4.99-2.88a.88.88 0 0 0 .44-.76v-5.91l1.77 1.02a.1.1 0 0 1 .05.08v5.82c0 2.46-2 4.46-4.43 4.46zm-8.48-4.22a4.34 4.34 0 0 1-.58-4.3l.16.1 4.99 2.88c.27.16.6.16.87 0l5.12-2.95v2.04a.1.1 0 0 1-.04.09l-5.04 2.91a4.444 4.444 0 0 1-5.48-.77zm-1.54-9.33c.96-1.66 2.76-2.68 4.68-2.68.49 0 .97.07 1.44.2l-.15.09-4.99 2.88a.88.88 0 0 0-.44.76v5.91L2 13.43a.1.1 0 0 1-.05-.08V7.53c.01-.08.08-.16.15-.24zm14.49 3.86L12.55 9.2l5.12-2.95a.1.1 0 0 1 .09 0l5.04 2.91c1.94 1.12 2.61 3.58 1.49 5.52a4.417 4.417 0 0 1-3.69 2.21c-.49 0-.97-.07-1.44-.2l.15-.09-1.28-.74v-3.71zm2.63-2.65l-4.99-2.88a.88.88 0 0 0-.87 0L9.32 9.58V7.54a.1.1 0 0 1 .04-.09l5.04-2.91a4.44 4.44 0 0 1 6.06 1.44 4.34 4.34 0 0 1 .58 4.3l-.16-.1zM10.8 14.8l-2.22-1.28 2.22-1.28 2.22 1.28-2.22 1.28z"/>
      </svg>
    )
  },

  // Claude / Anthropic
  claude: {
    bg: 'bg-[#D97706] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M13.527 2.158c.28-.68 1.226-.68 1.506 0l1.83 4.44a1.8 1.8 0 0 0 1.002 1.002l4.44 1.83c.68.28.68 1.226 0 1.506l-4.44 1.83a1.8 1.8 0 0 0-1.002 1.002l-1.83 4.44c-.28.68-1.226.68-1.506 0l-1.83-4.44a1.8 1.8 0 0 0-1.002-1.002l-4.44-1.83c-.68-.28-.68-1.226 0-1.506l4.44-1.83a1.8 1.8 0 0 0 1.002-1.002l1.83-4.44z"/>
      </svg>
    )
  },

  // Perplexity
  perplexity: {
    bg: 'bg-[#183238] text-[#20B2AA]',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[65%] h-[65%]">
        <path d="M12 2L4 6.5v11L12 22l8-4.5v-11L12 2zm0 3.3l5.3 3L12 11.3 6.7 8.3 12 5.3zm-6 4.7l5 2.8v5.8l-5-2.8V10zm12 5.8l-5 2.8v-5.8l5-2.8v5.8z"/>
      </svg>
    )
  },

  // Midjourney
  midjourney: {
    bg: 'bg-[#0E1318] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M12 2L2 19.5h20L12 2zm0 4.2l6.2 10.8H5.8L12 6.2z"/>
      </svg>
    )
  },

  // Netflix
  netflix: {
    bg: 'bg-black text-[#E50914]',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M4 2v20l4-2V2H4zm8 0l4 18V2h-4zm-4 3.5l8 15V17L8 2v3.5zm8-3.5v20l4-2V2h-4z"/>
      </svg>
    )
  },

  // YouTube / YouTube Music
  youtube: {
    bg: 'bg-[#FF0000] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[65%] h-[65%]">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },

  // Disney+
  disney: {
    bg: 'bg-[#113CCF] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[65%] h-[65%]">
        <path d="M4.5 12c0-4.14 3.36-7.5 7.5-7.5 2.45 0 4.63 1.18 6 3l-1.5 1.5C15.4 7.7 13.8 7 12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5c1.8 0 3.4-.7 4.5-2l1.5 1.5c-1.37 1.82-3.55 3-6 3-4.14 0-7.5-3.36-7.5-7.5zm14-1h2v2h-2v2h-2v-2h-2v-2h2v-2h2v2z"/>
      </svg>
    )
  },

  // TVING (티빙)
  tving: {
    bg: 'bg-[#FF153C] text-white font-black',
    render: () => (
      <span className="text-[12px] md:text-[14px] font-black tracking-tighter leading-none">TV</span>
    )
  },

  // Wavve (웨이브)
  wavve: {
    bg: 'bg-[#1054F6] text-white font-black',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[65%] h-[65%]">
        <path d="M2 15l4-8 4 8 4-8 4 8 4-8v10H2v-2z"/>
      </svg>
    )
  },

  // WATCHA (왓챠)
  watcha: {
    bg: 'bg-[#FF0558] text-white font-black',
    render: () => (
      <span className="text-[13px] md:text-[15px] font-black tracking-tighter leading-none">W</span>
    )
  },

  // Coupang (쿠팡 / 쿠팡플레이)
  coupang: {
    bg: 'bg-[#EA1D2C] text-white font-black',
    render: () => (
      <span className="text-[13px] md:text-[15px] font-black tracking-tighter leading-none">C</span>
    )
  },

  // Spotify
  spotify: {
    bg: 'bg-[#1ED760] text-black',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    )
  },

  // Melon (멜론)
  melon: {
    bg: 'bg-[#00CD3C] text-white font-black',
    render: () => (
      <span className="text-[13px] md:text-[15px] font-black tracking-tighter leading-none">m</span>
    )
  },

  // Genie (지니뮤직)
  genie: {
    bg: 'bg-[#00A8FF] text-white font-black',
    render: () => (
      <span className="text-[13px] md:text-[15px] font-black tracking-tighter leading-none">g</span>
    )
  },

  // FLO (플로)
  flo: {
    bg: 'bg-[#3F3FFF] text-white font-black',
    render: () => (
      <span className="text-[12px] md:text-[14px] font-black tracking-tighter leading-none">FLO</span>
    )
  },

  // Apple / Apple Music / Apple TV / iCloud
  apple: {
    bg: 'bg-black dark:bg-zinc-800 text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.2c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.06 1.7-0.93 2.73 1 .08 2.03-.48 2.65-1.23z"/>
      </svg>
    )
  },

  // Naver / Naver Plus / MYBOX
  naver: {
    bg: 'bg-[#03C75A] text-white font-black',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[50%] h-[50%]">
        <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
      </svg>
    )
  },

  // Kakao / KakaoTalk
  kakao: {
    bg: 'bg-[#FEE500] text-[#191919]',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.82 1.83 5.3 4.63 6.72l-.95 3.51c-.08.31.25.56.52.39l4.18-2.77c.53.07 1.07.11 1.62.11 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
      </svg>
    )
  },

  // Notion
  notion: {
    bg: 'bg-black text-white dark:bg-zinc-900 border border-black/10 dark:border-white/20',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.213.98l14.474-.84c.84-.046.934-.56.934-1.167V6.447c0-.606-.233-.933-.747-.887l-15.127.887c-.56.046-.747.373-.747.84zm13.681.793c.093.42 0 .84-.42.887l-.747.14v9.704c-.42.234-.84.374-1.26.374-.607 0-.887-.187-1.4-.793l-4.76-7.465v7.279l1.353.327c.42.093.467.466.374.886l-2.614.14c-.093-.42.047-.84.42-.886l.84-.234V9.338l-1.12-.093c-.42-.047-.467-.42-.374-.84l2.66-.187 4.947 7.605V9.058l-1.073-.14c-.42-.047-.467-.42-.374-.84z"/>
      </svg>
    )
  },

  // Figma
  figma: {
    bg: 'bg-[#2C2D30]',
    render: () => (
      <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]">
        <path fill="#0ACF83" d="M12 24a4 4 0 0 0 4-4v-4h-4a4 4 0 0 0 0 8z"/>
        <path fill="#A259FF" d="M4 16a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z"/>
        <path fill="#F24E1E" d="M4 8a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z"/>
        <path fill="#FF7262" d="M12 4h4a4 4 0 1 1 0 8h-4V4z"/>
        <path fill="#1ABCFE" d="M20 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/>
      </svg>
    )
  },

  // Adobe
  adobe: {
    bg: 'bg-[#FF0000] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M13.966 22h5.534L12 2 4.5 22h5.534l2.453-6.521h3.426L13.966 22zM12 6.848l1.458 3.88h-2.916L12 6.848z"/>
      </svg>
    )
  },

  // Microsoft / M365 / OneDrive
  microsoft: {
    bg: 'bg-[#242424] p-1.5',
    render: () => (
      <svg viewBox="0 0 24 24" className="w-[65%] h-[65%]">
        <path fill="#F25022" d="M1 1h10v10H1z"/>
        <path fill="#7FBA00" d="M13 1h10v10H13z"/>
        <path fill="#00A4EF" d="M1 13h10v10H1z"/>
        <path fill="#FFB900" d="M13 13h10v10H13z"/>
      </svg>
    )
  },

  // GitHub / Copilot
  github: {
    bg: 'bg-[#24292F] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[65%] h-[65%]">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    )
  },

  // Slack
  slack: {
    bg: 'bg-[#4A154B] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    )
  },

  // Zoom
  zoom: {
    bg: 'bg-[#2D8CFF] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M4.5 7.5A2.5 2.5 0 0 0 2 10v4a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 16 14v-4a2.5 2.5 0 0 0-2.5-2.5h-9zm13 2.25l4.5-3v10.5l-4.5-3v-4.5z"/>
      </svg>
    )
  },

  // Dropbox
  dropbox: {
    bg: 'bg-[#0061FF] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[65%] h-[65%]">
        <path d="M6 2l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM0 10l6 4-6 4-6-4 6-4zm18 0l6 4-6 4-6-4 6-4zM6 18.5l6-4 6 4-6 3.5-6-3.5z"/>
      </svg>
    )
  },

  // Toss (토스)
  toss: {
    bg: 'bg-[#0064FF] text-white font-black',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[65%] h-[65%]">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-5h2v5zm0-7h-2V7h2v2.5z"/>
      </svg>
    )
  },

  // Baemin (배달의민족 / 배민클럽)
  baemin: {
    bg: 'bg-[#2AC1BC] text-white font-black',
    render: () => (
      <span className="text-[12px] md:text-[14px] font-black tracking-tighter leading-none">배민</span>
    )
  },

  // Kurly (컬리)
  kurly: {
    bg: 'bg-[#5F0080] text-white font-black',
    render: () => (
      <span className="text-[12px] md:text-[14px] font-bold tracking-tight leading-none">Kurly</span>
    )
  },

  // Millie (밀리의 서재)
  millie: {
    bg: 'bg-[#FFE342] text-black font-black',
    render: () => (
      <span className="text-[13px] md:text-[15px] font-black tracking-tighter leading-none">밀리</span>
    )
  },

  // RIDI (리디셀렉트)
  ridi: {
    bg: 'bg-[#1F8CE6] text-white font-black',
    render: () => (
      <span className="text-[13px] md:text-[15px] font-black tracking-tighter leading-none">RIDI</span>
    )
  },

  // Socar (쏘카)
  socar: {
    bg: 'bg-[#00B8FF] text-white font-black',
    render: () => (
      <span className="text-[12px] md:text-[14px] font-bold tracking-tight leading-none">SOCAR</span>
    )
  },

  // Xbox
  xbox: {
    bg: 'bg-[#107C10] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[65%] h-[65%]">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12s12-5.37 12-12c0-6.63-5.37-12-12-12zm-3.5 4.5c1.8 1.4 3.5 1.5 3.5 1.5s1.7-.1 3.5-1.5c2.3 1.8 3.9 4.6 4.3 7.8-1.2-1.3-3.6-2.3-5.8-2.3-1 0-1.7.3-2 .3-.3 0-1-.3-2-.3-2.2 0-4.6 1-5.8 2.3.4-3.2 2-6 4.3-7.8zM4.2 14.5c1.5-1.4 4-2.2 6.1-2.2.8 0 1.4.2 1.7.2.3 0 .9-.2 1.7-.2 2.1 0 4.6.8 6.1 2.2-.8 3.4-3.5 6-6.8 6.5-.3 0-.7-.2-.9-.4l-.1-.1-.1.1c-.2.2-.6.4-.9.4-3.3-.5-6-3.1-6.8-6.5z"/>
      </svg>
    )
  },

  // PlayStation
  playstation: {
    bg: 'bg-[#003791] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[65%] h-[65%]">
        <path d="M8.5 3.5v11.2l3.5-1.3V7.2l3.5 1.3v5.4l-7 2.6v2.5l7-2.6 4.5-1.7V8.5L12 5.5 8.5 3.5z"/>
      </svg>
    )
  },

  // Nintendo
  nintendo: {
    bg: 'bg-[#E60012] text-white',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[65%] h-[65%]">
        <path d="M4 3h7v18H4a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm4.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm4.5-5h7a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-7V3zm3.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
      </svg>
    )
  },

  // Canva
  canva: {
    bg: 'bg-[#00C4CC] text-white font-black',
    render: () => (
      <span className="text-[13px] md:text-[15px] font-black tracking-tighter leading-none italic">C</span>
    )
  },

  // DeepL
  deepl: {
    bg: 'bg-[#0F2B46] text-white font-black',
    render: () => (
      <span className="text-[11px] md:text-[13px] font-black tracking-tight leading-none">DeepL</span>
    )
  }
}

/**
 * ServiceIcon Component
 * @param {string} serviceName - 구독 서비스 이름
 * @param {string} category - 카테고리 (Fallback 색상용)
 * @param {string} className - 추가 Tailwind 클래스
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function ServiceIcon({ 
  serviceName = '', 
  category = 'Etc', 
  className = '',
  size = 'md' 
}) {
  const brandKey = useMemo(() => getServiceBrand(serviceName), [serviceName])
  const brand = brandKey ? BRAND_ICONS[brandKey] : null

  // Size preset mapping
  const sizeClasses = {
    sm: 'w-[24px] h-[24px] rounded-[6px] text-[11px]',
    md: 'w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-[8px] md:rounded-[10px] text-[12px] md:text-[15px]',
    lg: 'w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-[10px] md:rounded-[12px] text-[15px] md:text-[18px]'
  }

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md

  // 1. 브랜드 아이콘이 있는 경우: 해당 브랜드 로고 및 전용 배경 렌더링
  if (brand) {
    return (
      <div
        className={cn(
          "flex items-center justify-center font-bold shrink-0 overflow-hidden select-none transition-all duration-300 shadow-sm",
          selectedSizeClass,
          brand.bg,
          className
        )}
        title={serviceName}
      >
        {brand.render()}
      </div>
    )
  }

  // 2. 브랜드 아이콘이 없는 경우: 카테고리 색상 배경 + 첫 글자 텍스트 Fallback
  const fallbackChar = serviceName.trim().charAt(0) || '?'
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.Etc
  const txtColor = TEXT_COLORS[category] || 'text-white'

  return (
    <div
      className={cn(
        "flex items-center justify-center font-extrabold shrink-0 select-none transition-all duration-300 shadow-sm",
        selectedSizeClass,
        catColor,
        txtColor,
        className
      )}
      title={serviceName}
    >
      {fallbackChar}
    </div>
  )
}

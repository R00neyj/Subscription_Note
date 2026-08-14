export const SUB_DOMAINS = {
  // 1. Work (생산성 / 업무 도구)
  Work_AI: {
    id: 'Work_AI',
    mainCategory: 'Work',
    label: 'AI / LLM 도구',
    advice: '유사한 AI 생산성/LLM 구독이 겹치지 않나요? 가장 자주 쓰는 모델 하나에 집중해보세요.',
    keywords: [
      'claude', 'chatgpt', 'openai', 'cursor', 'copilot', 'midjourney',
      'v0', 'poe', 'gemini', 'perplexity', '클로드', '챗지피티', '챗gpt', '커서',
      '미드저니', '퍼플렉시티', '제미나이', 'grok', 'anthropic', '앤트로픽', 'suno',
      '구글ai', '구글 ai', 'googleai', 'google ai', '구글원ai', 'googleoneai',
      '뤼튼', 'wrtn', 'genspark', '젠스파크', 'sora', '소라', 'kling', 'runway',
      '노션ai', 'notionai', 'deepseek', '딥시크'
    ]
  },
  Work_Design: {
    id: 'Work_Design',
    mainCategory: 'Work',
    label: '디자인 / 그래픽 툴',
    advice: '디자인 작업 툴이 중복되고 있어요. 주로 사용하는 플랫폼 하나로 정리해보세요.',
    keywords: [
      'figma', 'adobe', 'canva', 'sketch', 'photoshop', 'illustrator',
      'after effects', 'premiere', '피그마', '어도비', '캔바', '포토샵',
      '일러스트레이터', '프리미어', 'framer', 'invision'
    ]
  },
  Work_Productivity: {
    id: 'Work_Productivity',
    mainCategory: 'Work',
    label: '문서 / 노트 / 지식관리',
    advice: '노트/문서 관리 툴이 분산되어 있진 않나요? 주 작업 공간을 하나로 통일해보세요.',
    keywords: [
      'notion', 'obsidian', 'evernote', 'coda', 'roam', 'bear',
      'craft', '노션', '옵시디언', '에버노트', '코다'
    ]
  },
  Work_Collaboration: {
    id: 'Work_Collaboration',
    mainCategory: 'Work',
    label: '협업 / 메신저 / 화상회의',
    advice: '협업 및 커뮤니케이션 도구를 단일 채널로 통합해보세요.',
    keywords: [
      'slack', 'discord', 'zoom', 'teams', 'google meet', 'gather',
      '슬랙', '디스코드', '줌', '팀즈'
    ]
  },
  Work_Dev: {
    id: 'Work_Dev',
    mainCategory: 'Work',
    label: '개발 / 프로젝트 관리',
    advice: '개발 및 이슈 관리 플랫폼을 점검해보세요.',
    keywords: [
      'github', 'gitlab', 'jira', 'linear', 'asana', 'trello',
      '깃허브', '깃랩', '지라', '리니어', '아사나', '트렐로'
    ]
  },

  // 2. OTT (미디어 / 콘텐츠)
  OTT_Video: {
    id: 'OTT_Video',
    mainCategory: 'OTT',
    label: '영상 스트리밍 (OTT)',
    advice: '비슷한 영상 콘텐츠 플랫폼이 겹치지 않나요? 이번 달에 보지 않는 OTT는 일시정지해보세요.',
    keywords: [
      'netflix', 'tving', 'wavve', 'watcha', 'disney', 'coupang play',
      'youtube', 'laftel', 'hulu', 'hbo', '넷플릭스', '티빙', '웨이브',
      '왓챠', '디즈니', '디즈니플러스', '쿠팡플레이', '유튜브', '라프텔', '애플tv'
    ]
  },
  OTT_Book: {
    id: 'OTT_Book',
    mainCategory: 'OTT',
    label: '도서 / 웹툰 / 지식 콘텐츠',
    advice: '전자책/웹툰 구독이 중복되고 있어요. 더 자주 읽는 서비스만 남겨보세요.',
    keywords: [
      'ridi', 'ridibooks', 'millie', 'welaaa', 'naver webtoon', 'kakao page',
      'publy', 'longblack', '리디', '리디북스', '밀리의서재', '밀리의 서재',
      '윌라', '네이버웹툰', '카카오페이지', '퍼블리', '롱블랙'
    ]
  },

  // 3. Music (음악)
  Music_Streaming: {
    id: 'Music_Streaming',
    mainCategory: 'Music',
    label: '음원 스트리밍',
    advice: '여러 음원 플랫폼을 결제하고 계시네요. 하나의 플레이리스트로 합쳐보세요.',
    keywords: [
      'spotify', 'melon', 'genie', 'bugs', 'apple music', 'flo',
      'youtube music', '스포티파이', '멜론', '지니', '벅스', '애플뮤직', '플로', '유튜브뮤직'
    ]
  },

  // 4. Shopping (쇼핑 / 배송)
  Shopping_Membership: {
    id: 'Shopping_Membership',
    mainCategory: 'Shopping',
    label: '쇼핑 멤버십 / 배송 혜택',
    advice: '가장 자주 주문하는 배송 멤버십 1~2개만 남겨도 지출을 크게 줄일 수 있어요.',
    keywords: [
      'coupang', 'naver plus', 'kurly', 'shinsegae', 'ssg', 'amazon',
      'baemin', 'yogiyo', '쿠팡', '네이버플러스', '마켓컬리', '컬리',
      '신세계', '유니버스', '배민', '배달의민족', '요기요', '와우'
    ]
  },

  // 5. Cloud (스토리지 / 인프라)
  Cloud_Storage: {
    id: 'Cloud_Storage',
    mainCategory: 'Cloud',
    label: '개인 클라우드 스토리지',
    advice: '개인 백업 스토리지가 분산되어 있어요. 주 클라우드 하나로 통합 백업을 고려해보세요.',
    keywords: [
      'google one', 'google drive', 'icloud', 'dropbox', 'onedrive',
      'naver mybox', 'box', '구글원', '구글드라이브', '아이클라우드',
      '드롭박스', '원드라이브', '마이박스'
    ]
  },
  Cloud_Infra: {
    id: 'Cloud_Infra',
    mainCategory: 'Cloud',
    label: '클라우드 인프라 / 호스팅',
    advice: '호스팅 및 클라우드 인프라 비용을 점검해보세요.',
    keywords: [
      'aws', 'vercel', 'supabase', 'netlify', 'render', 'digitalocean',
      'cloudflare', 'gcp', 'azure', '버셀', '수파베이스'
    ]
  }
}

/**
 * 서비스명과 대분류를 기반으로 세부 도메인을 정밀 매칭
 * @param {string} serviceName - 서비스명 (예: "Claude Code", "구글 AI 프로", "Figma")
 * @param {string} mainCategory - 대분류 카테고리 (예: "Work", "Cloud", "OTT")
 * @returns {object} 매칭된 세부 도메인 정보 객체
 */
export const detectSubDomain = (serviceName = '', mainCategory = 'Etc') => {
  const rawName = (serviceName || '').toLowerCase()
  const normalized = rawName.replace(/[\s\-_+()]/g, '')
  
  // 1. [최우선] AI / LLM 서비스는 카테고리(Cloud/Work/Etc)를 불문하고 AI 도메인으로 최우선 통합 매칭
  const aiSubDomain = SUB_DOMAINS.Work_AI
  const isAIMatch = aiSubDomain.keywords.some(kw => {
    const normKw = kw.toLowerCase().replace(/[\s\-_+()]/g, '')
    return normalized.includes(normKw)
  }) || (
    // '구글' + 'ai' 또는 'google' + 'ai' 또는 서비스명 내 명시적 AI 키워드
    (normalized.includes('구글') && normalized.includes('ai')) ||
    (normalized.includes('google') && normalized.includes('ai')) ||
    (/\bai\b/i.test(rawName) && !normalized.includes('baemin') && !normalized.includes('daum')) ||
    rawName.includes('인공지능')
  )

  if (isAIMatch) {
    return aiSubDomain
  }

  // 2. 지정된 mainCategory 내의 세부 도메인 우선 검사
  const sameCategorySubDomains = Object.values(SUB_DOMAINS).filter(
    sd => sd.mainCategory === mainCategory && sd.id !== 'Work_AI'
  )
  for (const sd of sameCategorySubDomains) {
    if (sd.keywords.some(kw => normalized.includes(kw.toLowerCase().replace(/[\s\-_+()]/g, '')))) {
      return sd
    }
  }

  // 3. 다른 카테고리의 키워드라도 일치하는지 전역 검사
  for (const sd of Object.values(SUB_DOMAINS)) {
    if (sd.id === 'Work_AI') continue
    if (sd.keywords.some(kw => normalized.includes(kw.toLowerCase().replace(/[\s\-_+()]/g, '')))) {
      return sd
    }
  }

  // 4. 매칭되는 세부 키워드가 없는 경우
  return {
    id: `${mainCategory}_General`,
    mainCategory,
    label: `${mainCategory} 일반`,
    advice: '불필요하게 겹치는 기능이나 서비스가 없는지 점검해보세요.',
    isGeneral: true
  }
}


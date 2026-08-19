/**
 * 이 카탈로그 가격의 "기준일".
 * 구독료는 시간이 지나면 실제 가격과 달라질 수 있다. 프리셋 각각에 별도의 검증일
 * (아래 `verifiedAt`)이 없으면, 그 프리셋의 가격은 이 날짜를 기준으로 표기된 것으로
 * 간주한다. 즉 "이 카탈로그를 마지막으로 훑어본 시점"을 뜻하며, 개별 항목의 가격을
 * 실제로 하나하나 재확인했다는 뜻은 아니다.
 * 카탈로그 가격을 전반적으로 재검토/갱신할 때마다 이 값을 갱신할 것.
 */
export const PRICE_BASE_DATE = '2026-08-19'

/**
 * SUBSCRIPTION_PRESETS 의 각 원소는 아래 필드를 가진다.
 * - nameKo, nameEn, price, category, billing_cycle, subscribe_url, cancel_url
 * - verifiedAt (선택) — 'YYYY-MM-DD' 형식. 이 프리셋의 가격을 실제로 공식 페이지에서
 *   확인한 날짜. **실제로 가격을 확인한 항목에만 나중에 붙인다.** 값이 없는 항목은
 *   PRICE_BASE_DATE 를 기준일로 취급한다 (아래 getPriceVerifiedAt 참고).
 *   → 현재는 어떤 프리셋에도 verifiedAt 이 붙어 있지 않다. 검증되지 않은 항목에
 *     임의로 날짜를 채워 넣지 말 것.
 */
const RAW_PRESETS = [
  // ==========================================
  // 1. OTT
  // ==========================================
  {
    nameKo: "넷플릭스 프리미엄",
    nameEn: "Netflix Premium",
    price: 17000,
    category: "OTT",
    subscribe_url: "https://www.netflix.com",
    cancel_url: "https://www.netflix.com/youraccount"
  },
  {
    nameKo: "유튜브 프리미엄",
    nameEn: "YouTube Premium",
    price: 14900,
    category: "OTT",
    subscribe_url: "https://www.youtube.com/premium",
    cancel_url: "https://www.youtube.com/paid_memberships",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "유튜브 프리미엄 라이트",
    nameEn: "YouTube Premium Lite",
    price: 8500,
    verifiedAt: "2026-08-20",
    category: "OTT",
    subscribe_url: "https://www.youtube.com/premium",
    cancel_url: "https://www.youtube.com/paid_memberships"
  },
  {
    nameKo: "디즈니+ 프리미엄",
    nameEn: "Disney+ Premium",
    price: 13900,
    category: "OTT",
    subscribe_url: "https://www.disneyplus.com",
    cancel_url: "https://www.disneyplus.com/account"
  },
  {
    nameKo: "디즈니+ 프리미엄 (연간)",
    nameEn: "Disney+ Premium Yearly",
    price: 139000,
    category: "OTT",
    billing_cycle: "yearly",
    subscribe_url: "https://www.disneyplus.com",
    cancel_url: "https://www.disneyplus.com/account"
  },
  {
    nameKo: "티빙 프리미엄",
    nameEn: "TVING Premium",
    price: 17000,
    category: "OTT",
    subscribe_url: "https://www.tving.com",
    cancel_url: "https://www.tving.com/my"
  },
  {
    nameKo: "티빙 프리미엄 (연간)",
    nameEn: "TVING Premium Yearly",
    price: 170000,
    category: "OTT",
    billing_cycle: "yearly",
    subscribe_url: "https://www.tving.com",
    cancel_url: "https://www.tving.com/my"
  },
  {
    nameKo: "웨이브 프리미엄",
    nameEn: "Wavve Premium",
    price: 13900,
    category: "OTT",
    subscribe_url: "https://www.wavve.com",
    cancel_url: "https://www.wavve.com/my/membership"
  },
  {
    nameKo: "쿠팡플레이 (와우)",
    nameEn: "Coupang Play",
    price: 7890,
    category: "OTT",
    subscribe_url: "https://www.coupangplay.com",
    cancel_url: "https://www.coupang.com/np/my/wow"
  },
  {
    nameKo: "왓챠 프리미엄",
    nameEn: "WATCHA Premium",
    price: 12900,
    category: "OTT",
    subscribe_url: "https://watcha.com",
    cancel_url: "https://watcha.com/settings"
  },
  {
    nameKo: "라프텔 베이직",
    nameEn: "Laftel Basic",
    price: 9900,
    category: "OTT",
    subscribe_url: "https://laftel.net",
    cancel_url: "https://laftel.net/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "라프텔 프리미엄",
    nameEn: "Laftel Premium",
    price: 14900,
    verifiedAt: "2026-08-20",
    category: "OTT",
    subscribe_url: "https://laftel.net",
    cancel_url: "https://laftel.net/settings"
  },
  {
    nameKo: "애플 TV",
    nameEn: "Apple TV",
    price: 6500,
    category: "OTT",
    subscribe_url: "https://tv.apple.com",
    cancel_url: "https://support.apple.com/HT202039",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "파라마운트+",
    nameEn: "Paramount+",
    price: 9000,
    category: "OTT",
    subscribe_url: "https://www.paramountplus.com",
    cancel_url: "https://www.paramountplus.com/account"
  },
  {
    nameKo: "넷플릭스 광고형",
    nameEn: "Netflix Ad-supported",
    price: 7000,
    verifiedAt: "2026-08-19",
    category: "OTT",
    subscribe_url: "https://www.netflix.com",
    cancel_url: "https://www.netflix.com/youraccount"
  },
  {
    nameKo: "티빙 베이직",
    nameEn: "TVING Basic",
    price: 9500,
    category: "OTT",
    subscribe_url: "https://www.tving.com",
    cancel_url: "https://www.tving.com/my"
  },
  {
    nameKo: "SPOTV NOW",
    nameEn: "SPOTV NOW",
    price: 19900,
    category: "OTT",
    subscribe_url: "https://www.spotvnow.co.kr",
    cancel_url: "https://www.spotvnow.co.kr/my/membership"
  },
  {
    nameKo: "NBA 리그 패스",
    nameEn: "NBA League Pass",
    price: 26000,
    category: "OTT",
    subscribe_url: "https://www.nba.com/watch/league-pass-stream",
    cancel_url: "https://www.nba.com/account"
  },
  {
    nameKo: "크런치롤",
    nameEn: "Crunchyroll",
    price: 6000,
    category: "OTT",
    subscribe_url: "https://www.crunchyroll.com",
    cancel_url: "https://www.crunchyroll.com/account/membership"
  },
  {
    nameKo: "아마존 프라임 비디오",
    nameEn: "Amazon Prime Video",
    price: 6000,
    category: "OTT",
    subscribe_url: "https://www.primevideo.com",
    cancel_url: "https://www.amazon.com/mc/manage"
  },
  {
    nameKo: "Mubi",
    nameEn: "Mubi",
    price: 12000,
    category: "OTT",
    subscribe_url: "https://mubi.com",
    cancel_url: "https://mubi.com/settings"
  },
  {
    nameKo: "시리즈온",
    nameEn: "Series ON",
    price: 10000,
    category: "OTT",
    subscribe_url: "https://serieson.naver.com",
    cancel_url: "https://serieson.naver.com/my"
  },
  {
    nameKo: "카카오페이지",
    nameEn: "Kakao Page",
    price: 10000,
    category: "OTT",
    subscribe_url: "https://page.kakao.com",
    cancel_url: "https://page.kakao.com/mypage"
  },
  {
    nameKo: "리디셀렉트",
    nameEn: "RIDI Select",
    price: 4900,
    category: "OTT",
    subscribe_url: "https://select.ridibooks.com",
    cancel_url: "https://select.ridibooks.com/settings"
  },

  // ==========================================
  // 2. Music
  // ==========================================
  {
    nameKo: "유튜브 뮤직",
    nameEn: "YouTube Music",
    price: 11990,
    category: "Music",
    subscribe_url: "https://music.youtube.com",
    cancel_url: "https://www.youtube.com/paid_memberships"
  },
  {
    nameKo: "스포티파이",
    nameEn: "Spotify",
    price: 11990,
    verifiedAt: "2026-08-19",
    category: "Music",
    subscribe_url: "https://www.spotify.com",
    cancel_url: "https://www.spotify.com/account/overview/"
  },
  {
    nameKo: "멜론 스트리밍",
    nameEn: "Melon",
    price: 8690,
    category: "Music",
    subscribe_url: "https://www.melon.com",
    cancel_url: "https://member.melon.com/my/pay/use.htm",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "지니뮤직",
    nameEn: "Genie Music",
    price: 9240,
    category: "Music",
    subscribe_url: "https://www.genie.co.kr",
    cancel_url: "https://www.genie.co.kr/my/buyList",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "애플 뮤직",
    nameEn: "Apple Music",
    price: 8900,
    category: "Music",
    subscribe_url: "https://music.apple.com",
    cancel_url: "https://support.apple.com/HT202039"
  },
  {
    nameKo: "플로",
    nameEn: "FLO",
    price: 8000,
    category: "Music",
    subscribe_url: "https://www.music-flo.com",
    cancel_url: "https://www.music-flo.com/mypage/voucher"
  },
  {
    nameKo: "벅스",
    nameEn: "Bugs",
    price: 7900,
    category: "Music",
    subscribe_url: "https://music.bugs.co.kr",
    cancel_url: "https://secure.bugs.co.kr/member/myinfo/use"
  },
  {
    nameKo: "바이브",
    nameEn: "VIBE",
    price: 8500,
    category: "Music",
    subscribe_url: "https://vibe.naver.com",
    cancel_url: "https://vibe.naver.com/membership/my"
  },
  {
    nameKo: "QQ뮤직",
    nameEn: "QQ Music",
    price: 5000,
    category: "Music",
    subscribe_url: "https://y.qq.com",
    cancel_url: "https://y.qq.com/portal/profile.html"
  },
  {
    nameKo: "이다지오",
    nameEn: "Idagio",
    price: 12500,
    verifiedAt: "2026-08-19",
    category: "Music",
    subscribe_url: "https://www.idagio.com",
    cancel_url: "https://app.idagio.com/account"
  },
  {
    nameKo: "냅스터",
    nameEn: "Napster",
    price: 10000,
    category: "Music",
    subscribe_url: "https://order.napster.com",
    cancel_url: "https://account.napster.com"
  },

  // ==========================================
  // 3. Shopping
  // ==========================================
  {
    nameKo: "쿠팡 와우",
    nameEn: "Coupang Wow",
    price: 7890,
    category: "Shopping",
    subscribe_url: "https://www.coupang.com",
    cancel_url: "https://www.coupang.com/np/my/wow"
  },
  {
    nameKo: "네이버 플러스",
    nameEn: "Naver Plus",
    price: 4900,
    category: "Shopping",
    subscribe_url: "https://plus.naver.com",
    cancel_url: "https://nid.naver.com/membership/my"
  },
  {
    nameKo: "네이버 플러스 (연간)",
    nameEn: "Naver Plus Yearly",
    price: 46800,
    category: "Shopping",
    billing_cycle: "yearly",
    subscribe_url: "https://plus.naver.com",
    cancel_url: "https://nid.naver.com/membership/my"
  },
  {
    nameKo: "신세계 유니버스",
    nameEn: "Universe Club",
    price: 30000,
    category: "Shopping",
    billing_cycle: "yearly",
    subscribe_url: "https://universe.gmarket.co.kr",
    cancel_url: "https://my.gmarket.co.kr/smileclub"
  },
  {
    nameKo: "컬리 멤버스",
    nameEn: "Kurly Members",
    price: 1900,
    category: "Shopping",
    subscribe_url: "https://www.kurly.com",
    cancel_url: "https://www.kurly.com/mypage/membership"
  },
  {
    nameKo: "우주패스 all",
    nameEn: "Universe Pass all",
    price: 9900,
    category: "Shopping",
    subscribe_url: "https://sktuniverse.tworld.co.kr",
    cancel_url: "https://sktuniverse.tworld.co.kr/my/pass"
  },
  {
    nameKo: "신세계 유니버스 (G마켓)",
    nameEn: "Smile Club",
    price: 30000,
    category: "Shopping",
    subscribe_url: "https://universe.gmarket.co.kr",
    cancel_url: "https://my.gmarket.co.kr/smileclub",
    billing_cycle: "yearly"
  },
  {
    nameKo: "롯데 ON 멤버십",
    nameEn: "Lotte ON",
    price: 2900,
    category: "Shopping",
    subscribe_url: "https://www.lotteon.com",
    cancel_url: "https://www.lotteon.com/mypage"
  },
  {
    nameKo: "코스트코 이그제큐티브",
    nameEn: "Costco Executive",
    price: 86000,
    category: "Shopping",
    subscribe_url: "https://www.costco.co.kr",
    cancel_url: "https://www.costco.co.kr/my-account",
    billing_cycle: "yearly",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "오아시스마켓",
    nameEn: "Oasis Market",
    price: 5000,
    category: "Shopping",
    subscribe_url: "https://www.oasis.co.kr",
    cancel_url: "https://www.oasis.co.kr/my"
  },
  {
    nameKo: "CU 구독 쿠폰",
    nameEn: "CU Subscription",
    price: 2000,
    category: "Shopping",
    subscribe_url: "https://pocketcu.co.kr",
    cancel_url: "https://pocketcu.co.kr/my"
  },
  {
    nameKo: "트레이더스 멤버십",
    nameEn: "Traders Membership",
    price: 30000,
    category: "Shopping",
    subscribe_url: "https://traders.ssg.com",
    cancel_url: "https://traders.ssg.com/mypage",
    billing_cycle: "yearly"
  },
  {
    nameKo: "올리브영 멤버십",
    nameEn: "Olive Young",
    price: 0,
    category: "Shopping",
    subscribe_url: "https://www.oliveyoung.co.kr",
    cancel_url: "https://www.oliveyoung.co.kr/store/mypage/getMyPage.do"
  },
  {
    nameKo: "무신사 현대카드",
    nameEn: "Musinsa Card",
    price: 10000,
    category: "Shopping",
    subscribe_url: "https://www.musinsa.com",
    cancel_url: "https://www.musinsa.com/mypage"
  },
  {
    nameKo: "29CM 멤버십",
    nameEn: "29CM Membership",
    price: 5000,
    category: "Shopping",
    subscribe_url: "https://www.29cm.co.kr",
    cancel_url: "https://www.29cm.co.kr/mypage"
  },
  {
    nameKo: "에이블리 멤버십",
    nameEn: "Ably",
    price: 3000,
    category: "Shopping",
    subscribe_url: "https://a-bly.com",
    cancel_url: "https://a-bly.com/mypage"
  },
  {
    nameKo: "지그재그 멤버십",
    nameEn: "Zigzag",
    price: 3000,
    category: "Shopping",
    subscribe_url: "https://zigzag.kr",
    cancel_url: "https://zigzag.kr/mypage"
  },
  {
    nameKo: "와인나라",
    nameEn: "Winenara",
    price: 15000,
    category: "Shopping",
    subscribe_url: "https://www.winenara.com",
    cancel_url: "https://www.winenara.com/mypage"
  },
  {
    nameKo: "토스 프라임",
    nameEn: "Toss Prime",
    price: 5900,
    category: "Shopping",
    subscribe_url: "https://toss.im/tossprime",
    cancel_url: "https://toss.im"
  },

  // ==========================================
  // 4. Work & AI
  // ==========================================
  {
    nameKo: "구글 AI 프로",
    nameEn: "Google AI Pro",
    price: 29000,
    category: "Work",
    subscribe_url: "https://gemini.google.com/advanced",
    cancel_url: "https://myaccount.google.com/subscriptions",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "구글 AI 울트라",
    nameEn: "Google AI Ultra",
    price: 119000,
    category: "Work",
    subscribe_url: "https://gemini.google.com/advanced",
    cancel_url: "https://myaccount.google.com/subscriptions",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "구글 AI 울트라 (20배)",
    nameEn: "Google AI Ultra 20x",
    price: 300000,
    verifiedAt: "2026-08-20",
    category: "Work",
    subscribe_url: "https://gemini.google.com/advanced",
    cancel_url: "https://myaccount.google.com/subscriptions"
  },
  {
    nameKo: "구글 AI 플러스 (400GB)",
    nameEn: "Google AI Plus 400GB",
    price: 7500,
    verifiedAt: "2026-08-20",
    category: "Work",
    subscribe_url: "https://gemini.google.com/advanced",
    cancel_url: "https://myaccount.google.com/subscriptions"
  },
  {
    nameKo: "제미나이 비즈니스",
    nameEn: "Gemini Business",
    price: 29000,
    category: "Work",
    subscribe_url: "https://workspace.google.com/solutions/ai/",
    cancel_url: "https://admin.google.com"
  },
  {
    nameKo: "제미나이 엔터프라이즈",
    nameEn: "Gemini Enterprise",
    price: 43000,
    category: "Work",
    subscribe_url: "https://workspace.google.com/solutions/ai/",
    cancel_url: "https://admin.google.com"
  },
  {
    nameKo: "제미나이 에듀케이션",
    nameEn: "Gemini Education",
    price: 29000,
    category: "Work",
    subscribe_url: "https://edu.google.com",
    cancel_url: "https://admin.google.com"
  },
  {
    nameKo: "챗GPT 고",
    nameEn: "ChatGPT Go",
    price: 13000,
    category: "Work",
    subscribe_url: "https://chatgpt.com",
    cancel_url: "https://chatgpt.com/#settings/Subscription",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "챗GPT 플러스",
    nameEn: "ChatGPT Plus",
    price: 29000,
    category: "Work",
    subscribe_url: "https://chatgpt.com",
    cancel_url: "https://chatgpt.com/#settings/Subscription",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "챗GPT 팀",
    nameEn: "ChatGPT Team",
    price: 42000,
    category: "Work",
    subscribe_url: "https://chatgpt.com",
    cancel_url: "https://chatgpt.com/#settings/Subscription"
  },
  {
    nameKo: "챗GPT 프로",
    nameEn: "ChatGPT Pro",
    price: 159000,
    category: "Work",
    subscribe_url: "https://chatgpt.com",
    cancel_url: "https://chatgpt.com/#settings/Subscription",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "클로드 프로",
    nameEn: "Claude Pro",
    priceUsd: 22,
    category: "Work",
    subscribe_url: "https://claude.ai",
    cancel_url: "https://claude.ai/settings/billing",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "클로드 맥스 5x",
    nameEn: "Claude Max 5x",
    priceUsd: 100,
    category: "Work",
    subscribe_url: "https://claude.ai",
    cancel_url: "https://claude.ai/settings/billing",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "클로드 맥스 20x",
    nameEn: "Claude Max 20x",
    priceUsd: 200,
    category: "Work",
    subscribe_url: "https://claude.ai",
    cancel_url: "https://claude.ai/settings/billing",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "클로드 팀 (Standard)",
    nameEn: "Claude Team Standard",
    priceUsd: 25,
    category: "Work",
    subscribe_url: "https://claude.ai",
    cancel_url: "https://claude.ai/settings/billing",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "클로드 팀 (Premium)",
    nameEn: "Claude Team Premium",
    priceUsd: 125,
    category: "Work",
    subscribe_url: "https://claude.ai",
    cancel_url: "https://claude.ai/settings/billing",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "퍼플렉시티 프로",
    nameEn: "Perplexity Pro",
    priceUsd: 20,
    category: "Work",
    subscribe_url: "https://www.perplexity.ai/pro",
    cancel_url: "https://www.perplexity.ai/settings/account",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "퍼플렉시티 프로 (연간)",
    nameEn: "Perplexity Pro Yearly",
    price: 290000,
    category: "Work",
    billing_cycle: "yearly",
    subscribe_url: "https://www.perplexity.ai/pro",
    cancel_url: "https://www.perplexity.ai/settings/account"
  },
  {
    nameKo: "깃허브 코파일럿",
    nameEn: "Github Copilot",
    priceUsd: 10,
    category: "Work",
    subscribe_url: "https://github.com/features/copilot",
    cancel_url: "https://github.com/settings/billing",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "깃허브 코파일럿 프로+",
    nameEn: "Github Copilot Pro Plus",
    priceUsd: 39,
    verifiedAt: "2026-08-20",
    category: "Work",
    subscribe_url: "https://github.com/features/copilot",
    cancel_url: "https://github.com/settings/billing"
  },
  {
    nameKo: "깃허브 코파일럿 맥스",
    nameEn: "Github Copilot Max",
    priceUsd: 100,
    verifiedAt: "2026-08-20",
    category: "Work",
    subscribe_url: "https://github.com/features/copilot",
    cancel_url: "https://github.com/settings/billing"
  },
  {
    nameKo: "깃허브 코파일럿 (연간)",
    nameEn: "Github Copilot Yearly",
    priceUsd: 100,
    category: "Work",
    billing_cycle: "yearly",
    subscribe_url: "https://github.com/features/copilot",
    cancel_url: "https://github.com/settings/billing",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "미드저니 베이직",
    nameEn: "Midjourney Basic",
    priceUsd: 10,
    category: "Work",
    subscribe_url: "https://www.midjourney.com",
    cancel_url: "https://www.midjourney.com/account",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "미드저니 베이직 (연간)",
    nameEn: "Midjourney Basic Yearly",
    price: 139000,
    category: "Work",
    billing_cycle: "yearly",
    subscribe_url: "https://www.midjourney.com",
    cancel_url: "https://www.midjourney.com/account"
  },
  {
    nameKo: "딥엘 프로 (개인)",
    nameEn: "DeepL Pro Individual",
    priceUsd: 10.49,
    category: "Work",
    subscribe_url: "https://www.deepl.com/pro",
    cancel_url: "https://www.deepl.com/account/subscription",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "어도비 CC 프로 (모든 앱)",
    nameEn: "Adobe Creative Cloud Pro",
    price: 78100,
    category: "Work",
    subscribe_url: "https://www.adobe.com/creativecloud/plans.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "어도비 CC 스탠다드 (신규)",
    nameEn: "Adobe Creative Cloud Standard",
    price: 61000,
    category: "Work",
    subscribe_url: "https://www.adobe.com/creativecloud/plans.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "어도비 포토샵 (단일 앱)",
    nameEn: "Adobe Photoshop Single",
    price: 30800,
    category: "Work",
    subscribe_url: "https://www.adobe.com/products/photoshop.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "어도비 일러스트레이터 (단일 앱)",
    nameEn: "Adobe Illustrator Single",
    price: 30800,
    category: "Work",
    subscribe_url: "https://www.adobe.com/products/illustrator.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "어도비 프리미어 프로 (단일 앱)",
    nameEn: "Adobe Premiere Pro Single",
    price: 30800,
    category: "Work",
    subscribe_url: "https://www.adobe.com/products/premiere.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "어도비 익스프레스 프리미엄",
    nameEn: "Adobe Express Premium",
    price: 13200,
    category: "Work",
    subscribe_url: "https://www.adobe.com/express/pricing",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "어도비 포토그래피 플랜",
    nameEn: "Adobe Photography Plan",
    price: 26400,
    category: "Work",
    subscribe_url: "https://www.adobe.com/creativecloud/photography.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "어도비 팀용 프로 (모든 앱)",
    nameEn: "Adobe CC Pro for Teams",
    price: 104000,
    category: "Work",
    subscribe_url: "https://www.adobe.com/creativecloud/business/teams.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "어도비 팀용 단일 앱",
    nameEn: "Adobe Single App for Teams",
    price: 44000,
    category: "Work",
    subscribe_url: "https://www.adobe.com/creativecloud/business/teams.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "애크로뱃 프로 (팀용)",
    nameEn: "Adobe Acrobat Pro for Teams",
    price: 29000,
    category: "Work",
    subscribe_url: "https://www.adobe.com/acrobat/pricing.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "어도비 CC 학생용 (첫해)",
    nameEn: "Adobe CC Student 1st Year",
    price: 21120,
    category: "Work",
    subscribe_url: "https://www.adobe.com/creativecloud/buy/students.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "어도비 CC 학생용 (갱신)",
    nameEn: "Adobe CC Student Renewal",
    price: 47300,
    category: "Work",
    subscribe_url: "https://www.adobe.com/creativecloud/buy/students.html",
    cancel_url: "https://account.adobe.com/plans"
  },
  {
    nameKo: "피그마 프로 (디자인)",
    nameEn: "Figma Professional Full",
    priceUsd: 20,
    category: "Work",
    subscribe_url: "https://www.figma.com/pricing/",
    cancel_url: "https://www.figma.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "피그마 프로 (디자인) (연간)",
    nameEn: "Figma Professional Yearly",
    priceUsd: 192,
    category: "Work",
    billing_cycle: "yearly",
    subscribe_url: "https://www.figma.com/pricing/",
    cancel_url: "https://www.figma.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "피그마 프로 (개발)",
    nameEn: "Figma Professional Dev",
    priceUsd: 15,
    category: "Work",
    subscribe_url: "https://www.figma.com/pricing/",
    cancel_url: "https://www.figma.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "피그마 프로 (협업)",
    nameEn: "Figma Professional Collab",
    priceUsd: 5,
    category: "Work",
    subscribe_url: "https://www.figma.com/pricing/",
    cancel_url: "https://www.figma.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "피그마 조직 (디자인)",
    nameEn: "Figma Organization Full",
    priceUsd: 55,
    category: "Work",
    subscribe_url: "https://www.figma.com/pricing/",
    cancel_url: "https://www.figma.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "피그마 조직 (개발)",
    nameEn: "Figma Organization Dev",
    priceUsd: 25,
    category: "Work",
    subscribe_url: "https://www.figma.com/pricing/",
    cancel_url: "https://www.figma.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "피그마 조직 (협업)",
    nameEn: "Figma Organization Collab",
    priceUsd: 5,
    category: "Work",
    subscribe_url: "https://www.figma.com/pricing/",
    cancel_url: "https://www.figma.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "피그마 엔터프라이즈 (디자인)",
    nameEn: "Figma Enterprise Full",
    priceUsd: 90,
    category: "Work",
    subscribe_url: "https://www.figma.com/pricing/",
    cancel_url: "https://www.figma.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "피그마 엔터프라이즈 (개발)",
    nameEn: "Figma Enterprise Dev",
    priceUsd: 35,
    category: "Work",
    subscribe_url: "https://www.figma.com/pricing/",
    cancel_url: "https://www.figma.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "피그마 엔터프라이즈 (협업)",
    nameEn: "Figma Enterprise Collab",
    priceUsd: 5,
    category: "Work",
    subscribe_url: "https://www.figma.com/pricing/",
    cancel_url: "https://www.figma.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "캔바 프로",
    nameEn: "Canva Pro",
    price: 14000,
    category: "Work",
    subscribe_url: "https://www.canva.com/pro/",
    cancel_url: "https://www.canva.com/settings/billing-and-teams"
  },
  {
    nameKo: "프레이머 프로",
    nameEn: "Framer Pro",
    price: 29873,
    category: "Work",
    subscribe_url: "https://www.framer.com/pricing/",
    cancel_url: "https://www.framer.com/account",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "웹플로우 베이직",
    nameEn: "Webflow Basic",
    priceUsd: 15,
    category: "Work",
    subscribe_url: "https://webflow.com/pricing",
    cancel_url: "https://webflow.com/dashboard/account/billing",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "엔바토 엘리먼츠 코어",
    nameEn: "Envato Elements Core",
    priceUsd: 16.5,
    category: "Work",
    subscribe_url: "https://elements.envato.com/pricing",
    cancel_url: "https://elements.envato.com/account",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "엔바토 엘리먼츠 플러스",
    nameEn: "Envato Elements Plus",
    priceUsd: 39,
    verifiedAt: "2026-08-20",
    category: "Work",
    subscribe_url: "https://elements.envato.com/pricing",
    cancel_url: "https://elements.envato.com/account"
  },
  {
    nameKo: "엔바토 엘리먼츠 얼티밋",
    nameEn: "Envato Elements Ultimate",
    priceUsd: 168,
    verifiedAt: "2026-08-20",
    category: "Work",
    subscribe_url: "https://elements.envato.com/pricing",
    cancel_url: "https://elements.envato.com/account"
  },
  {
    nameKo: "노션 플러스",
    nameEn: "Notion Plus",
    price: 14000,
    verifiedAt: "2026-08-19",
    category: "Work",
    subscribe_url: "https://www.notion.so/pricing",
    cancel_url: "https://www.notion.so/settings"
  },
  {
    nameKo: "노션 플러스 (연간)",
    nameEn: "Notion Plus Yearly",
    price: 144000,
    category: "Work",
    billing_cycle: "yearly",
    subscribe_url: "https://www.notion.so/pricing",
    cancel_url: "https://www.notion.so/settings"
  },
  {
    nameKo: "마이크로소프트 365 퍼스널",
    nameEn: "Microsoft 365 Personal",
    price: 12500,
    verifiedAt: "2026-08-19",
    category: "Work",
    subscribe_url: "https://www.microsoft.com/microsoft-365/buy/compare-all-microsoft-365-products",
    cancel_url: "https://account.microsoft.com/services"
  },
  {
    nameKo: "마이크로소프트 365 퍼스널 (연간)",
    nameEn: "Microsoft 365 Personal Yearly",
    price: 125000,
    verifiedAt: "2026-08-19",
    category: "Work",
    billing_cycle: "yearly",
    subscribe_url: "https://www.microsoft.com/microsoft-365/buy/compare-all-microsoft-365-products",
    cancel_url: "https://account.microsoft.com/services"
  },
  {
    nameKo: "슬랙 프로",
    nameEn: "Slack Pro",
    priceUsd: 8.75,
    category: "Work",
    subscribe_url: "https://slack.com/pricing",
    cancel_url: "https://my.slack.com/admin/billing",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "줌 프로",
    nameEn: "Zoom Pro",
    // 공식 페이지가 VAT 제외로 표기(19,833원)해 다른 원화 항목과 기준이 어긋나 있었다.
    // 실제 청구액에 맞춰 VAT 10% 를 더한 값으로 통일한다.
    price: 21816,
    category: "Work",
    subscribe_url: "https://zoom.us/pricing",
    cancel_url: "https://zoom.us/billing",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "미로 스타터",
    nameEn: "Miro Starter",
    priceUsd: 10,
    category: "Work",
    subscribe_url: "https://miro.com/pricing/",
    cancel_url: "https://miro.com/app/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "먼데이닷컴 베이직",
    nameEn: "Monday.com Basic",
    price: 13000,
    category: "Work",
    subscribe_url: "https://monday.com/pricing",
    cancel_url: "https://monday.com/billing"
  },
  {
    nameKo: "아사나 스타터",
    nameEn: "Asana Starter",
    price: 15951,
    category: "Work",
    subscribe_url: "https://asana.com/pricing",
    cancel_url: "https://app.asana.com/0/admin-console/billing",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "투두이스트 프로",
    nameEn: "Todoist Pro",
    priceUsd: 7,
    category: "Work",
    subscribe_url: "https://todoist.com/pricing",
    cancel_url: "https://todoist.com/app/settings/subscription",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "리니어 베이직",
    nameEn: "Linear Basic",
    priceUsd: 10,
    category: "Work",
    subscribe_url: "https://linear.app/pricing",
    cancel_url: "https://linear.app/settings/billing",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "레이캐스트 프로",
    nameEn: "Raycast Pro",
    priceUsd: 10,
    category: "Work",
    subscribe_url: "https://www.raycast.com/pro",
    cancel_url: "https://www.raycast.com/settings/billing",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "젯브레인 올 프로덕트 (연간)",
    nameEn: "JetBrains All Products Yearly",
    priceUsd: 719,
    category: "Work",
    subscribe_url: "https://www.jetbrains.com/all/",
    cancel_url: "https://account.jetbrains.com",
    billing_cycle: "yearly",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "재피어 프로페셔널",
    nameEn: "Zapier Professional",
    priceUsd: 29.99,
    category: "Work",
    subscribe_url: "https://zapier.com/pricing",
    cancel_url: "https://zapier.com/app/billing",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "그래머리 프로",
    nameEn: "Grammarly Pro",
    priceUsd: 12,
    category: "Work",
    subscribe_url: "https://www.grammarly.com/plans",
    cancel_url: "https://account.grammarly.com/subscription",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "넷리파이 퍼스널",
    nameEn: "Netlify Personal",
    priceUsd: 9,
    category: "Work",
    subscribe_url: "https://www.netlify.com/pricing/",
    cancel_url: "https://app.netlify.com/teams/billing",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "넷리파이 프로",
    nameEn: "Netlify Pro",
    priceUsd: 20,
    category: "Work",
    subscribe_url: "https://www.netlify.com/pricing/",
    cancel_url: "https://app.netlify.com/teams/billing",
    verifiedAt: "2026-08-19"
  },

  // ==========================================
  // 5. Cloud
  // ==========================================
  {
    nameKo: "구글 원 베이직 (100GB)",
    nameEn: "Google One Basic 100GB",
    price: 2400,
    category: "Cloud",
    subscribe_url: "https://one.google.com",
    cancel_url: "https://one.google.com/settings",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "구글 AI 플러스 (2TB)",
    nameEn: "Google AI Plus 2TB",
    price: 11900,
    category: "Cloud",
    subscribe_url: "https://one.google.com",
    cancel_url: "https://one.google.com/settings",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "아이클라우드+ 50GB",
    nameEn: "iCloud+ 50GB",
    price: 1100,
    category: "Cloud",
    subscribe_url: "https://www.icloud.com",
    cancel_url: "https://support.apple.com/HT202039",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "아이클라우드+ 200GB",
    nameEn: "iCloud+ 200GB",
    price: 4400,
    category: "Cloud",
    subscribe_url: "https://www.icloud.com",
    cancel_url: "https://support.apple.com/HT202039",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "아이클라우드+ 2TB",
    nameEn: "iCloud+ 2TB",
    price: 14000,
    category: "Cloud",
    subscribe_url: "https://www.icloud.com",
    cancel_url: "https://support.apple.com/HT202039",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "아이클라우드+ 6TB",
    nameEn: "iCloud+ 6TB",
    price: 44000,
    verifiedAt: "2026-08-20",
    category: "Cloud",
    subscribe_url: "https://www.icloud.com",
    cancel_url: "https://support.apple.com/HT202039"
  },
  {
    nameKo: "아이클라우드+ 12TB",
    nameEn: "iCloud+ 12TB",
    price: 88000,
    verifiedAt: "2026-08-20",
    category: "Cloud",
    subscribe_url: "https://www.icloud.com",
    cancel_url: "https://support.apple.com/HT202039"
  },
  {
    nameKo: "드롭박스 플러스",
    nameEn: "Dropbox Plus",
    price: 15000,
    verifiedAt: "2026-08-19",
    category: "Cloud",
    subscribe_url: "https://www.dropbox.com/plans",
    cancel_url: "https://www.dropbox.com/account/plan"
  },
  {
    nameKo: "원드라이브 100GB",
    nameEn: "OneDrive 100GB",
    price: 2900,
    category: "Cloud",
    subscribe_url: "https://www.microsoft.com/microsoft-365/onedrive/compare-onedrive-plans",
    cancel_url: "https://account.microsoft.com/services",
    verifiedAt: "2026-08-19"
  },
  {
    nameKo: "네이버 마이박스 80GB",
    nameEn: "Naver MYBOX",
    price: 1650,
    category: "Cloud",
    subscribe_url: "https://mybox.naver.com",
    cancel_url: "https://mybox.naver.com/about/membership"
  },
  {
    nameKo: "박스 프로",
    nameEn: "Box Pro",
    price: 12000,
    category: "Cloud",
    subscribe_url: "https://www.box.com/pricing",
    cancel_url: "https://app.box.com/account"
  },
  {
    nameKo: "테라박스 프리미엄",
    nameEn: "TeraBox Premium",
    price: 5000,
    category: "Cloud",
    subscribe_url: "https://www.terabox.com/vip",
    cancel_url: "https://www.terabox.com/vip"
  },
  {
    nameKo: "메가 프로",
    nameEn: "Mega Pro",
    price: 7000,
    category: "Cloud",
    subscribe_url: "https://mega.nz/pricing",
    cancel_url: "https://mega.nz/fm/account"
  },
  {
    nameKo: "피클라우드",
    nameEn: "pCloud",
    price: 7000,
    category: "Cloud",
    subscribe_url: "https://www.pcloud.com/cloud-storage-pricing-plans.html",
    cancel_url: "https://my.pcloud.com/#page=settings&tab=account"
  },
  {
    nameKo: "싱크닷컴",
    nameEn: "Sync.com",
    price: 11000,
    category: "Cloud",
    subscribe_url: "https://www.sync.com/pricing/",
    cancel_url: "https://cp.sync.com/account"
  },
  {
    nameKo: "백블레이즈",
    nameEn: "Backblaze",
    price: 9000,
    category: "Cloud",
    subscribe_url: "https://www.backblaze.com/cloud-backup.html",
    cancel_url: "https://secure.backblaze.com/billing.htm"
  },
  {
    nameKo: "아이드라이브",
    nameEn: "IDrive",
    price: 8000,
    category: "Cloud",
    subscribe_url: "https://www.idrive.com/pricing",
    cancel_url: "https://www.idrive.com/idrive/account"
  },
  {
    nameKo: "트레조릿",
    nameEn: "Tresorit",
    price: 15000,
    category: "Cloud",
    subscribe_url: "https://tresorit.com/pricing",
    cancel_url: "https://web.tresorit.com/admin/billing"
  },
  {
    nameKo: "데구",
    nameEn: "Degoo",
    price: 13000,
    category: "Cloud",
    subscribe_url: "https://degoo.com",
    cancel_url: "https://app.degoo.com/account"
  },
  {
    nameKo: "미디어파이어",
    nameEn: "MediaFire",
    price: 6000,
    category: "Cloud",
    subscribe_url: "https://www.mediafire.com/upgrade/",
    cancel_url: "https://www.mediafire.com/account"
  },
  {
    nameKo: "넥스트클라우드",
    nameEn: "Nextcloud",
    price: 5000,
    category: "Cloud",
    subscribe_url: "https://nextcloud.com",
    cancel_url: "https://nextcloud.com/account"
  },
  {
    nameKo: "어도비 클라우드",
    nameEn: "Adobe Cloud",
    price: 12000,
    category: "Cloud",
    subscribe_url: "https://www.adobe.com/creativecloud.html",
    cancel_url: "https://account.adobe.com/plans"
  },

  // ==========================================
  // 6. Etc & Life
  // ==========================================
  {
    nameKo: "배민클럽",
    nameEn: "Baemin Club",
    price: 3990,
    category: "Etc",
    subscribe_url: "https://www.baemin.com",
    cancel_url: "https://www.baemin.com"
  },
  {
    nameKo: "요기패스",
    nameEn: "Yogipass",
    price: 9900,
    category: "Etc",
    subscribe_url: "https://www.yogiyo.co.kr",
    cancel_url: "https://www.yogiyo.co.kr"
  },
  {
    nameKo: "쏘카 패스",
    nameEn: "Socar Pass",
    price: 14900,
    category: "Etc",
    subscribe_url: "https://www.socar.kr",
    cancel_url: "https://www.socar.kr/membership"
  },
  {
    nameKo: "밀리의 서재",
    nameEn: "Millies Library",
    price: 9900,
    category: "Etc",
    subscribe_url: "https://www.millie.co.kr",
    cancel_url: "https://www.millie.co.kr/v3/mypage/subscription"
  },
  {
    nameKo: "밀리의 서재 (연간)",
    nameEn: "Millies Library Yearly",
    price: 99000,
    category: "Etc",
    billing_cycle: "yearly",
    subscribe_url: "https://www.millie.co.kr",
    cancel_url: "https://www.millie.co.kr/v3/mypage/subscription"
  },
  {
    nameKo: "클래스101",
    nameEn: "Class101",
    price: 19900,
    category: "Etc",
    subscribe_url: "https://class101.net",
    cancel_url: "https://class101.net/ko/mypage/subscription"
  },
  {
    nameKo: "클래스101 (연간)",
    nameEn: "Class101 Yearly",
    price: 199000,
    category: "Etc",
    billing_cycle: "yearly",
    subscribe_url: "https://class101.net",
    cancel_url: "https://class101.net/ko/mypage/subscription"
  },
  {
    nameKo: "엑스박스 게임패스 에센셜",
    nameEn: "Xbox Game Pass Essential",
    price: 10800,
    category: "Etc",
    subscribe_url: "https://www.xbox.com/xbox-game-pass",
    cancel_url: "https://account.microsoft.com/services",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "엑스박스 게임패스 프리미엄",
    nameEn: "Xbox Game Pass Premium",
    price: 14900,
    verifiedAt: "2026-08-20",
    category: "Etc",
    subscribe_url: "https://www.xbox.com/ko-KR/xbox-game-pass",
    cancel_url: "https://account.microsoft.com/services"
  },
  {
    nameKo: "엑스박스 게임패스 얼티밋",
    nameEn: "Xbox Game Pass Ultimate",
    price: 19000,
    verifiedAt: "2026-08-20",
    category: "Etc",
    subscribe_url: "https://www.xbox.com/ko-KR/xbox-game-pass",
    cancel_url: "https://account.microsoft.com/services"
  },
  {
    nameKo: "엑스박스 게임패스 PC",
    nameEn: "Xbox Game Pass PC",
    price: 15500,
    verifiedAt: "2026-08-20",
    category: "Etc",
    subscribe_url: "https://www.xbox.com/ko-KR/xbox-game-pass",
    cancel_url: "https://account.microsoft.com/services"
  },
  {
    nameKo: "플스 플러스",
    nameEn: "PS Plus",
    price: 7500,
    category: "Etc",
    subscribe_url: "https://www.playstation.com/ps-plus",
    cancel_url: "https://store.playstation.com/account/subscriptions"
  },
  {
    nameKo: "플스 플러스 (연간)",
    nameEn: "PS Plus Yearly",
    price: 75000,
    category: "Etc",
    billing_cycle: "yearly",
    subscribe_url: "https://www.playstation.com/ps-plus",
    cancel_url: "https://store.playstation.com/account/subscriptions"
  },
  {
    nameKo: "닌텐도 온라인",
    nameEn: "Nintendo Online",
    price: 5900,
    verifiedAt: "2026-08-19",
    category: "Etc",
    subscribe_url: "https://www.nintendo.co.kr/switch/online",
    cancel_url: "https://ec.nintendo.com/my/membership"
  },
  {
    nameKo: "닌텐도 온라인 (연간)",
    nameEn: "Nintendo Online Yearly",
    price: 24900,
    verifiedAt: "2026-08-19",
    category: "Etc",
    billing_cycle: "yearly",
    subscribe_url: "https://www.nintendo.co.kr/switch/online",
    cancel_url: "https://ec.nintendo.com/my/membership"
  },
  {
    nameKo: "윌라",
    nameEn: "Willa",
    price: 12500,
    category: "Etc",
    subscribe_url: "https://www.welaaa.com",
    cancel_url: "https://www.welaaa.com/my/membership",
    verifiedAt: "2026-08-20"
  },
  {
    nameKo: "크레마클럽",
    nameEn: "Cremaclub",
    price: 5500,
    category: "Etc",
    subscribe_url: "https://bookclub.yes24.com",
    cancel_url: "https://bookclub.yes24.com/MyClub"
  },
  {
    nameKo: "교보문고 sam",
    nameEn: "Kyobo sam",
    price: 9900,
    category: "Etc",
    subscribe_url: "https://sam.kyobobook.co.kr",
    cancel_url: "https://sam.kyobobook.co.kr/my"
  },
  {
    nameKo: "런드리고",
    nameEn: "Laundrygo",
    price: 30000,
    category: "Etc",
    subscribe_url: "https://www.laundrygo.com",
    cancel_url: "https://www.laundrygo.com"
  },
  {
    nameKo: "와이즐리",
    nameEn: "Wisely",
    price: 8000,
    category: "Etc",
    subscribe_url: "https://www.wisely.com",
    cancel_url: "https://www.wisely.com/mypage"
  },
  {
    nameKo: "닥터노아",
    nameEn: "Dr. Noah",
    price: 3000,
    category: "Etc",
    subscribe_url: "https://doctornoah.net",
    cancel_url: "https://doctornoah.net/mypage"
  },
  {
    nameKo: "술담화",
    nameEn: "Suldamhwa",
    price: 39000,
    category: "Etc",
    subscribe_url: "https://www.sooldamhwa.com",
    cancel_url: "https://www.sooldamhwa.com/my"
  },
  {
    nameKo: "패스트캠퍼스",
    nameEn: "Fast Campus",
    price: 29000,
    category: "Etc",
    subscribe_url: "https://fastcampus.co.kr",
    cancel_url: "https://fastcampus.co.kr/mypage"
  },
  {
    nameKo: "어니스트플라워",
    nameEn: "Honest Flower",
    price: 15000,
    category: "Etc",
    subscribe_url: "https://honestflower.kr",
    cancel_url: "https://honestflower.kr/mypage"
  },
  {
    nameKo: "베이컨박스",
    nameEn: "Bacon Box",
    price: 34900,
    category: "Etc",
    subscribe_url: "https://baconbox.co",
    cancel_url: "https://baconbox.co/mypage"
  },

  // ==========================================
  // 7. Kakao
  // ==========================================
  {
    nameKo: "카카오톡 이모티콘 플러스",
    nameEn: "Emoticon Plus",
    price: 6900,
    category: "Etc",
    subscribe_url: "https://emoticon.kakao.com",
    cancel_url: "https://my.kakao.com"
  },
  {
    nameKo: "카카오톡 톡서랍 플러스 (100GB)",
    nameEn: "Talk Drawer Plus 100GB",
    price: 2500,
    category: "Cloud",
    subscribe_url: "https://drive.kakao.com",
    cancel_url: "https://my.kakao.com"
  },
  {
    nameKo: "카카오톡 톡서랍 플러스 (250GB)",
    nameEn: "Talk Drawer Plus 250GB",
    price: 4900,
    category: "Cloud",
    subscribe_url: "https://drive.kakao.com",
    cancel_url: "https://my.kakao.com"
  },
  {
    nameKo: "카카오톡 톡서랍 플러스 (1TB)",
    nameEn: "Talk Drawer Plus 1TB",
    price: 11900,
    category: "Cloud",
    subscribe_url: "https://drive.kakao.com",
    cancel_url: "https://my.kakao.com"
  },
  {
    nameKo: "카카오톡 광고 프리 (베이직)",
    nameEn: "KakaoTalk Ad-Free Basic",
    price: 2900,
    category: "Etc",
    subscribe_url: "https://kakao.com",
    cancel_url: "https://my.kakao.com"
  },
  {
    nameKo: "카카오톡 멤버십 (통합)",
    nameEn: "Kakao Universe Membership",
    price: 9900,
    category: "Etc",
    subscribe_url: "https://kakao.com",
    cancel_url: "https://my.kakao.com"
  }
]

// 달러로 청구되는 해외 서비스의 원화 환산 기준.
//
// 항목마다 환율을 적어 두면 값이 어긋난다. 실제로 클로드 팀은 1,740원/달러,
// 클로드 맥스는 1,450원/달러가 내포돼 있어 같은 회사 상품인데 가정이 달랐다.
// 환율이 바뀌면 이 상수 한 줄만 고치면 priceUsd 를 가진 항목이 전부 다시 계산된다.
//
// 기준: 월간 결제 정가. 연간 선결제 할인가는 조건부이므로 쓰지 않는다
// (연간 플랜은 "(연간)" 항목으로 따로 있다).
//
// 다만 공식 요금 페이지에 월간/연간 토글이 없고 값을 하나만 노출하는 곳
// (리니어 $10, 그래머리 $12, 엔바토 $16.50 등)은 그 노출값을 그대로 쓴다.
// 사용자가 그 페이지에서 실제로 보게 되는 숫자와 맞추는 쪽이 낫다고 판단했다.
export const USD_KRW = 1412
export const FX_BASE_DATE = '2026-08-19'

// 해외 전자적 용역(SaaS)에 붙는 부가가치세율.
//
// 해외 사업자의 요금 페이지에 적힌 달러 금액은 통상 세금 제외 표기이고, 한국 개인이
// 결제하면 부가가치세법 제53조의2에 따라 10%가 더 붙는다. 반면 원화 공식가로 적는
// 항목(넷플릭스, 챗GPT 등)은 총액표시제상 이미 VAT 가 포함된 값이다.
// 두 기준이 섞이면 카드 명세서와 대조할 때 달러 항목만 10% 낮게 보이므로,
// 여기서 VAT 를 더해 "실제 청구액" 기준으로 통일한다.
//
// 사업자등록번호를 등록한 B2B 결제는 면세되는 경우가 있으나, 이 앱은 개인 구독 관리를
// 전제로 하므로 B2C(과세) 기준을 따른다.
// 환율과 세금은 갱신 주기가 다르므로 USD_KRW 에 녹이지 않고 상수를 분리해 둔다.
export const OVERSEAS_VAT_RATE = 0.1

/**
 * 원화 공식가가 있는 서비스(넷플릭스, 챗GPT 등)는 `price` 를 직접 적는다(VAT 포함가).
 * 달러로만 청구되는 서비스는 `priceUsd` 에 세전 정가만 적고, 원화 환산과 VAT 가산은
 * 여기서 일괄 처리한다.
 */
export const SUBSCRIPTION_PRESETS = RAW_PRESETS.map((preset) =>
  preset.priceUsd == null
    ? preset
    : { ...preset, price: Math.round(preset.priceUsd * USD_KRW * (1 + OVERSEAS_VAT_RATE)) }
)

/**
 * 프리셋의 가격 기준일을 반환한다.
 * 실제로 검증한 날짜(`verifiedAt`)가 있으면 그 값을, 없으면 카탈로그 공통 기준일
 * (`PRICE_BASE_DATE`)을 반환한다.
 * @param {object} preset - SUBSCRIPTION_PRESETS 의 원소
 * @returns {string} 'YYYY-MM-DD' 형식의 기준일
 */
export function getPriceVerifiedAt(preset) {
  return preset?.verifiedAt ?? PRICE_BASE_DATE
}

/**
 * 가격 기준일이 오래된(=최근에 검증되지 않은) 프리셋 목록을 반환한다.
 * 가격 재검증이 필요한 항목을 뽑아볼 때 쓴다.
 * @param {number} [monthsThreshold=6] - 이 개월 수보다 기준일이 오래되면 "오래됨"으로 간주
 * @param {Date} [now] - 기준 시각. 테스트 등에서 주입 가능하도록 선택 인자로 둔다. 기본값은 현재 시각.
 * @returns {object[]} 임계치보다 기준일이 오래된 프리셋 배열
 */
export function listStalePresets(monthsThreshold = 6, now = new Date()) {
  const threshold = new Date(now)
  threshold.setMonth(threshold.getMonth() - monthsThreshold)

  return SUBSCRIPTION_PRESETS.filter((preset) => {
    const verifiedAt = new Date(getPriceVerifiedAt(preset))
    return verifiedAt < threshold
  })
}

/**
 * 서비스명 기반 공식 링크(구독 페이지, 해지/관리 페이지) 매칭 헬퍼 함수
 * @param {string} serviceName - 검색할 서비스명
 * @returns {{ subscribe_url: string|null, cancel_url: string|null }}
 */
export function getServiceLinks(serviceName) {
  if (!serviceName || typeof serviceName !== 'string') {
    return { subscribe_url: null, cancel_url: null }
  }

  const normalized = serviceName.trim().toLowerCase()
  const found = SUBSCRIPTION_PRESETS.find(p => 
    p.nameKo.toLowerCase().includes(normalized) ||
    p.nameEn.toLowerCase().includes(normalized) ||
    normalized.includes(p.nameKo.toLowerCase()) ||
    normalized.includes(p.nameEn.toLowerCase())
  )

  if (found) {
    return {
      subscribe_url: found.subscribe_url || null,
      cancel_url: found.cancel_url || null
    }
  }

  return { subscribe_url: null, cancel_url: null }
}

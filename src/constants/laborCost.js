// 구독료를 "돈"이 아니라 "노동 시간"으로 환산하기 위한 기준값들.
// 물건 비유(캠핑카, 명품)는 애초에 살 생각이 없던 사람에게는 상실감이 생기지 않아
// 누구에게나 동일하게 아픈 단위인 '내가 일한 시간'으로 프레임을 바꾼다.

// 2026년 적용 최저임금 (고용노동부 고시, 2026.1.1 ~ 12.31)
// 매년 바뀌므로 연 1회 hourly/year만 갱신하면 전체 계산이 따라온다.
export const MINIMUM_WAGE = { year: 2026, hourly: 10320 }

// 근로기준법상 월 소정근로시간(주 40시간 + 주휴시간). 월급 <-> 시급 환산의 표준값.
export const MONTHLY_WORK_HOURS = 209
// 1일 소정근로시간. "며칠 일한 셈"의 기준.
export const DAILY_WORK_HOURS = 8

export const monthlyToHourly = (monthlyPay) => Math.round(monthlyPay / MONTHLY_WORK_HOURS)

// "월 소득을 입력하세요" 빈 칸은 장벽이 높아 탭 한 번으로 끝나는 프리셋으로 제공한다.
export const WAGE_PRESETS = [
  {
    id: 'minimum',
    label: '최저시급',
    hourly: MINIMUM_WAGE.hourly,
    basisLabel: '최저시급 기준'
  },
  {
    id: 'm250',
    label: '월 250만',
    hourly: monthlyToHourly(2500000),
    basisLabel: '월 250만원 기준'
  },
  {
    id: 'm350',
    label: '월 350만',
    hourly: monthlyToHourly(3500000),
    basisLabel: '월 350만원 기준'
  },
  {
    id: 'm500',
    label: '월 500만',
    hourly: monthlyToHourly(5000000),
    basisLabel: '월 500만원 기준'
  }
]

export const DEFAULT_WAGE_PRESET_ID = 'minimum'

export const getWagePreset = (presetId) =>
  WAGE_PRESETS.find((p) => p.id === presetId) || WAGE_PRESETS[0]

// 저장된 시급이 없으면 최저시급으로 폴백한다.
// 기준을 모를 때는 항상 적게 잡는 쪽으로 — 과장했다 들키면 경고 하나가 아니라
// 리포트 전체의 신뢰가 무너진다.
export const resolveHourlyWage = (hourlyWage) =>
  hourlyWage && hourlyWage > 0 ? hourlyWage : MINIMUM_WAGE.hourly

const round1 = (n) => Math.round(n * 10) / 10

/**
 * 금액을 노동 시간으로 환산한다.
 * @param {number} amount 원 단위 금액
 * @param {number|null} hourlyWage 사용자가 고른 기준 시급 (없으면 최저시급)
 */
export const toWorkTime = (amount, hourlyWage) => {
  const wage = resolveHourlyWage(hourlyWage)
  const hours = amount / wage
  return {
    wage,
    hours,
    days: hours / DAILY_WORK_HOURS,
    months: hours / MONTHLY_WORK_HOURS
  }
}

// 큰 단위부터 골라 "131일" / "5개월"처럼 한 가지 단위로만 보여준다.
const formatDuration = ({ hours, days, months }) => {
  if (months >= 12) {
    const years = round1(months / 12)
    return `${years}년`
  }
  if (days >= 26) return `${round1(months)}개월`
  if (hours >= DAILY_WORK_HOURS) return `${round1(days)}일`
  if (hours >= 1) return `${round1(hours)}시간`
  return `${Math.max(1, Math.round(hours * 60))}분`
}

/**
 * 누적 금액을 "며칠치 노동인가"로 바꿔 카드/모달에 쓸 문구를 만든다.
 */
export const buildWorkCost = (amount, hourlyWage) => {
  const time = toWorkTime(amount, hourlyWage)
  const { days, months } = time
  const duration = formatDuration(time)

  if (amount <= 0) {
    return {
      ...time,
      duration: '0시간',
      icon: '🌱',
      headline: '아직 일해서 갚을 구독료가 없어요',
      message: '현재 정기 결제 중인 구독 서비스가 없습니다.'
    }
  }

  let icon = '⏱️'
  let message = ''

  if (days < 1) {
    icon = '⏱️'
    message = `커피 한 잔 마실 틈 없이 ${duration}을 꼬박 일해야 나오는 돈이에요.`
  } else if (days < 3) {
    icon = '📆'
    message = `${duration}치 일당이 통째로 빠져나간 셈이에요.`
  } else if (days < 10) {
    icon = '📆'
    message = `오직 구독료를 벌기 위해 ${duration}을 출근한 셈이에요.`
  } else if (days < 26) {
    icon = '🗓️'
    message = `${duration}을 꼬박 무급으로 일한 것과 같은 금액이에요.`
  } else if (months < 6) {
    icon = '🗓️'
    message = `${duration}치 월급이 구독료로 증발했습니다.`
  } else if (months < 12) {
    icon = '😵'
    message = `${duration}, 반년 넘게 무급으로 일한 것과 같아요.`
  } else if (months < 24) {
    icon = '😱'
    message = `${duration}을 오롯이 구독료 벌이에만 바친 셈이에요.`
  } else {
    icon = '🚨'
    message = `${duration}치 노동이 구독료로 통째로 사라졌습니다.`
  }

  return {
    ...time,
    duration,
    icon,
    headline: `${duration}치 근무 시간`,
    message
  }
}

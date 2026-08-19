import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  // Remove <, >, ", ', ` to prevent basic XSS and injection
  return input.replace(/[<>"'`]/g, '')
}

/**
 * 한글 받침(종성) 유무 확인
 */
export function hasJongseong(word) {
  if (!word || typeof word !== 'string') return false
  const trimmed = word.trim()
  if (!trimmed) return false
  const lastChar = trimmed.slice(-1)
  const code = lastChar.charCodeAt(0)

  // 한글 음절 유니코드 범위 (가 ~ 힣)
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 > 0
  }

  // 끝 글자가 숫자인 경우
  if (/[013678]$/.test(trimmed)) return true
  if (/[2459]$/.test(trimmed)) return false

  // 끝 글자가 영문인 경우 간이 판별 (받침 소리가 나는 자음)
  if (/[lmnrkptcb]$/i.test(trimmed)) return true

  return false
}

/**
 * 조사 자동 결합 헬퍼 함수
 * @param {string} word - 대상 단어
 * @param {'을/를'|'이/가'|'은/는'|'과/와'|'으로/로'} particle - 붙일 조사 쌍
 */
export function attachParticle(word, particle) {
  if (!word) return ''
  const hasJong = hasJongseong(word)
  if (particle === '을/를') return `${word}${hasJong ? '을' : '를'}`
  if (particle === '이/가') return `${word}${hasJong ? '이' : '가'}`
  if (particle === '은/는') return `${word}${hasJong ? '은' : '는'}`
  if (particle === '과/와') return `${word}${hasJong ? '과' : '와'}`
  if (particle === '으로/로') {
    const lastChar = word.trim().slice(-1)
    const code = lastChar.charCodeAt(0)
    // 한글 중 ㄹ 받침인 경우 '로' 결합
    if (code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 === 8) {
      return `${word}로`
    }
    return `${word}${hasJong ? '으로' : '로'}`
  }
  return word
}


/**
 * 모달 배경(딤 영역)을 눌렀을 때만 닫기 위한 핸들러를 만든다.
 *
 * click 이 아니라 mousedown 을 보는 이유: 모달 안에서 드래그로 텍스트를 선택하다
 * 배경에서 손을 떼면 click 은 두 지점의 공통 조상인 배경에서 발생해, 글자를 긁기만
 * 해도 모달이 닫힌다. mousedown 은 실제로 누른 지점에서만 발생해 이 오작동이 없다.
 *
 * 내부 패널에 stopPropagation 을 거는 방식 대신 target === currentTarget 을 쓰는 이유:
 * 전파를 막으면 패널 안의 이벤트를 통째로 삼켜 다른 기능과 충돌할 수 있다.
 *
 * @param {() => void} onClose 배경을 눌렀을 때 실행할 닫기 동작
 */
export const createBackdropClose = (onClose) => (e) => {
  if (e.target === e.currentTarget) onClose()
}

/**
 * 모바일에서 모달은 히스토리 항목을 하나 push 해 두고 뒤로가기로 닫는다
 * (SubscriptionModal / PromoteModal 참고). 배경 클릭으로 닫을 때도 같은 경로를 타야
 * push 해 둔 항목이 남아 뒤로가기 한 번을 잡아먹는 일이 없다.
 *
 * 모달이 열려 있는 동안 모바일에서는 항상 push 된 상태이므로 별도 플래그 없이 판단한다.
 */
export const closeModalViaHistory = (onClose) => {
  if (window.innerWidth < 768) window.history.back()
  else onClose()
}

import useSubscriptionStore from '../store/useSubscriptionStore'

/**
 * Vibration API 기반 햅틱 피드백.
 *
 * 안드로이드 크롬/삼성인터넷 계열(설치형 PWA 포함)에서만 실제로 울린다.
 * iOS Safari 에는 API 자체가 없어 조용히 무시된다 — 숨긴 스위치 input 을 눌러
 * 시스템 햅틱을 유도하는 우회책은 iOS 버전에 따라 언제 깨질지 알 수 없어 쓰지 않는다.
 *
 * 남용하면 오히려 싸구려로 느껴지므로 탭 전환 / 저장 완료 / 되돌리기 어려운 동작에만 건다.
 */

export const HAPTIC = {
  tap: 15,               // 탭 전환처럼 "눌렸다"만 알리는 최소 신호. 10ms 는 LRA 모터에서 인지가 어렵다
  success: 18,           // 저장·추가 완료
  warning: [12, 40, 12], // 삭제처럼 되돌리기 어려운 동작
}

/**
 * 진동이 실제로 가능한 기기인지 판별.
 *
 * 데스크톱 크롬도 navigator.vibrate 를 노출하지만 하드웨어가 없어 아무 일도 일어나지 않는다.
 * 설정 화면에 의미 없는 토글이 뜨지 않도록 터치 지원 여부를 함께 본다.
 */
export function isHapticsSupported() {
  if (typeof navigator === 'undefined') return false
  return typeof navigator.vibrate === 'function' && navigator.maxTouchPoints > 0
}

/**
 * @param {number|number[]} pattern HAPTIC 프리셋 또는 vibrate 패턴
 */
export function haptic(pattern = HAPTIC.tap) {
  if (!isHapticsSupported()) return false
  if (!useSubscriptionStore.getState().hapticsEnabled) return false

  try {
    // 사용자 제스처 없이 호출되면 브라우저가 무시하고 false 를 돌려준다(예외는 아님).
    return navigator.vibrate(pattern)
  } catch {
    return false
  }
}

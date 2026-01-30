import { useState, useEffect } from 'react'
import useSubscriptionStore from '../store/useSubscriptionStore'

export function useEffectiveTheme() {
  const themeMode = useSubscriptionStore((state) => state.themeMode) || 'system'
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const update = () => {
      const systemDark = mediaQuery.matches
      const effectiveDark = themeMode === 'dark' || (themeMode === 'system' && systemDark)
      setIsDark(effectiveDark)
    }

    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [themeMode])

  return isDark
}

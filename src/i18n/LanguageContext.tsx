// ─── i18n/LanguageContext.tsx ─────────────────────────────────────────────────
// URL-based language detection: /th/* = Thai, everything else = English
// Provides langPath() and switchLangPath() helpers for navigation

import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { Lang } from './translations'

interface LanguageContextType {
  lang: Lang
  /** Prefix path with language segment.
   *  en: /services  →  /services
   *  th: /services  →  /th/services
   */
  langPath: (path: string) => string
  /** Returns the current page URL in the alternate language. */
  switchLangPath: () => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  langPath: (p) => p,
  switchLangPath: () => '/',
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  const value = useMemo<LanguageContextType>(() => {
    // Detect Thai: URL is exactly /th or starts with /th/
    const isThai = pathname === '/th' || pathname.startsWith('/th/')
    const lang: Lang = isThai ? 'th' : 'en'

    function langPath(path: string): string {
      const normalized = path.startsWith('/') ? path : `/${path}`
      if (lang === 'th') {
        return normalized === '/' ? '/th' : `/th${normalized}`
      }
      return normalized
    }

    function switchLangPath(): string {
      if (lang === 'en') {
        // English → Thai: prepend /th
        return pathname === '/' ? '/th' : `/th${pathname}`
      } else {
        // Thai → English: strip /th prefix
        const withoutPrefix = pathname.replace(/^\/th/, '') || '/'
        return withoutPrefix
      }
    }

    return { lang, langPath, switchLangPath }
  }, [pathname])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext)
}

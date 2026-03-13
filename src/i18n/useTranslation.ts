import { useLanguage } from './LanguageContext'
import { translations } from './translations'

export function useTranslation() {
  const { lang } = useLanguage()
  return { t: translations[lang], lang }
}

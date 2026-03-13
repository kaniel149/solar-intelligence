// ─── i18n/index.ts ────────────────────────────────────────────────────────────
// Barrel: re-export everything consumers need from a single import path

export type { Lang, Translations } from './translations'
export { translations } from './translations'
export { LanguageProvider, useLanguage } from './LanguageContext'
export { useTranslation } from './useTranslation'

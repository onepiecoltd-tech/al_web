// Curated learning languages offered in the UI. The backend accepts any
// plausible code, so this list can grow without server changes.
export interface Language {
  code: string
  label: string
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'Tiếng Anh' },
  { code: 'zh', label: 'Tiếng Trung' },
  { code: 'ko', label: 'Tiếng Hàn' },
  { code: 'ja', label: 'Tiếng Nhật' },
  { code: 'fr', label: 'Tiếng Pháp' },
  { code: 'de', label: 'Tiếng Đức' },
]

export function languageLabel(code: string): string {
  return LANGUAGES.find(l => l.code === code)?.label ?? code.toUpperCase()
}

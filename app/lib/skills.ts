// The four language skills. `label` is what's stored in exam.type (set by the
// AI on upload), so list filtering compares against the label.
export interface Skill {
  code: 'listening' | 'reading' | 'writing' | 'speaking'
  label: string
}

export const SKILLS: Skill[] = [
  { code: 'listening', label: 'Nghe' },
  { code: 'reading', label: 'Đọc' },
  { code: 'writing', label: 'Viết' },
  { code: 'speaking', label: 'Nói' },
]

export function skillLabel(code: string): string {
  return SKILLS.find(s => s.code === code)?.label ?? code
}

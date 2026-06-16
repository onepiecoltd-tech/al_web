export type AvatarColor = 'son' | 'reu' | 'gold' | 'ink'

export interface Source { type: string; name: string; chars: string; when: string; state: 'ready' | 'reading' }

export const SOURCES: Source[] = [
  { type: 'PDF', name: 'Cambridge IELTS 18 — Test 2.pdf', chars: '5.842', when: '3 phút trước', state: 'ready' },
  { type: 'DOCX', name: 'TOEIC Part 5 — tổng hợp.docx', chars: '3.120', when: 'đang trích xuất…', state: 'reading' },
  { type: 'TXT', name: 'Academic word list.txt', chars: '1.980', when: 'hôm qua', state: 'ready' },
]

export interface AdminReport {
  what: string; who: string; type: string; when: string; sev: 'err' | 'warn'
}

export const A_REPORTS: AdminReport[] = [
  { what: 'Bình luận xúc phạm trong bài "TOEIC 900+"', who: 'Nam', type: 'Bình luận', when: '12 phút', sev: 'err' },
  { what: 'Spam link trong chat phòng nhóm', who: 'ẩn danh', type: 'Chat', when: '1 giờ', sev: 'warn' },
  { what: 'Nội dung không phù hợp trong livestream', who: 'Phúc', type: 'Livestream', when: '3 giờ', sev: 'err' },
  { what: 'Bài blog nghi sao chép', who: 'Quỳnh', type: 'Blog', when: 'hôm qua', sev: 'warn' },
]

// Shared reactive app state (messenger overlay, offline).
const messengerOpen = ref(false)
const offline = ref(false)

export function useLnApp() {
  return { messengerOpen, offline }
}

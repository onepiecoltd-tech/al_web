export type AvatarColor = 'son' | 'reu' | 'gold' | 'ink'

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

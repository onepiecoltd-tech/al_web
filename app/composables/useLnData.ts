// LuyệnNgữ — shared mock data for the prototype (ported from app/data.jsx)

export type AvatarColor = 'son' | 'reu' | 'gold' | 'ink'
export type Presence = 'online' | 'busy' | 'away' | 'offline'

export interface Friend { name: string; color: AvatarColor; status: Presence; msg: string; elo: number }
export interface RankRow { name: string; color: AvatarColor; elo: number; w: number; delta: string; me?: boolean }
export interface Gift { em: string; nm: string; p: number }
export interface Source { type: string; name: string; chars: string; when: string; state: 'ready' | 'reading' }
export interface BlogEntry { title: string; cat: string; author: string; date: string; reads: string; excerpt: string; comments: number }
export interface Notif { type: string; ic: string; text: string; when: string; tone: 'son' | 'error' | 'gold' | 'reu' }

export const ME = {
  name: 'Minh Anh', handle: '@minhanh', plan: 'Pro', coins: 1240,
  elo: 1482, rank: 'Vàng', streak: 12, joined: 'Tháng 3, 2026',
}

export const FRIENDS: Friend[] = [
  { name: 'Thu Hà', color: 'son', status: 'online', msg: 'Sẵn sàng luyện đề ✦', elo: 1455 },
  { name: 'Khánh', color: 'reu', status: 'busy', msg: 'Đang thi đấu', elo: 1521 },
  { name: 'Nam', color: 'gold', status: 'away', msg: 'Ăn trưa, lát quay lại', elo: 1310 },
  { name: 'Linh', color: 'ink', status: 'offline', msg: '', elo: 1402 },
  { name: 'Phúc', color: 'reu', status: 'offline', msg: '', elo: 1288 },
]

export const LEADERBOARD: RankRow[] = [
  { name: 'Khánh', color: 'reu', elo: 1521, w: 48, delta: '+12' },
  { name: 'Minh Anh', color: 'son', elo: 1482, w: 41, delta: '+8', me: true },
  { name: 'Linh', color: 'ink', elo: 1402, w: 33, delta: '−4' },
  { name: 'Thu Hà', color: 'son', elo: 1455, w: 39, delta: '+15' },
  { name: 'Phúc', color: 'reu', elo: 1288, w: 21, delta: '+2' },
  { name: 'Nam', color: 'gold', elo: 1310, w: 25, delta: '−7' },
].sort((a, b) => b.elo - a.elo)

export const GIFTS: Gift[] = [
  { em: '🌹', nm: 'Hồng', p: 10 }, { em: '👏', nm: 'Vỗ tay', p: 15 }, { em: '❤️', nm: 'Tim', p: 20 },
  { em: '🔥', nm: 'Lửa', p: 30 }, { em: '🎓', nm: 'Tốt nghiệp', p: 60 }, { em: '🏆', nm: 'Cúp', p: 120 }, { em: '💎', nm: 'Kim cương', p: 500 },
]

export const SOURCES: Source[] = [
  { type: 'PDF', name: 'Cambridge IELTS 18 — Test 2.pdf', chars: '5.842', when: '3 phút trước', state: 'ready' },
  { type: 'DOCX', name: 'TOEIC Part 5 — tổng hợp.docx', chars: '3.120', when: 'đang trích xuất…', state: 'reading' },
  { type: 'TXT', name: 'Academic word list.txt', chars: '1.980', when: 'hôm qua', state: 'ready' },
]

export const BLOG: BlogEntry[] = [
  { title: 'Chiến thuật Part 2 IELTS: kể chuyện theo khung 4 ý', cat: 'IELTS Speaking', author: 'Thu Hà', date: '08/06', reads: '1.2k', excerpt: 'Cách biến 4 gạch đầu dòng của cue card thành một câu chuyện 2 phút mạch lạc, có mở–thân–kết và từ nối tự nhiên.', comments: 14 },
  { title: 'Vì sao luyện đề từ chính tài liệu của bạn hiệu quả hơn', cat: 'Phương pháp', author: 'Minh Anh', date: '06/06', reads: '860', excerpt: 'Tải nguồn đề của riêng bạn, để AI sinh câu hỏi sát ngữ cảnh — ghi nhớ theo bối cảnh thật thay vì học vẹt.', comments: 9 },
  { title: 'TOEIC 900+: lịch luyện 6 tuần kèm mốc ELO thách đấu', cat: 'TOEIC', author: 'Khánh', date: '02/06', reads: '2.4k', excerpt: 'Lộ trình kết hợp làm đề ngân hàng, thách đấu người lạ để giữ nhịp, và đo tiến bộ qua ELO mỗi tuần.', comments: 23 },
]

export const NOTIFS: Notif[] = [
  { type: 'invite', ic: 'swords', text: 'Khánh mời bạn vào một trận thách đấu', when: '2 phút', tone: 'son' },
  { type: 'go_live', ic: 'radio', text: 'Thu Hà đang livestream một trận đấu', when: '15 phút', tone: 'error' },
  { type: 'gift', ic: 'gift', text: 'Bạn nhận 🏆 từ Nam trong buổi live', when: '1 giờ', tone: 'gold' },
  { type: 'friend', ic: 'user-plus', text: 'Linh đã chấp nhận lời mời kết bạn', when: 'hôm qua', tone: 'reu' },
]

// ── Admin (ported from app/admin.jsx) ───────────────────────────

export interface AdminUser {
  name: string; handle: string; email: string; plan: 'Pro' | 'Free'
  elo: number; status: 'active' | 'banned'; joined: string
  role: 'user' | 'mod'; color: AvatarColor
}
export interface AdminExam {
  name: string; type: string; q: number; by: string
  state: 'published' | 'review' | 'draft'; date: string
}
export interface AdminReport {
  what: string; who: string; type: string; when: string; sev: 'err' | 'warn'
}
export interface AdminTxn {
  user: string; kind: string; amt: string; vnd: string
  method: string; when: string; ok: boolean
}

export const A_USERS: AdminUser[] = [
  { name: 'Minh Anh', handle: '@minhanh', email: 'minhanh@email.com', plan: 'Pro', elo: 1482, status: 'active', joined: '03/2026', role: 'user', color: 'son' },
  { name: 'Khánh', handle: '@khanh', email: 'khanh@email.com', plan: 'Pro', elo: 1521, status: 'active', joined: '01/2026', role: 'user', color: 'reu' },
  { name: 'Thu Hà', handle: '@thuha', email: 'thuha@email.com', plan: 'Free', elo: 1455, status: 'active', joined: '02/2026', role: 'mod', color: 'son' },
  { name: 'Linh', handle: '@linh', email: 'linh@email.com', plan: 'Free', elo: 1402, status: 'active', joined: '04/2026', role: 'user', color: 'ink' },
  { name: 'Nam', handle: '@nam', email: 'nam@email.com', plan: 'Free', elo: 1310, status: 'banned', joined: '05/2026', role: 'user', color: 'gold' },
  { name: 'Phúc', handle: '@phuc', email: 'phuc@email.com', plan: 'Free', elo: 1288, status: 'active', joined: '05/2026', role: 'user', color: 'reu' },
  { name: 'Quỳnh', handle: '@quynh', email: 'quynh@email.com', plan: 'Pro', elo: 1390, status: 'active', joined: '04/2026', role: 'user', color: 'son' },
]

export const A_EXAMS: AdminExam[] = [
  { name: 'Cambridge IELTS 18 — Full', type: 'IELTS', q: 200, by: 'Admin', state: 'published', date: '02/06' },
  { name: 'TOEIC ETS 2024 — Test 5', type: 'TOEIC', q: 200, by: 'Admin', state: 'published', date: '28/05' },
  { name: 'Academic Word List drills', type: 'Từ vựng', q: 120, by: 'Thu Hà', state: 'review', date: 'hôm nay' },
  { name: 'TOEFL Reading set A', type: 'TOEFL', q: 60, by: 'Khánh', state: 'review', date: 'hôm qua' },
  { name: 'IELTS Speaking forecast Q2', type: 'IELTS', q: 45, by: 'Admin', state: 'draft', date: '30/05' },
]

export const A_REPORTS: AdminReport[] = [
  { what: 'Bình luận xúc phạm trong bài "TOEIC 900+"', who: 'Nam', type: 'Bình luận', when: '12 phút', sev: 'err' },
  { what: 'Spam link trong chat phòng nhóm', who: 'ẩn danh', type: 'Chat', when: '1 giờ', sev: 'warn' },
  { what: 'Nội dung không phù hợp trong livestream', who: 'Phúc', type: 'Livestream', when: '3 giờ', sev: 'err' },
  { what: 'Bài blog nghi sao chép', who: 'Quỳnh', type: 'Blog', when: 'hôm qua', sev: 'warn' },
]

export const A_TXNS: AdminTxn[] = [
  { user: 'Minh Anh', kind: 'Nạp xu', amt: '+600 xu', vnd: '₫50.000', method: 'PayOS', when: '21:14', ok: true },
  { user: 'Khánh', kind: 'Gói Pro', amt: '30 ngày', vnd: '₫50.000', method: 'PayOS', when: '20:02', ok: true },
  { user: 'Quỳnh', kind: 'Nạp xu', amt: '+1.300 xu', vnd: '₫100.000', method: 'PayOS', when: '18:40', ok: true },
  { user: 'Nam', kind: 'Nạp xu', amt: '+230 xu', vnd: '₫20.000', method: 'PayOS', when: '16:11', ok: false },
]

// Shared reactive app state (messenger overlay, offline).
// Auth lives in the Pinia store (useAuthStore); coins in useWallet().
const messengerOpen = ref(false)
const offline = ref(false)

export function useLnApp() {
  return { messengerOpen, offline }
}

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

// Shared reactive app state (coins, auth, messenger overlay, offline).
const coins = ref(ME.coins)
const authed = ref(true)
const messengerOpen = ref(false)
const offline = ref(false)

export function useLnApp() {
  return { coins, authed, messengerOpen, offline }
}

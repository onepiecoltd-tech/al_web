// Shapes returned by the Nitro BFF routes (mirror the Go API).

export interface Profile {
  id: string
  email: string
  name: string
  handle: string
  plan: string
  coins: number
  elo: number
  rank: string
  streak: number
  role: 'user' | 'mod' | 'admin'
  joined: string
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PageMeta
}

export interface AdminUser {
  id: string
  name: string
  handle: string
  email: string
  plan: string
  elo: number
  role: 'user' | 'mod' | 'admin'
  status: 'active' | 'banned'
  joined: string
}

export interface AdminExam {
  id: string
  name: string
  type: string
  questions: number
  author: string
  state: 'published' | 'review' | 'draft'
  created_at: string
}

export interface AdminReport {
  id: string
  content: string
  reporter: string
  type: string
  severity: 'err' | 'warn'
  status: 'open' | 'resolved'
  action: string
  created_at: string
}

export interface AdminSetting {
  key: string
  label: string
  value: boolean
  updated_at: string
}

export interface Gift {
  id: string
  emoji: string
  name: string
  price: number
}

export interface Notification {
  id: string
  type: string
  icon: string
  text: string
  tone: 'son' | 'error' | 'gold' | 'reu'
  read: boolean
  created_at: string
}

export type Presence = 'online' | 'busy' | 'away' | 'offline'

export interface Friend {
  id: string
  name: string
  handle: string
  elo: number
  presence: Presence
  msg: string
}

export interface LeaderboardRow {
  id: string
  name: string
  handle: string
  elo: number
  wins: number
  me: boolean
}

export interface BlogPost {
  id: string
  title: string
  category: string
  author: string
  excerpt: string
  body: string
  reads: number
  comments: number
  status: 'published' | 'review' | 'draft'
  created_at: string
}

import type { InjectionKey, Ref } from 'vue'

export interface LnCtx {
  go: (id: string) => void
  coins: Ref<number>
  addCoins: (n: number) => void
  openMessenger: () => void
}

export const LN_CTX: InjectionKey<LnCtx> = Symbol('ln-ctx')

export function useLnCtx(): LnCtx {
  const ctx = inject(LN_CTX)
  if (!ctx) throw new Error('useLnCtx must be used inside the luyenngu layout')
  return ctx
}

// nav id ↔ route path
export const NAV_PATH: Record<string, string> = {
  'trang-chu': '/',
  'luyen-de': '/luyen-de',
  'luyen-noi': '/luyen-noi',
  'hoc-nhom': '/hoc-nhom',
  'thach-dau': '/thach-dau',
  'gap-go': '/gap-go',
  'ban-be': '/ban-be',
  blog: '/blog',
  'ho-so': '/ho-so',
}

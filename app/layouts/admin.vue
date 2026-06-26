<script setup lang="ts">
import { cn } from '~/lib/utils'

const { me } = useMe()

const { data: pendingRes } = await useFetch<{ meta: { total: number } }>('/api/admin/reports', {
  query: { status: 'pending', limit: 1 },
  default: () => ({ meta: { total: 0 } }),
})
const pendingCount = computed(() => pendingRes.value.meta.total)

type NavSection = { sec: string }
type NavItem = { id: string; label: string; icon: string; path: string }
type NavEntry = NavSection | NavItem

const NAV: NavEntry[] = [
  { sec: 'Tổng quan' },
  { id: 'overview', label: 'Bảng điều khiển', icon: 'layout-dashboard', path: '/admin' },
  { id: 'revenue', label: 'Doanh thu', icon: 'wallet', path: '/admin/doanh-thu' },
  { sec: 'Quản lý' },
  { id: 'users', label: 'Người dùng', icon: 'users', path: '/admin/nguoi-dung' },
  { id: 'exams', label: 'Đề thi & ngân hàng', icon: 'file-stack', path: '/admin/de-thi' },
  { id: 'questions', label: 'Quản lý câu hỏi', icon: 'list-checks', path: '/admin/cau-hoi' },
  { id: 'blog', label: 'Blog', icon: 'newspaper', path: '/admin/blog' },
  { sec: 'An toàn' },
  { id: 'reports', label: 'Kiểm duyệt', icon: 'shield-alert', path: '/admin/kiem-duyet' },
  { id: 'settings', label: 'Cấu hình', icon: 'settings', path: '/admin/cau-hinh' },
]

function isSec(n: NavEntry): n is NavSection { return 'sec' in n }
function isItem(n: NavEntry): n is NavItem { return 'id' in n }

const TITLES: Record<string, string> = {
  '/admin': 'Bảng điều khiển',
  '/admin/doanh-thu': 'Doanh thu & giao dịch',
  '/admin/nguoi-dung': 'Quản lý người dùng',
  '/admin/de-thi': 'Đề thi & ngân hàng câu hỏi',
  '/admin/cau-hoi': 'Quản lý câu hỏi',
  '/admin/blog': 'Quản lý Blog',
  '/admin/kiem-duyet': 'Kiểm duyệt',
  '/admin/cau-hinh': 'Cấu hình hệ thống',
}

const localePath = useLocalePath()
const route = useRoute()
const auth = useAuthStore()
const confirm = useConfirm()

async function logout() {
  if (!await confirm.ask({ title: 'Đăng xuất?', message: 'Bạn sẽ cần đăng nhập lại để vào trang quản trị.', confirmLabel: 'Đăng xuất', danger: true }))
    return
  await auth.logout()
  navigateTo(localePath('/login'))
}

// active nav by route path (strip locale prefix so /vi/admin/… still matches)
const currentPath = computed(() => {
  const p = route.path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
  return p === '' ? '/' : p
})
const title = computed(() => TITLES[currentPath.value] || 'Admin')

useHead({ bodyAttrs: { class: 'luyenngu font-body' } })
</script>

<template>
  <div class="grid grid-cols-[244px_minmax(0,1fr)] h-screen bg-paper-bg max-[900px]:grid-cols-1">
    <!-- DARK SIDEBAR -->
    <aside class="flex flex-col bg-[#211D19] text-white px-3 py-4 min-h-0 max-[900px]:hidden">
      <div class="flex items-center gap-2.5 px-2 pt-1.5 pb-5">
        <LnSeal :size="36" light />
        <div>
          <div class="font-display font-extrabold text-[1.15rem] leading-none text-white">LuyệnNgữ</div>
          <div class="font-body font-bold text-[0.58rem] tracking-[0.14em] capitalize text-son-bright mt-[3px]">Admin</div>
        </div>
      </div>

      <nav class="flex flex-col gap-0.5 flex-1 overflow-y-auto min-h-0">
        <template v-for="(n, i) in NAV" :key="i">
          <div
            v-if="isSec(n)"
            class="font-body font-bold text-[0.62rem] tracking-[0.14em] capitalize text-white/40 px-[11px] pt-3.5 pb-1.5"
          >
            {{ n.sec }}
          </div>
          <NuxtLink
            v-else-if="isItem(n)"
            :to="localePath(n.path)"
            :class="cn(
              'flex items-center gap-[11px] px-[11px] py-[9px] rounded-md-ln font-body text-[0.8125rem] font-semibold text-white/70! cursor-pointer transition-colors duration-150 hover:bg-white/[0.07] hover:text-white! text-left w-full',
              currentPath === n.path && 'bg-son text-white! hover:bg-son',
            )"
          >
            <LnIcon :name="n.icon" :size="18" class="flex-none" />
            <span class="flex-1">{{ n.label }}</span>
            <span
              v-if="n.id === 'reports' && pendingCount > 0"
              :class="cn(
                'min-w-[18px] h-[18px] px-[5px] rounded-full font-body font-bold text-[0.66rem] leading-[18px] text-center',
                currentPath === n.path ? 'bg-white text-son-deep' : 'bg-son-bright text-white',
              )"
            >{{ pendingCount }}</span>
          </NuxtLink>
        </template>
      </nav>

      <div class="border-t border-white/[0.12] pt-3 mt-3 flex items-center gap-2.5">
        <LnAvatar :name="me?.name ?? ''" color="son" :size="34" />
        <div class="flex-1 min-w-0">
          <div class="font-body text-[0.8125rem] font-bold text-white truncate">{{ me?.name }}</div>
          <div class="text-xs text-white/50 truncate">{{ me?.email }}</div>
        </div>
        <button type="button" title="Đăng xuất" class="text-white/50! hover:text-white!" @click="logout">
          <LnIcon name="log-out" :size="16" class="cursor-pointer" />
        </button>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="flex flex-col min-w-0 h-screen">
      <header class="h-[60px] flex-none flex items-center gap-4 px-6 border-b border-line bg-paper-bg">
        <h1 class="font-display font-bold text-[1.4rem]">{{ title }}</h1>
        <div class="flex-1" />
        <div class="max-w-[300px] flex-1 max-[720px]:hidden">
          <LnSearch placeholder="Tìm trong admin…" />
        </div>
        <LnIconBtn dot>
          <LnIcon name="bell" :size="20" />
        </LnIconBtn>
        <NuxtLink :to="localePath('/')">
          <LnBtn variant="outline" size="sm" icon="external-link">Xem app</LnBtn>
        </NuxtLink>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
    <LnToastStack />
    <LnConfirmDialog />
  </div>
</template>

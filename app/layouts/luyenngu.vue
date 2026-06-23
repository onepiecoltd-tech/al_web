<script setup lang="ts">
import { cn } from '~/lib/utils'
import { useLnApp } from '~/composables/useLnData'
import { LN_CTX, NAV_PATH, type LnCtx } from '~/composables/useLnCtx'
import LnMessengerOverlay from '~/components/luyenngu/screens/LnMessengerOverlay.vue'

const NAV_BASE = [
  { id: 'trang-chu', label: 'Trang chủ', icon: 'home' },
  { id: 'luyen-de', label: 'Luyện đề', icon: 'file-text' },
  { id: 'luyen-noi', label: 'Luyện nói', icon: 'mic' },
  { id: 'hoc-nhom', label: 'Học nhóm', icon: 'users' },
  { id: 'thach-dau', label: 'Thách đấu', icon: 'swords' },
  { id: 'gap-go', label: 'Gặp gỡ', icon: 'shuffle' },
  { id: 'ban-be', label: 'Bạn bè', icon: 'message-circle' },
  { id: 'blog', label: 'Blog', icon: 'newspaper' },
  { id: 'ho-so', label: 'Hồ sơ', icon: 'user' },
]
const TITLES: Record<string, string> = {
  '/': 'Trang chủ', '/luyen-de': 'Luyện đề', '/luyen-noi': 'Luyện nói',
  '/hoc-nhom': 'Học nhóm', '/thach-dau': 'Thách đấu', '/gap-go': 'Gặp gỡ',
  '/ban-be': 'Bạn bè & Chat',
  '/blog': 'Blog', '/ho-so': 'Hồ sơ',
}

const collapsed = ref(false)
const { messengerOpen, offline } = useLnApp()
const auth = useAuthStore()
const { unread } = useNotifications()
const { count: unreadMessages } = useUnreadMessages()
const { me, isAdmin } = useMe()
const { coins } = useWallet()

// Inject the live unread-message count as the "Bạn bè" nav badge.
const NAV = computed(() => NAV_BASE.map(n => ({
  ...n,
  dot: n.id === 'ban-be' ? unreadMessages.value : 0,
})))
const notifOpen = ref(false)
const localePath = useLocalePath()
const route = useRoute()

// active nav by route path (strip locale prefix so /vi/luyen-de still matches)
const currentPath = computed(() => {
  const p = route.path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
  return p === '' ? '/' : p
})
const title = computed(() => TITLES[currentPath.value] || 'LuyệnNgữ')

useHead({ bodyAttrs: { class: 'luyenngu font-body' } })

const confirm = useConfirm()
async function logout() {
  if (!await confirm.ask({ title: 'Đăng xuất?', message: 'Bạn sẽ cần đăng nhập lại để tiếp tục.', confirmLabel: 'Đăng xuất', danger: true }))
    return
  await auth.logout()
  navigateTo(localePath('/login'))
}

const ctx: LnCtx = {
  go: (id) => { navigateTo(localePath(NAV_PATH[id] || '/')) },
  openMessenger: () => { messengerOpen.value = true },
}
provide(LN_CTX, ctx)
</script>

<template>
  <div :class="cn('ln-app grid h-screen bg-paper-bg max-[720px]:grid-cols-1 transition-[grid-template-columns] duration-200 ease-in-out', collapsed ? 'grid-cols-[68px_minmax(0,1fr)]' : 'grid-cols-[248px_minmax(0,1fr)]')">
    <!-- SIDEBAR -->
    <aside class="ln-side flex flex-col bg-paper-1 border-r border-line px-3 py-4 min-h-0 overflow-hidden
      max-[720px]:fixed max-[720px]:bottom-0 max-[720px]:inset-x-0 max-[720px]:top-auto max-[720px]:flex-row max-[720px]:border-r-0 max-[720px]:border-t max-[720px]:z-50 max-[720px]:p-1.5 max-[720px]:h-[60px]">
      <div :class="cn('flex items-center gap-2.5 px-2 pt-1.5 pb-5 max-[720px]:hidden', collapsed && 'flex-col gap-2 px-0')">
        <LnSeal :size="collapsed ? 30 : 38" />
        <div v-if="!collapsed" class="font-display font-extrabold text-xl leading-none tracking-tight flex-1">LuyệnNgữ</div>
        <button
          type="button"
          :title="collapsed ? 'Mở rộng' : 'Thu gọn'"
          class="hidden min-[721px]:flex items-center justify-center w-7 h-7 rounded-md-ln text-ink-3 hover:bg-paper-2 hover:text-ink flex-none"
          @click="collapsed = !collapsed"
        >
          <LnIcon :name="collapsed ? 'chevrons-right' : 'chevrons-left'" :size="18" />
        </button>
      </div>
      <nav class="flex flex-col gap-0.5 overflow-y-auto flex-1 min-h-0 max-[720px]:flex-row max-[720px]:overflow-x-auto max-[720px]:gap-0 max-[720px]:justify-around max-[720px]:w-full">
        <NuxtLink
          v-for="n in NAV"
          :key="n.id"
          :to="localePath(NAV_PATH[n.id] ?? '/')"
          :title="collapsed ? n.label : undefined"
          :class="cn(
            'relative flex items-center gap-[11px] px-[11px] py-[9px] rounded-md-ln text-ink-2 font-body text-[0.8125rem] font-semibold cursor-pointer transition-colors duration-150 hover:bg-paper-2 hover:text-ink text-left w-full',
            'max-[720px]:flex-col max-[720px]:gap-[3px] max-[720px]:text-[0.6rem] max-[720px]:px-1 max-[720px]:py-[5px]',
            collapsed && 'justify-center px-0',
            currentPath === NAV_PATH[n.id] && 'bg-son-soft text-son-deep before:content-[\'\'] before:absolute before:-left-1 before:top-2 before:bottom-2 before:w-[3px] before:rounded-[3px] before:bg-son max-[720px]:before:hidden',
          )"
        >
          <LnIcon :name="n.icon" :size="19" class="flex-none" />
          <span v-if="!collapsed" class="max-[720px]:text-[0.6rem]">{{ n.label }}</span>
          <span v-if="n.dot" :class="cn('min-w-[18px] h-[18px] px-[5px] rounded-full bg-son text-white font-body font-bold text-[0.68rem] leading-[18px] text-center max-[720px]:absolute max-[720px]:top-0.5 max-[720px]:right-[calc(50%-18px)]', collapsed ? 'absolute top-0.5 right-0.5' : 'ml-auto')">{{ n.dot > 9 ? '9+' : n.dot }}</span>
        </NuxtLink>
      </nav>
      <div class="border-t border-line pt-3 mt-3 max-[720px]:hidden">
        <div :class="cn('flex items-center gap-2.5 px-2 py-[7px] rounded-md-ln', collapsed && 'flex-col gap-2 px-0')">
          <NuxtLink :to="localePath('/ho-so')" class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
            <LnAvatar :name="me?.name ?? ''" color="son" :size="36" status="online" />
            <div v-if="!collapsed" class="min-w-0 flex-1">
              <div class="font-body text-[0.8125rem] font-bold truncate">{{ me?.name }}</div>
              <div class="text-xs text-ink-3">{{ me?.handle }} · ELO {{ me?.elo }}</div>
            </div>
          </NuxtLink>
          <LnIconBtn :size="32" title="Đăng xuất" @click="logout">
            <LnIcon name="log-out" :size="16" />
          </LnIconBtn>
        </div>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="flex flex-col min-w-0 h-screen max-[720px]:pb-[60px]">
      <header class="h-[60px] flex-none flex items-center gap-4 px-6 border-b border-line bg-paper-bg">
        <h1 class="font-display font-bold text-[1.4rem]">{{ title }}</h1>
        <div class="flex-1" />
        <div class="max-w-[320px] flex-1 max-[720px]:hidden">
          <LnSearch placeholder="Tìm bạn bè, nhóm, bài viết…" />
        </div>
        <LnCoinsPill :amount="coins" />
        <NuxtLink v-if="isAdmin" :to="localePath('/admin')">
          <LnBtn variant="outline" size="sm" icon="shield-alert">Trang quản trị</LnBtn>
        </NuxtLink>
        <LnIconBtn :title="offline ? 'Đang ngoại tuyến — bấm để online' : 'Mô phỏng ngoại tuyến'" @click="offline = !offline">
          <LnIcon :name="offline ? 'wifi-off' : 'wifi'" :size="20" :class="offline && 'text-error capitalize'" />
        </LnIconBtn>
        <div class="relative">
          <LnIconBtn @click="notifOpen = !notifOpen">
            <LnIcon name="bell" :size="20" />
          </LnIconBtn>
          <span
            v-if="unread > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-son text-white text-[0.65rem] font-bold tabular-nums pointer-events-none"
          >{{ unread > 9 ? '9+' : unread }}</span>
        </div>
        <LnAvatar :name="me?.name ?? ''" color="son" :size="36" status="online" />
      </header>

      <LnNotifPopover :open="notifOpen" @close="notifOpen = false" />
      <LnOfflineBanner v-if="offline" />

      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>

    <LnMessengerOverlay v-if="messengerOpen" @exit="messengerOpen = false" />
    <LnToastStack />
    <LnConfirmDialog />
  </div>
</template>

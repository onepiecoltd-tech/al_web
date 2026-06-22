<script setup lang="ts">
import { type AvatarColor } from '~/composables/useLnData'
import { useLnCtx } from '~/composables/useLnCtx'
import type { Friend } from '~/types/api'

const ctx = useLnCtx()
const { me } = useMe()
const firstName = computed(() => (me.value?.name ?? '').split(' ').slice(-1)[0] || 'bạn')

const today = computed(() => {
  const d = new Date()
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  return `${days[d.getDay()]} · ${d.getDate()} tháng ${d.getMonth() + 1}`
})

const { data: friends } = await useFetch<Friend[]>('/api/friends', { default: () => [] })
const onlineFriends = computed(() => friends.value.filter(f => f.presence !== 'offline'))

const avatarPalette: AvatarColor[] = ['son', 'reu', 'gold', 'ink']
const avatarColor = (i: number): AvatarColor => avatarPalette[i % avatarPalette.length]!

const shortcuts = [
  { ic: 'file-text', t: 'Giải đề AI', s: 'còn 5 lượt hôm nay', go: 'luyen-de', tone: 'son' },
  { ic: 'mic', t: 'Luyện nói', s: 'cue card mới', go: 'luyen-noi', tone: 'reu' },
  { ic: 'swords', t: 'Thách đấu nhanh', s: 'ghép đối thủ ~1480', go: 'thach-dau', tone: 'son' },
  { ic: 'users', t: 'Vào nhóm', s: '2 nhóm đang mở', go: 'hoc-nhom', tone: 'reu' },
] as const

const weekly: [string, number, '' | 'reu' | 'gold'][] = [['Làm đề', 80, ''], ['Luyện nói', 55, 'reu'], ['Thách đấu', 40, 'gold']]

const activity = [
  { ic: 'check', t: 'Hoàn thành đề Cambridge IELTS 18 — Test 2', s: '32/40 câu · 2 giờ trước', tone: 'success', bg: 'bg-success-bg', fg: 'text-success' },
  { ic: 'swords', t: 'Thắng thách đấu với Linh', s: 'ELO +12 · hôm qua', bg: 'bg-son-soft', fg: 'text-son' },
  { ic: 'mic', t: 'Luyện nói: band ước lượng 6.5', s: 'hôm qua', bg: 'bg-reu-soft', fg: 'text-reu-deep' },
  { ic: 'gift', t: 'Tặng 🏆 cho Thu Hà trong buổi live', s: '−120 xu · 2 ngày trước', bg: 'bg-gold-soft', fg: 'text-gold-deep' },
]

</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- greeting -->
    <div class="flex items-center justify-between gap-3">
      <div>
        <div class="text-xs font-extrabold capitalize tracking-[0.12em] text-son">{{ today }}</div>
        <h2 class="font-display font-extrabold text-[2rem] mt-1">Chào {{ firstName }} 👋</h2>
      </div>
      <LnBadge tone="gold" status class="text-[0.8rem] px-3 py-1.5">🔥 {{ me?.streak ?? 0 }} ngày streak</LnBadge>
    </div>

    <!-- stats -->
    <div class="grid grid-cols-4 gap-3 max-[1040px]:grid-cols-2 max-[720px]:grid-cols-1">
      <LnStat icon="flame" k="Streak" :v="me?.streak ?? 0" d="kỷ lục: 21 ngày" />
      <LnStat icon="trophy" :k="`ELO · Hạng ${me?.rank ?? ''}`" :v="me?.elo ?? 0" d="+8 tuần này" dtone="up" />
      <LnStat icon="target" k="Tỉ lệ thắng" v="64%" d="41 thắng / 23 thua" />
      <LnStat icon="book-open" k="Lượt luyện" v="312" d="+18 tuần này" dtone="up" />
    </div>

    <!-- challenge banner + weekly -->
    <div class="grid grid-cols-[1.6fr_1fr] gap-4 max-[1040px]:grid-cols-1">
      <LnBanner>
        <LnBadge status class="bg-white/15 text-white">Thách đấu trong ngày</LnBadge>
        <h2 class="font-display font-bold text-[1.75rem] mt-3">Khánh thách đấu bạn — ELO 1.521</h2>
        <p class="text-white/70 font-body text-[0.9375rem] mt-1.5 max-w-[46ch]">Đối thủ trên cơ 39 điểm. Thắng trận này để leo lên hạng Bạch Kim. Đọc to để AI chấm độ khớp.</p>
        <div class="flex gap-4 mt-[18px]">
          <LnBtn variant="primary" icon="swords" @click="ctx.go('thach-dau')">Nhận thách đấu</LnBtn>
          <LnBtn variant="outline" class="bg-transparent! text-white! border-white/30!" @click="ctx.go('thach-dau')">Tìm đối thủ khác</LnBtn>
        </div>
      </LnBanner>
      <LnCard pop>
        <div class="flex items-center justify-between"><b class="font-body text-base font-bold">Mục tiêu tuần</b><span class="text-ink-3 text-xs">5/7 ngày</span></div>
        <div class="flex flex-col gap-3.5 mt-4">
          <div v-for="[k, v, tone] in weekly" :key="k">
            <div class="flex items-center justify-between mb-1.5"><span class="font-body text-[0.8125rem] font-semibold">{{ k }}</span><span class="text-ink-3 text-xs">{{ v }}%</span></div>
            <LnProgress :value="v" :tone="tone" />
          </div>
        </div>
      </LnCard>
    </div>

    <!-- shortcuts -->
    <div>
      <div class="font-display font-bold text-[1.3125rem] mb-3">Lối tắt</div>
      <div class="grid grid-cols-4 gap-3 max-[1040px]:grid-cols-2 max-[720px]:grid-cols-1">
        <button
          v-for="s in shortcuts"
          :key="s.t"
          type="button"
          class="text-left cursor-pointer bg-paper-0 border border-line rounded-lg-ln p-4 transition-colors hover:bg-paper-2"
          @click="ctx.go(s.go)"
        >
          <div class="grid place-items-center w-10 h-10 rounded-md-ln" :class="s.tone === 'son' ? 'bg-son-soft' : 'bg-reu-soft'">
            <LnIcon :name="s.ic" :size="20" :class="s.tone === 'son' ? 'text-son' : 'text-reu-deep'" />
          </div>
          <div class="font-body text-base font-bold mt-3">{{ s.t }}</div>
          <div class="text-xs text-ink-3 mt-px">{{ s.s }}</div>
        </button>
      </div>
    </div>

    <!-- activity + friends online -->
    <div class="grid grid-cols-[1.6fr_1fr] gap-4 max-[1040px]:grid-cols-1">
      <LnCard>
        <b class="font-body text-base font-bold mb-2 block">Hoạt động gần đây</b>
        <div v-for="(a, i) in activity" :key="i" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
          <div class="grid place-items-center w-[34px] h-[34px] rounded-md-ln" :class="a.bg">
            <LnIcon :name="a.ic" :size="16" :class="a.fg" />
          </div>
          <div class="flex-1"><div class="font-body text-[0.9375rem] font-semibold">{{ a.t }}</div><div class="text-xs text-ink-3 mt-px">{{ a.s }}</div></div>
        </div>
      </LnCard>
      <LnCard>
        <div class="flex items-center justify-between mb-2"><b class="font-body text-base font-bold">Bạn bè online</b><a class="text-xs cursor-pointer text-son" @click="ctx.go('ban-be')">Xem tất cả</a></div>
        <div v-for="(f, i) in onlineFriends" :key="f.id" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
          <LnAvatar :name="f.name" :color="avatarColor(i)" :size="36" :status="f.presence" />
          <div class="flex-1"><div class="font-body text-[0.9375rem] font-semibold">{{ f.name }}</div><div class="text-xs text-ink-3 mt-px">{{ f.msg }}</div></div>
          <LnBtn variant="ghost" size="sm" icon="swords" @click="ctx.go('thach-dau')" />
        </div>
      </LnCard>
    </div>
  </div>
</template>

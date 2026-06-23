<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { Badge, CoinPack, Transaction } from '~/types/api'

const { me, refresh: refreshMe } = useMe()
const { coins, topup: doTopup } = useWallet()
const topup = ref(false)
const toast = useToast()

// --- Sửa hồ sơ ---
const editOpen = ref(false)
const editName = ref('')
const editSaving = ref(false)
function openEdit() {
  editName.value = me.value?.name ?? ''
  editOpen.value = true
}
async function saveEdit() {
  const name = editName.value.trim()
  if (!name)
    return
  editSaving.value = true
  try {
    await $fetch('/api/me', { method: 'PUT', body: { name } })
    await refreshMe()
    editOpen.value = false
    toast.ok('Đã cập nhật hồ sơ.')
  }
  catch {
    toast.err('Cập nhật hồ sơ thất bại.')
  }
  finally {
    editSaving.value = false
  }
}

const { data: packs } = await useFetch<CoinPack[]>('/api/coin-packs', { default: () => [] })
const { data: txns, refresh: refreshTxns } = await useFetch<Transaction[]>('/api/wallet/transactions', { default: () => [] })

function fmtTxnTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const buying = ref(false)
async function buy(packId: string) {
  buying.value = true
  try {
    await doTopup(packId)
    await refreshTxns()
    topup.value = false
    toast.ok('Nạp xu thành công!')
  }
  catch {
    toast.err('Nạp xu thất bại. Vui lòng thử lại.')
  }
  finally {
    buying.value = false
  }
}
const settings = reactive<Record<string, boolean>>({ show_online: true, allow_stranger_challenge: true, allow_stranger_chat: false, notify_on_friend_live: false })
const { data: prefs } = await useFetch<Record<string, boolean>>('/api/me/prefs', { default: () => ({}) })
Object.assign(settings, prefs.value)
async function setPref(key: string, value: boolean) {
  settings[key] = value
  try {
    await $fetch('/api/me/prefs', { method: 'PUT', body: { ...settings } })
    toast.ok('Đã lưu cài đặt.')
  }
  catch { toast.err('Lưu cài đặt thất bại.') }
}

const settingsRows: [keyof typeof settings, string, string][] = [
  ['show_online', 'Hiện đang online', 'Bạn bè thấy chấm xanh trạng thái của bạn.'],
  ['allow_stranger_challenge', 'Cho người lạ thách đấu', 'Cho phép ghép cặp ngẫu nhiên đến với bạn.'],
  ['allow_stranger_chat', 'Gặp gỡ (người lạ) · 18+', 'Cho phép ghép & trò chuyện với người lạ. Vị trí chỉ ở mức tỉnh/thành.'],
  ['notify_on_friend_live', 'Thông báo khi bạn bè livestream', 'Nhận thông báo go-live từ bạn bè.'],
]

const { data: badges } = await useFetch<Badge[]>('/api/me/badges', { default: () => [] })
const badgeBg: Record<string, string> = { son: 'bg-son-soft', gold: 'bg-gold-soft', reu: 'bg-reu-soft', ink: 'bg-paper-3' }

</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- header -->
    <LnCard pop class="flex gap-5 items-center flex-wrap">
      <LnAvatar :name="me?.name ?? ''" color="son" :size="76" status="online" />
      <div class="flex-1 min-w-[220px]">
        <div class="flex items-center gap-2.5">
          <h2 class="font-display font-bold text-[1.75rem] whitespace-nowrap">{{ me?.name }}</h2>
          <LnBadge tone="gold" status>{{ me?.plan }}</LnBadge>
        </div>
        <div class="text-ink-3 font-body text-[0.9375rem] mt-1">{{ me?.handle }} · Tham gia {{ me?.joined }}</div>
        <div class="flex gap-[18px] mt-3.5 flex-wrap">
          <span class="flex items-center gap-1.5 font-body text-[0.8125rem] font-semibold whitespace-nowrap"><LnIcon name="flame" :size="16" class="text-son" />{{ me?.streak }} ngày streak</span>
          <span class="flex items-center gap-1.5 font-body text-[0.8125rem] font-semibold whitespace-nowrap"><LnIcon name="trophy" :size="16" class="text-gold-deep" />ELO {{ me?.elo }} · Hạng {{ me?.rank }}</span>
        </div>
      </div>
      <LnBtn variant="outline" icon="pen-line" @click="openEdit">Sửa hồ sơ</LnBtn>
    </LnCard>

    <!-- stats -->
    <div class="grid grid-cols-3 gap-3 max-[1040px]:grid-cols-2 max-[720px]:grid-cols-1">
      <LnStat icon="swords" k="Trận thắng" :v="me?.wins ?? 0" />
      <LnStat icon="trophy" k="ELO" :v="me?.elo ?? 0" />
      <LnStat icon="award" k="Huy hiệu" :v="badges.length" />
    </div>

    <!-- badges -->
    <LnCard>
      <b class="font-body text-base font-bold">Huy hiệu</b>
      <div class="flex gap-3.5 flex-wrap mt-3.5">
        <div v-for="b in badges" :key="b.id" class="text-center w-[76px]">
          <div class="grid place-items-center w-14 h-14 mx-auto rounded-lg-ln text-[1.6rem]" :class="badgeBg[b.tone]">{{ b.emoji }}</div>
          <div class="text-xs text-ink-3 mt-1.5">{{ b.name }}</div>
        </div>
      </div>
    </LnCard>

    <div class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
      <!-- wallet + txns -->
      <div class="flex flex-col gap-4">
        <div class="relative overflow-hidden rounded-xl-ln p-6 text-white after:content-[''] after:absolute after:-right-[30px] after:-top-[30px] after:w-[140px] after:h-[140px] after:rounded-full after:bg-[radial-gradient(circle,rgba(181,136,46,.5),transparent_70%)]" style="background: linear-gradient(135deg, #2A2520, #3a322a)">
          <div class="relative">
            <div class="text-xs text-white/65 capitalize tracking-[0.1em]">Ví xu</div>
            <div class="flex items-center gap-2.5 font-body font-extrabold text-[2.4rem] leading-none tabular-nums my-2 mb-1"><LnCoin :size="30" />{{ coins.toLocaleString('vi') }}</div>
            <p class="text-white/60 text-xs max-w-[34ch]">Dùng xu để tặng quà khi xem livestream. MVP không hỗ trợ rút tiền.</p>
            <LnBtn variant="gold" size="sm" icon="plus" class="mt-3" @click="topup = true">Nạp thêm xu</LnBtn>
          </div>
        </div>
        <LnCard>
          <b class="font-body text-base font-bold">Lịch sử giao dịch</b>
          <div class="mt-2">
            <p v-if="!txns.length" class="text-ink-3 text-sm py-4">Chưa có giao dịch nào.</p>
            <div v-for="t in txns" :key="t.id" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
              <div class="grid place-items-center w-9 h-9 rounded-md-ln flex-none" :class="t.coins < 0 ? 'bg-son-soft' : 'bg-success-bg'">
                <LnIcon :name="t.kind === 'topup' ? 'plus' : 'gift'" :size="16" :class="t.coins < 0 ? 'text-son' : 'text-success'" />
              </div>
              <div><div class="font-body text-[0.8125rem] font-semibold">{{ t.description }}</div><div class="text-xs text-ink-3 mt-px">{{ fmtTxnTime(t.created_at) }}{{ t.status === 'failed' ? ' · thất bại' : '' }}</div></div>
              <div class="ml-auto font-body font-bold text-[0.95rem] tabular-nums" :class="t.coins < 0 ? 'text-error capitalize' : 'text-success'">{{ t.coins > 0 ? '+' : '' }}{{ t.coins }}</div>
            </div>
          </div>
        </LnCard>
      </div>

      <!-- pro + settings -->
      <div class="flex flex-col gap-4">
        <LnCard pop :class="me?.plan === 'pro' ? '!border-gold-line' : ''">
          <div class="flex items-center justify-between">
            <b class="font-body text-base font-bold">Gói {{ me?.plan === 'pro' ? 'Pro' : 'Free' }}</b>
            <LnBadge :tone="me?.plan === 'pro' ? 'gold' : 'reu'" status>{{ me?.plan === 'pro' ? 'Đang hoạt động' : 'Miễn phí' }}</LnBadge>
          </div>
          <p v-if="me?.plan === 'pro'" class="font-body text-[0.9375rem] text-ink-2 my-2.5">Bạn đang dùng các tính năng Pro.</p>
          <p v-else class="font-body text-[0.9375rem] text-ink-2 my-2.5">Liên hệ hỗ trợ để nâng cấp lên Pro.</p>
        </LnCard>
        <LnCard>
          <b class="font-body text-base font-bold">Cài đặt</b>
          <div class="mt-1.5">
            <div v-for="[k, t, d] in settingsRows" :key="k" class="flex items-center justify-between gap-4 py-3 border-b border-line-soft last:border-0">
              <div class="flex-1"><div class="font-body text-base font-semibold">{{ t }}</div><div class="text-xs text-ink-3 mt-px">{{ d }}</div></div>
              <LnSwitch :model-value="settings[k] ?? false" @update:model-value="(v: boolean) => setPref(k, v)" />
            </div>
          </div>
        </LnCard>
      </div>
    </div>

    <!-- topup dialog -->
    <LnDialog :open="topup" @close="topup = false">
      <div class="flex items-center justify-between mb-1.5"><b class="font-display text-[1.3125rem] font-bold">Nạp xu</b><LnIconBtn @click="topup = false"><LnIcon name="x" :size="20" /></LnIconBtn></div>
      <p class="text-ink-3 font-body text-[0.9375rem] mb-4">Thanh toán an toàn qua PayOS. Xu vào ví ngay sau khi xác nhận.</p>
      <div class="flex flex-col gap-2.5">
        <button
          v-for="p in packs"
          :key="p.id"
          type="button"
          :disabled="buying"
          :class="cn('flex items-center gap-3.5 cursor-pointer text-left border rounded-lg-ln p-4 disabled:opacity-50', p.popular ? 'border-gold-line bg-gold-soft' : 'border-line bg-paper-0')"
          @click="buy(p.id)"
        >
          <LnCoin :size="38" />
          <div class="flex-1"><div class="font-body text-base font-bold">{{ p.coins.toLocaleString('vi') }} xu</div><div class="text-xs text-ink-3 mt-px">₫{{ p.vnd.toLocaleString('vi') }}</div></div>
          <LnBadge v-if="p.popular" tone="gold" status>Phổ biến</LnBadge>
          <LnIcon name="chevron-right" :size="18" class="text-ink-3" />
        </button>
      </div>
    </LnDialog>

    <!-- edit profile dialog -->
    <LnDialog :open="editOpen" @close="editOpen = false">
      <div class="flex items-center justify-between mb-1.5"><b class="font-display text-[1.3125rem] font-bold">Sửa hồ sơ</b><LnIconBtn @click="editOpen = false"><LnIcon name="x" :size="20" /></LnIconBtn></div>
      <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Tên hiển thị</label>
      <input
        v-model="editName"
        :disabled="editSaving"
        class="w-full mt-2 mb-4 bg-paper-2 border border-line rounded-md-ln px-3.5 py-2.5 font-body text-[0.9375rem] text-ink focus:outline-none focus:border-son disabled:opacity-60"
        placeholder="Tên hiển thị"
        @keyup.enter="saveEdit"
      >
      <LnBtn variant="primary" class="w-full" :disabled="editSaving || !editName.trim()" @click="saveEdit">{{ editSaving ? 'Đang lưu…' : 'Lưu' }}</LnBtn>
    </LnDialog>
  </div>
</template>

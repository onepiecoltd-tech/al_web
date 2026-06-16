<script setup lang="ts">
import type { AdminTransaction, Paginated, RevenueSummary } from '~/types/api'

const { data: rev } = await useFetch<RevenueSummary>('/api/admin/revenue', {
  default: () => ({ month_vnd: 0, today_vnd: 0, topups_month: 0, pro_total: 0 }),
})

const page = ref(1)
const { data: res } = await useFetch<Paginated<AdminTransaction>>('/api/admin/transactions', {
  query: { page, limit: 10 },
  default: () => ({ data: [], meta: { page: 1, limit: 10, total: 0, total_pages: 0 } }),
})
const txns = computed(() => res.value.data)
const totalPages = computed(() => res.value.meta.total_pages)

const vnd = (n: number) => `₫${n.toLocaleString('vi')}`

const metrics = computed(() => [
  { v: vnd(rev.value.month_vnd), k: 'Doanh thu tháng', ic: 'wallet', tone: 'reu' },
  { v: vnd(rev.value.today_vnd), k: 'Hôm nay', ic: 'trending-up', tone: 'son' },
  { v: rev.value.pro_total.toLocaleString('vi'), k: 'Gói Pro đang chạy', ic: 'crown', tone: 'gold' },
  { v: String(rev.value.topups_month), k: 'Lượt nạp tháng', ic: 'coins', tone: 'gold' },
])
const iconColor: Record<string, string> = { son: 'text-son', gold: 'text-gold-deep', reu: 'text-reu-deep' }
const iconBg: Record<string, string> = { son: 'bg-son-soft', gold: 'bg-gold-soft', reu: 'bg-reu-soft' }

function fmtTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- metrics -->
    <div class="grid grid-cols-4 gap-3 max-[1040px]:grid-cols-2 max-[640px]:grid-cols-1">
      <div v-for="m in metrics" :key="m.k" class="bg-paper-0 border border-line rounded-lg-ln p-4 shadow-sm-ln">
        <div class="grid place-items-center w-[38px] h-[38px] rounded-md-ln" :class="iconBg[m.tone]">
          <LnIcon :name="m.ic" :size="19" :class="iconColor[m.tone]" />
        </div>
        <div class="font-display font-extrabold text-[1.9rem] leading-none mt-3.5 tabular-nums">{{ m.v }}</div>
        <div class="text-xs text-ink-3 mt-[5px]">{{ m.k }}</div>
      </div>
    </div>

    <!-- transactions -->
    <LnCard>
      <b class="font-body text-base font-bold">Giao dịch gần đây</b>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th v-for="h in ['Người dùng', 'Loại', 'Xu', 'Số tiền', 'Cổng', 'Trạng thái', 'Thời gian']" :key="h" class="text-left font-body font-bold text-[0.72rem] tracking-[0.04em] uppercase text-ink-3 px-4 py-3 bg-paper-2 border-b border-line whitespace-nowrap">
                {{ h }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in txns" :key="t.id" class="transition-colors hover:bg-paper-1">
              <td class="px-4 py-3 border-b border-line-soft align-middle">
                <div class="flex items-center gap-2.5">
                  <LnAvatar :name="t.user" color="son" :size="30" />
                  <span class="font-body text-[0.8125rem] font-semibold">{{ t.user }}</span>
                </div>
              </td>
              <td class="px-4 py-3 border-b border-line-soft align-middle">
                <LnBadge :tone="t.kind === 'topup' ? 'reu' : 'gold'">{{ t.kind === 'topup' ? 'Nạp xu' : 'Tặng quà' }}</LnBadge>
              </td>
              <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-semibold font-body text-[0.9375rem]" :class="t.coins < 0 ? 'text-error' : 'text-success'">{{ t.coins > 0 ? '+' : '' }}{{ t.coins }}</td>
              <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-body text-[0.9375rem]">{{ t.vnd ? vnd(t.vnd) : '—' }}</td>
              <td class="px-4 py-3 border-b border-line-soft align-middle text-ink-3">{{ t.method }}</td>
              <td class="px-4 py-3 border-b border-line-soft align-middle">
                <span class="ln-spill" :class="t.status === 'ok' ? 'ok' : 'err'">{{ t.status === 'ok' ? 'Thành công' : 'Thất bại' }}</span>
              </td>
              <td class="px-4 py-3 border-b border-line-soft align-middle text-ink-3 text-xs">{{ fmtTime(t.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-end mt-3.5">
        <LnPager v-model:page="page" :total-pages="totalPages" />
      </div>
    </LnCard>
  </div>
</template>

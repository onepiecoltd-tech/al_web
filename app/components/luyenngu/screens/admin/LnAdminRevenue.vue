<script setup lang="ts">
import { A_TXNS } from '~/composables/useLnData'

const metrics: { v: string; k: string; ic: string; tone: 'reu' | 'son' | 'gold' }[] = [
  { v: '₫48,2M', k: 'Doanh thu tháng', ic: 'wallet', tone: 'reu' },
  { v: '₫1,8M', k: 'Hôm nay', ic: 'trending-up', tone: 'son' },
  { v: '1.840', k: 'Gói Pro đang chạy', ic: 'crown', tone: 'gold' },
  { v: '₫9,4M', k: 'Nạp xu tháng', ic: 'coins', tone: 'gold' },
]
const iconColor: Record<string, string> = { son: 'text-son', gold: 'text-gold-deep', reu: 'text-reu-deep' }
const iconBg: Record<string, string> = { son: 'bg-son-soft', gold: 'bg-gold-soft', reu: 'bg-reu-soft' }
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- metrics -->
    <div class="grid grid-cols-4 gap-3 max-[1040px]:grid-cols-2 max-[640px]:grid-cols-1">
      <div v-for="m in metrics" :key="m.k" class="bg-paper-0 border border-line rounded-lg-ln p-4 shadow-sm-ln">
        <div class="flex items-center justify-between">
          <div class="grid place-items-center w-[38px] h-[38px] rounded-md-ln" :class="iconBg[m.tone]">
            <LnIcon :name="m.ic" :size="19" :class="iconColor[m.tone]" />
          </div>
        </div>
        <div class="font-display font-extrabold text-[1.9rem] leading-none mt-3.5 tabular-nums">{{ m.v }}</div>
        <div class="text-xs text-ink-3 mt-[5px]">{{ m.k }}</div>
      </div>
    </div>

    <!-- transactions -->
    <LnCard>
      <b class="font-body text-base font-bold">Giao dịch gần đây</b>
      <div class="mt-3 overflow-hidden">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th v-for="h in ['Người dùng', 'Loại', 'Giá trị', 'Số tiền', 'Cổng', 'Trạng thái', 'Thời gian']" :key="h" class="text-left font-body font-bold text-[0.72rem] tracking-[0.04em] uppercase text-ink-3 px-4 py-3 bg-paper-2 border-b border-line whitespace-nowrap">
                {{ h }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(t, i) in A_TXNS" :key="i" class="transition-colors hover:bg-paper-1">
              <td class="px-4 py-3 border-b border-line-soft align-middle">
                <div class="flex items-center gap-2.5">
                  <LnAvatar :name="t.user" color="son" :size="30" />
                  <span class="font-body text-[0.8125rem] font-semibold">{{ t.user }}</span>
                </div>
              </td>
              <td class="px-4 py-3 border-b border-line-soft align-middle">
                <LnBadge :tone="t.kind === 'Gói Pro' ? 'gold' : 'reu'">{{ t.kind }}</LnBadge>
              </td>
              <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-semibold font-body text-[0.9375rem]">{{ t.amt }}</td>
              <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-body text-[0.9375rem]">{{ t.vnd }}</td>
              <td class="px-4 py-3 border-b border-line-soft align-middle text-ink-3">{{ t.method }}</td>
              <td class="px-4 py-3 border-b border-line-soft align-middle">
                <span class="ln-spill" :class="t.ok ? 'ok' : 'err'">{{ t.ok ? 'Thành công' : 'Thất bại' }}</span>
              </td>
              <td class="px-4 py-3 border-b border-line-soft align-middle text-ink-3 text-xs">{{ t.when }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LnCard>
  </div>
</template>

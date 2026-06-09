<script setup lang="ts">
import { A_USERS } from '~/composables/useLnData'

const localePath = useLocalePath()
const go = (path: string) => navigateTo(localePath(path))

const metrics = [
  { ic: 'users', tone: 'son', v: '12.428', k: 'Người dùng', d: '+312', up: true },
  { ic: 'crown', tone: 'gold', v: '1.840', k: 'Thuê bao Pro', d: '+48', up: true },
  { ic: 'wallet', tone: 'reu', v: '₫48,2M', k: 'Doanh thu tháng', d: '+9%', up: true },
  { ic: 'shield-alert', tone: 'son', v: '4', k: 'Báo cáo chờ xử lý', d: '+2', up: false },
] as const

const iconColor: Record<string, string> = { son: 'text-son', gold: 'text-gold-deep', reu: 'text-reu-deep' }
const iconBg: Record<string, string> = { son: 'bg-son-soft', gold: 'bg-gold-soft', reu: 'bg-reu-soft' }

const bars: [string, number][] = [['T2', 62], ['T3', 78], ['T4', 71], ['T5', 88], ['T6', 95], ['T7', 120], ['CN', 104]]
const max = 120

const todo: { ic: string; t: string; sev: 'err' | 'warn'; path: string }[] = [
  { ic: 'shield-alert', t: '4 báo cáo chờ kiểm duyệt', sev: 'err', path: '/admin/kiem-duyet' },
  { ic: 'file-stack', t: '2 đề chờ duyệt', sev: 'warn', path: '/admin/de-thi' },
  { ic: 'credit-card', t: '1 giao dịch lỗi', sev: 'err', path: '/admin/doanh-thu' },
]

const range = ref<'w' | 'm'>('w')
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
          <span
            class="font-body font-bold text-[0.72rem] px-[7px] py-0.5 rounded-full"
            :class="m.up ? 'bg-success-bg text-success' : 'bg-error-bg text-error'"
          >{{ m.d }}</span>
        </div>
        <div class="font-display font-extrabold text-[1.9rem] leading-none mt-3.5 tabular-nums">{{ m.v }}</div>
        <div class="text-xs text-ink-3 mt-[5px]">{{ m.k }}</div>
      </div>
    </div>

    <!-- chart + todo -->
    <div class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
      <LnCard pop>
        <div class="flex items-center justify-between mb-1.5">
          <b class="font-body text-base font-bold">Người dùng hoạt động · 7 ngày</b>
          <LnSegment v-model="range" :options="[{ v: 'w', label: 'Tuần' }, { v: 'm', label: 'Tháng' }]" />
        </div>
        <div class="flex items-end gap-2.5 h-[160px] pt-2.5 mb-[26px]">
          <div
            v-for="[d, v] in bars"
            :key="d"
            class="flex-1 relative min-h-1 rounded-t-md bg-son-soft border border-b-0 border-son-line transition-colors hover:bg-son group"
            :style="{ height: `${(v / max) * 100}%` }"
          >
            <span class="absolute -top-5 inset-x-0 text-center font-body font-bold text-[0.72rem] text-ink-2">{{ v }}</span>
            <span class="absolute -bottom-[22px] inset-x-0 text-center text-xs text-ink-3">{{ d }}</span>
          </div>
        </div>
      </LnCard>

      <LnCard>
        <div class="flex items-center justify-between mb-2"><b class="font-body text-base font-bold">Cần xử lý</b></div>
        <button
          v-for="r in todo"
          :key="r.t"
          type="button"
          class="flex items-center gap-3 py-[11px] w-full text-left border-b border-line-soft last:border-0 cursor-pointer"
          @click="go(r.path)"
        >
          <div class="grid place-items-center w-[34px] h-[34px] rounded-md-ln" :class="r.sev === 'err' ? 'bg-error-bg' : 'bg-warning-bg'">
            <LnIcon :name="r.ic" :size="16" :class="r.sev === 'err' ? 'text-error' : 'text-warning'" />
          </div>
          <div class="flex-1 font-body text-[0.9375rem]">{{ r.t }}</div>
          <LnIcon name="chevron-right" :size="16" class="text-ink-3" />
        </button>
      </LnCard>
    </div>

    <!-- recent signups -->
    <LnCard>
      <div class="flex items-center justify-between mb-2">
        <b class="font-body text-base font-bold">Đăng ký gần đây</b>
        <a class="text-xs cursor-pointer text-son" @click="go('/admin/nguoi-dung')">Xem tất cả</a>
      </div>
      <div v-for="u in A_USERS.slice(0, 4)" :key="u.handle" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
        <LnAvatar :name="u.name" :color="u.color" :size="36" />
        <div class="flex-1">
          <div class="font-body text-[0.9375rem] font-semibold">{{ u.name }}</div>
          <div class="text-xs text-ink-3 mt-px">{{ u.email }}</div>
        </div>
        <LnBadge v-if="u.plan === 'Pro'" tone="gold" status>Pro</LnBadge>
        <span v-else class="ln-spill mut">Free</span>
        <span class="text-ink-3 text-xs w-16 text-right">{{ u.joined }}</span>
      </div>
    </LnCard>
  </div>
</template>

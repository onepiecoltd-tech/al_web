<script setup lang="ts">
import { A_REPORTS } from '~/composables/useLnData'

const tab = ref<'open' | 'done'>('open')
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-3 flex-wrap">
      <LnSegment v-model="tab" :options="[{ v: 'open', label: 'Chờ xử lý' }, { v: 'done', label: 'Đã xử lý' }]" />
      <div class="flex-1" />
      <span class="text-ink-3 text-xs">{{ A_REPORTS.length }} báo cáo mới</span>
    </div>

    <LnCard v-for="(r, i) in A_REPORTS" :key="i" class="flex gap-3.5 items-center">
      <div class="grid place-items-center w-[42px] h-[42px] rounded-md-ln flex-none" :class="r.sev === 'err' ? 'bg-error-bg' : 'bg-warning-bg'">
        <LnIcon name="flag" :size="19" :class="r.sev === 'err' ? 'text-error' : 'text-warning'" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-body text-base font-semibold">{{ r.what }}</div>
        <div class="flex gap-2.5 mt-[3px] items-center">
          <LnBadge tone="son">{{ r.type }}</LnBadge>
          <span class="text-ink-3 text-xs">bởi {{ r.who }} · {{ r.when }} trước</span>
        </div>
      </div>
      <div class="flex gap-2">
        <LnBtn variant="ghost" size="sm">Bỏ qua</LnBtn>
        <LnBtn variant="outline" size="sm" icon="eye-off">Ẩn</LnBtn>
        <LnBtn variant="primary" size="sm" icon="trash-2">Gỡ</LnBtn>
      </div>
    </LnCard>
  </div>
</template>

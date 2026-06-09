<script setup lang="ts">
import { GIFTS } from '~/composables/useLnData'

const coinPacks: [string, string][] = [['₫20.000', '230 xu'], ['₫50.000', '600 xu'], ['₫100.000', '1.300 xu']]

const flags = reactive([
  { t: 'Cho phép đăng ký mới', on: true },
  { t: 'Blog cộng đồng (cần duyệt)', on: true },
  { t: 'Livestream + tặng quà', on: true },
  { t: 'Chế độ bảo trì', on: false },
])
</script>

<template>
  <div class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
    <!-- gifts catalog -->
    <LnCard pop>
      <b class="font-body text-base font-bold">Danh mục quà (gifts)</b>
      <p class="text-ink-3 text-xs mt-1 mb-3">Giá tính bằng xu. Sửa sẽ áp dụng cho mọi livestream.</p>
      <div v-for="g in GIFTS" :key="g.nm" class="flex items-center gap-3 py-[9px] border-b border-line-soft last:border-0">
        <span class="text-2xl leading-none">{{ g.em }}</span>
        <span class="flex-1 font-body text-[0.9375rem] font-semibold">{{ g.nm }}</span>
        <LnCoinsPill :amount="g.p" />
        <LnIconBtn :size="30"><LnIcon name="pen-line" :size="14" /></LnIconBtn>
      </div>
      <LnBtn variant="outline" size="sm" icon="plus" class="mt-3">Thêm quà</LnBtn>
    </LnCard>

    <div class="flex flex-col gap-4">
      <!-- coin packages -->
      <LnCard>
        <b class="font-body text-base font-bold">Gói nạp xu</b>
        <div class="mt-2.5">
          <div v-for="[v, x] in coinPacks" :key="v" class="flex items-center gap-3 py-[9px] border-b border-line-soft last:border-0">
            <span class="flex-1 font-body text-[0.9375rem] font-semibold">{{ v }}</span>
            <span class="text-ink-3">{{ x }}</span>
            <LnIconBtn :size="30"><LnIcon name="pen-line" :size="14" /></LnIconBtn>
          </div>
        </div>
      </LnCard>

      <!-- feature flags -->
      <LnCard>
        <b class="font-body text-base font-bold">Cờ tính năng</b>
        <div class="mt-1.5">
          <div
            v-for="(f, i) in flags"
            :key="f.t"
            class="flex items-center justify-between gap-4 py-[13px]"
            :class="i === flags.length - 1 ? '' : 'border-b border-line-soft'"
          >
            <div class="font-body text-[0.9375rem]">{{ f.t }}</div>
            <LnSwitch v-model="f.on" />
          </div>
        </div>
      </LnCard>
    </div>
  </div>
</template>

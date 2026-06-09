<script setup lang="ts">
import { BLOG } from '~/composables/useLnData'
</script>

<template>
  <div class="bg-paper-0 border border-line rounded-lg-ln overflow-hidden">
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th v-for="h in ['Bài viết', 'Tác giả', 'Lượt đọc', 'Bình luận', 'Trạng thái', '']" :key="h" class="text-left font-body font-bold text-[0.72rem] tracking-[0.04em] uppercase text-ink-3 px-4 py-3 bg-paper-2 border-b border-line whitespace-nowrap">
            {{ h }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(b, i) in BLOG" :key="i" class="transition-colors hover:bg-paper-1">
          <td class="px-4 py-3 border-b border-line-soft align-middle">
            <div class="font-body text-[0.8125rem] font-semibold max-w-[360px]">{{ b.title }}</div>
            <div class="text-xs text-ink-3">{{ b.cat }} · {{ b.date }}</div>
          </td>
          <td class="px-4 py-3 border-b border-line-soft align-middle text-ink-3">{{ b.author }}</td>
          <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-body text-[0.9375rem]">{{ b.reads }}</td>
          <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-body text-[0.9375rem]">{{ b.comments }}</td>
          <td class="px-4 py-3 border-b border-line-soft align-middle">
            <span class="ln-spill" :class="i === 2 ? 'warn' : 'ok'">{{ i === 2 ? 'Chờ duyệt' : 'Đã đăng' }}</span>
          </td>
          <td class="px-4 py-3 border-b border-line-soft align-middle">
            <div class="flex gap-1 justify-end items-center">
              <LnBtn v-if="i === 2" variant="secondary" size="sm">Duyệt</LnBtn>
              <LnIconBtn :size="32"><LnIcon name="trash-2" :size="15" class="text-error" /></LnIconBtn>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

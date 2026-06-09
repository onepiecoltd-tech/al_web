<script setup lang="ts">
import { A_USERS } from '~/composables/useLnData'

const q = ref('')
const plan = ref<'all' | 'pro' | 'free'>('all')

const rows = computed(() =>
  A_USERS.filter(u =>
    (plan.value === 'all' || u.plan.toLowerCase() === plan.value)
    && (u.name.toLowerCase().includes(q.value.toLowerCase()) || u.email.includes(q.value.toLowerCase())),
  ),
)
</script>

<template>
  <div class="flex flex-col">
    <!-- toolbar -->
    <div class="flex items-center gap-3 flex-wrap mb-4">
      <div class="max-w-[300px] flex-1 min-w-[200px]">
        <LnSearch v-model="q" placeholder="Tìm theo tên hoặc email…" />
      </div>
      <LnSegment v-model="plan" :options="[{ v: 'all', label: 'Tất cả' }, { v: 'pro', label: 'Pro' }, { v: 'free', label: 'Free' }]" />
      <div class="flex-1" />
      <LnBtn variant="outline" size="sm" icon="download">Xuất CSV</LnBtn>
      <LnBtn variant="primary" size="sm" icon="user-plus">Thêm</LnBtn>
    </div>

    <!-- table -->
    <div class="bg-paper-0 border border-line rounded-lg-ln overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th v-for="h in ['Người dùng', 'Gói', 'ELO', 'Vai trò', 'Trạng thái', 'Tham gia', '']" :key="h" class="text-left font-body font-bold text-[0.72rem] tracking-[0.04em] uppercase text-ink-3 px-4 py-3 bg-paper-2 border-b border-line whitespace-nowrap">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in rows" :key="u.handle" class="transition-colors hover:bg-paper-1">
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <div class="flex items-center gap-2.5">
                <LnAvatar :name="u.name" :color="u.color" :size="34" />
                <div>
                  <div class="font-body text-[0.8125rem] font-semibold">{{ u.name }}</div>
                  <div class="text-xs text-ink-3">{{ u.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <LnBadge v-if="u.plan === 'Pro'" tone="gold" status>Pro</LnBadge>
              <span v-else class="ln-spill mut">Free</span>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-body text-[0.9375rem]">{{ u.elo }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <LnBadge v-if="u.role === 'mod'" tone="reu">Mod</LnBadge>
              <span v-else class="text-ink-3 text-xs">Thành viên</span>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <span class="ln-spill" :class="u.status === 'active' ? 'ok' : 'err'">{{ u.status === 'active' ? 'Hoạt động' : 'Bị khóa' }}</span>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle text-ink-3 text-xs">{{ u.joined }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <div class="flex gap-1 justify-end">
                <LnIconBtn :size="32" title="Sửa"><LnIcon name="pen-line" :size="15" /></LnIconBtn>
                <LnIconBtn :size="32" :title="u.status === 'active' ? 'Khóa' : 'Mở khóa'">
                  <LnIcon :name="u.status === 'active' ? 'ban' : 'check'" :size="15" :class="u.status === 'active' ? 'text-error' : 'text-success'" />
                </LnIconBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- footer -->
    <div class="flex items-center justify-between mt-3.5">
      <span class="text-ink-3 text-xs">{{ rows.length }} / {{ A_USERS.length }} người dùng</span>
      <div class="flex gap-1.5">
        <LnBtn variant="outline" size="sm" icon="chevron-left" />
        <LnBtn variant="outline" size="sm">1</LnBtn>
        <LnBtn variant="ghost" size="sm">2</LnBtn>
        <LnBtn variant="outline" size="sm" icon="chevron-right" />
      </div>
    </div>
  </div>
</template>

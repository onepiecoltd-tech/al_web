<script setup lang="ts">
import type { AdminReport, Paginated } from '~/types/api'

const tab = ref<'open' | 'done'>('open')
const status = computed(() => (tab.value === 'open' ? 'open' : 'resolved'))
const page = ref(1)
watch(tab, () => { page.value = 1 })

const { data: res, refresh } = await useFetch<Paginated<AdminReport>>('/api/admin/reports', {
  query: { status, page, limit: 10 },
  default: () => ({ data: [], meta: { page: 1, limit: 10, total: 0, total_pages: 0 } }),
})
const reports = computed(() => res.value.data)
const totalPages = computed(() => res.value.meta.total_pages)

const actionLabel: Record<string, string> = { dismissed: 'Đã bỏ qua', hidden: 'Đã ẩn', removed: 'Đã gỡ' }

function fmtAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return `${Math.floor(diff / 86400)} ngày trước`
}

const toast = useToast()
const confirm = useConfirm()
const busy = ref<string | null>(null)
async function resolve(r: AdminReport, action: string) {
  if (action === 'removed' && !await confirm.ask({ title: 'Gỡ nội dung?', message: 'Nội dung bị báo cáo sẽ bị gỡ khỏi hệ thống.', confirmLabel: 'Gỡ', danger: true }))
    return
  busy.value = r.id
  try {
    await $fetch(`/api/admin/reports/${r.id}/resolve`, { method: 'POST', body: { action } })
    await refresh()
    toast.ok(`${actionLabel[action] ?? 'Đã xử lý'} báo cáo.`)
  }
  catch { toast.err('Xử lý thất bại. Vui lòng thử lại.') }
  finally {
    busy.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-3 flex-wrap">
      <LnSegment v-model="tab" :options="[{ v: 'open', label: 'Chờ xử lý' }, { v: 'done', label: 'Đã xử lý' }]" />
      <div class="flex-1" />
      <span class="text-ink-3 text-xs">{{ reports.length }} báo cáo</span>
    </div>

    <div v-if="!reports.length" class="text-center text-ink-3 text-sm py-10">
      {{ tab === 'open' ? 'Không có báo cáo nào chờ xử lý.' : 'Chưa có báo cáo nào được xử lý.' }}
    </div>

    <LnCard v-for="r in reports" :key="r.id" class="flex gap-3.5 items-center">
      <div class="grid place-items-center w-[42px] h-[42px] rounded-md-ln flex-none" :class="r.severity === 'err' ? 'bg-error-bg' : 'bg-warning-bg'">
        <LnIcon name="flag" :size="19" :class="r.severity === 'err' ? 'text-error capitalize' : 'text-warning'" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-body text-base font-semibold">{{ r.content }}</div>
        <div class="flex gap-2.5 mt-[3px] items-center">
          <LnBadge tone="son">{{ r.type }}</LnBadge>
          <span class="text-ink-3 text-xs">bởi {{ r.reporter }} · {{ fmtAgo(r.created_at) }}</span>
        </div>
      </div>
      <div v-if="tab === 'open'" class="flex gap-2">
        <LnBtn variant="ghost" size="sm" :disabled="busy === r.id" @click="resolve(r, 'dismissed')">Bỏ qua</LnBtn>
        <LnBtn variant="outline" size="sm" icon="eye-off" :disabled="busy === r.id" @click="resolve(r, 'hidden')">Ẩn</LnBtn>
        <LnBtn variant="primary" size="sm" icon="trash-2" :disabled="busy === r.id" @click="resolve(r, 'removed')">Gỡ</LnBtn>
      </div>
      <LnBadge v-else tone="reu">{{ actionLabel[r.action] ?? 'Đã xử lý' }}</LnBadge>
    </LnCard>

    <div class="flex justify-end">
      <LnPager v-model:page="page" :total-pages="totalPages" />
    </div>
  </div>
</template>

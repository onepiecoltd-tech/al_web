<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { AdminExam, Paginated } from '~/types/api'

const page = ref(1)
const { data: res, refresh } = await useFetch<Paginated<AdminExam>>('/api/admin/exams', {
  query: { page, limit: 10 },
  default: () => ({ data: [], meta: { page: 1, limit: 10, total: 0, total_pages: 0 } }),
})
const exams = computed(() => res.value.data)
const totalPages = computed(() => res.value.meta.total_pages)

const stateClass: Record<string, string> = { published: 'ok', review: 'warn', draft: 'mut' }
const stateLabel: Record<string, string> = { published: 'Đã đăng', review: 'Chờ duyệt', draft: 'Nháp' }
const examTypes = ['IELTS', 'TOEIC', 'TOEFL', 'Từ vựng']

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

// create (upload card)
const drop = ref(false)
const form = reactive({ name: '', type: 'IELTS', questions: 0 })
const creating = ref(false)
function onDrop(e: DragEvent) {
  e.preventDefault()
  drop.value = false
}
async function create() {
  if (!form.name.trim())
    return
  creating.value = true
  try {
    await $fetch('/api/admin/exams', { method: 'POST', body: { ...form } })
    Object.assign(form, { name: '', type: 'IELTS', questions: 0 })
    await refresh()
  }
  finally {
    creating.value = false
  }
}

async function update(e: AdminExam, patch: Partial<AdminExam>) {
  await $fetch(`/api/admin/exams/${e.id}`, {
    method: 'PUT',
    body: { name: e.name, type: e.type, questions: e.questions, state: e.state, ...patch },
  })
  await refresh()
}

async function remove(e: AdminExam) {
  await $fetch(`/api/admin/exams/${e.id}`, { method: 'DELETE' })
  await refresh()
}

// edit dialog
const editOpen = ref(false)
const editing = ref<AdminExam | null>(null)
const editForm = reactive({ name: '', type: 'IELTS', questions: 0, state: 'draft' as AdminExam['state'] })
function openEdit(e: AdminExam) {
  editing.value = e
  Object.assign(editForm, { name: e.name, type: e.type, questions: e.questions, state: e.state })
  editOpen.value = true
}
async function saveEdit() {
  if (!editing.value)
    return
  await update(editing.value, { ...editForm })
  editOpen.value = false
}
</script>

<template>
  <div class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
    <!-- exam table + pager -->
    <div class="flex flex-col gap-3">
    <div class="bg-paper-0 border border-line rounded-lg-ln overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th v-for="h in ['Đề / bộ câu hỏi', 'Loại', 'Số câu', 'Người tạo', 'Trạng thái', '']" :key="h" class="text-left font-body font-bold text-[0.72rem] tracking-[0.04em] uppercase text-ink-3 px-4 py-3 bg-paper-2 border-b border-line whitespace-nowrap">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in exams" :key="e.id" class="transition-colors hover:bg-paper-1">
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <div class="flex items-center gap-2.5">
                <div class="grid place-items-center w-[34px] h-[34px] rounded-md-ln bg-reu-soft flex-none">
                  <LnIcon name="file-text" :size="16" class="text-reu-deep" />
                </div>
                <div>
                  <div class="font-body text-[0.8125rem] font-semibold">{{ e.name }}</div>
                  <div class="text-xs text-ink-3">{{ fmtDate(e.created_at) }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle"><LnBadge tone="reu">{{ e.type }}</LnBadge></td>
            <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-body text-[0.9375rem]">{{ e.questions }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle text-ink-3 text-xs">{{ e.author }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <span class="ln-spill" :class="stateClass[e.state]">{{ stateLabel[e.state] }}</span>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <div class="flex gap-1 justify-end items-center">
                <LnBtn v-if="e.state === 'review'" variant="secondary" size="sm" @click="update(e, { state: 'published' })">Duyệt</LnBtn>
                <LnIconBtn :size="32" title="Sửa" @click="openEdit(e)"><LnIcon name="pen-line" :size="15" /></LnIconBtn>
                <LnIconBtn :size="32" title="Xóa" @click="remove(e)"><LnIcon name="trash-2" :size="15" class="text-error" /></LnIconBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      <div class="flex justify-end">
        <LnPager v-model:page="page" :total-pages="totalPages" />
      </div>
    </div>

    <!-- create card -->
    <LnCard pop>
      <b class="font-body text-base font-bold">Thêm đề thi mới</b>
      <div
        :class="cn(
          'mt-3.5 border-[1.5px] border-dashed rounded-lg-ln p-8 text-center',
          drop ? 'border-son bg-son-soft' : 'border-line-strong bg-paper-2',
        )"
        @dragover.prevent="drop = true"
        @dragleave="drop = false"
        @drop="onDrop"
      >
        <LnIcon name="upload-cloud" :size="30" class="text-ink-4 mx-auto mb-2.5" />
        <div class="font-body text-[0.9375rem]">Kéo-thả hoặc <b class="text-son">chọn tệp</b></div>
        <div class="text-ink-3 text-xs mt-1.5">PDF · DOCX · XLSX · CSV — (trích xuất tệp sẽ bổ sung sau)</div>
      </div>

      <div class="flex flex-col gap-3 mt-4">
        <LnField v-model="form.name" label="Tên đề" placeholder="VD: Cambridge IELTS 19 — Test 1" />
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Loại</label>
          <select v-model="form.type" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] text-ink focus:outline-none focus:border-son">
            <option v-for="t in examTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Số câu</label>
          <input v-model.number="form.questions" type="number" min="0" placeholder="0" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] text-ink focus:outline-none focus:border-son">
        </div>
        <LnBtn variant="primary" icon="plus" class="w-full" :disabled="creating" @click="create">
          {{ creating ? 'Đang tạo…' : 'Tạo đề (nháp)' }}
        </LnBtn>
      </div>
    </LnCard>

    <!-- edit dialog -->
    <LnDialog :open="editOpen" :width="460" @close="editOpen = false">
      <div class="flex items-center justify-between mb-4">
        <b class="font-display text-[1.3125rem] font-bold">Sửa đề thi</b>
        <LnIconBtn @click="editOpen = false"><LnIcon name="x" :size="20" /></LnIconBtn>
      </div>
      <div class="flex flex-col gap-3.5">
        <LnField v-model="editForm.name" label="Tên đề" />
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Loại</label>
          <select v-model="editForm.type" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] focus:outline-none focus:border-son">
            <option v-for="t in examTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Số câu</label>
          <input v-model.number="editForm.questions" type="number" min="0" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] text-ink focus:outline-none focus:border-son">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Trạng thái</label>
          <select v-model="editForm.state" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] focus:outline-none focus:border-son">
            <option value="draft">Nháp</option>
            <option value="review">Chờ duyệt</option>
            <option value="published">Đã đăng</option>
          </select>
        </div>
        <div class="flex gap-2.5 mt-1">
          <LnBtn variant="ghost" class="flex-1" @click="editOpen = false">Hủy</LnBtn>
          <LnBtn variant="primary" class="flex-1" @click="saveEdit">Lưu</LnBtn>
        </div>
      </div>
    </LnDialog>
  </div>
</template>

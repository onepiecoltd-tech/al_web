<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { AdminExam, Paginated } from '~/types/api'

const localePath = useLocalePath()
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
const toast = useToast()
const confirm = useConfirm()
const creating = ref(false)
const fileInput = ref<HTMLInputElement>()
const examFile = ref<File>()
const MAX_FILE_SIZE = 5 * 1024 * 1024
function pickFile(f?: File | null) {
  if (!f)
    return
  if (!/\.(pdf|txt)$/i.test(f.name)) {
    toast.err('Chỉ hỗ trợ tệp PDF hoặc TXT.')
    return
  }
  if (f.size > MAX_FILE_SIZE) {
    toast.err('Tệp vượt quá giới hạn 5MB.')
    return
  }
  examFile.value = f
  if (!form.name.trim())
    form.name = f.name.replace(/\.(pdf|txt)$/i, '')
}

// upload progress (0-100), undefined when not uploading
const importProgress = ref<number>()
// true once the upload finished and the server is busy extracting via AI (no progress signal for this part)
const aiProcessing = ref(false)
function importFile(examId: string, file: File) {
  return new Promise<{ imported: number }>((resolve, reject) => {
    const fd = new FormData()
    fd.append('file', file)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `/api/admin/exams/${examId}/import`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        importProgress.value = Math.round((e.loaded / e.total) * 100)
    }
    xhr.upload.onload = () => { aiProcessing.value = true }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300)
        resolve(JSON.parse(xhr.responseText))
      else
        reject(new Error(JSON.parse(xhr.responseText)?.statusMessage ?? 'Nhập câu hỏi thất bại.'))
    }
    xhr.onerror = () => reject(new Error('Nhập câu hỏi thất bại.'))
    xhr.send(fd)
  })
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  drop.value = false
  pickFile(e.dataTransfer?.files?.[0])
}
async function create() {
  if (!form.name.trim())
    return
  creating.value = true
  try {
    const exam = await $fetch<AdminExam>('/api/admin/exams', { method: 'POST', body: { ...form } })
    if (examFile.value) {
      importProgress.value = 0
      const res = await importFile(exam.id, examFile.value)
      toast.ok(`Đã tạo đề "${form.name}" và AI nhập được ${res.imported} câu hỏi.`)
    }
    else {
      toast.ok(`Đã tạo đề "${form.name}".`)
    }
    Object.assign(form, { name: '', type: 'IELTS', questions: 0 })
    examFile.value = undefined
    await refresh()
  }
  catch (e) {
    // The import call may have errored client-side (e.g. proxy/timeout) while the
    // AI extraction still finished on the server — re-check before reporting failure.
    if (examFile.value) {
      await refresh()
      const imported = exams.value.find(x => x.name === form.name)?.questions
      if (imported) {
        toast.ok(`Đã tạo đề "${form.name}" và AI nhập được ${imported} câu hỏi.`)
        Object.assign(form, { name: '', type: 'IELTS', questions: 0 })
        examFile.value = undefined
        return
      }
    }
    toast.err((e as Error).message ?? 'Tạo đề thất bại.')
  }
  finally {
    creating.value = false
    importProgress.value = undefined
    aiProcessing.value = false
  }
}

async function update(e: AdminExam, patch: Partial<AdminExam>, opts: { quiet?: boolean } = {}) {
  try {
    await $fetch(`/api/admin/exams/${e.id}`, {
      method: 'PUT',
      body: { name: e.name, type: e.type, questions: e.questions, state: e.state, ...patch },
    })
    await refresh()
    if (!opts.quiet)
      toast.ok(`Đã cập nhật đề "${e.name}".`)
  }
  catch { toast.err('Cập nhật thất bại.') }
}

async function remove(e: AdminExam) {
  if (!await confirm.ask({ title: 'Xóa đề thi?', message: `Đề "${e.name}" và toàn bộ câu hỏi trong ngân hàng của đề sẽ bị xóa vĩnh viễn.`, confirmLabel: 'Xóa', danger: true }))
    return
  try {
    await $fetch(`/api/admin/exams/${e.id}`, { method: 'DELETE' })
    await refresh()
    toast.ok(`Đã xóa đề "${e.name}".`)
  }
  catch { toast.err('Xóa thất bại.') }
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
  await update(editing.value, { ...editForm }, { quiet: true })
  if (editOpen.value) {
    toast.ok(`Đã cập nhật đề "${editForm.name}".`)
    editOpen.value = false
  }
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
            <th v-for="h in ['Đề / bộ câu hỏi', 'Loại', 'Số câu', 'Người tạo', 'Trạng thái', '']" :key="h" class="text-left font-body font-bold text-[0.72rem] tracking-[0.04em] capitalize text-ink-3 px-4 py-3 bg-paper-2 border-b border-line whitespace-nowrap">
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
                <LnBtn v-if="e.state !== 'published'" variant="secondary" size="sm" @click="update(e, { state: 'published' })">{{ e.state === 'review' ? 'Duyệt' : 'Đăng' }}</LnBtn>
                <LnIconBtn :size="32" title="Xem chi tiết" @click="navigateTo(localePath(`/admin/de-thi/${e.id}`))"><LnIcon name="eye" :size="15" /></LnIconBtn>
                <LnIconBtn :size="32" title="Sửa" @click="openEdit(e)"><LnIcon name="pen-line" :size="15" /></LnIconBtn>
                <LnIconBtn :size="32" title="Xóa" @click="remove(e)"><LnIcon name="trash-2" :size="15" class="text-error capitalize" /></LnIconBtn>
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
        @click="fileInput?.click()"
      >
        <input ref="fileInput" type="file" accept=".pdf,.txt,application/pdf,text/plain" class="hidden" @change="pickFile(($event.target as HTMLInputElement).files?.[0])">
        <LnIcon name="upload-cloud" :size="30" class="text-ink-4 mx-auto mb-2.5" />
        <div class="font-body text-[0.9375rem]">Kéo-thả hoặc <b class="text-son">chọn tệp</b></div>
        <div v-if="examFile" class="text-son text-xs mt-1.5 font-semibold">{{ examFile.name }}</div>
        <div v-else class="text-ink-3 text-xs mt-1.5">Tệp đề thi (.pdf hoặc .txt, tối đa 5MB) — AI tự tách câu hỏi &amp; đáp án mẫu</div>
      </div>
      <div v-if="importProgress !== undefined" class="mt-2.5">
        <div class="h-1.5 rounded-full bg-paper-2 overflow-hidden">
          <div
            :class="cn('h-full bg-son transition-[width]', aiProcessing && 'animate-pulse')"
            :style="{ width: `${aiProcessing ? 100 : importProgress}%` }"
          />
        </div>
        <div class="text-xs text-ink-3 mt-1">
          {{ aiProcessing ? 'Đang xử lý bằng AI… có thể mất 1-2 phút, vui lòng đợi' : `Đang tải lên… ${importProgress}%` }}
        </div>
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

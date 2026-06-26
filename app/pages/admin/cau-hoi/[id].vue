<script setup lang="ts">
import { languageLabel } from '~/lib/languages'
import { skillLabel } from '~/lib/skills'
import type { AdminQuestion } from '~/types/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Sửa câu hỏi — LuyệnNgữ Admin' })

const route = useRoute()
const localePath = useLocalePath()
const toast = useToast()
const confirm = useConfirm()
const id = route.params.id as string

const { data: q } = await useFetch<AdminQuestion>(`/api/admin/questions/${id}`)

const form = reactive({ prompt: '', sample_answer: '' })
watchEffect(() => {
  if (q.value)
    Object.assign(form, { prompt: q.value.prompt, sample_answer: q.value.sample_answer })
})

const saving = ref(false)
async function save() {
  if (!form.prompt.trim())
    return
  saving.value = true
  try {
    await $fetch(`/api/admin/questions/${id}`, { method: 'PUT', body: { ...form } })
    if (q.value)
      Object.assign(q.value, { prompt: form.prompt, sample_answer: form.sample_answer })
    toast.ok('Đã lưu câu hỏi.')
  }
  catch {
    toast.err('Lưu thất bại.')
  }
  finally {
    saving.value = false
  }
}

const generating = ref(false)
async function generateAnswer() {
  generating.value = true
  try {
    const { sample_answer } = await $fetch<{ sample_answer: string }>(`/api/admin/questions/${id}/generate-answer`, { method: 'POST' })
    form.sample_answer = sample_answer
    toast.ok('Đã tạo đáp án bằng AI. Nhớ bấm Lưu nếu muốn chỉnh thêm.')
  }
  catch {
    toast.err('Tạo đáp án thất bại. Hãy thử lại.')
  }
  finally {
    generating.value = false
  }
}

async function remove() {
  if (!await confirm.ask({ title: 'Xóa câu hỏi?', message: 'Câu hỏi này sẽ bị xóa vĩnh viễn khỏi ngân hàng.', confirmLabel: 'Xóa', danger: true }))
    return
  try {
    await $fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    toast.ok('Đã xóa câu hỏi.')
    navigateTo(localePath('/admin/cau-hoi'))
  }
  catch {
    toast.err('Xóa thất bại.')
  }
}
</script>

<template>
  <div class="max-w-[760px] flex flex-col gap-4">
    <LnBtn variant="ghost" size="sm" icon="arrow-left" class="self-start" @click="navigateTo(localePath('/admin/cau-hoi'))">Quay lại danh sách</LnBtn>

    <div v-if="!q" class="text-ink-3 font-body text-[0.9375rem]">Không tìm thấy câu hỏi.</div>

    <template v-else>
      <!-- meta -->
      <div class="flex flex-wrap items-center gap-2 bg-paper-0 border border-line rounded-lg-ln p-3.5">
        <LnBadge v-if="q.type" tone="reu">{{ skillLabel(q.type) }}</LnBadge>
        <LnBadge tone="info">{{ languageLabel(q.language) }}</LnBadge>
        <LnBadge v-if="q.sample_answer" tone="success">Đã có đáp án</LnBadge>
        <LnBadge v-else tone="gold">Chưa có đáp án</LnBadge>
        <span class="text-ink-3 font-body text-xs ml-auto">Thuộc đề: <b class="text-ink-2">{{ q.exam_name }}</b> · câu {{ q.position }}</span>
      </div>

      <!-- edit form -->
      <div class="bg-paper-0 border border-line rounded-lg-ln p-5 flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Nội dung câu hỏi</label>
          <textarea v-model="form.prompt" rows="3" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] text-ink focus:outline-none focus:border-son" />
        </div>
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Đáp án mẫu</label>
            <LnBtn variant="ghost" size="sm" icon="sparkles" :disabled="generating" @click="generateAnswer">
              {{ generating ? 'Đang tạo…' : 'Tạo đáp án bằng AI' }}
            </LnBtn>
          </div>
          <textarea v-model="form.sample_answer" rows="8" placeholder="Để trống nếu chưa có đáp án" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] text-ink focus:outline-none focus:border-son" />
        </div>
        <div class="flex items-center gap-2.5">
          <LnBtn variant="primary" icon="check" :disabled="saving || !form.prompt.trim()" @click="save">{{ saving ? 'Đang lưu…' : 'Lưu' }}</LnBtn>
          <LnBtn variant="ghost" class="ml-auto text-error" icon="trash-2" @click="remove">Xóa câu hỏi</LnBtn>
        </div>
      </div>
    </template>
  </div>
</template>

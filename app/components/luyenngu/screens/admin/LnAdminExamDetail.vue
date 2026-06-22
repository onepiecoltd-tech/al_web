<script setup lang="ts">
import type { AdminExam, Question } from '~/types/api'

const route = useRoute()
const localePath = useLocalePath()
const id = route.params.id as string

const { data: exam } = await useFetch<AdminExam>(`/api/admin/exams/${id}`)
const { data: questions, pending } = await useFetch<Question[]>(`/api/admin/exams/${id}/questions`, {
  default: () => [],
})

const stateClass: Record<string, string> = { published: 'ok', review: 'warn', draft: 'mut' }
const stateLabel: Record<string, string> = { published: 'Đã đăng', review: 'Chờ duyệt', draft: 'Nháp' }

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <LnBtn variant="ghost" size="sm" icon="chevron-left" @click="navigateTo(localePath('/admin/de-thi'))">
      Quay lại đề thi
    </LnBtn>

    <LnCard v-if="exam" pop>
      <div class="flex items-start justify-between gap-3">
        <div>
          <b class="font-display text-[1.3125rem] font-bold">{{ exam.name }}</b>
          <div class="flex items-center gap-2.5 mt-1.5 text-ink-3 text-xs">
            <LnBadge tone="reu">{{ exam.type }}</LnBadge>
            <span>{{ exam.questions }} câu</span>
            <span>·</span>
            <span>{{ exam.author }}</span>
            <span>·</span>
            <span>{{ fmtDate(exam.created_at) }}</span>
          </div>
        </div>
        <span class="ln-spill" :class="stateClass[exam.state]">{{ stateLabel[exam.state] }}</span>
      </div>
    </LnCard>

    <LnCard pop>
      <div class="flex items-center justify-between mb-3.5">
        <b class="font-body text-base font-bold">Ngân hàng câu hỏi ({{ questions?.length ?? 0 }})</b>
      </div>

      <div v-if="pending" class="text-ink-3 text-sm py-4">Đang tải…</div>
      <div v-else-if="!questions?.length" class="text-ink-3 text-sm py-4">
        Chưa có câu hỏi nào. Tải lên PDF ở trang đề thi để nhập câu hỏi.
      </div>
      <div v-else class="flex flex-col gap-3">
        <div v-for="q in questions" :key="q.id" class="border border-line rounded-lg-ln p-4">
          <div class="flex gap-2.5">
            <span class="font-body text-[0.8125rem] font-bold text-son flex-none">{{ q.position }}.</span>
            <p class="font-body text-[0.9375rem]">{{ q.prompt }}</p>
          </div>
          <p v-if="q.sample_answer" class="text-ink-3 text-[0.8125rem] mt-2 pl-[22px]">{{ q.sample_answer }}</p>
        </div>
      </div>
    </LnCard>
  </div>
</template>

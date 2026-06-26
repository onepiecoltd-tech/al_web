<script setup lang="ts">
import { LANGUAGES, languageLabel } from '~/lib/languages'
import { SKILLS, skillLabel } from '~/lib/skills'
import type { AdminQuestion, Paginated } from '~/types/api'

const toast = useToast()
const confirm = useConfirm()
const localePath = useLocalePath()

// --- Filters (all server-side) ---
const page = ref(1)
const fLang = ref('')
const fSkill = ref('')
const fAnswered = ref('') // '' | 'yes' | 'no'
const searchInput = ref('')
const search = ref('')

// Debounce the search box so each keystroke doesn't hit the backend.
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (v) => {
  if (searchTimer)
    clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { search.value = v }, 300)
})
// Any filter change goes back to page 1.
watch([fLang, fSkill, fAnswered, search], () => { page.value = 1 })

const { data: res, refresh } = await useFetch<Paginated<AdminQuestion>>('/api/admin/questions', {
  query: { page, limit: 20, lang: fLang, skill: fSkill, answered: fAnswered, q: search },
  default: () => ({ data: [], meta: { page: 1, limit: 20, total: 0, total_pages: 0 } }),
})
const questions = computed(() => res.value.data)
const totalPages = computed(() => res.value.meta.total_pages)
const total = computed(() => res.value.meta.total)

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function openEdit(q: AdminQuestion) {
  navigateTo(localePath(`/admin/cau-hoi/${q.id}`))
}

// Generate a sample answer via AI for one question.
const generatingId = ref<string | null>(null)
async function generateAnswer(q: AdminQuestion) {
  generatingId.value = q.id
  try {
    const { sample_answer } = await $fetch<{ sample_answer: string }>(`/api/admin/questions/${q.id}/generate-answer`, { method: 'POST' })
    // Update the row from the response directly — don't rely on refetch timing.
    q.sample_answer = sample_answer
    toast.ok('Đã tạo đáp án bằng AI.')
  }
  catch {
    toast.err('Tạo đáp án thất bại. Hãy thử lại.')
  }
  finally {
    generatingId.value = null
  }
}

async function remove(q: AdminQuestion) {
  if (!await confirm.ask({ title: 'Xóa câu hỏi?', message: 'Câu hỏi này sẽ bị xóa vĩnh viễn khỏi ngân hàng.', confirmLabel: 'Xóa', danger: true }))
    return
  try {
    await $fetch(`/api/admin/questions/${q.id}`, { method: 'DELETE' })
    await refresh()
    toast.ok('Đã xóa câu hỏi.')
  }
  catch {
    toast.err('Xóa thất bại.')
  }
}

function resetFilters() {
  fLang.value = ''
  fSkill.value = ''
  fAnswered.value = ''
  searchInput.value = ''
  search.value = ''
}
const selCls = 'px-2.5 py-1.5 rounded-md-ln border border-line bg-paper-0 font-body text-sm focus:outline-none focus:border-son'
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- filter bar -->
    <div class="flex flex-wrap items-center gap-2.5 bg-paper-0 border border-line rounded-lg-ln p-3">
      <div class="flex-1 min-w-[200px]">
        <LnSearch v-model="searchInput" placeholder="Tìm theo nội dung câu hỏi hoặc đáp án…" />
      </div>
      <select v-model="fLang" :class="selCls">
        <option value="">Mọi ngôn ngữ</option>
        <option v-for="l in LANGUAGES" :key="l.code" :value="l.code">{{ l.label }}</option>
      </select>
      <select v-model="fSkill" :class="selCls">
        <option value="">Mọi kỹ năng</option>
        <option v-for="s in SKILLS" :key="s.code" :value="s.code">{{ s.label }}</option>
      </select>
      <select v-model="fAnswered" :class="selCls">
        <option value="">Đáp án: tất cả</option>
        <option value="yes">Đã có đáp án</option>
        <option value="no">Chưa có đáp án</option>
      </select>
      <LnBtn v-if="fLang || fSkill || fAnswered || search" variant="ghost" size="sm" icon="x" @click="resetFilters">Xóa lọc</LnBtn>
    </div>

    <!-- table -->
    <div class="bg-paper-0 border border-line rounded-lg-ln overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th v-for="h in ['Câu hỏi', 'Ngôn ngữ', 'Kỹ năng', 'Đáp án', '']" :key="h" class="text-left font-body font-bold text-[0.72rem] tracking-[0.04em] capitalize text-ink-3 px-4 py-3 bg-paper-2 border-b border-line whitespace-nowrap">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!questions.length">
            <td colspan="5" class="px-4 py-8 text-center text-ink-3 font-body text-[0.9375rem]">Không có câu hỏi nào khớp bộ lọc.</td>
          </tr>
          <tr v-for="q in questions" :key="q.id" class="transition-colors hover:bg-paper-1 align-top">
            <td class="px-4 py-3 border-b border-line-soft max-w-[480px]">
              <div class="font-body text-[0.8125rem] text-ink line-clamp-2">{{ q.prompt }}</div>
              <div v-if="q.sample_answer" class="font-body text-xs text-ink-2 mt-1 pl-2 border-l-2 border-success/40 line-clamp-3 whitespace-pre-line">{{ q.sample_answer }}</div>
              <div class="text-xs text-ink-3 mt-0.5">{{ fmtDate(q.created_at) }}</div>
            </td>
            <td class="px-4 py-3 border-b border-line-soft text-ink-2 text-xs whitespace-nowrap">{{ languageLabel(q.language) }}</td>
            <td class="px-4 py-3 border-b border-line-soft"><LnBadge v-if="q.type" tone="reu">{{ skillLabel(q.type) }}</LnBadge><span v-else class="text-ink-3 text-xs">—</span></td>
            <td class="px-4 py-3 border-b border-line-soft">
              <LnBadge v-if="q.sample_answer" tone="success">Có</LnBadge>
              <LnBadge v-else tone="gold">Thiếu</LnBadge>
            </td>
            <td class="px-4 py-3 border-b border-line-soft">
              <div class="flex gap-1 justify-end items-center">
                <LnBtn variant="ghost" size="sm" icon="sparkles" :disabled="generatingId === q.id" :title="q.sample_answer ? 'Tạo lại đáp án bằng AI' : 'Tạo đáp án bằng AI'" @click="generateAnswer(q)">
                  {{ generatingId === q.id ? 'Đang tạo…' : 'Tạo đáp án' }}
                </LnBtn>
                <LnIconBtn :size="32" title="Sửa" @click="openEdit(q)"><LnIcon name="pen-line" :size="15" /></LnIconBtn>
                <LnIconBtn :size="32" title="Xóa" @click="remove(q)"><LnIcon name="trash-2" :size="15" class="text-error" /></LnIconBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-end">
      <LnPager v-model:page="page" :total-pages="totalPages" :total="total" />
    </div>
  </div>
</template>

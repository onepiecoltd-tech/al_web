<script setup lang="ts">
import { cn } from '~/lib/utils'
import { A_EXAMS } from '~/composables/useLnData'

const drop = ref(false)
const examName = ref('')

function onDrop(e: DragEvent) {
  e.preventDefault()
  drop.value = false
}

const stateClass: Record<string, string> = { published: 'ok', review: 'warn', draft: 'mut' }
const stateLabel: Record<string, string> = { published: 'Đã đăng', review: 'Chờ duyệt', draft: 'Nháp' }
</script>

<template>
  <div class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
    <!-- exam table -->
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
          <tr v-for="e in A_EXAMS" :key="e.name" class="transition-colors hover:bg-paper-1">
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <div class="flex items-center gap-2.5">
                <div class="grid place-items-center w-[34px] h-[34px] rounded-md-ln bg-reu-soft flex-none">
                  <LnIcon name="file-text" :size="16" class="text-reu-deep" />
                </div>
                <div>
                  <div class="font-body text-[0.8125rem] font-semibold">{{ e.name }}</div>
                  <div class="text-xs text-ink-3">{{ e.date }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle"><LnBadge tone="reu">{{ e.type }}</LnBadge></td>
            <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-body text-[0.9375rem]">{{ e.q }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle text-ink-3 text-xs">{{ e.by }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <span class="ln-spill" :class="stateClass[e.state]">{{ stateLabel[e.state] }}</span>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <div class="flex gap-1 justify-end items-center">
                <LnBtn v-if="e.state === 'review'" variant="secondary" size="sm">Duyệt</LnBtn>
                <LnIconBtn :size="32"><LnIcon name="ellipsis" :size="16" /></LnIconBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- upload card -->
    <LnCard pop>
      <b class="font-body text-base font-bold">Tải lên đề thi mới</b>
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
        <div class="text-ink-3 text-xs mt-1.5">PDF · DOCX · XLSX · CSV — tối đa 25MB</div>
      </div>

      <div class="flex flex-col gap-3 mt-4">
        <LnField v-model="examName" label="Tên đề" placeholder="VD: Cambridge IELTS 19 — Test 1" />
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Loại</label>
          <select class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] text-ink focus:outline-none focus:border-son focus:shadow-[0_0_0_3px_var(--son-soft)]">
            <option>IELTS</option><option>TOEIC</option><option>TOEFL</option><option>Từ vựng</option>
          </select>
        </div>
        <LnBtn variant="primary" icon="upload" class="w-full">Tải lên & trích xuất</LnBtn>
        <p class="text-ink-3 text-xs">Server (Go) trích xuất văn bản, tách câu hỏi, rồi đưa vào ngân hàng sau khi duyệt.</p>
      </div>
    </LnCard>
  </div>
</template>

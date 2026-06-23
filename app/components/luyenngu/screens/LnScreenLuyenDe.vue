<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { AdminExam, Paginated, Question } from '~/types/api'

const VALID_TABS = ['nguon', 'giai', 'lam']
const route = useRoute()
const router = useRouter()
const tab = ref(VALID_TABS.includes(route.query.tab as string) ? (route.query.tab as string) : 'nguon')
watch(tab, (v) => {
  router.replace({ query: { ...route.query, tab: v } })
})
const toast = useToast()

// --- Nguồn đề: đề người dùng tự tải lên ---
const { data: mineRes, refresh: refreshMine } = await useFetch<Paginated<AdminExam>>('/api/exams/mine', {
  query: { limit: 50 },
  default: () => ({ data: [], meta: { page: 1, limit: 50, total: 0, total_pages: 0 } }),
})
const myExams = computed(() => mineRes.value.data)

const fileInput = ref<HTMLInputElement>()
const drop = ref(false)
const uploading = ref(false)
// 0-100 while bytes upload, then null while AI extracts (no progress signal)
const uploadPct = ref<number | null>(null)
const aiBusy = ref(false)
const MAX = 5 * 1024 * 1024

function fileExt(name: string) {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toUpperCase() : '?'
}
function fmtWhen(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}
const iconTone: Record<string, string> = { PDF: 'son', TXT: 'gold' }
const sourceIconBg: Record<string, string> = { son: 'bg-son-soft text-son-deep', reu: 'bg-reu-soft text-reu-deep', gold: 'bg-gold-soft text-gold-deep' }

function pickAndUpload(f?: File | null) {
  if (!f || uploading.value)
    return
  if (!/\.(pdf|txt)$/i.test(f.name)) {
    toast.err('Chỉ hỗ trợ tệp PDF hoặc TXT.')
    return
  }
  if (f.size > MAX) {
    toast.err('Tệp vượt quá giới hạn 5MB.')
    return
  }
  uploading.value = true
  uploadPct.value = 0
  aiBusy.value = false
  const fd = new FormData()
  fd.append('file', f)
  const xhr = new XMLHttpRequest()
  xhr.open('POST', '/api/exams/upload')
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable)
      uploadPct.value = Math.round((e.loaded / e.total) * 100)
  }
  xhr.upload.onload = () => { aiBusy.value = true }
  xhr.onload = async () => {
    uploading.value = false
    uploadPct.value = null
    aiBusy.value = false
    if (xhr.status >= 200 && xhr.status < 300) {
      const res = JSON.parse(xhr.responseText)
      toast.ok(`Đã tải lên — AI trích được ${res.imported} câu hỏi.`)
      await refreshMine()
    }
    else {
      toast.err(JSON.parse(xhr.responseText)?.statusMessage ?? 'Tải lên thất bại.')
    }
  }
  xhr.onerror = () => {
    uploading.value = false
    uploadPct.value = null
    aiBusy.value = false
    toast.err('Tải lên thất bại.')
  }
  xhr.send(fd)
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  drop.value = false
  pickAndUpload(e.dataTransfer?.files?.[0])
}

// --- Xem chi tiết đề đã tải lên ---
const detailOpen = ref(false)
const detailLoading = ref(false)
const detailExam = ref<AdminExam | null>(null)
const detailQuestions = ref<Question[]>([])
async function openDetail(id: string) {
  detailOpen.value = true
  detailLoading.value = true
  detailExam.value = null
  detailQuestions.value = []
  try {
    const res = await $fetch<{ exam: AdminExam, questions: Question[] }>(`/api/exams/${id}`)
    detailExam.value = res.exam
    detailQuestions.value = res.questions
  }
  catch {
    toast.err('Không tải được nội dung đề.')
    detailOpen.value = false
  }
  finally {
    detailLoading.value = false
  }
}

// --- Giải đề AI ---
interface ChatMsg { role: 'user' | 'model'; text: string }
const chatExamId = ref<string | null>(null)
const chatMsgs = ref<ChatMsg[]>([])
const chatLoading = ref(false)
const chatInput = ref('')
const chatBusy = ref(false)
const chatBody = ref<HTMLElement>()
const quickAsks = ['Giải thích câu đầu tiên', 'Đáp án mẫu cho câu khó nhất là gì?', 'Tóm tắt đề này trong 2 câu']

async function loadChatHistory(id: string) {
  chatLoading.value = true
  chatMsgs.value = []
  try {
    const res = await $fetch<{ messages: { role: string, text: string }[] }>(`/api/exams/${id}/chat`)
    chatMsgs.value = res.messages.map(m => ({ role: m.role as 'user' | 'model', text: m.text }))
    scrollChatToBottom()
  }
  catch {
    toast.err('Không tải được lịch sử chat.')
  }
  finally {
    chatLoading.value = false
  }
}
watch(myExams, (list) => {
  if (!chatExamId.value && list[0]) {
    chatExamId.value = list[0].id
    loadChatHistory(list[0].id)
  }
}, { immediate: true })
function switchChatExam(id: string) {
  chatExamId.value = id
  loadChatHistory(id)
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function fmt(t: string) {
  return escapeHtml(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')
}
const chatAtBottom = ref(true)

function nearBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

function onChatScroll() {
  if (chatBody.value)
    chatAtBottom.value = nearBottom(chatBody.value)
}

async function scrollChatToBottom() {
  const el = chatBody.value
  if (!el)
    return
  // Don't yank the view down if the user has scrolled up to read earlier text.
  const atBottom = nearBottom(el)
  await nextTick()
  if (atBottom)
    el.scrollTop = el.scrollHeight
}

async function forceScrollToBottom() {
  await nextTick()
  if (chatBody.value)
    chatBody.value.scrollTop = chatBody.value.scrollHeight
}

function sendChat(text?: string) {
  const question = (text ?? chatInput.value).trim()
  if (!question || chatBusy.value || !chatExamId.value)
    return
  chatMsgs.value.push({ role: 'user', text: question })
  chatMsgs.value.push({ role: 'model', text: '' })
  const modelIdx = chatMsgs.value.length - 1
  chatInput.value = ''
  chatBusy.value = true
  scrollChatToBottom()

  // Gemini doesn't stream evenly — it can sit silent for several seconds
  // ("thinking") then dump its whole answer in one or two big bursts. Rather
  // than show that burstiness directly, buffer incoming text and drip it out
  // to the UI at a steady pace, so it always looks like smooth typing
  // regardless of how chunky the actual network delivery is.
  let pending = ''
  let dripTimer: ReturnType<typeof setInterval> | null = null
  let streamEnded = false
  const DRIP_MS = 16
  const DRIP_CHARS = 2

  function stopDrip() {
    if (dripTimer) {
      clearInterval(dripTimer)
      dripTimer = null
    }
  }
  function maybeFinish() {
    if (streamEnded && !pending.length) {
      stopDrip()
      es.close()
      chatBusy.value = false
      scrollChatToBottom()
    }
  }
  function startDrip() {
    if (dripTimer)
      return
    dripTimer = setInterval(() => {
      if (pending.length) {
        chatMsgs.value[modelIdx]!.text += pending.slice(0, DRIP_CHARS)
        pending = pending.slice(DRIP_CHARS)
        scrollChatToBottom()
      }
      else {
        stopDrip()
        maybeFinish()
      }
    }, DRIP_MS)
  }
  function failNow(message: string) {
    toast.err(message)
    stopDrip()
    // Show whatever was already buffered rather than silently dropping it.
    if (pending) {
      chatMsgs.value[modelIdx]!.text += pending
      pending = ''
    }
    if (!chatMsgs.value[modelIdx]!.text) {
      chatMsgs.value.splice(modelIdx, 1)
      chatMsgs.value.pop() // the user question that triggered this failed attempt
    }
    es.close()
    chatBusy.value = false
    scrollChatToBottom()
  }

  // EventSource (not fetch+ReadableStream) — Chrome's fetch streaming
  // buffers the whole response internally for small payloads before handing
  // any of it to JS, which made short answers appear to "arrive all at
  // once". EventSource is purpose-built for SSE and doesn't have that issue.
  const es = new EventSource(`/api/exams/${chatExamId.value}/ask?question=${encodeURIComponent(question)}`)
  es.onmessage = (ev) => {
    let payload: { text?: string, error?: string, done?: boolean }
    try {
      payload = JSON.parse(ev.data)
    }
    catch { return }
    if (payload.text) {
      pending += payload.text
      startDrip()
    }
    if (payload.error) {
      failNow(payload.error)
      return
    }
    if (payload.done) {
      streamEnded = true
      // Close now so EventSource doesn't auto-reconnect when the server ends
      // the stream — the full answer is already buffered in `pending`, and the
      // drip finishes from there. Reconnecting would re-run the whole Ask.
      es.close()
      maybeFinish()
    }
  }
  es.onerror = () => {
    // The server closes the connection after the final "done" event; EventSource
    // reports that close as an error (and tries to reconnect). If we already got
    // "done", the answer is complete — ignore it and let the drip finish.
    if (streamEnded || es.readyState === EventSource.CLOSED)
      return
    failNow('Không nhận được phản hồi từ AI.')
  }
}

// --- Làm đề ---
// Questions here are free-text prompt + sample_answer (no multiple-choice
// data), so grading is self-reported rather than auto-scored.
const phase = ref<'setup' | 'quiz' | 'done'>('setup')
const src = ref<'bank' | 'source'>('source')
const srcOptions: [string, string, string][] = [['source', 'Từ đề của bạn ✦', 'sparkles'], ['bank', 'Ngân hàng có sẵn', 'file-stack']]
const { data: bankRes } = await useFetch<Paginated<AdminExam>>('/api/exams/bank', {
  query: { limit: 50 },
  default: () => ({ data: [], meta: { page: 1, limit: 50, total: 0, total_pages: 0 } }),
})
const bankExams = computed(() => bankRes.value.data)
const pickableExams = computed(() => src.value === 'bank' ? bankExams.value : myExams.value)
const picked = ref<string | null>(null)
const count = ref(10)
const quizQuestions = ref<Question[]>([])
const quizIdx = ref(0)
const quizAnswer = ref('')
const quizRevealed = ref(false)
const quizGrades = ref<(boolean | null)[]>([])
const quizLoading = ref(false)

const quizCurrent = computed(() => quizQuestions.value[quizIdx.value])
const quizScore = computed(() => quizGrades.value.filter(g => g === true).length)

watch(src, () => { picked.value = null })

async function startQuiz() {
  if (!picked.value)
    return
  quizLoading.value = true
  try {
    const url = src.value === 'bank' ? `/api/exams/bank/${picked.value}` : `/api/exams/${picked.value}`
    const res = await $fetch<{ questions: Question[] }>(url)
    quizQuestions.value = res.questions.slice(0, count.value)
    if (!quizQuestions.value.length) {
      toast.err('Đề này chưa có câu hỏi nào.')
      return
    }
    quizIdx.value = 0
    quizAnswer.value = ''
    quizRevealed.value = false
    quizGrades.value = quizQuestions.value.map(() => null)
    phase.value = 'quiz'
  }
  catch {
    toast.err('Không tải được câu hỏi.')
  }
  finally {
    quizLoading.value = false
  }
}
function revealAnswer() {
  quizRevealed.value = true
}
function gradeSelf(correct: boolean) {
  quizGrades.value[quizIdx.value] = correct
}
function nextQuestion() {
  if (quizIdx.value < quizQuestions.value.length - 1) {
    quizIdx.value++
    quizAnswer.value = ''
    quizRevealed.value = false
  }
  else {
    phase.value = 'done'
  }
}
function prevQuestion() {
  if (quizIdx.value > 0) {
    quizIdx.value--
    quizAnswer.value = ''
    quizRevealed.value = false
  }
}
function restartQuiz() {
  phase.value = 'setup'
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <LnTabs v-model="tab" :tabs="[{ v: 'nguon', label: 'Nguồn đề' }, { v: 'giai', label: 'Giải đề AI' }, { v: 'lam', label: 'Làm đề' }]" />

    <!-- ============ NGUỒN ĐỀ ============ -->
    <div v-if="tab === 'nguon'" class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
      <div>
        <div
          :class="cn(
            'border-[1.5px] border-dashed rounded-lg-ln text-center p-10 transition-colors',
            uploading ? 'opacity-60 pointer-events-none' : 'cursor-pointer',
            drop ? 'border-son bg-son-soft' : 'border-line-strong bg-paper-2 text-ink-3',
          )"
          @dragover.prevent="drop = true"
          @dragleave="drop = false"
          @drop="onDrop"
          @click="fileInput?.click()"
        >
          <input ref="fileInput" type="file" accept=".pdf,.txt,application/pdf,text/plain" class="hidden" @change="pickAndUpload(($event.target as HTMLInputElement).files?.[0])">
          <LnIcon name="upload-cloud" :size="30" class="text-ink-4 mx-auto mb-2.5" />
          <div class="font-body text-base">Kéo-thả tệp vào đây hoặc <b class="text-son">chọn từ máy</b></div>
          <div class="text-ink-3 text-xs mt-2">PDF · TXT — tối đa 5MB · AI tự tách câu hỏi</div>
        </div>
        <div v-if="uploadPct !== null || aiBusy" class="mt-2.5">
          <div class="h-1.5 rounded-full bg-paper-2 overflow-hidden">
            <div :class="cn('h-full bg-son transition-[width]', aiBusy && 'animate-pulse')" :style="{ width: `${aiBusy ? 100 : uploadPct}%` }" />
          </div>
          <div class="text-xs text-ink-3 mt-1">{{ aiBusy ? 'Đang xử lý bằng AI… có thể mất 1-2 phút' : `Đang tải lên… ${uploadPct}%` }}</div>
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <b class="font-body text-base font-bold">Đề của bạn ({{ myExams.length }})</b>
        <div v-if="!myExams.length" class="text-ink-3 font-body text-[0.9375rem] bg-paper-1 border border-line rounded-lg-ln p-4 text-center">
          Chưa có đề nào. Tải lên tệp PDF/TXT để bắt đầu.
        </div>
        <div
          v-for="e in myExams"
          :key="e.id"
          class="bg-paper-0 border border-line rounded-lg-ln p-4 flex gap-3 items-start shadow-sm-ln cursor-pointer transition-colors hover:bg-paper-1"
          @click="openDetail(e.id)"
        >
          <div class="grid place-items-center w-11 h-11 rounded-md-ln flex-none font-body font-extrabold text-[0.8rem]" :class="sourceIconBg[iconTone[fileExt(e.name)] ?? 'reu']">{{ iconTone[fileExt(e.name)] ? fileExt(e.name) : 'ĐỀ' }}</div>
          <div class="flex-1 min-w-0"><div class="font-body text-base font-bold truncate">{{ e.name }}</div><div class="text-xs text-ink-3 mt-0.5">{{ e.questions }} câu · {{ fmtWhen(e.created_at) }}</div></div>
          <LnBadge tone="success">Sẵn sàng</LnBadge>
        </div>
      </div>
    </div>

    <!-- ============ GIẢI ĐỀ AI ============ -->
    <div v-else-if="tab === 'giai'" class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
      <LnCard v-if="!myExams.length" pop class="text-center text-ink-3 font-body text-[0.9375rem] py-10">
        Chưa có đề nào để giải. Tải lên một đề ở tab “Nguồn đề” trước.
      </LnCard>
      <template v-else>
        <LnCard pop class="!p-0 overflow-hidden flex flex-col h-[680px]">
          <div class="flex items-center justify-between px-4 py-3 border-b border-line">
            <div class="flex items-center gap-2.5"><LnIcon name="sparkles" :size="18" class="text-son" /><b class="font-body text-base font-bold">Trợ lý giải đề</b></div>
            <select
              :value="chatExamId"
              class="px-3 py-[7px] rounded-full bg-paper-2 border border-line font-body text-[0.8125rem] font-bold text-ink focus:outline-none"
              @change="switchChatExam(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="e in myExams" :key="e.id" :value="e.id">{{ e.name }}</option>
            </select>
          </div>
          <div class="flex-1 relative min-h-0">
          <div ref="chatBody" class="absolute inset-0 bg-paper-1 overflow-y-auto p-3.5 flex flex-col gap-2.5" @scroll="onChatScroll">
            <div v-if="chatLoading" class="text-ink-3 font-body text-[0.875rem] text-center m-auto">Đang tải lịch sử chat…</div>
            <div v-else-if="!chatMsgs.length" class="text-ink-3 font-body text-[0.875rem] text-center m-auto max-w-[80%]">
              Hỏi AI bất cứ điều gì về đề này — giải thích câu hỏi, đáp án mẫu, từ vựng…
            </div>
            <template v-for="(m, i) in chatMsgs" :key="i">
              <div v-if="m.role === 'model' && !m.text" class="bg-paper-0 border border-line self-start rounded-bl-[4px] rounded-[14px] px-3 py-2 flex gap-1.5 items-center w-fit">
                <span v-for="d in 3" :key="d" class="w-1.5 h-1.5 rounded-full bg-ink-4" :style="{ animation: `ln-blink 1.2s ${(d - 1) * 0.2}s infinite` }" />
              </div>
              <div
                v-else
                class="max-w-[88%] px-3 py-2 rounded-[14px] font-body text-[0.9375rem]"
                :class="m.role === 'user' ? 'bg-son text-white self-end rounded-br-[4px]' : 'bg-paper-0 border border-line self-start rounded-bl-[4px]'"
                v-html="fmt(m.text)"
              />
            </template>
          </div>
          <button
            v-if="!chatAtBottom"
            class="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-paper-0 border border-line shadow-md flex items-center justify-center text-ink-2 hover:bg-paper-1"
            aria-label="Cuộn xuống cuối"
            @click="forceScrollToBottom"
          >
            <LnIcon name="arrow-down" :size="18" />
          </button>
          </div>
          <div class="flex gap-2 p-[11px] border-t border-line bg-paper-0 items-center">
            <input
              v-model="chatInput"
              :disabled="chatBusy"
              class="flex-1 bg-paper-2 border border-line rounded-full px-3.5 py-2 font-body text-[0.9375rem] text-ink placeholder:text-ink-4 focus:outline-none focus:border-son"
              placeholder="Hỏi về câu hỏi bất kỳ trong đề…"
              @keyup.enter="sendChat()"
            >
            <LnBtn variant="primary" size="sm" icon="send" class="!px-2.5 !py-2" :disabled="chatBusy || !chatInput.trim()" @click="sendChat()" />
          </div>
        </LnCard>
        <div class="flex flex-col gap-3.5">
          <LnCard>
            <b class="font-body text-base font-bold">Gợi ý nhanh</b>
            <div class="flex flex-col gap-2 mt-3">
              <button v-for="q in quickAsks" :key="q" type="button" :disabled="chatBusy" class="text-left font-body text-[0.8125rem] rounded-full px-3.5 py-[7px] border border-line-strong bg-paper-0 text-ink-2 cursor-pointer transition-colors hover:bg-paper-2 disabled:opacity-50" @click="sendChat(q)">{{ q }}</button>
            </div>
          </LnCard>
        </div>
      </template>
    </div>

    <!-- ============ LÀM ĐỀ ============ -->
    <template v-else>
      <!-- quiz view -->
      <div v-if="phase === 'quiz' && quizCurrent" class="max-w-[720px]">
        <div class="flex items-center justify-between mb-4">
          <LnBtn variant="ghost" size="sm" icon="x" @click="phase = 'setup'">Thoát</LnBtn>
          <span class="text-ink-3 font-body text-[0.8125rem] font-semibold">Câu {{ quizIdx + 1 }} / {{ quizQuestions.length }}</span>
        </div>
        <LnProgress :value="((quizIdx + 1) / quizQuestions.length) * 100" class="mb-6" />
        <LnCard pop class="!p-8">
          <p class="font-display text-[1.3125rem] font-semibold mb-[22px]">{{ quizCurrent.prompt }}</p>
          <textarea
            v-model="quizAnswer"
            :disabled="quizRevealed"
            rows="3"
            class="w-full bg-paper-2 border border-line rounded-lg-ln p-3 font-body text-[0.9375rem] text-ink placeholder:text-ink-4 focus:outline-none focus:border-son disabled:opacity-70"
            placeholder="Nhập câu trả lời của bạn…"
          />
          <div v-if="quizRevealed" class="mt-4 bg-paper-2 rounded-lg-ln p-3.5">
            <b class="font-body text-[0.8125rem] text-ink-2">Đáp án mẫu</b>
            <p class="font-body text-[0.9375rem] mt-1">{{ quizCurrent.sample_answer || 'Đề này chưa có đáp án mẫu.' }}</p>
            <div class="flex gap-2 mt-3">
              <LnBtn :variant="quizGrades[quizIdx] === true ? 'primary' : 'outline'" size="sm" icon="check" @click="gradeSelf(true)">Mình làm đúng</LnBtn>
              <LnBtn :variant="quizGrades[quizIdx] === false ? 'primary' : 'outline'" size="sm" icon="x" @click="gradeSelf(false)">Mình làm sai</LnBtn>
            </div>
          </div>
        </LnCard>
        <div class="flex items-center justify-between mt-5">
          <LnBtn variant="outline" icon="chevron-left" :disabled="quizIdx === 0" @click="prevQuestion">Câu trước</LnBtn>
          <LnBtn v-if="!quizRevealed" variant="primary" @click="revealAnswer">Xem đáp án</LnBtn>
          <LnBtn v-else variant="primary" icon-r="chevron-right" @click="nextQuestion">{{ quizIdx === quizQuestions.length - 1 ? 'Hoàn thành' : 'Câu tiếp' }}</LnBtn>
        </div>
      </div>

      <!-- done view -->
      <div v-else-if="phase === 'done'" class="max-w-[480px]">
        <LnCard pop class="text-center !py-10">
          <LnIcon name="party-popper" :size="32" class="text-son mx-auto mb-3" />
          <b class="font-display text-[1.3125rem] font-bold">Hoàn thành!</b>
          <p class="text-ink-3 font-body text-[0.9375rem] mt-2">Bạn tự chấm đúng {{ quizScore }} / {{ quizQuestions.length }} câu.</p>
          <LnBtn variant="primary" class="mt-5" @click="restartQuiz">Làm đề khác</LnBtn>
        </LnCard>
      </div>

      <!-- setup view -->
      <div v-else class="max-w-[640px]">
        <LnCard pop>
          <b class="font-display text-[1.3125rem] font-bold">Tạo bài luyện</b>
          <p class="text-ink-3 font-body text-[0.9375rem] mt-1 mb-[18px]">Tự chấm: làm câu, xem đáp án mẫu rồi đánh giá đúng/sai cho bản thân.</p>
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Nguồn câu hỏi</label>
          <div class="flex gap-4 mt-2 mb-5">
            <button
              v-for="[v, l, ic] in srcOptions"
              :key="v"
              type="button"
              :class="cn('flex-1 cursor-pointer text-left border rounded-lg-ln p-4', src === v ? 'border-son bg-son-soft shadow-[0_0_0_3px_var(--son-soft)]' : 'border-line bg-paper-0')"
              @click="src = v as 'bank' | 'source'"
            >
              <LnIcon :name="ic" :size="20" class="text-son" />
              <div class="font-body text-base font-bold mt-2">{{ l }}</div>
              <div class="text-xs text-ink-3 mt-px">{{ v === 'bank' ? `${bankExams.length} đề có sẵn` : 'Đề bạn đã tải lên' }}</div>
            </button>
          </div>
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">{{ src === 'bank' ? 'Chọn đề trong ngân hàng' : 'Chọn đề của bạn' }}</label>
          <div v-if="pickableExams.length" class="flex flex-wrap gap-2 mt-2 mb-5">
            <span
              v-for="e in pickableExams"
              :key="e.id"
              :class="cn('font-body text-[0.8125rem] rounded-full px-3.5 py-[7px] border cursor-pointer', picked === e.id ? 'bg-son-soft border-son-line text-son-deep font-bold' : 'border-line-strong bg-paper-0 text-ink-2')"
              @click="picked = e.id"
            >{{ e.name }}</span>
          </div>
          <div v-else class="text-ink-3 text-xs mt-2 mb-5">{{ src === 'bank' ? 'Ngân hàng chưa có đề nào.' : 'Chưa có đề nào — tải lên ở tab “Nguồn đề” trước.' }}</div>
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Số câu</label>
          <div class="flex items-center gap-3 mt-2 mb-6">
            <LnSegment v-model="count" :options="[{ v: 10, label: '10' }, { v: 20, label: '20' }, { v: 40, label: '40' }]" />
          </div>
          <LnBtn variant="primary" size="lg" icon="play" class="w-full" :disabled="!picked || quizLoading" @click="startQuiz">{{ quizLoading ? 'Đang tải…' : 'Bắt đầu làm bài' }}</LnBtn>
        </LnCard>
      </div>
    </template>

    <LnDialog :open="detailOpen" :width="600" @close="detailOpen = false">
      <div v-if="detailLoading" class="text-center text-ink-3 font-body text-[0.9375rem] py-6">Đang tải…</div>
      <template v-else-if="detailExam">
        <div class="flex items-center justify-between mb-1">
          <b class="font-display text-[1.3125rem] font-bold">{{ detailExam.name }}</b>
          <LnIconBtn @click="detailOpen = false"><LnIcon name="x" :size="20" /></LnIconBtn>
        </div>
        <div class="text-ink-3 font-body text-[0.8125rem] mb-4">{{ detailExam.type }} · {{ detailQuestions.length }} câu hỏi</div>
        <div v-if="!detailQuestions.length" class="text-ink-3 font-body text-[0.9375rem] text-center py-6">Đề chưa có câu hỏi nào.</div>
        <div v-else class="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          <div v-for="q in detailQuestions" :key="q.id" class="border border-line rounded-lg-ln p-3.5">
            <div class="font-body text-[0.9375rem] font-semibold"><span class="text-son">{{ q.position }}.</span> {{ q.prompt }}</div>
            <div v-if="q.sample_answer" class="text-ink-2 font-body text-[0.875rem] mt-1.5 pl-1 border-l-2 border-line-strong ml-1">{{ q.sample_answer }}</div>
          </div>
        </div>
      </template>
    </LnDialog>
  </div>
</template>

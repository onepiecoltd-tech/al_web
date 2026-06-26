<script setup lang="ts">
import { cn } from '~/lib/utils'
import { LANGUAGES } from '~/lib/languages'
import type { Question } from '~/types/api'

const mode = ref('speak')
const toast = useToast()

// --- Ngôn ngữ đang học: lọc câu hỏi luyện nói theo ngôn ngữ. ---
// Mặc định theo hồ sơ; đổi lựa chọn sẽ lưu lại làm sở thích của người dùng.
const { me } = useMe()
const lang = ref(me.value?.learning_language ?? 'en')
let userPickedLang = false
watch(me, (m) => {
  if (!userPickedLang && m?.learning_language)
    lang.value = m.learning_language
})
async function changeLang(code: string) {
  userPickedLang = true
  lang.value = code
  await $fetch('/api/me/language', { method: 'PUT', body: { language: code } }).catch(() => {})
}

// --- Luyện nói (forecast): real mic recording → upload → Gemini band scores ---
const DEFAULT_PROMPT = 'Describe a skill you want to learn.'
const DEFAULT_CUES = ['what the skill is', 'how you would learn it', 'why you want to learn it', 'and how it would help you']

// Speaking prompt can come from a random bank question (default), a
// free-typed question, one of the user's own uploaded "đề", or an exam from
// the shared question bank ("ngân hàng đề").
const promptSrc = ref<'default' | 'custom' | 'exam' | 'bank'>('default')
const customPrompt = ref('')
const randomQuestion = ref<Question | null>(null)
const randomLoading = ref(false)
async function loadRandomQuestion() {
  randomLoading.value = true
  try {
    randomQuestion.value = await $fetch<Question>('/api/exam-bank/random-question')
  }
  catch {
    randomQuestion.value = null
  }
  finally {
    randomLoading.value = false
  }
}
await loadRandomQuestion()
const examQuestions = ref<Question[]>([])
const selectedQuestionId = ref<string | null>(null)
const examQuestionsLoading = ref(false)

// Full-text search runs on the server (Postgres ILIKE over prompt + sample
// answer); we keep the typed term in the URL-free local state and debounce the
// fetch so each keystroke doesn't hit the backend.
const qSearch = ref('')

// Pool speaking questions of the chosen source, applying the server-side search.
// 'exam' → the user's own uploads ("mine"); 'bank' → the shared question bank.
async function loadSourceQuestions() {
  if (promptSrc.value !== 'exam' && promptSrc.value !== 'bank') {
    examQuestions.value = []
    selectedQuestionId.value = null
    return
  }
  examQuestionsLoading.value = true
  try {
    const res = await $fetch<{ questions: Question[] }>('/api/questions', {
      query: {
        skill: 'speaking',
        source: promptSrc.value === 'bank' ? 'bank' : 'mine',
        lang: lang.value,
        q: qSearch.value.trim(),
        limit: 100,
      },
    })
    examQuestions.value = res.questions
    if (!examQuestions.value.some(q => q.id === selectedQuestionId.value))
      selectedQuestionId.value = examQuestions.value[0]?.id ?? null
  }
  catch {
    toast.err('Không tải được câu hỏi.')
  }
  finally {
    examQuestionsLoading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch([promptSrc, lang], loadSourceQuestions)
watch(qSearch, () => {
  if (searchTimer)
    clearTimeout(searchTimer)
  searchTimer = setTimeout(loadSourceQuestions, 300)
})

// Page through results client-side so long lists stay manageable.
const QPER = 6
const qPage = ref(1)
const qTotalPages = computed(() => Math.max(1, Math.ceil(examQuestions.value.length / QPER)))
const pagedQuestions = computed(() => examQuestions.value.slice((qPage.value - 1) * QPER, qPage.value * QPER))
watch(examQuestions, () => { qPage.value = 1 })

const cuePrompt = computed(() => {
  if (promptSrc.value === 'custom')
    return customPrompt.value.trim() || DEFAULT_PROMPT
  if (promptSrc.value === 'exam' || promptSrc.value === 'bank') {
    const q = examQuestions.value.find(q => q.id === selectedQuestionId.value)
    return q?.prompt || DEFAULT_PROMPT
  }
  return randomQuestion.value?.prompt || DEFAULT_PROMPT
})
const cues = computed(() => promptSrc.value === 'default' && !randomQuestion.value ? DEFAULT_CUES : [])

// Sample answer for the current prompt (when it comes from a real question),
// so the learner can practise against a model response. Hidden until revealed.
const cueSample = computed(() => {
  if (promptSrc.value === 'exam' || promptSrc.value === 'bank')
    return examQuestions.value.find(q => q.id === selectedQuestionId.value)?.sample_answer || ''
  if (promptSrc.value === 'default')
    return randomQuestion.value?.sample_answer || ''
  return ''
})
const showSample = ref(false)
watch([promptSrc, selectedQuestionId, randomQuestion], () => { showSample.value = false })

interface SpeakingResult { band_overall: number, fluency: number, vocabulary: number, grammar: number, pronunciation: number, feedback: string }
const rec = ref(false)
const grading = ref(false)
const result = ref<SpeakingResult | null>(null)
const elapsed = ref(0)
let mediaRecorder: MediaRecorder | null = null
let chunks: Blob[] = []
let timer: ReturnType<typeof setInterval> | null = null

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

async function toggleRec() {
  if (rec.value) {
    mediaRecorder?.stop()
    return
  }
  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  }
  catch {
    toast.err('Không truy cập được microphone. Hãy cấp quyền trong trình duyệt.')
    return
  }
  chunks = []
  mediaRecorder = new MediaRecorder(stream)
  mediaRecorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
  mediaRecorder.onstop = () => {
    stream.getTracks().forEach(t => t.stop())
    if (timer) { clearInterval(timer); timer = null }
    rec.value = false
    void submitRecording(new Blob(chunks, { type: mediaRecorder?.mimeType || 'audio/webm' }))
  }
  mediaRecorder.start()
  rec.value = true
  result.value = null
  elapsed.value = 0
  timer = setInterval(() => { elapsed.value++ }, 1000)
}

async function submitRecording(blob: Blob) {
  grading.value = true
  try {
    const fd = new FormData()
    fd.append('audio', blob, 'answer.webm')
    fd.append('prompt', cues.value.length ? `${cuePrompt.value}\n${cues.value.join('; ')}` : cuePrompt.value)
    result.value = await $fetch<SpeakingResult>('/api/speaking/grade', { method: 'POST', body: fd })
  }
  catch {
    toast.err('Chấm điểm thất bại. Hãy thử ghi âm lại.')
  }
  finally {
    grading.value = false
  }
}

const band = computed(() => result.value
  ? ([
      [result.value.fluency, 'Fluency'],
      [result.value.vocabulary, 'Từ vựng'],
      [result.value.grammar, 'Ngữ pháp'],
      [result.value.pronunciation, 'Phát âm'],
    ] as [number, string][])
  : [])

// --- Drill phát âm: random word from db + speech-to-text match via Web Speech API ---
interface DrillWord { id: string, word: string, phonetic: string }
const currentWord = ref<DrillWord | null>(null)
const wordLoading = ref(false)
const recentWords = ref<DrillWord[]>([])
async function loadRandomWord() {
  wordLoading.value = true
  try {
    const w = await $fetch<DrillWord>('/api/speaking/random-word')
    currentWord.value = w
    recentWords.value = [w, ...recentWords.value.filter(r => r.id !== w.id)].slice(0, 6)
  }
  catch {
    toast.err('Chưa có từ luyện phát âm nào trong hệ thống.')
  }
  finally {
    wordLoading.value = false
  }
}
await loadRandomWord()
const customWord = ref('')
async function practiceCustomWord() {
  const w = customWord.value.trim()
  if (!w)
    return
  wordLoading.value = true
  try {
    const res = await $fetch<DrillWord>('/api/speaking/word', { method: 'POST', body: { word: w } })
    currentWord.value = res
    recentWords.value = [res, ...recentWords.value.filter(r => r.id !== res.id)].slice(0, 6)
    customWord.value = ''
    drillHeard.value = ''
    drillScore.value = null
  }
  catch {
    toast.err('Không thêm được từ này.')
  }
  finally {
    wordLoading.value = false
  }
}
const word = computed(() => currentWord.value?.word ?? '')
const drillRec = ref(false)
const drillHeard = ref('')
const drillScore = ref<number | null>(null)
let recognition: any = null

function levenshtein(a: string, b: string) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++)
      dp[i]![j] = a[i - 1] === b[j - 1] ? dp[i - 1]![j - 1]! : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!)
  }
  return dp[m]![n]!
}
function similarity(a: string, b: string) {
  a = a.toLowerCase().trim()
  b = b.toLowerCase().trim()
  if (!a || !b)
    return 0
  return Math.round((1 - levenshtein(a, b) / Math.max(a.length, b.length)) * 100)
}

function toggleDrillRec() {
  const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognitionImpl) {
    toast.err('Trình duyệt này không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome.')
    return
  }
  if (drillRec.value) {
    recognition?.stop()
    return
  }
  recognition = new SpeechRecognitionImpl()
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.onresult = (e: any) => {
    const heard = e.results[0]?.[0]?.transcript ?? ''
    drillHeard.value = heard
    drillScore.value = similarity(heard, word.value)
  }
  recognition.onerror = () => {
    toast.err('Không nghe rõ. Hãy thử lại.')
    drillRec.value = false
  }
  recognition.onend = () => { drillRec.value = false }
  recognition.start()
  drillRec.value = true
  drillHeard.value = ''
  drillScore.value = null
}
function pickWord(w: DrillWord) {
  currentWord.value = w
  drillHeard.value = ''
  drillScore.value = null
}
async function nextWord() {
  drillHeard.value = ''
  drillScore.value = null
  await loadRandomWord()
}
function speakSample() {
  const u = new SpeechSynthesisUtterance(word.value)
  u.lang = 'en-US'
  speechSynthesis.speak(u)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between border-b border-line">
      <LnTabs v-model="mode" :tabs="[{ v: 'speak', label: 'Luyện nói (forecast)' }, { v: 'drill', label: 'Drill phát âm' }]" class="!border-b-0" />
      <LnBadge tone="gold" status>Chấm AI</LnBadge>
    </div>

    <!-- forecast -->
    <div v-if="mode === 'speak'" class="flex flex-col gap-4">
      <LnCard class="!p-4">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-body text-[0.8125rem] font-semibold text-ink-2 mr-1">Đề bài:</span>
          <LnSegment v-model="promptSrc" :options="[{ v: 'default', label: 'Mặc định' }, { v: 'custom', label: 'Tự nhập' }, { v: 'exam', label: 'Từ đề của bạn' }, { v: 'bank', label: 'Ngân hàng đề' }]" />
          <LnBtn v-if="promptSrc === 'default'" variant="ghost" size="sm" icon="shuffle" :disabled="randomLoading" @click="loadRandomQuestion">Câu khác</LnBtn>
        </div>
        <input
          v-if="promptSrc === 'custom'"
          v-model="customPrompt"
          class="w-full mt-3 bg-paper-2 border border-line rounded-md-ln px-3.5 py-2.5 font-body text-[0.9375rem] text-ink placeholder:text-ink-4 focus:outline-none focus:border-son"
          placeholder="Nhập câu hỏi luyện nói của riêng bạn…"
        >
        <div v-else-if="promptSrc === 'exam' || promptSrc === 'bank'" class="mt-3 flex flex-col gap-2">
          <label class="flex items-center gap-2 font-body text-sm">
            <span class="text-ink-3">Ngôn ngữ đang học:</span>
            <select
              :value="lang"
              class="border border-line rounded-md-ln bg-paper-0 px-2.5 py-1.5 font-body text-sm"
              @change="changeLang(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="l in LANGUAGES" :key="l.code" :value="l.code">{{ l.label }}</option>
            </select>
          </label>
          <LnSearch v-model="qSearch" placeholder="Tìm câu hỏi…" class="mb-1" />
          <div v-if="examQuestionsLoading" class="text-ink-3 font-body text-[0.875rem]">Đang tải câu hỏi…</div>
          <template v-else-if="examQuestions.length">
            <button
              v-for="q in pagedQuestions"
              :key="q.id"
              type="button"
              :class="cn('text-left rounded-md-ln border px-3.5 py-2.5 font-body text-[0.875rem] transition-colors', selectedQuestionId === q.id ? 'border-son bg-son-soft text-ink' : 'border-line bg-paper-0 text-ink-2 hover:bg-paper-2')"
              @click="selectedQuestionId = q.id"
            >
              {{ q.prompt }}
            </button>
            <LnPager v-if="qTotalPages > 1" v-model:page="qPage" :total-pages="qTotalPages" :total="examQuestions.length" class="mt-1" />
          </template>
          <div v-else-if="qSearch.trim()" class="text-ink-3 font-body text-[0.875rem] py-1">Không tìm thấy câu hỏi phù hợp.</div>
          <div v-else class="text-ink-3 font-body text-[0.875rem]">
            {{ promptSrc === 'bank' ? 'Ngân hàng chưa có câu hỏi nói nào.' : 'Chưa có câu hỏi nào — tải đề lên ở Luyện đề trước.' }}
          </div>
        </div>
      </LnCard>

      <div class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
      <div class="ln-cue relative bg-paper-0 border border-line rounded-xl-ln p-6 shadow-card">
        <div class="text-xs font-extrabold capitalize tracking-[0.12em] text-son">IELTS Speaking · Part 2</div>
        <div class="font-display text-[1.3125rem] font-bold my-2 mb-3">{{ cuePrompt }}</div>
        <ul v-if="cues.length" class="m-0 pl-[18px] text-ink-2 font-body text-[0.9375rem] flex flex-col gap-[5px] list-disc">
          <li v-for="c in cues" :key="c">{{ c }}</li>
        </ul>
        <div v-if="cueSample" class="mt-4">
          <LnBtn variant="ghost" size="sm" :icon="showSample ? 'eye-off' : 'eye'" @click="showSample = !showSample">{{ showSample ? 'Ẩn đáp án mẫu' : 'Xem đáp án mẫu' }}</LnBtn>
          <div v-if="showSample" class="mt-2 bg-paper-2 rounded-md-ln p-3.5 font-body text-[0.9375rem] text-ink-2 whitespace-pre-line">{{ cueSample }}</div>
        </div>
        <div class="flex items-center gap-3.5 mt-6 pt-4 border-t border-line">
          <button type="button" :disabled="grading" :class="cn('grid place-items-center w-[58px] h-[58px] rounded-full bg-son text-white border-0 cursor-pointer flex-none disabled:opacity-50', rec && 'ln-mic-rec')" @click="toggleRec">
            <LnIcon :name="rec ? 'square' : 'mic'" :size="24" class="text-white" />
          </button>
          <div>
            <div class="font-mono-ln font-bold text-2xl text-ink">{{ fmtTime(elapsed) }}</div>
            <div class="text-xs text-ink-3">{{ rec ? 'Đang thu âm — nói tự nhiên' : grading ? 'Đang chấm bằng AI…' : 'Bấm để bắt đầu' }}</div>
          </div>
        </div>
      </div>

      <LnCard pop>
        <div class="flex items-center justify-between"><b class="font-display text-[1.3125rem] font-bold">Nhận xét của AI</b></div>
        <div v-if="grading" class="text-ink-3 font-body text-[0.9375rem] text-center py-8">Đang chấm điểm…</div>
        <div v-else-if="!result" class="text-ink-3 font-body text-[0.9375rem] text-center py-8">Ghi âm câu trả lời rồi bấm dừng để AI chấm điểm.</div>
        <template v-else>
          <div class="flex gap-2.5 mt-4">
            <div v-for="[v, k] in band" :key="k" class="flex-1 bg-reu-soft border border-reu-line rounded-md-ln p-2.5 text-center">
              <div class="font-display font-extrabold text-[1.2rem] text-reu-deep">{{ v }}</div>
              <div class="text-xs text-ink-3 mt-px">{{ k }}</div>
            </div>
          </div>
          <p class="font-body text-[0.9375rem] text-ink-2 mt-4">{{ result.feedback }}</p>
          <div class="h-px bg-line my-4" />
          <div class="flex items-center justify-between"><span class="font-body text-[0.8125rem] font-semibold">Band ước lượng</span><LnBadge tone="reu" status class="text-base px-3.5 py-[5px]">{{ result.band_overall }}</LnBadge></div>
        </template>
      </LnCard>
      </div>
    </div>

    <!-- drill -->
    <div v-else class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
      <LnCard pop class="text-center !p-10">
        <span class="text-xs font-extrabold capitalize tracking-[0.12em] text-son">Drill phát âm · miễn phí</span>
        <div class="flex gap-2 max-w-[360px] mx-auto mt-4">
          <input
            v-model="customWord"
            :disabled="wordLoading"
            class="flex-1 bg-paper-2 border border-line rounded-full px-3.5 py-2 font-body text-[0.875rem] text-ink placeholder:text-ink-4 focus:outline-none focus:border-son disabled:opacity-60"
            placeholder="Nhập từ bạn muốn luyện…"
            @keyup.enter="practiceCustomWord"
          >
          <LnBtn variant="primary" size="sm" icon="check" :disabled="wordLoading || !customWord.trim()" @click="practiceCustomWord" />
        </div>
        <p v-if="wordLoading" class="text-ink-3 font-body text-[0.9375rem] py-6">Đang tải từ…</p>
        <template v-else-if="currentWord">
          <p class="font-display font-extrabold text-[2.1rem] mt-3.5 mb-1.5">{{ currentWord.word }}</p>
          <p v-if="currentWord.phonetic" class="text-ink-3 font-body text-[0.9375rem]">{{ currentWord.phonetic }}</p>
          <div class="flex gap-3 justify-center mt-6">
            <LnBtn variant="outline" icon="volume-2" @click="speakSample">Nghe mẫu</LnBtn>
            <button type="button" :class="cn('grid place-items-center w-16 h-16 rounded-full bg-son text-white border-0 cursor-pointer flex-none', drillRec && 'ln-mic-rec')" @click="toggleDrillRec">
              <LnIcon name="mic" :size="26" class="text-white" />
            </button>
          </div>
          <p class="text-ink-3 text-xs mt-3.5">{{ drillRec ? 'Đang nghe…' : 'Bấm mic rồi đọc to' }}</p>
        </template>
        <p v-else class="text-ink-3 font-body text-[0.9375rem] py-6">Chưa có từ luyện phát âm nào.</p>
      </LnCard>
      <div class="flex flex-col gap-3.5">
        <LnCard>
          <div class="flex items-center justify-between"><b class="font-body text-base font-bold">Độ khớp lần đọc</b><span v-if="drillScore !== null" class="font-display font-extrabold text-[1.4rem]" :class="drillScore >= 70 ? 'text-success' : 'text-error'">{{ drillScore }}%</span></div>
          <p v-if="drillHeard" class="font-body text-[0.9375rem] text-ink-2 mt-3.5">Nghe được: "<b>{{ drillHeard }}</b>"</p>
          <p v-else class="text-ink-3 font-body text-[0.9375rem] mt-3.5">Chưa có lượt đọc nào.</p>
        </LnCard>
        <LnCard>
          <div class="flex items-center justify-between">
            <b class="font-body text-base font-bold">Từ tiếp theo</b>
            <LnBtn variant="ghost" size="sm" icon="shuffle" :disabled="wordLoading" @click="nextWord">Từ khác</LnBtn>
          </div>
          <div v-if="recentWords.length" class="flex flex-wrap gap-2 mt-3">
            <span v-for="w in recentWords" :key="w.id" class="font-body text-[0.8125rem] rounded-full px-3.5 py-[7px] border cursor-pointer transition-colors" :class="w.id === currentWord?.id ? 'border-son bg-son-soft text-son-deep font-bold' : 'border-line-strong bg-paper-0 text-ink-2 hover:bg-paper-2'" @click="pickWord(w)">{{ w.word }}</span>
          </div>
        </LnCard>
      </div>
    </div>
  </div>
</template>

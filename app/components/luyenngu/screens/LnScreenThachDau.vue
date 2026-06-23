<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { AvatarColor } from '~/composables/useLnData'
import type { Duel, Friend, LeaderboardRow } from '~/types/api'

const { me } = useMe()
const toast = useToast()

const { data: board } = await useFetch<LeaderboardRow[]>('/api/leaderboard', { default: () => [] })
const { data: friends } = await useFetch<Friend[]>('/api/friends', { default: () => [] })
const { data: duels, refresh: refreshDuels } = await useFetch<Duel[]>('/api/duels', { default: () => [] })

const incoming = computed(() => duels.value.filter(d => d.status === 'pending' && d.opponent_id === me.value?.id))
const outgoing = computed(() => duels.value.filter(d => d.status === 'pending' && d.challenger_id === me.value?.id))
const history = computed(() => duels.value.filter(d => d.status === 'completed'))

const avatarPalette: AvatarColor[] = ['son', 'reu', 'gold', 'ink']
const avatarColor = (i: number): AvatarColor => avatarPalette[i % avatarPalette.length]!
const rankColor = (i: number) => ['text-gold-deep', 'text-[#8d8d8d]', 'text-[#a9743f]'][i] || 'text-ink-3'

const PROMPTS = [
  'The quick brown fox jumps over the lazy dog.',
  'She sells seashells by the seashore.',
  'Innovation distinguishes between a leader and a follower.',
  'A journey of a thousand miles begins with a single step.',
  'The early bird catches the worm but the second mouse gets the cheese.',
  'How much wood would a woodchuck chuck if a woodchuck could chuck wood.',
]
const randomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]!

const speech = useSpeechScore()

// --- challenge a friend ---
const challengeOpen = ref(false)
const opponentId = ref<string | null>(null)
const challengePrompt = ref('')
const challengeScore = ref<number | null>(null)
const challengeBusy = ref(false)
function openChallenge() {
  opponentId.value = friends.value[0]?.id ?? null
  challengePrompt.value = randomPrompt()
  challengeScore.value = null
  speech.heard.value = ''
  challengeOpen.value = true
}
async function recordChallenge() {
  if (speech.recording.value) {
    speech.stop()
    return
  }
  try {
    challengeScore.value = await speech.record(challengePrompt.value)
  }
  catch {
    toast.err(speech.supported.value ? 'Không nghe rõ. Hãy thử lại.' : 'Trình duyệt không hỗ trợ nhận diện giọng nói (hãy dùng Chrome).')
  }
}
async function sendChallenge() {
  if (!opponentId.value || challengeScore.value === null)
    return
  challengeBusy.value = true
  try {
    await $fetch('/api/duels', { method: 'POST', body: { opponent_id: opponentId.value, prompt: challengePrompt.value, score: challengeScore.value } })
    await refreshDuels()
    challengeOpen.value = false
    toast.ok('Đã gửi lời thách đấu!')
  }
  catch (e) {
    const err = e as { data?: { message?: string } }
    toast.err(err.data?.message ?? 'Không gửi được thách đấu.')
  }
  finally {
    challengeBusy.value = false
  }
}

// --- respond to a challenge ---
const respondOpen = ref(false)
const respondDuel = ref<Duel | null>(null)
const respondScore = ref<number | null>(null)
const respondResult = ref<Duel | null>(null)
const respondBusy = ref(false)
function openRespond(d: Duel) {
  respondDuel.value = d
  respondScore.value = null
  respondResult.value = null
  speech.heard.value = ''
  respondOpen.value = true
}
async function recordRespond() {
  if (!respondDuel.value)
    return
  if (speech.recording.value) {
    speech.stop()
    return
  }
  try {
    respondScore.value = await speech.record(respondDuel.value.prompt)
  }
  catch {
    toast.err(speech.supported.value ? 'Không nghe rõ. Hãy thử lại.' : 'Trình duyệt không hỗ trợ nhận diện giọng nói (hãy dùng Chrome).')
  }
}
async function submitRespond() {
  if (!respondDuel.value || respondScore.value === null)
    return
  respondBusy.value = true
  try {
    respondResult.value = await $fetch<Duel>(`/api/duels/${respondDuel.value.id}/respond`, { method: 'POST', body: { score: respondScore.value } })
    await refreshDuels()
  }
  catch {
    toast.err('Không gửi được kết quả.')
  }
  finally {
    respondBusy.value = false
  }
}
async function decline(d: Duel) {
  try {
    await $fetch(`/api/duels/${d.id}/decline`, { method: 'POST' })
    await refreshDuels()
    toast.ok('Đã từ chối lời thách đấu.')
  }
  catch {
    toast.err('Không từ chối được.')
  }
}

// outcome helpers (from the current user's perspective)
const myId = computed(() => me.value?.id)
function myDelta(d: Duel) {
  return d.challenger_id === myId.value ? d.challenger_delta : d.opponent_delta
}
function won(d: Duel) {
  return !!d.winner_id && d.winner_id === myId.value
}
function draw(d: Duel) {
  return d.status === 'completed' && !d.winner_id
}
function opponentName(d: Duel) {
  return d.challenger_id === myId.value ? d.opponent_name : d.challenger_name
}
</script>

<template>
  <div class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
    <!-- left -->
    <div class="flex flex-col gap-4">
      <!-- rank card -->
      <div class="relative overflow-hidden bg-ink text-white rounded-xl-ln p-8 before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(220,74,51,.32),transparent_60%)]">
        <div class="relative">
          <LnBadge status class="bg-white/15 text-white">Hạng của bạn</LnBadge>
          <div class="flex items-center gap-[18px] mt-4">
            <div class="w-[72px] h-[72px] rounded-full bg-gold grid place-items-center font-display font-extrabold text-[1.6rem] text-white">🏆</div>
            <div>
              <div class="font-display font-extrabold text-[2.2rem] text-white">{{ me?.elo }}</div>
              <div class="text-white/65 font-body text-[0.9375rem]">Hạng {{ me?.rank }} · {{ me?.wins }} trận thắng</div>
            </div>
          </div>
        </div>
      </div>

      <LnBtn variant="primary" size="lg" icon="swords" @click="openChallenge">Thách đấu bạn bè</LnBtn>

      <!-- incoming challenges -->
      <LnCard v-if="incoming.length">
        <b class="font-body text-base font-bold">Lời thách đấu ({{ incoming.length }})</b>
        <div v-for="d in incoming" :key="d.id" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
          <LnAvatar :name="d.challenger_name" color="reu" :size="36" />
          <div class="flex-1 min-w-0">
            <div class="font-body text-[0.9375rem] font-semibold">{{ d.challenger_name }}</div>
            <div class="text-xs text-ink-3 truncate">"{{ d.prompt }}"</div>
          </div>
          <LnBtn variant="primary" size="sm" icon="mic" @click="openRespond(d)">Đấu</LnBtn>
          <LnBtn variant="ghost" size="sm" icon="x" @click="decline(d)" />
        </div>
      </LnCard>

      <!-- recent results -->
      <LnCard v-if="history.length">
        <b class="font-body text-base font-bold">Kết quả gần đây</b>
        <div v-for="d in history" :key="d.id" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
          <div :class="cn('grid place-items-center w-9 h-9 rounded-md-ln flex-none text-white', won(d) ? 'bg-success' : draw(d) ? 'bg-ink-4' : 'bg-error')">
            <LnIcon :name="won(d) ? 'trophy' : draw(d) ? 'minus' : 'x'" :size="16" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-body text-[0.9375rem] font-semibold">vs {{ opponentName(d) }}</div>
            <div class="text-xs text-ink-3">{{ won(d) ? 'Thắng' : draw(d) ? 'Hòa' : 'Thua' }} · {{ d.challenger_id === myId ? d.challenger_score : d.opponent_score }}% – {{ d.challenger_id === myId ? d.opponent_score : d.challenger_score }}%</div>
          </div>
          <span class="font-body font-bold text-[0.9rem]" :class="myDelta(d) >= 0 ? 'text-success' : 'text-error'">{{ myDelta(d) >= 0 ? '+' : '' }}{{ myDelta(d) }}</span>
        </div>
      </LnCard>

      <!-- outgoing (waiting) -->
      <LnCard v-if="outgoing.length">
        <b class="font-body text-base font-bold">Đang chờ đối thủ</b>
        <div v-for="d in outgoing" :key="d.id" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
          <LnAvatar :name="d.opponent_name" color="gold" :size="34" />
          <div class="flex-1 min-w-0">
            <div class="font-body text-[0.9375rem] font-semibold">{{ d.opponent_name }}</div>
            <div class="text-xs text-ink-3">Điểm của bạn: {{ d.challenger_score }}%</div>
          </div>
          <LnBadge tone="gold" status>Chờ</LnBadge>
        </div>
      </LnCard>
    </div>

    <!-- leaderboard -->
    <LnCard>
      <div class="flex items-center justify-between mb-2"><b class="font-body text-base font-bold">Bảng xếp hạng</b><span class="text-ink-3 text-xs">theo ELO</span></div>
      <div
        v-for="(p, i) in board"
        :key="p.id"
        :class="cn('flex items-center gap-3 border-b border-line-soft last:border-0', p.me ? 'bg-son-soft rounded-md-ln px-2.5 -mx-2.5 py-2.5 !border-0' : 'py-[11px]')"
      >
        <span class="w-7 text-center font-display font-extrabold flex-none" :class="rankColor(i)">{{ i + 1 }}</span>
        <LnAvatar :name="p.name" :color="avatarColor(i)" :size="34" />
        <div class="flex-1"><div class="font-body text-[0.9375rem] font-semibold">{{ p.name }}<span v-if="p.me" class="text-ink-3 font-normal"> · bạn</span></div><div class="text-xs text-ink-3 mt-px">{{ p.wins }} thắng</div></div>
        <div class="text-right"><div class="font-body font-bold text-[0.95rem]">{{ p.elo }}</div></div>
      </div>
    </LnCard>

    <!-- challenge dialog -->
    <LnDialog :open="challengeOpen" :width="520" @close="challengeOpen = false">
      <div class="flex items-center justify-between mb-3.5"><b class="font-display text-[1.3125rem] font-bold">Thách đấu phát âm</b><LnIconBtn @click="challengeOpen = false"><LnIcon name="x" :size="20" /></LnIconBtn></div>
      <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Đối thủ</label>
      <select v-if="friends.length" v-model="opponentId" class="w-full mt-2 mb-4 px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] focus:outline-none focus:border-son">
        <option v-for="fr in friends" :key="fr.id" :value="fr.id">{{ fr.name }}</option>
      </select>
      <p v-else class="text-ink-3 text-xs mt-2 mb-4">Bạn chưa có bạn bè nào để thách đấu. Kết bạn ở mục Bạn bè trước.</p>

      <div class="bg-paper-2 border border-line rounded-lg-ln p-4 text-center font-body text-[1.0625rem] mb-4">"{{ challengePrompt }}"</div>
      <div class="flex flex-col items-center gap-2">
        <button type="button" :class="cn('grid place-items-center w-16 h-16 rounded-full bg-son text-white border-0 cursor-pointer', speech.recording.value && 'ln-mic-rec')" @click="recordChallenge">
          <LnIcon name="mic" :size="26" class="text-white" />
        </button>
        <p class="text-ink-3 text-xs">{{ speech.recording.value ? 'Đang nghe…' : 'Bấm mic rồi đọc to câu trên' }}</p>
        <p v-if="challengeScore !== null" class="font-display font-extrabold text-[1.4rem]" :class="challengeScore >= 50 ? 'text-success' : 'text-error'">Độ khớp {{ challengeScore }}%</p>
        <p v-if="challengeScore !== null && challengeScore < 50" class="text-error text-xs">Cần đạt ít nhất 50% để gửi thách đấu — thử đọc lại.</p>
      </div>
      <LnBtn variant="primary" class="w-full mt-4" :disabled="challengeBusy || challengeScore === null || challengeScore < 50 || !opponentId" @click="sendChallenge">{{ challengeBusy ? 'Đang gửi…' : 'Gửi thách đấu' }}</LnBtn>
    </LnDialog>

    <!-- respond dialog -->
    <LnDialog :open="respondOpen" :width="520" @close="respondOpen = false">
      <template v-if="respondResult">
        <div class="text-center">
          <div class="text-[3rem]">{{ won(respondResult) ? '👑' : draw(respondResult) ? '🤝' : '💪' }}</div>
          <h2 class="font-display font-extrabold text-[2rem] mt-1">{{ won(respondResult) ? 'Chiến thắng!' : draw(respondResult) ? 'Hòa!' : 'Thua rồi!' }}</h2>
          <p class="text-ink-3 font-body text-[0.9375rem] mt-1">Bạn {{ respondResult.opponent_score }}% · {{ respondResult.challenger_name }} {{ respondResult.challenger_score }}%</p>
          <LnCard pop class="mt-5 !p-6">
            <div class="flex justify-around items-center">
              <div><div class="text-ink-3 text-xs">ELO</div><div class="font-display font-extrabold text-[1.6rem]">{{ me?.elo }}</div></div>
              <div :class="myDelta(respondResult) >= 0 ? 'text-success' : 'text-error'" class="flex items-center gap-1.5">
                <LnIcon :name="myDelta(respondResult) >= 0 ? 'trending-up' : 'trending-down'" :size="20" />
                <span class="font-display font-extrabold text-[1.3rem]">{{ myDelta(respondResult) >= 0 ? '+' : '' }}{{ myDelta(respondResult) }}</span>
              </div>
            </div>
          </LnCard>
          <LnBtn variant="primary" class="w-full mt-5" @click="respondOpen = false">Xong</LnBtn>
        </div>
      </template>
      <template v-else-if="respondDuel">
        <div class="flex items-center justify-between mb-3.5"><b class="font-display text-[1.3125rem] font-bold">Đấu với {{ respondDuel.challenger_name }}</b><LnIconBtn @click="respondOpen = false"><LnIcon name="x" :size="20" /></LnIconBtn></div>
        <p class="text-ink-3 font-body text-[0.9375rem] mb-3">{{ respondDuel.challenger_name }} đạt {{ respondDuel.challenger_score }}% — hãy đọc to để vượt qua!</p>
        <div class="bg-paper-2 border border-line rounded-lg-ln p-4 text-center font-body text-[1.0625rem] mb-4">"{{ respondDuel.prompt }}"</div>
        <div class="flex flex-col items-center gap-2">
          <button type="button" :class="cn('grid place-items-center w-16 h-16 rounded-full bg-son text-white border-0 cursor-pointer', speech.recording.value && 'ln-mic-rec')" @click="recordRespond">
            <LnIcon name="mic" :size="26" class="text-white" />
          </button>
          <p class="text-ink-3 text-xs">{{ speech.recording.value ? 'Đang nghe…' : 'Bấm mic rồi đọc to câu trên' }}</p>
          <p v-if="respondScore !== null" class="font-display font-extrabold text-[1.4rem]" :class="respondScore >= 70 ? 'text-success' : 'text-ink'">Độ khớp {{ respondScore }}%</p>
        </div>
        <LnBtn variant="primary" class="w-full mt-4" :disabled="respondBusy || respondScore === null" @click="submitRespond">{{ respondBusy ? 'Đang gửi…' : 'Chốt kết quả' }}</LnBtn>
      </template>
    </LnDialog>
  </div>
</template>

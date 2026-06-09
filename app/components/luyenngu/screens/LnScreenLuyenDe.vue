<script setup lang="ts">
import { cn } from '~/lib/utils'
import { SOURCES } from '~/composables/useLnData'

const tab = ref('nguon')

// --- Nguồn đề ---
const iconTone: Record<string, string> = { PDF: 'son', DOCX: 'reu', TXT: 'gold', XLSX: 'reu' }
const sourceIconBg: Record<string, string> = { son: 'bg-son-soft text-son-deep', reu: 'bg-reu-soft text-reu-deep', gold: 'bg-gold-soft text-gold-deep' }

// --- Giải đề AI ---
const msgs = [
  { me: true, t: 'Giải giúp mình câu 23 trong Cambridge IELTS 18 — Test 2 nhé.' },
  { me: false, t: 'Câu 23 hỏi về thông tin trong đoạn 4. Đáp án đúng là **B (FALSE)** — bài đọc nói nhiệt độ "remained stable", trái với "rose sharply" trong câu hỏi. Mẹo: gặp trạng từ chỉ mức độ mạnh (sharply, dramatically) hãy đối chiếu kỹ với từ trung tính trong bài.' },
]
const fmt = (t: string) => t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
const quickAsks = ['Giải toàn bộ Part 5', 'Giải thích từ vựng khó', 'Dịch đoạn 3 sang tiếng Việt']

// --- Làm đề ---
const phase = ref<'setup' | 'quiz'>('setup')
const src = ref<'bank' | 'source'>('bank')
const count = ref(20)
const picked = ref(0)
const readySources = SOURCES.filter(s => s.state === 'ready')
const srcOptions: [string, string, string][] = [['bank', 'Ngân hàng có sẵn', 'file-stack'], ['source', 'Từ đề của bạn ✦', 'sparkles']]

// --- Quiz ---
const sel = ref<string | null>(null)
const opts: [string, string][] = [['A', 'has been delayed'], ['B', 'was delaying'], ['C', 'delayed'], ['D', 'is delayed']]
</script>

<template>
  <div class="flex flex-col gap-5">
    <LnTabs v-model="tab" :tabs="[{ v: 'nguon', label: 'Nguồn đề' }, { v: 'giai', label: 'Giải đề AI' }, { v: 'lam', label: 'Làm đề' }]" />

    <!-- ============ NGUỒN ĐỀ ============ -->
    <div v-if="tab === 'nguon'" class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
      <div>
        <div class="border-[1.5px] border-dashed border-line-strong rounded-lg-ln bg-paper-2 text-center text-ink-3 p-10">
          <LnIcon name="upload-cloud" :size="30" class="text-ink-4 mx-auto mb-2.5" />
          <div class="font-body text-base">Kéo-thả tệp vào đây hoặc <b class="text-son">chọn từ máy</b></div>
          <div class="text-ink-3 text-xs mt-2">PDF · DOCX · XLSX · TXT · ảnh — tối đa 10MB</div>
        </div>
        <div class="mt-3.5 flex gap-2.5 items-start bg-paper-1 border border-line rounded-lg-ln p-4">
          <LnIcon name="info" :size="18" class="text-info mt-0.5" />
          <div class="font-body text-[0.9375rem] text-ink-2">Gói Free nạp <b>1 nguồn</b>. Nâng cấp Pro để nạp không giới hạn và tạo đề từ nguồn của bạn. <a class="font-bold cursor-pointer text-son">Nâng cấp →</a></div>
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between"><b class="font-body text-base font-bold">Đã nạp ({{ SOURCES.length }})</b><LnBadge tone="gold" status>Pro</LnBadge></div>
        <div v-for="s in SOURCES" :key="s.name" class="bg-paper-0 border border-line rounded-lg-ln p-4 flex gap-3 items-start shadow-sm-ln">
          <div class="grid place-items-center w-11 h-11 rounded-md-ln flex-none font-body font-extrabold text-[0.8rem]" :class="sourceIconBg[iconTone[s.type]]">{{ s.type }}</div>
          <div class="flex-1 min-w-0"><div class="font-body text-base font-bold truncate">{{ s.name }}</div><div class="text-xs text-ink-3 mt-0.5">{{ s.chars }} ký tự · {{ s.when }}</div></div>
          <LnBadge v-if="s.state === 'ready'" tone="success">Sẵn sàng</LnBadge>
          <LnBadge v-else tone="info">Đang đọc</LnBadge>
        </div>
      </div>
    </div>

    <!-- ============ GIẢI ĐỀ AI ============ -->
    <div v-else-if="tab === 'giai'" class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
      <LnCard pop class="!p-0 overflow-hidden flex flex-col h-[520px]">
        <div class="flex items-center justify-between px-4 py-3 border-b border-line">
          <div class="flex items-center gap-2.5"><LnIcon name="sparkles" :size="18" class="text-son" /><b class="font-body text-base font-bold">Trợ lý giải đề</b></div>
          <div class="inline-flex p-[3px] rounded-full bg-paper-2 border border-line"><span class="px-4 py-[7px] rounded-full bg-paper-0 text-ink shadow-sm-ln font-body text-[0.8125rem] font-bold">Cambridge 18 · T2</span></div>
        </div>
        <div class="flex-1 bg-paper-1 overflow-y-auto p-3.5 flex flex-col gap-2.5">
          <div
            v-for="(m, i) in msgs"
            :key="i"
            class="max-w-[88%] px-3 py-2 rounded-[14px] font-body text-[0.9375rem]"
            :class="m.me ? 'bg-son text-white self-end rounded-br-[4px]' : 'bg-paper-0 border border-line self-start rounded-bl-[4px]'"
            v-html="fmt(m.t)"
          />
          <div class="bg-paper-0 border border-line self-start rounded-bl-[4px] rounded-[14px] px-3 py-2 flex gap-1.5 items-center w-fit">
            <span v-for="i in 3" :key="i" class="w-1.5 h-1.5 rounded-full bg-ink-4" :style="{ animation: `ln-blink 1.2s ${(i - 1) * 0.2}s infinite` }" />
          </div>
        </div>
        <div class="flex gap-2 p-[11px] border-t border-line bg-paper-0 items-center">
          <div class="flex-1 bg-paper-2 border border-line rounded-full px-3.5 py-2 font-body text-[0.9375rem] text-ink-4">Hỏi về câu hỏi bất kỳ trong nguồn…</div>
          <LnBtn variant="primary" size="sm" icon="send" class="!px-2.5 !py-2" />
        </div>
      </LnCard>
      <div class="flex flex-col gap-3.5">
        <LnCard>
          <div class="flex items-center justify-between"><b class="font-body text-base font-bold">Lượt giải hôm nay</b><LnBadge tone="son" status>Free</LnBadge></div>
          <div class="font-display font-extrabold text-[1.9rem] my-2.5">2 <span class="text-ink-3 font-body text-[0.9375rem] font-normal">/ 5 lượt</span></div>
          <LnProgress :value="40" />
          <LnBtn variant="gold" size="sm" icon="zap" class="mt-3.5 w-full">Nâng Pro · không giới hạn</LnBtn>
        </LnCard>
        <LnCard>
          <b class="font-body text-base font-bold">Gợi ý nhanh</b>
          <div class="flex flex-col gap-2 mt-3">
            <button v-for="q in quickAsks" :key="q" type="button" class="text-left font-body text-[0.8125rem] rounded-full px-3.5 py-[7px] border border-line-strong bg-paper-0 text-ink-2 cursor-pointer transition-colors hover:bg-paper-2">{{ q }}</button>
          </div>
        </LnCard>
      </div>
    </div>

    <!-- ============ LÀM ĐỀ ============ -->
    <template v-else>
      <!-- quiz view -->
      <div v-if="phase === 'quiz'" class="max-w-[720px]">
        <div class="flex items-center justify-between mb-4">
          <LnBtn variant="ghost" size="sm" icon="x" @click="phase = 'setup'">Thoát</LnBtn>
          <div class="flex items-center gap-3.5">
            <LnBadge tone="info"><LnIcon name="clock" :size="13" class="inline mr-1" />12:48</LnBadge>
            <span class="text-ink-3 font-body text-[0.8125rem] font-semibold">Câu 7 / {{ count }}</span>
          </div>
        </div>
        <LnProgress :value="(7 / count) * 100" class="mb-6" />
        <LnCard pop class="!p-8">
          <span class="text-xs font-extrabold uppercase tracking-[0.12em] text-son">TOEIC · Part 5</span>
          <p class="font-display text-[1.3125rem] font-semibold my-[22px] mt-3">The shipment ______ due to a customs inspection at the port.</p>
          <div class="flex flex-col gap-2.5">
            <button
              v-for="[k, v] in opts"
              :key="k"
              type="button"
              :class="cn('flex gap-3 items-center cursor-pointer text-left border rounded-lg-ln p-4', sel === k ? 'border-son bg-son-soft' : 'border-line bg-paper-0')"
              @click="sel = k"
            >
              <span :class="cn('grid place-items-center w-[26px] h-[26px] rounded-full border-[1.5px] font-body text-[0.8rem] font-bold flex-none', sel === k ? 'border-son bg-son text-white' : 'border-line-strong text-ink-2')">{{ k }}</span>
              <span class="font-body text-[1.0625rem]">{{ v }}</span>
            </button>
          </div>
        </LnCard>
        <div class="flex items-center justify-between mt-5">
          <LnBtn variant="outline" icon="chevron-left">Câu trước</LnBtn>
          <LnBtn variant="primary" icon-r="chevron-right">Câu tiếp</LnBtn>
        </div>
      </div>

      <!-- setup view -->
      <div v-else class="max-w-[640px]">
        <LnCard pop>
          <b class="font-display text-[1.3125rem] font-bold">Tạo bài luyện</b>
          <p class="text-ink-3 font-body text-[0.9375rem] mt-1 mb-[18px]">Chọn nguồn câu hỏi và số câu, làm có giờ, chấm tự động.</p>
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
              <div class="text-xs text-ink-3 mt-px">{{ v === 'bank' ? '8.000+ câu TOEIC/IELTS' : 'AI sinh từ Cambridge 18 · T2' }}</div>
            </button>
          </div>
          <div v-if="src === 'source'" class="mb-5">
            <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Chọn nguồn</label>
            <div class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="(s, i) in readySources"
                :key="s.name"
                :class="cn('font-body text-[0.8125rem] rounded-full px-3.5 py-[7px] border cursor-pointer', picked === i ? 'bg-son-soft border-son-line text-son-deep font-bold' : 'border-line-strong bg-paper-0 text-ink-2')"
                @click="picked = i"
              >{{ s.name.split(' — ')[0] }}</span>
            </div>
          </div>
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Số câu</label>
          <div class="flex items-center gap-3 mt-2 mb-6">
            <LnSegment v-model="count" :options="[{ v: 10, label: '10' }, { v: 20, label: '20' }, { v: 40, label: '40' }]" />
            <span class="text-ink-3 text-xs">≈ {{ Math.round(count * 0.75) }} phút</span>
          </div>
          <LnBtn variant="primary" size="lg" icon="play" class="w-full" @click="phase = 'quiz'">Bắt đầu làm bài</LnBtn>
        </LnCard>
      </div>
    </template>
  </div>
</template>

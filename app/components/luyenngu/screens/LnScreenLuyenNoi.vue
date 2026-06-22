<script setup lang="ts">
import { cn } from '~/lib/utils'

const mode = ref<'speak' | 'drill'>('speak')
const rec = ref(false)

const band: [string, string][] = [['6.5', 'Fluency'], ['7.0', 'Từ vựng'], ['6.0', 'Ngữ pháp'], ['6.5', 'Phát âm']]
const cues = ['what the skill is', 'how you would learn it', 'why you want to learn it', 'and how it would help you']
const syllables: [string, number][] = [['en', 1], ['tre', 1], ['pre', 0], ['neur', 1]]
const nextWords = ['comfortable', 'vegetable', 'February', 'schedule', 'colleague']
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <LnSegment v-model="mode" :options="[{ v: 'speak', label: 'Luyện nói (forecast)' }, { v: 'drill', label: 'Drill phát âm' }]" />
      <LnBadge tone="gold" status>Chấm AI · Pro</LnBadge>
    </div>

    <!-- forecast -->
    <div v-if="mode === 'speak'" class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
      <div class="ln-cue relative bg-paper-0 border border-line rounded-xl-ln p-6 shadow-card">
        <div class="text-xs font-extrabold capitalize tracking-[0.12em] text-son">IELTS Speaking · Part 2 · Forecast Quý 2</div>
        <div class="font-display text-[1.3125rem] font-bold my-2 mb-3">Describe a skill you want to learn.</div>
        <ul class="m-0 pl-[18px] text-ink-2 font-body text-[0.9375rem] flex flex-col gap-[5px] list-disc">
          <li v-for="c in cues" :key="c">{{ c }}</li>
        </ul>
        <div class="flex items-center gap-3.5 mt-6 pt-4 border-t border-line">
          <button type="button" :class="cn('grid place-items-center w-[58px] h-[58px] rounded-full bg-son text-white border-0 cursor-pointer flex-none', rec && 'ln-mic-rec')" @click="rec = !rec">
            <LnIcon :name="rec ? 'square' : 'mic'" :size="24" class="text-white" />
          </button>
          <div>
            <div class="font-mono-ln font-bold text-2xl text-ink">{{ rec ? '00:48' : '02:00' }}</div>
            <div class="text-xs text-ink-3">{{ rec ? 'Đang thu âm — nói tự nhiên' : 'Bấm để bắt đầu · 2 phút' }}</div>
          </div>
          <div class="ml-auto flex gap-2">
            <LnBtn variant="ghost" size="sm" icon="refresh-cw">Cue khác</LnBtn>
            <LnBtn variant="ghost" size="sm" icon="sparkles">Rút từ nguồn</LnBtn>
          </div>
        </div>
      </div>

      <LnCard pop>
        <div class="flex items-center justify-between"><b class="font-display text-[1.3125rem] font-bold">Nhận xét của AI</b><span class="text-ink-3 text-xs">lần thu trước</span></div>
        <div class="flex gap-2.5 mt-4">
          <div v-for="[v, k] in band" :key="k" class="flex-1 bg-reu-soft border border-reu-line rounded-md-ln p-2.5 text-center">
            <div class="font-display font-extrabold text-[1.2rem] text-reu-deep">{{ v }}</div>
            <div class="text-xs text-ink-3 mt-px">{{ k }}</div>
          </div>
        </div>
        <p class="font-body text-[0.9375rem] text-ink-2 mt-4">Trôi chảy tốt, ít ngập ngừng. Cần đa dạng cấu trúc câu phức và chú ý âm cuối /s/, /t/. Mở rộng ý "how it helps you" thêm 2–3 câu.</p>
        <div class="h-px bg-line my-4" />
        <div class="flex items-center justify-between"><span class="font-body text-[0.8125rem] font-semibold">Band ước lượng</span><LnBadge tone="reu" status class="text-base px-3.5 py-[5px]">6.5</LnBadge></div>
      </LnCard>
    </div>

    <!-- drill -->
    <div v-else class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
      <LnCard pop class="text-center !p-10">
        <span class="text-xs font-extrabold capitalize tracking-[0.12em] text-son">Drill phát âm · miễn phí</span>
        <p class="font-display font-extrabold text-[2.1rem] mt-3.5 mb-1.5">entrepreneur</p>
        <p class="text-ink-3 font-body text-[0.9375rem]">/ˌɒn.trə.prəˈnɜːr/</p>
        <div class="flex gap-3 justify-center mt-6">
          <LnBtn variant="outline" icon="volume-2">Nghe mẫu</LnBtn>
          <button type="button" :class="cn('grid place-items-center w-16 h-16 rounded-full bg-son text-white border-0 cursor-pointer flex-none', rec && 'ln-mic-rec')" @click="rec = !rec">
            <LnIcon name="mic" :size="26" class="text-white" />
          </button>
        </div>
        <p class="text-ink-3 text-xs mt-3.5">Bấm mic rồi đọc to — chấm độ khớp bằng LCS</p>
      </LnCard>
      <div class="flex flex-col gap-3.5">
        <LnCard>
          <div class="flex items-center justify-between"><b class="font-body text-base font-bold">Độ khớp lần đọc</b><span class="font-display font-extrabold text-[1.4rem] text-success">82%</span></div>
          <div class="flex flex-wrap gap-1 mt-3.5 font-body text-[1.0625rem]">
            <span v-for="([s, ok], i) in syllables" :key="i" class="px-2 py-[3px] rounded-md font-semibold" :class="ok ? 'bg-success-bg text-success' : 'bg-error-bg text-error capitalize'">{{ s }}</span>
          </div>
          <p class="font-body text-[0.9375rem] text-ink-2 mt-3.5">Âm <b>/prə/</b> chưa rõ — bật mạnh hơi hơn ở "pre". Các âm còn lại tốt.</p>
        </LnCard>
        <LnCard>
          <b class="font-body text-base font-bold">Từ tiếp theo</b>
          <div class="flex flex-wrap gap-2 mt-3">
            <span v-for="w in nextWords" :key="w" class="font-body text-[0.8125rem] rounded-full px-3.5 py-[7px] border border-line-strong bg-paper-0 text-ink-2 cursor-pointer transition-colors hover:bg-paper-2">{{ w }}</span>
          </div>
        </LnCard>
      </div>
    </div>
  </div>
</template>

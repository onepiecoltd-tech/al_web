<script setup lang="ts">
import { cn } from '~/lib/utils'
import { LEADERBOARD } from '~/composables/useLnData'
import { useLnCtx } from '~/composables/useLnCtx'

const ctx = useLnCtx()
const phase = ref<'lobby' | 'searching' | 'vs' | 'result'>('lobby')
let timer: ReturnType<typeof setTimeout> | undefined

watch(phase, (p) => {
  if (timer) clearTimeout(timer)
  if (p === 'searching') timer = setTimeout(() => { phase.value = 'vs' }, 2200)
})
onBeforeUnmount(() => timer && clearTimeout(timer))

const rankColor = (i: number) => ['text-gold-deep', 'text-[#8d8d8d]', 'text-[#a9743f]'][i] || 'text-ink-3'
</script>

<template>
  <!-- SEARCHING -->
  <div v-if="phase === 'searching'" class="grid place-items-center min-h-[460px]">
    <div class="text-center">
      <div class="w-[120px] h-[120px] mx-auto relative">
        <span
          v-for="i in 3"
          :key="i"
          class="absolute inset-0 rounded-full border-2 border-son opacity-0"
          :style="{ animation: `ln-ping 1.8s ${(i - 1) * 0.6}s cubic-bezier(0,0,.2,1) infinite` }"
        />
        <div class="absolute inset-7 rounded-full bg-son grid place-items-center"><LnIcon name="swords" :size="28" class="text-white" /></div>
      </div>
      <h2 class="font-display font-bold text-[1.75rem] mt-7">Đang tìm đối thủ…</h2>
      <p class="text-ink-3 font-body text-[0.9375rem] mt-1.5">Ghép với người chơi ELO 1.450–1.520</p>
    </div>
  </div>

  <!-- VS -->
  <div v-else-if="phase === 'vs'" class="max-w-[720px] mx-auto">
    <div class="relative overflow-hidden bg-ink text-white rounded-xl-ln p-10 before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(220,74,51,.32),transparent_60%)]">
      <div class="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div class="text-center">
          <div class="w-16 h-16 rounded-full mx-auto mb-2.5 grid place-items-center font-display font-extrabold text-[1.2rem] bg-son">M</div>
          <div class="font-body text-base font-bold">Minh Anh</div><div class="text-xs text-white/60 mt-0.5">ELO 1.482 · Vàng</div>
        </div>
        <div class="font-display font-black text-2xl leading-none italic text-son-bright">VS</div>
        <div class="text-center">
          <div class="w-16 h-16 rounded-full mx-auto mb-2.5 grid place-items-center font-display font-extrabold text-[1.2rem] bg-reu">K</div>
          <div class="font-body text-base font-bold">Khánh</div><div class="text-xs text-white/60 mt-0.5">ELO 1.521 · Vàng</div>
        </div>
      </div>
      <div class="relative bg-white/10 rounded-md-ln px-[18px] py-4 mt-6 text-center text-white font-body text-[1.0625rem]">"The quick brown fox jumps over the lazy dog."</div>
      <div class="relative h-2 rounded-full bg-white/15 mt-[18px] overflow-hidden"><span class="absolute inset-y-0 left-0 right-[42%] bg-son-bright" /></div>
      <div class="relative flex justify-between mt-2.5 text-xs text-white/70"><span>Bạn · 58%</span><span>⏱ 00:12</span><span>Khánh · 42%</span></div>
    </div>
    <div class="flex justify-center mt-[22px]">
      <LnBtn variant="primary" size="lg" icon="mic" @click="phase = 'result'">Đọc to câu trên</LnBtn>
    </div>
  </div>

  <!-- RESULT -->
  <div v-else-if="phase === 'result'" class="max-w-[560px] mx-auto text-center">
    <div class="text-[3.4rem]">👑</div>
    <h2 class="font-display font-extrabold text-[2.5rem] mt-1.5">Chiến thắng!</h2>
    <p class="text-ink-3 font-body text-[1.0625rem] mt-1">Độ khớp 58% so với 42% của Khánh</p>
    <LnCard pop class="mt-6 !p-8">
      <div class="flex justify-around items-center">
        <div><div class="text-ink-3 text-xs">ELO trước</div><div class="font-display font-extrabold text-[1.8rem]">1.482</div></div>
        <div class="text-success flex items-center gap-1.5"><LnIcon name="arrow-right" :size="20" /><span class="font-display font-extrabold text-[1.3rem]">+14</span></div>
        <div><div class="text-ink-3 text-xs">ELO mới</div><div class="font-display font-extrabold text-[1.8rem] text-success">1.496</div></div>
      </div>
    </LnCard>
    <div class="flex gap-3 mt-[22px]">
      <LnBtn variant="secondary" icon="radio" class="flex-1" @click="ctx.go('ban-be')">Phát trực tiếp trận này</LnBtn>
      <LnBtn variant="primary" icon="swords" class="flex-1" @click="phase = 'searching'">Đấu tiếp</LnBtn>
    </div>
    <LnBtn variant="ghost" size="sm" class="mt-3" @click="phase = 'lobby'">Về sảnh thách đấu</LnBtn>
  </div>

  <!-- LOBBY -->
  <div v-else class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
    <div class="flex flex-col gap-4">
      <div class="relative overflow-hidden bg-ink text-white rounded-xl-ln p-8 before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(220,74,51,.32),transparent_60%)]">
        <div class="relative">
          <LnBadge status class="bg-white/15 text-white">Hạng của bạn</LnBadge>
          <div class="flex items-center gap-[18px] mt-4">
            <div class="w-[72px] h-[72px] rounded-full bg-gold grid place-items-center font-display font-extrabold text-[1.6rem] text-white">🏆</div>
            <div><div class="font-display font-extrabold text-[2.2rem] text-white">1.482</div><div class="text-white/65 font-body text-[0.9375rem]">Hạng Vàng · #14 tuần này</div></div>
          </div>
          <div class="relative h-2 rounded-full bg-white/15 mt-5 overflow-hidden"><span class="absolute inset-y-0 left-0 right-[22%] bg-son-bright" /></div>
          <div class="flex justify-between mt-2.5 text-xs text-white/70"><span>1.482</span><span class="text-white/85">còn 18 điểm lên Bạch Kim</span><span>1.500</span></div>
        </div>
      </div>
      <LnBtn variant="primary" size="lg" icon="swords" @click="phase = 'searching'">Tìm đối thủ ngẫu nhiên</LnBtn>
      <div class="flex gap-3">
        <LnBtn variant="outline" icon="user-plus" class="flex-1">Mời đích danh</LnBtn>
        <LnBtn variant="outline" icon="radio" class="flex-1">Xem trận live</LnBtn>
      </div>
    </div>

    <LnCard>
      <div class="flex items-center justify-between mb-2"><b class="font-body text-base font-bold">Bảng xếp hạng · tuần</b><span class="text-ink-3 text-xs">theo ELO</span></div>
      <div
        v-for="(p, i) in LEADERBOARD"
        :key="p.name"
        :class="cn('flex items-center gap-3 border-b border-line-soft last:border-0', p.me ? 'bg-son-soft rounded-md-ln px-2.5 -mx-2.5 py-2.5 !border-0' : 'py-[11px]')"
      >
        <span class="w-7 text-center font-display font-extrabold flex-none" :class="rankColor(i)">{{ i + 1 }}</span>
        <LnAvatar :name="p.name" :color="p.color" :size="34" />
        <div class="flex-1"><div class="font-body text-[0.9375rem] font-semibold">{{ p.name }}<span v-if="p.me" class="text-ink-3 font-normal"> · bạn</span></div><div class="text-xs text-ink-3 mt-px">{{ p.w }} thắng</div></div>
        <div class="text-right"><div class="font-body font-bold text-[0.95rem]">{{ p.elo }}</div><div class="text-xs mt-px" :class="p.delta[0] === '+' ? 'text-success' : 'text-error'">{{ p.delta }}</div></div>
      </div>
    </LnCard>
  </div>
</template>

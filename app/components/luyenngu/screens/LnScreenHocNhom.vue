<script setup lang="ts">
import type { AvatarColor } from '~/composables/useLnData'

interface Member { name: string; color: AvatarColor; xp: number; live: number; me?: boolean }
const members: Member[] = [
  { name: 'Khánh', color: 'reu', xp: 4820, live: 92 },
  { name: 'Minh Anh', color: 'son', xp: 4510, live: 78, me: true },
  { name: 'Thu Hà', color: 'son', xp: 3990, live: 64 },
  { name: 'Linh', color: 'ink', xp: 3120, live: 41 },
  { name: 'Nam', color: 'gold', xp: 2870, live: 0 },
]

const liveBoard = members.filter(m => m.live > 0).sort((a, b) => b.live - a.live)
const xpBoard = [...members].sort((a, b) => b.xp - a.xp)
const groups: [string, number, string, boolean][] = [['Lớp luyện IELTS tối', 5, 'NGU-2026', true], ['TOEIC 900 club', 12, 'TOE-900', false]]

const joinCode = ref('')
const rankColor = (i: number) => ['text-gold-deep', 'text-[#8d8d8d]', 'text-[#a9743f]'][i] || 'text-ink-3'
</script>

<template>
  <div class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
    <!-- left: live round + leaderboard -->
    <div class="flex flex-col gap-4">
      <LnBanner>
        <div class="flex items-start justify-between gap-3">
          <div>
            <LnBadge status class="bg-error text-white!">● Đang diễn ra</LnBadge>
            <h2 class="font-display font-bold text-[1.75rem] mt-2.5">Vòng đấu phát âm</h2>
            <p class="text-white/70 font-body text-[0.9375rem] mt-1">Đọc to câu hiển thị — điểm cập nhật realtime.</p>
          </div>
          <div class="text-center"><div class="font-display font-extrabold text-[2.6rem] leading-none text-son-bright">0:14</div><div class="text-xs text-white/60">còn lại</div></div>
        </div>
        <div class="bg-white/10 rounded-md-ln px-4 py-3.5 mt-4 font-body text-[1.0625rem]">"Innovation distinguishes between a leader and a follower."</div>
      </LnBanner>

      <LnCard pop>
        <div class="flex items-center justify-between mb-1.5"><b class="font-body text-base font-bold">Bảng điểm trực tiếp</b><span class="text-ink-3 text-xs">cập nhật qua WebSocket</span></div>
        <div v-for="(m, i) in liveBoard" :key="m.name" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
          <span class="w-7 text-center font-display font-extrabold flex-none" :class="rankColor(i)">{{ i + 1 }}</span>
          <LnAvatar :name="m.name" :color="m.color" :size="34" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between"><span class="font-body text-[0.9375rem] font-semibold">{{ m.name }}<span v-if="m.me" class="text-ink-3 font-normal"> · bạn</span></span><span class="font-body font-bold text-[0.9rem]">{{ m.live }}</span></div>
            <LnProgress :value="m.live" :tone="i === 0 ? '' : 'reu'" class="mt-1" />
          </div>
        </div>
        <LnBtn variant="primary" icon="mic" class="w-full mt-3.5">Đọc lượt của bạn</LnBtn>
      </LnCard>
    </div>

    <!-- right: join + groups + XP -->
    <div class="flex flex-col gap-4">
      <LnCard>
        <b class="font-body text-base font-bold">Vào nhóm bằng mã</b>
        <div class="flex gap-2 mt-3">
          <input v-model="joinCode" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] uppercase placeholder:text-ink-4 placeholder:normal-case focus:outline-none focus:border-son" placeholder="VD: NGU-2026">
          <LnBtn variant="secondary">Vào</LnBtn>
        </div>
      </LnCard>
      <LnCard>
        <div class="flex items-center justify-between mb-2"><b class="font-body text-base font-bold">Nhóm của bạn</b><LnBtn variant="ghost" size="sm" icon="plus">Tạo</LnBtn></div>
        <div v-for="[n, c, code, active] in groups" :key="n" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
          <div class="grid place-items-center w-[38px] h-[38px] rounded-md-ln bg-reu text-white"><LnIcon name="users" :size="18" /></div>
          <div class="flex-1"><div class="font-body text-[0.9375rem] font-semibold">{{ n }}</div><div class="text-xs text-ink-3 mt-px">{{ c }} thành viên · mã {{ code }}</div></div>
          <LnBadge v-if="active" tone="error" status>Live</LnBadge>
        </div>
      </LnCard>
      <LnCard>
        <b class="font-body text-base font-bold">XP leaderboard · tuần</b>
        <div class="mt-2.5">
          <div v-for="(m, i) in xpBoard" :key="m.name" class="flex items-center gap-3 py-[9px] border-b border-line-soft last:border-0">
            <span class="w-7 text-center font-display font-extrabold flex-none" :class="rankColor(i)">{{ i + 1 }}</span>
            <LnAvatar :name="m.name" :color="m.color" :size="30" />
            <span class="font-body text-[0.9375rem] font-semibold flex-1">{{ m.name }}</span>
            <span class="font-body font-bold text-[0.85rem] text-gold-deep">{{ m.xp.toLocaleString('vi') }} XP</span>
          </div>
        </div>
      </LnCard>
    </div>
  </div>
</template>

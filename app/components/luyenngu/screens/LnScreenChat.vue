<script setup lang="ts">
import { cn } from '~/lib/utils'
import { type AvatarColor } from '~/composables/useLnData'
import { useLnCtx } from '~/composables/useLnCtx'
import type { Friend, Gift } from '~/types/api'

const ctx = useLnCtx()
const active = ref(0)
const view = ref<'chat' | 'live'>('chat')
const callOpen = ref(false)

const { data: friends } = await useFetch<Friend[]>('/api/friends', { default: () => [] })
const { data: gifts } = await useGifts()
const f = computed(() => friends.value[active.value])

const avatarPalette: AvatarColor[] = ['son', 'reu', 'gold', 'ink']
const avatarColor = (i: number): AvatarColor => avatarPalette[i % avatarPalette.length]!

const statusLabel: Record<string, string> = { online: 'Đang hoạt động', busy: 'Bận', away: 'Vắng mặt', offline: 'Ngoại tuyến' }

// live chat
const liveChat = ref<{ n: string; t: string; gift?: boolean }[]>([
  { n: 'Linh', t: 'Cố lên Khánh! 🔥' }, { n: 'Nam', t: 'Trận này căng quá' }, { n: 'Phúc', t: 'gg 👏' },
])
function sendGift(g: Gift) {
  if (ctx.coins.value >= g.price) {
    ctx.addCoins(-g.price)
    liveChat.value.push({ n: 'Bạn', t: `đã tặng ${g.emoji} ${g.name}`, gift: true })
  }
}

function openChat(i: number) { active.value = i; view.value = 'chat' }
</script>

<template>
  <div class="grid grid-cols-[290px_minmax(0,1fr)] gap-4 h-[calc(100vh-60px-3rem)] max-[720px]:grid-cols-1 max-[720px]:h-auto">
    <!-- friends list -->
    <LnCard class="!p-0 flex flex-col overflow-hidden">
      <div class="flex items-center justify-between px-3.5 pt-3.5 pb-2.5"><b class="font-body text-base font-bold">Bạn bè</b><LnBtn variant="ghost" size="sm" icon="user-plus" /></div>
      <div class="px-3 pb-2.5"><LnSearch placeholder="Tìm bạn…" /></div>
      <div class="px-3 pb-1.5">
        <LnBtn variant="secondary" icon="message-square-text" class="w-full" @click="ctx.openMessenger">Mở Messenger cổ điển</LnBtn>
      </div>
      <div class="overflow-y-auto flex-1 px-2 py-1.5">
        <button
          v-for="(fr, i) in friends"
          :key="fr.id"
          type="button"
          :class="cn('flex items-center gap-[11px] w-full px-[11px] py-[9px] rounded-md-ln text-left transition-colors', active === i ? 'bg-paper-2' : 'hover:bg-paper-2')"
          @click="openChat(i)"
        >
          <LnAvatar :name="fr.name" :color="avatarColor(i)" :size="38" :status="fr.presence" />
          <div class="flex-1 min-w-0">
            <div class="font-body text-[0.9375rem] font-semibold">{{ fr.name }}</div>
            <div class="text-xs text-ink-3 truncate">{{ fr.presence === 'offline' ? 'Ngoại tuyến' : fr.msg }}</div>
          </div>
        </button>
      </div>
    </LnCard>

    <!-- live view -->
    <LnCard v-if="view === 'live'" class="!p-0 flex flex-col overflow-hidden">
      <div class="grid grid-cols-[1fr_300px] flex-1 min-h-0 max-[720px]:grid-cols-1">
        <div class="bg-ink relative grid grid-cols-2 gap-0.5 p-0.5">
          <span class="absolute top-3 left-3 z-[2] flex gap-2 items-center">
            <LnBadge status class="bg-error text-white">● LIVE</LnBadge>
            <span class="inline-flex items-center bg-black/50 text-white rounded-[5px] px-2 py-[3px] text-xs font-bold"><LnIcon name="eye" :size="12" class="mr-1" />342</span>
          </span>
          <button type="button" class="absolute top-2.5 right-2.5 z-[2] grid place-items-center w-9 h-9 rounded-md-ln text-white hover:bg-white/10" @click="view = 'chat'"><LnIcon name="x" :size="20" /></button>
          <div v-for="[n, c] in ([['Minh Anh', 'son'], ['Khánh', 'reu']] as const)" :key="n" class="grid place-items-center relative rounded-lg overflow-hidden" style="background: linear-gradient(160deg,#322a24,#1f1a16)">
            <LnAvatar :name="n" :color="c" :size="64" />
            <span class="absolute left-2.5 bottom-2.5 text-xs text-white bg-black/45 px-2 py-0.5 rounded-md">{{ n }}</span>
          </div>
        </div>
        <div class="flex flex-col border-l border-line min-h-0">
          <div class="flex items-center justify-between px-3.5 py-3 border-b border-line"><b class="font-body text-[0.8125rem] font-bold">Cổ vũ trực tiếp</b></div>
          <div class="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2">
            <div v-for="(c, i) in liveChat" :key="i" class="font-body text-[0.9375rem]">
              <b :class="c.gift ? 'text-gold-deep' : 'text-son-deep'">{{ c.n }}</b>
              <span :class="c.gift ? 'text-gold-deep font-semibold' : 'text-ink-2'"> {{ c.t }}</span>
            </div>
          </div>
          <div class="p-2.5 border-t border-line">
            <div class="flex items-center justify-between mb-2"><span class="text-ink-3 text-xs">Tặng quà</span><LnCoinsPill :amount="ctx.coins.value" /></div>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="g in gifts"
                :key="g.id"
                type="button"
                :title="`${g.name} · ${g.price} xu`"
                class="basis-[calc(25%-5px)] bg-paper-0 border border-line rounded-lg-ln px-1 py-[7px] text-center cursor-pointer transition-all hover:border-gold-line hover:bg-gold-soft hover:-translate-y-0.5"
                @click="sendGift(g)"
              >
                <div class="text-[1.3rem] leading-none">{{ g.emoji }}</div>
                <div class="mt-0.5 inline-flex items-center gap-[3px] text-xs font-bold text-gold-deep"><LnCoin :size="13" />{{ g.price }}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </LnCard>

    <!-- conversation -->
    <LnCard v-else class="!p-0 flex flex-col overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-line">
        <div class="flex items-center gap-2.5">
          <LnAvatar :name="f?.name ?? ''" :color="avatarColor(active)" :size="36" :status="f?.presence" />
          <div><div class="font-body text-base font-bold">{{ f?.name }}</div><div class="text-xs" :class="f?.presence === 'online' ? 'text-success' : 'text-ink-3'">{{ statusLabel[f?.presence ?? 'offline'] }}</div></div>
        </div>
        <div class="flex gap-0.5">
          <LnIconBtn title="Gọi video" @click="callOpen = true"><LnIcon name="video" :size="20" /></LnIconBtn>
          <LnIconBtn title="Livestream" @click="view = 'live'"><LnIcon name="radio" :size="20" /></LnIconBtn>
          <LnIconBtn title="Thông tin"><LnIcon name="info" :size="20" /></LnIconBtn>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto bg-paper-1 p-3.5 flex flex-col gap-2.5">
        <div class="text-center text-xs text-ink-3 my-1">Hôm nay</div>
        <div class="max-w-[78%] px-3 py-2 rounded-[14px] font-body text-[0.9375rem] bg-paper-0 border border-line self-start rounded-bl-[4px]">Tối nay luyện Part 2 chứ? 🎧</div>
        <div class="max-w-[78%] px-3 py-2 rounded-[14px] font-body text-[0.9375rem] bg-son text-white self-end rounded-br-[4px]">Ok, mình lấy cue card forecast tuần này nhé</div>
        <div class="max-w-[78%] px-3 py-2 rounded-[14px] font-body text-[0.9375rem] bg-paper-0 border border-line self-start rounded-bl-[4px]">Để mình mở phòng. Sẵn đấu phát âm luôn 💪</div>
        <div class="self-center bg-gold-soft text-gold-deep border border-dashed border-gold-line font-bold text-[0.8rem] px-3 py-2 rounded-[14px]">⚡ {{ f?.name }} đã Buzz bạn!</div>
        <div class="max-w-[78%] px-3 py-2 rounded-[14px] font-body text-[0.9375rem] bg-son text-white self-end rounded-br-[4px]">Hahaha vào liền 🔥</div>
      </div>
      <div class="flex gap-2 p-[11px] border-t border-line bg-paper-0 items-center">
        <LnIconBtn :size="38"><LnIcon name="smile" :size="20" /></LnIconBtn>
        <LnIconBtn :size="38" title="Buzz"><LnIcon name="zap" :size="20" class="text-gold-deep" /></LnIconBtn>
        <div class="flex-1 bg-paper-2 border border-line rounded-full px-3.5 py-2 font-body text-[0.9375rem] text-ink-4">Nhắn tin tới {{ f?.name }}…</div>
        <LnBtn variant="primary" size="sm" icon="send" class="!px-2.5 !py-2" />
      </div>
    </LnCard>

    <!-- video call dialog -->
    <LnDialog :open="callOpen" :width="560" @close="callOpen = false">
      <div class="flex items-center justify-between mb-3.5"><b class="font-display text-[1.3125rem] font-bold">Luyện nói cùng nhau</b><LnIconBtn @click="callOpen = false"><LnIcon name="x" :size="20" /></LnIconBtn></div>
      <div class="grid grid-cols-2 gap-2.5">
        <div v-for="[n, c] in ([['Bạn', 'son'], [f?.name ?? '', avatarColor(active)]] as [string, AvatarColor][])" :key="n" class="aspect-[4/3] rounded-lg-ln bg-ink grid place-items-center relative overflow-hidden">
          <LnAvatar :name="n" :color="c" :size="56" />
          <span class="absolute left-2.5 bottom-2.5 text-xs text-white bg-black/40 px-2 py-0.5 rounded-md">{{ n }}</span>
        </div>
      </div>
      <div class="flex justify-center gap-2.5 mt-[18px]">
        <LnIconBtn :size="46" class="bg-paper-2!"><LnIcon name="mic" :size="20" /></LnIconBtn>
        <LnIconBtn :size="46" class="bg-paper-2!"><LnIcon name="video" :size="20" /></LnIconBtn>
        <LnIconBtn :size="46" class="bg-error! text-white!" @click="callOpen = false"><LnIcon name="phone-off" :size="20" /></LnIconBtn>
        <LnIconBtn :size="46" class="bg-error! text-white!" title="Phát trực tiếp"><LnIcon name="radio" :size="20" /></LnIconBtn>
      </div>
    </LnDialog>
  </div>
</template>

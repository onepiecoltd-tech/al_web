<script setup lang="ts">
// Screen: Gặp gỡ — trò chuyện ngẫu nhiên người lạ (18+, có kiểm soát)
import { useLnCtx } from '~/composables/useLnCtx'
import type { Gift } from '~/types/api'

const ctx = useLnCtx()
const { data: gifts } = await useGifts()

const optIn = ref(false)
const phase = ref<'setup' | 'searching' | 'session'>('setup')
const scope = ref('city')
const age = ref('18-25')
const kind = ref<'voice' | 'text'>('voice')

// gate
const ok = ref(false)

// searching → session after a beat
let timer: ReturnType<typeof setTimeout> | undefined
watch(phase, (p) => {
  if (timer) clearTimeout(timer)
  if (p === 'searching') timer = setTimeout(() => { phase.value = 'session' }, 2200)
})
onBeforeUnmount(() => timer && clearTimeout(timer))

// session
const giftOpen = ref(false)
const msgs = ref<{ them?: boolean; gift?: boolean; t: string }[]>([
  { them: true, t: 'Hi! Mình đang luyện Speaking, bạn target band mấy?' },
  { them: false, t: 'Mình target 7.0 😄 cùng luyện Part 2 nhé' },
])
function sendGift(g: Gift) {
  if (ctx.coins.value >= g.price) {
    ctx.addCoins(-g.price)
    msgs.value.push({ gift: true, t: `Bạn đã tặng ${g.emoji} ${g.name}` })
    giftOpen.value = false
  }
}

const gateRows: [string, string][] = [
  ['shield-check', 'Chỉ dành cho người từ 18 tuổi. Không bao giờ ghép người lớn với vị thành niên.'],
  ['map-pin-off', 'Vị trí chỉ ở mức tỉnh/thành (tuỳ chọn) — không lộ vị trí chính xác hay khoảng cách cho đối phương.'],
  ['flag', 'Skip · Báo cáo · Chặn chỉ một chạm. Phiên trò chuyện không lưu lại trừ khi hai bên kết bạn.'],
  ['eye-off', 'Không chia sẻ SĐT, mạng xã hội hay địa chỉ. Nội dung được kiểm duyệt bằng AI + lọc từ khóa.'],
]

const kinds: [string, string, string, string][] = [
  ['voice', 'Gọi thoại', 'mic', 'Khuyến nghị để luyện nói'],
  ['text', 'Nhắn tin', 'message-circle', 'An toàn hơn, ẩn danh'],
]
const scopes: [string, string, string][] = [
  ['city', 'Cùng tỉnh/thành', 'map-pin'],
  ['nearby', 'Quanh đây', 'locate'],
  ['country', 'Trong nước', 'flag'],
  ['foreign', 'Nước ngoài', 'globe'],
]
const ageOptions = [
  { v: '18-25', label: '18–25' }, { v: '26-35', label: '26–35' },
  { v: '36+', label: '36+' }, { v: 'any', label: 'Bất kỳ' },
]
const scopeLabel: Record<string, string> = { city: 'cùng tỉnh/thành', nearby: 'quanh đây', country: 'trong nước', foreign: 'nước ngoài' }
</script>

<template>
  <!-- 18+ consent gate -->
  <div v-if="!optIn" class="max-w-[520px] mx-auto">
    <div class="text-center mb-5">
      <div class="w-16 h-16 rounded-xl-ln mx-auto grid place-items-center bg-son"><LnIcon name="shuffle" :size="30" class="text-white" /></div>
      <h2 class="font-display font-bold text-[1.75rem] mt-4">Gặp gỡ — luyện nói với người lạ</h2>
      <p class="text-ink-3 font-body text-[1.0625rem] mt-1.5">Ghép ngẫu nhiên để trò chuyện & luyện nói. Có thể kết bạn hoặc tặng quà.</p>
    </div>
    <LnCard pop>
      <div class="flex items-center justify-between mb-3"><b class="font-body text-base font-bold">Trước khi bắt đầu</b><LnBadge tone="error" status>Chỉ 18+</LnBadge></div>
      <div v-for="[ic, t] in gateRows" :key="t" class="flex items-start gap-3 py-2.5">
        <LnIcon :name="ic" :size="18" class="text-son mt-0.5 flex-none" />
        <div class="flex-1 font-body text-[0.9375rem] text-ink-2">{{ t }}</div>
      </div>
      <label class="flex gap-2.5 items-start mt-3.5 cursor-pointer">
        <button
          type="button"
          :class="['w-[22px] h-[22px] rounded-md grid place-items-center flex-none mt-px border-[1.5px]', ok ? 'bg-son border-son' : 'bg-transparent border-line-strong']"
          @click="ok = !ok"
        >
          <LnIcon v-if="ok" name="check" :size="14" class="text-white" />
        </button>
        <span class="font-body text-[0.9375rem] text-ink-2">Tôi xác nhận đã đủ 18 tuổi và đồng ý với quy tắc cộng đồng & an toàn.</span>
      </label>
      <LnBtn variant="primary" size="lg" icon="shuffle" :disabled="!ok" class="w-full mt-[18px]" @click="optIn = true">Bật Gặp gỡ</LnBtn>
      <p class="text-center text-xs text-ink-3 mt-2.5">Có thể tắt bất cứ lúc nào trong Hồ sơ › Cài đặt.</p>
    </LnCard>
  </div>

  <!-- searching -->
  <div v-else-if="phase === 'searching'" class="grid place-items-center min-h-[440px]">
    <div class="text-center">
      <div class="w-[120px] h-[120px] mx-auto relative">
        <span
          v-for="i in 3"
          :key="i"
          class="absolute inset-0 rounded-full border-2 border-son opacity-0"
          :style="{ animation: `ln-ping 1.8s ${(i - 1) * 0.6}s cubic-bezier(0,0,.2,1) infinite` }"
        />
        <div class="absolute inset-7 rounded-full bg-son grid place-items-center"><LnIcon name="shuffle" :size="28" class="text-white" /></div>
      </div>
      <h2 class="font-display font-bold text-[1.75rem] mt-7">Đang tìm người phù hợp…</h2>
      <p class="text-ink-3 font-body text-[0.9375rem] mt-1.5">{{ kind === 'voice' ? 'Gọi thoại' : 'Nhắn tin' }} · {{ scopeLabel[scope] }} · {{ age === 'any' ? 'mọi lứa tuổi' : age + ' tuổi' }}</p>
      <LnBtn variant="outline" class="mt-[22px]" @click="phase = 'setup'">Huỷ</LnBtn>
    </div>
  </div>

  <!-- active session -->
  <div v-else-if="phase === 'session'" class="max-w-[720px] mx-auto">
    <div class="flex gap-2.5 items-center bg-warning-bg border border-gold-line rounded-lg-ln px-3.5 py-3 mb-3.5">
      <LnIcon name="shield-alert" :size="16" class="text-gold-deep flex-none" />
      <span class="font-body text-xs text-ink-2">Đừng chia sẻ SĐT, mạng xã hội hay địa chỉ. Phiên này ẩn danh & không được lưu.</span>
    </div>
    <LnCard pop class="!p-0 overflow-hidden flex flex-col h-[480px]">
      <div class="flex items-center justify-between px-3.5 py-3 border-b border-line">
        <div class="flex items-center gap-2.5">
          <div class="w-[38px] h-[38px] rounded-full grid place-items-center bg-paper-3"><LnIcon name="user" :size="20" class="text-ink-3" /></div>
          <div>
            <div class="font-body text-base font-bold flex items-center gap-1.5">Người lạ <LnBadge tone="reu">Trung cấp</LnBadge></div>
            <div class="font-body text-xs" :class="kind === 'voice' ? 'text-success' : 'text-ink-3'">{{ kind === 'voice' ? '🔊 Đang gọi thoại · 00:42' : 'Đang nhắn tin' }}</div>
          </div>
        </div>
        <div class="flex gap-0.5">
          <LnIconBtn title="Báo cáo"><LnIcon name="flag" :size="18" class="text-error" /></LnIconBtn>
          <LnIconBtn title="Chặn"><LnIcon name="ban" :size="18" class="text-error" /></LnIconBtn>
        </div>
      </div>
      <div v-if="kind === 'voice'" class="flex justify-center gap-[30px] py-4 bg-paper-1 border-b border-line-soft">
        <div v-for="[n, c] in ([['Bạn', 'son'], ['Người lạ', 'paper-3']] as const)" :key="n" class="text-center">
          <div class="w-[52px] h-[52px] rounded-full mx-auto grid place-items-center" :class="c === 'son' ? 'bg-son' : 'bg-paper-3'">
            <LnIcon v-if="c === 'son'" name="mic" :size="22" class="text-white" />
            <LnIcon v-else name="user" :size="22" class="text-ink-3" />
          </div>
          <div class="text-xs text-ink-3 mt-1.5">{{ n }}</div>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto bg-paper-1 p-3.5 flex flex-col gap-2.5">
        <div
          v-for="(m, i) in msgs"
          :key="i"
          :class="m.gift
            ? 'self-center bg-gold-soft text-gold-deep border border-dashed border-gold-line font-bold text-[0.8rem] px-3 py-2 rounded-[14px]'
            : m.them
              ? 'max-w-[78%] px-3 py-2 rounded-[14px] font-body text-[0.9375rem] bg-paper-0 border border-line self-start rounded-bl-[4px]'
              : 'max-w-[78%] px-3 py-2 rounded-[14px] font-body text-[0.9375rem] bg-son text-white self-end rounded-br-[4px]'"
        >
          {{ m.t }}
        </div>
      </div>
      <div class="flex gap-2 p-[11px] border-t border-line bg-paper-0 items-center">
        <LnIconBtn :size="38" title="Tặng quà" @click="giftOpen = true"><LnIcon name="gift" :size="20" class="text-gold-deep" /></LnIconBtn>
        <div class="flex-1 bg-paper-2 border border-line rounded-full px-3.5 py-2 font-body text-[0.9375rem] text-ink-4">Nhắn gì đó…</div>
        <LnBtn variant="primary" size="sm" icon="send" class="!px-2.5 !py-2" />
      </div>
    </LnCard>
    <div class="flex gap-3 mt-4">
      <LnBtn variant="outline" icon="user-plus" class="flex-1">Kết bạn</LnBtn>
      <LnBtn variant="primary" icon="skip-forward" class="flex-1" @click="phase = 'searching'">Người tiếp theo</LnBtn>
      <LnBtn variant="ghost" icon="x" @click="phase = 'setup'">Kết thúc</LnBtn>
    </div>

    <LnDialog :open="giftOpen" @close="giftOpen = false">
      <div class="flex items-center justify-between mb-1.5"><b class="font-display text-[1.3125rem] font-bold">Tặng quà</b><LnCoinsPill :amount="ctx.coins.value" /></div>
      <p class="text-ink-3 font-body text-xs mb-3.5">Chỉ dành cho 18+ · có hạn mức mỗi phiên.</p>
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
          <div class="text-xs text-ink-2 mt-1">{{ g.name }}</div>
          <div class="mt-0.5 inline-flex items-center gap-[3px] text-xs font-bold text-gold-deep"><LnCoin :size="13" />{{ g.price }}</div>
        </button>
      </div>
    </LnDialog>
  </div>

  <!-- filter setup -->
  <div v-else class="max-w-[560px] mx-auto">
    <LnCard pop>
      <div class="flex items-center justify-between"><b class="font-display text-[1.4rem] font-bold">Bộ lọc ghép cặp</b><LnBadge tone="reu" status>Gặp gỡ bật</LnBadge></div>
      <p class="text-ink-3 font-body text-[0.9375rem] mt-1 mb-[18px]">Bộ lọc chỉ ảnh hưởng hồ ghép — không phải bản đồ, không hiện vị trí ai cho ai.</p>

      <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Hình thức</label>
      <div class="flex gap-2.5 mt-2 mb-5">
        <button
          v-for="[v, l, ic, sub] in kinds"
          :key="v"
          type="button"
          :class="['flex-1 text-left border rounded-lg-ln p-3.5 cursor-pointer transition-colors', kind === v ? 'border-son bg-son-soft' : 'border-line bg-paper-0']"
          @click="kind = v as 'voice' | 'text'"
        >
          <LnIcon :name="ic" :size="20" class="text-son" />
          <div class="font-body text-base font-bold mt-2">{{ l }}</div>
          <div class="text-xs text-ink-3 mt-px">{{ sub }}</div>
        </button>
      </div>

      <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Phạm vi</label>
      <div class="grid grid-cols-2 gap-2.5 mt-2 mb-5">
        <button
          v-for="[v, l, ic] in scopes"
          :key="v"
          type="button"
          :class="['flex items-center gap-2 justify-start px-3.5 py-2.5 rounded-full border font-body text-[0.8125rem]', scope === v ? 'bg-son-soft border-son-line text-son-deep font-bold' : 'bg-paper-0 border-line-strong text-ink-2 font-semibold']"
          @click="scope = v"
        >
          <LnIcon :name="ic" :size="16" />{{ l }}
        </button>
      </div>

      <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Khoảng tuổi</label>
      <div class="mt-2 mb-6"><LnSegment v-model="age" :options="ageOptions" /></div>

      <LnBtn variant="primary" size="lg" icon="shuffle" class="w-full" @click="phase = 'searching'">Bắt đầu ghép</LnBtn>
    </LnCard>
    <div class="text-center mt-3.5">
      <LnBtn variant="ghost" size="sm" icon="power" @click="optIn = false">Tắt Gặp gỡ</LnBtn>
    </div>
  </div>
</template>

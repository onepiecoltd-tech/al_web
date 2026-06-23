<script setup lang="ts">
import { cn } from '~/lib/utils'
import { type AvatarColor } from '~/composables/useLnData'
import { useLnCtx } from '~/composables/useLnCtx'
import type { DirectMessage, Friend, Gift, UserMini } from '~/types/api'

const ctx = useLnCtx()
const active = ref(0)
const view = ref<'chat' | 'live'>('chat')
const callOpen = ref(false)

const { me } = useMe()
const { data: friends, refresh: refreshFriends } = await useFetch<Friend[]>('/api/friends', { default: () => [] })
const { data: gifts } = await useGifts()
const { coins, gift: spendGift } = useWallet()
const toast = useToast()
const confirm = useConfirm()

// friend management dialog
const friendDlg = ref(false)
const friendTab = ref<'suggest' | 'friends' | 'requests'>('suggest')
const searchQ = ref('')
const searchResults = ref<UserMini[]>([])
const friendBusy = ref(false)
const { data: requests, refresh: refreshRequests } = await useFetch<Friend[]>('/api/friends/requests', { default: () => [] })

async function doSearch() {
  searchResults.value = await $fetch<UserMini[]>('/api/users/search', { query: { q: searchQ.value } })
}
function openFriendDlg() {
  searchQ.value = ''
  friendDlg.value = true
  friendTab.value = requests.value.length ? 'requests' : 'suggest'
  doSearch()
  refreshRequests()
}
watch(searchQ, doSearch)

async function addFriend(u: UserMini) {
  friendBusy.value = true
  try {
    await $fetch('/api/friends', { method: 'POST', body: { friend_id: u.id } })
    await Promise.all([refreshFriends(), refreshRequests(), doSearch()])
    toast.ok(`Đã gửi lời mời kết bạn tới ${u.name}.`)
  }
  catch {
    toast.err('Không thể gửi lời mời. Vui lòng thử lại.')
  }
  finally {
    friendBusy.value = false
  }
}
async function acceptRequest(u: Friend) {
  friendBusy.value = true
  try {
    await $fetch(`/api/friends/requests/${u.id}/accept`, { method: 'POST' })
    await Promise.all([refreshFriends(), refreshRequests(), doSearch()])
    toast.ok(`Bạn và ${u.name} đã trở thành bạn bè.`)
  }
  catch {
    toast.err('Không thể chấp nhận lời mời. Vui lòng thử lại.')
  }
  finally {
    friendBusy.value = false
  }
}
async function declineRequest(u: Friend) {
  friendBusy.value = true
  try {
    await $fetch(`/api/friends/${u.id}`, { method: 'DELETE' })
    await Promise.all([refreshRequests(), doSearch()])
    toast.ok(`Đã từ chối lời mời từ ${u.name}.`)
  }
  catch {
    toast.err('Không thể từ chối lời mời. Vui lòng thử lại.')
  }
  finally {
    friendBusy.value = false
  }
}
async function removeFriend(f: Friend) {
  if (!await confirm.ask({ title: 'Xóa bạn bè?', message: `${f.name} sẽ bị xóa khỏi danh sách bạn bè của bạn.`, confirmLabel: 'Xóa', danger: true }))
    return
  friendBusy.value = true
  try {
    await $fetch(`/api/friends/${f.id}`, { method: 'DELETE' })
    if (active.value >= friends.value.length - 1)
      active.value = 0
    await Promise.all([refreshFriends(), doSearch()])
    toast.ok(`Đã xóa ${f.name} khỏi danh sách bạn bè.`)
  }
  catch {
    toast.err('Không thể xóa bạn. Vui lòng thử lại.')
  }
  finally {
    friendBusy.value = false
  }
}
const f = computed(() => friends.value[active.value])

// --- Realtime 1:1 chat ---
// conversations[friendId] = message history with that friend, loaded lazily
// the first time you open their conversation and kept in sync from there by
// the single page-level SSE subscription below.
const conversations = ref<Record<string, DirectMessage[]>>({})
const convoLoading = ref(false)
const messageInput = ref('')
const sending = ref(false)
const chatBody = ref<HTMLElement>()
const { refresh: refreshUnread } = useUnreadMessages()

// Mark a conversation read on the server, then refresh the sidebar badge.
async function markRead(friendId: string) {
  await $fetch(`/api/messages/${friendId}/read`, { method: 'POST' }).catch(() => {})
  await refreshUnread()
}

async function loadConversation(friendId: string) {
  if (conversations.value[friendId])
    return
  convoLoading.value = true
  try {
    conversations.value[friendId] = await $fetch<DirectMessage[]>(`/api/messages/${friendId}`)
  }
  catch {
    toast.err('Không tải được lịch sử chat.')
  }
  finally {
    convoLoading.value = false
  }
}
async function scrollChatToBottom() {
  await nextTick()
  if (chatBody.value)
    chatBody.value.scrollTop = chatBody.value.scrollHeight
}
watch(() => f.value?.id, async (id) => {
  if (!id)
    return
  await loadConversation(id)
  scrollChatToBottom()
  markRead(id) // opening a conversation reads it
}, { immediate: true })

async function sendMessage() {
  const friendId = f.value?.id
  const body = messageInput.value.trim()
  if (!friendId || !body)
    return
  sending.value = true
  try {
    const msg = await $fetch<DirectMessage>(`/api/messages/${friendId}`, { method: 'POST', body: { body } })
    ;(conversations.value[friendId] ??= []).push(msg)
    messageInput.value = ''
    scrollChatToBottom()
  }
  catch {
    toast.err('Không gửi được tin nhắn.')
  }
  finally {
    sending.value = false
  }
}

// One WebSocket connection for the whole page — incoming messages from any
// friend land here and get appended to that friend's conversation if
// already loaded (so the open conversation updates live; others just wait
// for the user to open them, at which point loadConversation fetches the
// latest). Same-origin connection to Nitro, which bridges to Go — see
// server/api/messages/ws.ts.
let dmSocket: WebSocket | null = null
onMounted(() => {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  dmSocket = new WebSocket(`${proto}//${location.host}/api/messages/ws`)
  dmSocket.onmessage = (ev) => {
    let msg: DirectMessage
    try {
      msg = JSON.parse(ev.data)
    }
    catch {
      return
    }
    const list = conversations.value[msg.sender_id]
    if (list)
      list.push(msg)
    if (f.value?.id === msg.sender_id) {
      // Conversation is open on screen — treat the new message as read.
      scrollChatToBottom()
      markRead(msg.sender_id)
    }
    else {
      // Arrived for a conversation that isn't open — bump the sidebar badge.
      refreshUnread()
    }
  }
})
onUnmounted(() => dmSocket?.close())

// Keep friends' online dots current by re-fetching the list periodically —
// presence is derived server-side from each friend's last heartbeat.
let presenceTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  presenceTimer = setInterval(() => { refreshFriends() }, 30_000)
})
onUnmounted(() => {
  if (presenceTimer)
    clearInterval(presenceTimer)
})

const avatarPalette: AvatarColor[] = ['son', 'reu', 'gold', 'ink']
const avatarColor = (i: number): AvatarColor => avatarPalette[i % avatarPalette.length]!

const statusLabel: Record<string, string> = { online: 'Đang hoạt động', busy: 'Bận', away: 'Vắng mặt', offline: 'Ngoại tuyến' }

// live chat
const liveChat = ref<{ n: string; t: string; gift?: boolean }[]>([
  { n: 'Linh', t: 'Cố lên Khánh! 🔥' }, { n: 'Nam', t: 'Trận này căng quá' }, { n: 'Phúc', t: 'gg 👏' },
])
async function sendGift(g: Gift) {
  try {
    await spendGift(g.id)
    liveChat.value.push({ n: 'Bạn', t: `đã tặng ${g.emoji} ${g.name}`, gift: true })
    toast.ok(`Đã tặng ${g.emoji} ${g.name}!`)
  }
  catch { toast.err('Không đủ xu để tặng quà.') }
}

function openChat(i: number) { active.value = i; view.value = 'chat' }
</script>

<template>
  <div class="grid grid-cols-[290px_minmax(0,1fr)] gap-4 h-[calc(100vh-60px-3rem)] max-[720px]:grid-cols-1 max-[720px]:h-auto">
    <!-- friends list -->
    <LnCard class="!p-0 flex flex-col overflow-hidden">
      <div class="flex items-center justify-between px-3.5 pt-3.5 pb-2.5">
        <b class="font-body text-base font-bold">Bạn bè</b>
        <div class="relative">
          <LnBtn variant="ghost" size="sm" icon="user-plus" @click="openFriendDlg" />
          <span v-if="requests.length" class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-son text-white text-[0.6rem] font-bold tabular-nums pointer-events-none">{{ requests.length }}</span>
        </div>
      </div>
      <div class="px-3 pb-2.5"><LnSearch placeholder="Tìm bạn…" /></div>
      <!-- <div class="px-3 pb-1.5">
        <LnBtn variant="secondary" icon="message-square-text" class="w-full" @click="ctx.openMessenger">Mở Messenger cổ điển</LnBtn>
      </div> -->
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
          <div v-for="[n, c] in ([[me?.name ?? '', 'son'], [f?.name ?? '', 'reu']] as const)" :key="n" class="grid place-items-center relative rounded-lg overflow-hidden" style="background: linear-gradient(160deg,#322a24,#1f1a16)">
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
            <div class="flex items-center justify-between mb-2"><span class="text-ink-3 text-xs">Tặng quà</span><LnCoinsPill :amount="coins" /></div>
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
        <!-- <div class="flex gap-0.5">
          <LnIconBtn title="Gọi video" @click="callOpen = true"><LnIcon name="video" :size="20" /></LnIconBtn>
          <LnIconBtn title="Livestream" @click="view = 'live'"><LnIcon name="radio" :size="20" /></LnIconBtn>
          <LnIconBtn title="Thông tin"><LnIcon name="info" :size="20" /></LnIconBtn>
        </div> -->
      </div>
      <div ref="chatBody" class="flex-1 overflow-y-auto bg-paper-1 p-3.5 flex flex-col gap-2.5">
        <div v-if="convoLoading" class="text-center text-ink-3 font-body text-[0.875rem] m-auto">Đang tải lịch sử chat…</div>
        <div v-else-if="!f || !conversations[f.id]?.length" class="text-center text-ink-3 font-body text-[0.875rem] m-auto">Chưa có tin nhắn nào. Bắt đầu trò chuyện nhé!</div>
        <div
          v-for="m in (f ? conversations[f.id] : []) ?? []"
          :key="m.id"
          class="max-w-[78%] px-3 py-2 rounded-[14px] font-body text-[0.9375rem]"
          :class="m.sender_id === me?.id ? 'bg-son text-white self-end rounded-br-[4px]' : 'bg-paper-0 border border-line self-start rounded-bl-[4px]'"
        >{{ m.body }}</div>
      </div>
      <div class="flex gap-2 p-[11px] border-t border-line bg-paper-0 items-center">
        <input
          v-model="messageInput"
          :disabled="sending"
          class="flex-1 bg-paper-2 border border-line rounded-full px-3.5 py-2 font-body text-[0.9375rem] text-ink placeholder:text-ink-4 focus:outline-none focus:border-son disabled:opacity-60"
          :placeholder="`Nhắn tin tới ${f?.name ?? ''}…`"
          @keyup.enter="sendMessage"
        >
        <LnBtn variant="primary" size="sm" icon="send" class="!px-2.5 !py-2" :disabled="sending || !messageInput.trim()" @click="sendMessage" />
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

    <!-- friend management dialog -->
    <LnDialog :open="friendDlg" :width="460" @close="friendDlg = false">
      <div class="flex items-center justify-between mb-3.5">
        <b class="font-display text-[1.3125rem] font-bold">Quản lý bạn bè</b>
        <LnIconBtn @click="friendDlg = false"><LnIcon name="x" :size="20" /></LnIconBtn>
      </div>

      <LnTabs
        v-model="friendTab"
        :tabs="[
          { v: 'suggest', label: 'Gợi ý' },
          { v: 'friends', label: `Bạn bè (${friends.length})` },
          { v: 'requests', label: requests.length ? `Lời mời (${requests.length})` : 'Lời mời' },
        ]"
        class="mb-3.5"
      />

      <!-- fixed-height shell so switching tabs doesn't resize/flick the dialog -->
      <div class="h-[400px] flex flex-col">
        <div v-if="friendTab === 'suggest'" class="flex-none">
          <LnField v-model="searchQ" placeholder="Tìm theo tên, email hoặc @handle…" />
        </div>

        <div class="flex-1 overflow-y-auto mt-3">
          <!-- suggestions / search -->
          <template v-if="friendTab === 'suggest'">
            <div v-for="u in searchResults" :key="u.id" class="flex items-center gap-2.5 py-2 border-b border-line-soft last:border-0">
              <LnAvatar :name="u.name" color="reu" :size="32" />
              <div class="flex-1 min-w-0">
                <div class="font-body text-[0.875rem] font-semibold">{{ u.name }}</div>
                <div class="text-xs text-ink-3">{{ u.handle }} · ELO {{ u.elo }}</div>
              </div>
              <LnBtn v-if="u.friend_status === 'pending_sent'" variant="ghost" size="sm" icon="clock" disabled>Đã gửi lời mời</LnBtn>
              <LnBtn v-else variant="outline" size="sm" icon="user-plus" :disabled="friendBusy" @click="addFriend(u)">Kết bạn</LnBtn>
            </div>
            <p v-if="!searchResults.length" class="text-ink-3 text-xs py-3">{{ searchQ ? 'Không tìm thấy người dùng phù hợp.' : 'Không có gợi ý nào.' }}</p>
          </template>

          <!-- friend list -->
          <template v-else-if="friendTab === 'friends'">
            <div v-for="f in friends" :key="f.id" class="flex items-center gap-2.5 py-2 border-b border-line-soft last:border-0">
              <LnAvatar :name="f.name" color="son" :size="32" :status="f.presence" />
              <div class="flex-1 min-w-0">
                <div class="font-body text-[0.875rem] font-semibold">{{ f.name }}</div>
                <div class="text-xs text-ink-3">{{ f.handle }}</div>
              </div>
              <LnBtn variant="ghost" size="sm" icon="user-minus" :disabled="friendBusy" @click="removeFriend(f)">Xóa</LnBtn>
            </div>
            <p v-if="!friends.length" class="text-ink-3 text-xs py-3">Chưa có bạn bè nào.</p>
          </template>

          <!-- incoming requests -->
          <template v-else>
            <div v-for="u in requests" :key="u.id" class="flex items-center gap-2.5 py-2 border-b border-line-soft last:border-0">
              <LnAvatar :name="u.name" color="gold" :size="32" />
              <div class="flex-1 min-w-0">
                <div class="font-body text-[0.875rem] font-semibold">{{ u.name }}</div>
                <div class="text-xs text-ink-3">{{ u.handle }}</div>
              </div>
              <LnBtn variant="primary" size="sm" icon="check" :disabled="friendBusy" @click="acceptRequest(u)">Chấp nhận</LnBtn>
              <LnBtn variant="ghost" size="sm" icon="x" :disabled="friendBusy" @click="declineRequest(u)" />
            </div>
            <p v-if="!requests.length" class="text-ink-3 text-xs py-3">Không có lời mời nào.</p>
          </template>
        </div>
      </div>
    </LnDialog>
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { AvatarColor } from '~/composables/useLnData'
import type { GroupMember, StudyGroup } from '~/types/api'

const toast = useToast()
const confirm = useConfirm()
const { me } = useMe()

const { data: groups, refresh: refreshGroups } = await useFetch<StudyGroup[]>('/api/groups', { default: () => [] })

const selectedId = ref<string | null>(null)
watchEffect(() => {
  // Default to the first group; keep selection valid as the list changes.
  if (!groups.value.some(g => g.id === selectedId.value))
    selectedId.value = groups.value[0]?.id ?? null
})
const selected = computed(() => groups.value.find(g => g.id === selectedId.value) ?? null)

const members = ref<GroupMember[]>([])
const membersLoading = ref(false)
const pending = ref<GroupMember[]>([])
const isOwner = computed(() => !!selected.value && selected.value.owner_id === me.value?.id)

async function loadPending(id: string) {
  // Only the owner can fetch pending requests.
  if (!isOwner.value) {
    pending.value = []
    return
  }
  try {
    pending.value = await $fetch<GroupMember[]>(`/api/groups/${id}/requests`)
  }
  catch {
    pending.value = []
  }
}

watch(selectedId, async (id) => {
  members.value = []
  pending.value = []
  if (!id)
    return
  membersLoading.value = true
  try {
    members.value = await $fetch<GroupMember[]>(`/api/groups/${id}/members`)
  }
  catch {
    toast.err('Không tải được danh sách thành viên.')
  }
  finally {
    membersLoading.value = false
  }
  await loadPending(id)
}, { immediate: true })

async function approve(u: GroupMember) {
  if (!selectedId.value)
    return
  try {
    await $fetch(`/api/groups/${selectedId.value}/requests/${u.id}/approve`, { method: 'POST' })
    await Promise.all([
      loadPending(selectedId.value),
      (async () => { members.value = await $fetch<GroupMember[]>(`/api/groups/${selectedId.value}/members`) })(),
      refreshGroups(),
    ])
    toast.ok(`Đã duyệt ${u.name} vào nhóm.`)
  }
  catch {
    toast.err('Không duyệt được. Vui lòng thử lại.')
  }
}
async function reject(u: GroupMember) {
  if (!selectedId.value)
    return
  try {
    await $fetch(`/api/groups/${selectedId.value}/requests/${u.id}/reject`, { method: 'POST' })
    await loadPending(selectedId.value)
    toast.ok(`Đã từ chối ${u.name}.`)
  }
  catch {
    toast.err('Không từ chối được. Vui lòng thử lại.')
  }
}

const avatarPalette: AvatarColor[] = ['son', 'reu', 'gold', 'ink']
const avatarColor = (i: number): AvatarColor => avatarPalette[i % avatarPalette.length]!
const rankColor = (i: number) => ['text-gold-deep', 'text-[#8d8d8d]', 'text-[#a9743f]'][i] || 'text-ink-3'

// --- join by code ---
const joinCode = ref('')
const joining = ref(false)
async function join() {
  const code = joinCode.value.trim()
  if (!code)
    return
  joining.value = true
  try {
    const res = await $fetch<{ group: StudyGroup, pending: boolean }>('/api/groups/join', { method: 'POST', body: { code } })
    joinCode.value = ''
    if (res.pending) {
      // Awaiting owner approval — not a member yet, so don't select it.
      toast.ok(`Đã gửi yêu cầu vào nhóm "${res.group.name}". Chờ trưởng nhóm duyệt.`)
    }
    else {
      await refreshGroups()
      selectedId.value = res.group.id
      toast.ok(`Đã vào nhóm "${res.group.name}".`)
    }
  }
  catch (e) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    toast.err(err.data?.statusMessage ?? err.statusMessage ?? 'Không vào được nhóm. Kiểm tra lại mã.')
  }
  finally {
    joining.value = false
  }
}

// --- create ---
const createOpen = ref(false)
const newName = ref('')
const creating = ref(false)
async function create() {
  const name = newName.value.trim()
  if (!name)
    return
  creating.value = true
  try {
    const g = await $fetch<StudyGroup>('/api/groups', { method: 'POST', body: { name } })
    await refreshGroups()
    selectedId.value = g.id
    createOpen.value = false
    newName.value = ''
    toast.ok(`Đã tạo nhóm "${g.name}" · mã ${g.code}`)
  }
  catch {
    toast.err('Không tạo được nhóm. Vui lòng thử lại.')
  }
  finally {
    creating.value = false
  }
}

async function leave(g: StudyGroup) {
  if (!await confirm.ask({ title: 'Rời nhóm?', message: `Bạn sẽ rời khỏi "${g.name}".`, confirmLabel: 'Rời nhóm', danger: true }))
    return
  try {
    await $fetch(`/api/groups/${g.id}/leave`, { method: 'DELETE' })
    await refreshGroups()
    toast.ok(`Đã rời nhóm "${g.name}".`)
  }
  catch {
    toast.err('Không rời được nhóm. Vui lòng thử lại.')
  }
}

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    toast.ok('Đã sao chép mã nhóm.')
  }
  catch {
    toast.err('Không sao chép được.')
  }
}
</script>

<template>
  <div class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
    <!-- left: selected group + members ranked by ELO -->
    <LnCard v-if="selected" pop>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-display font-bold text-[1.5rem] truncate">{{ selected.name }}</h2>
          <div class="flex items-center gap-2 mt-1.5">
            <button type="button" class="inline-flex items-center gap-1.5 font-mono-ln text-[0.8125rem] font-bold bg-paper-2 border border-line rounded-full px-3 py-1 hover:bg-paper-3" @click="copyCode(selected.code)">
              <LnIcon name="hash" :size="13" />{{ selected.code }}<LnIcon name="copy" :size="13" class="text-ink-3" />
            </button>
            <span class="text-ink-3 text-xs">{{ selected.member_count }} thành viên</span>
          </div>
        </div>
        <LnBtn variant="ghost" size="sm" icon="log-out" @click="leave(selected)">Rời</LnBtn>
      </div>

      <!-- pending join requests (owner only) -->
      <template v-if="isOwner && pending.length">
        <div class="h-px bg-line my-4" />
        <b class="font-body text-base font-bold">Yêu cầu tham gia ({{ pending.length }})</b>
        <div v-for="u in pending" :key="u.id" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
          <LnAvatar :name="u.name" color="gold" :size="34" />
          <div class="flex-1 min-w-0">
            <div class="font-body text-[0.9375rem] font-semibold truncate">{{ u.name }}</div>
            <div class="text-xs text-ink-3">{{ u.handle }} · ELO {{ u.elo }}</div>
          </div>
          <LnBtn variant="primary" size="sm" icon="check" @click="approve(u)">Duyệt</LnBtn>
          <LnBtn variant="ghost" size="sm" icon="x" @click="reject(u)" />
        </div>
      </template>

      <div class="h-px bg-line my-4" />
      <div class="flex items-center justify-between mb-1.5">
        <b class="font-body text-base font-bold">Thành viên</b>
        <span class="text-ink-3 text-xs">xếp theo ELO</span>
      </div>
      <div v-if="membersLoading" class="text-ink-3 font-body text-[0.9375rem] py-6 text-center">Đang tải…</div>
      <div v-for="(m, i) in members" v-else :key="m.id" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0">
        <span class="w-7 text-center font-display font-extrabold flex-none" :class="rankColor(i)">{{ i + 1 }}</span>
        <LnAvatar :name="m.name" :color="avatarColor(i)" :size="34" :status="m.presence" />
        <div class="flex-1 min-w-0">
          <span class="font-body text-[0.9375rem] font-semibold">{{ m.name }}<span v-if="m.id === me?.id" class="text-ink-3 font-normal"> · bạn</span></span>
          <div class="text-xs text-ink-3">{{ m.handle }}</div>
        </div>
        <span class="font-body font-bold text-[0.85rem] text-gold-deep">ELO {{ m.elo }}</span>
      </div>
    </LnCard>
    <LnCard v-else pop class="text-center text-ink-3 font-body text-[0.9375rem] py-12">
      Bạn chưa tham gia nhóm nào. Tạo nhóm mới hoặc vào nhóm bằng mã.
    </LnCard>

    <!-- right: join + your groups -->
    <div class="flex flex-col gap-4">
      <LnCard>
        <b class="font-body text-base font-bold">Vào nhóm bằng mã</b>
        <div class="flex gap-2 mt-3">
          <input
            v-model="joinCode"
            :disabled="joining"
            class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] uppercase placeholder:text-ink-4 placeholder:normal-case focus:outline-none focus:border-son disabled:opacity-60"
            placeholder="VD: ABC234"
            @keyup.enter="join"
          >
          <LnBtn variant="secondary" :disabled="joining || !joinCode.trim()" @click="join">Vào</LnBtn>
        </div>
      </LnCard>

      <LnCard>
        <div class="flex items-center justify-between mb-2">
          <b class="font-body text-base font-bold">Nhóm của bạn</b>
          <LnBtn variant="ghost" size="sm" icon="plus" @click="createOpen = true">Tạo</LnBtn>
        </div>
        <p v-if="!groups.length" class="text-ink-3 text-xs py-3">Chưa có nhóm nào.</p>
        <button
          v-for="g in groups"
          :key="g.id"
          type="button"
          :class="cn('flex items-center gap-3 py-[11px] w-full text-left border-b border-line-soft last:border-0', g.id === selectedId && 'opacity-100')"
          @click="selectedId = g.id"
        >
          <div :class="cn('grid place-items-center w-[38px] h-[38px] rounded-md-ln text-white flex-none', g.id === selectedId ? 'bg-son' : 'bg-reu')"><LnIcon name="users" :size="18" /></div>
          <div class="flex-1 min-w-0">
            <div class="font-body text-[0.9375rem] font-semibold truncate">{{ g.name }}</div>
            <div class="text-xs text-ink-3 mt-px">{{ g.member_count }} thành viên · mã {{ g.code }}</div>
          </div>
          <LnIcon v-if="g.id === selectedId" name="chevron-right" :size="18" class="text-son flex-none" />
        </button>
      </LnCard>
    </div>

    <!-- create group dialog -->
    <LnDialog :open="createOpen" :width="420" @close="createOpen = false">
      <div class="flex items-center justify-between mb-1.5"><b class="font-display text-[1.3125rem] font-bold">Tạo nhóm</b><LnIconBtn @click="createOpen = false"><LnIcon name="x" :size="20" /></LnIconBtn></div>
      <p class="text-ink-3 font-body text-[0.9375rem] mb-4">Một mã nhóm sẽ được tạo để bạn mời bạn bè vào.</p>
      <input
        v-model="newName"
        :disabled="creating"
        class="w-full bg-paper-2 border border-line rounded-md-ln px-3.5 py-2.5 font-body text-[0.9375rem] text-ink focus:outline-none focus:border-son disabled:opacity-60"
        placeholder="Tên nhóm"
        @keyup.enter="create"
      >
      <LnBtn variant="primary" class="w-full mt-4" :disabled="creating || !newName.trim()" @click="create">{{ creating ? 'Đang tạo…' : 'Tạo nhóm' }}</LnBtn>
    </LnDialog>
  </div>
</template>

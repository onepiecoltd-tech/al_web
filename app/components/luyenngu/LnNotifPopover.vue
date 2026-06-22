<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { notifs, markAllRead } = useNotifications()

const iconColor: Record<string, string> = {
  error: 'text-error capitalize', gold: 'text-gold-deep', son: 'text-son', reu: 'text-reu-deep',
}
const bg: Record<string, string> = {
  error: 'bg-error-bg', gold: 'bg-gold-soft', son: 'bg-son-soft', reu: 'bg-reu-soft',
}

function fmtAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return `${Math.floor(diff / 86400)} ngày trước`
}

</script>

<template>
  <template v-if="open">
    <div class="fixed inset-0 z-[70]" @click="emit('close')" />
    <div class="absolute top-[52px] right-16 w-[340px] z-[71] overflow-hidden bg-paper-0 border border-line rounded-lg-ln shadow-card">
      <div class="flex items-center justify-between px-3.5 py-3 border-b border-line">
        <b class="font-body text-base font-bold">Thông báo</b>
        <span class="text-ink-3 text-xs cursor-pointer hover:text-son" @click="markAllRead">Đánh dấu đã đọc</span>
      </div>
      <div class="px-3.5 py-1">
        <div v-if="!notifs.length" class="py-6 text-center text-ink-3 text-xs">Chưa có thông báo nào.</div>
        <div v-for="n in notifs" :key="n.id" class="flex items-center gap-3 py-[11px] border-b border-line-soft last:border-0" :class="n.read ? 'opacity-60' : ''">
          <div class="grid place-items-center w-[34px] h-[34px] rounded-md-ln" :class="bg[n.tone]">
            <LnIcon :name="n.icon" :size="17" :class="iconColor[n.tone]" />
          </div>
          <div class="flex-1">
            <div class="font-body text-[0.9375rem] leading-[1.4]">{{ n.text }}</div>
            <div class="text-xs text-ink-3 mt-px">{{ fmtAgo(n.created_at) }}</div>
          </div>
          <span v-if="!n.read" class="w-2 h-2 rounded-full bg-son flex-none" />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { Friend } from '~/types/api'

const emit = defineEmits<{ exit: [] }>()
const { data: friends } = useFetch<Friend[]>('/api/friends', { default: () => [] })
const online = computed(() => friends.value.filter(f => f.presence !== 'offline'))
const offline = computed(() => friends.value.filter(f => f.presence === 'offline'))
const emojis = ['😀', '😄', '😉', '😎', '😍', '😜', '😢', '😡', '😱', '👍', '👏', '🔥', '❤️', '🌹', '🏆', '🎓', '💎', '⚔️']
</script>

<template>
  <div class="xp fixed inset-0 z-[100] flex flex-col">
    <div class="msgr-desk flex-1 relative overflow-hidden">
      <button type="button" class="absolute top-4 left-4 z-[5] inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper-0 text-ink font-body font-bold px-3.5 py-[7px] text-xs cursor-pointer" @click="emit('exit')">⬅ Thoát Messenger</button>

      <!-- buddy list -->
      <div class="xp-window xp-buddy absolute top-16 left-10">
        <div class="xp-title"><span class="x-logo">☺</span>LuyệnNgữ Messenger<span class="x-btns"><i>_</i><i>▢</i><i class="close" @click="emit('exit')">✕</i></span></div>
        <div class="xp-myrow">
          <span class="smiley" style="width:26px;height:26px"><i class="l" /><i class="r" /></span>
          <div><div class="me-nm">Minh Anh</div><div class="me-st">▾ Sẵn sàng luyện đề ✦</div></div>
        </div>
        <div class="xp-list">
          <div class="xp-grp">Bạn bè ({{ online.length }}/{{ friends.length }})</div>
          <div v-for="fr in online" :key="fr.id" class="xp-bud">
            <span class="dot" :class="fr.presence === 'online' ? 'on' : fr.presence" />{{ fr.name }}{{ fr.presence === 'busy' ? ' — đang thi đấu' : fr.presence === 'away' ? ' (vắng mặt)' : '' }}
          </div>
          <div class="xp-grp">Ngoại tuyến</div>
          <div v-for="fr in offline" :key="fr.id" class="xp-bud off"><span class="dot off" />{{ fr.name }}</div>
        </div>
      </div>

      <!-- chat window -->
      <div class="xp-window xp-chat absolute top-[110px] left-[300px]">
        <div class="xp-title"><span class="x-logo">☺</span>Trò chuyện — Thu Hà<span class="x-btns"><i>_</i><i>▢</i><i class="close">✕</i></span></div>
        <div class="xp-body">
          <div class="xp-log">
            <div class="ln"><b class="them">Thu Hà:</b> Tối nay luyện Part 2 nhé?</div>
            <div class="ln"><b class="me">Minh Anh:</b> Ok mình mở phòng đây</div>
            <div class="ln"><b class="them">Thu Hà:</b> Sẵn đấu phát âm luôn 😄</div>
            <div class="ln buzz">*** BUZZ!!! ***</div>
            <div class="ln"><b class="me">Minh Anh:</b> Hahaha vào liền 🔥</div>
          </div>
          <div class="xp-toolbar">
            <i title="Emoji">☺</i><i title="Đậm"><b>B</b></i><i title="Nghiêng"><span style="font-style:italic">I</span></i><i title="Webcam">📷</i><i title="Live">📹</i>
            <i class="buzz" title="Buzz">⚡ Buzz!</i>
          </div>
          <div class="xp-entry">Nhập tin nhắn…</div>
          <div class="xp-send"><button>Gửi</button></div>
        </div>
      </div>

      <!-- emoji board -->
      <div class="emoji-board absolute top-[150px] right-[60px]">
        <span v-for="(e, i) in emojis" :key="i">{{ e }}</span>
      </div>
    </div>

    <!-- taskbar -->
    <div class="xp-taskbar">
      <div class="xp-start"><span class="smiley" style="width:18px;height:18px"><i class="l" style="top:5px;left:5px" /><i class="r" style="top:5px;right:5px" /></span>start</div>
      <div class="xp-task">☺ LuyệnNgữ Messenger</div>
      <div class="xp-task">☺ Thu Hà</div>
      <div class="ml-auto text-white px-2.5" style="font:11px Tahoma">21:14</div>
    </div>
  </div>
</template>

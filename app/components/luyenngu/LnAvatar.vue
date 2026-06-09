<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  name?: string
  color?: 'son' | 'reu' | 'gold' | 'ink'
  size?: number
  status?: 'online' | 'busy' | 'away' | 'offline'
  src?: string
}>(), {
  name: '',
  color: 'reu',
  size: 38,
})

const initials = computed(() =>
  props.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase(),
)

const colors: Record<string, string> = {
  son: 'bg-son',
  reu: 'bg-reu',
  gold: 'bg-gold',
  ink: 'bg-ink',
}
const dotColors: Record<string, string> = {
  online: 'bg-success',
  busy: 'bg-error',
  away: 'bg-warning',
  offline: 'bg-ink-4',
}
</script>

<template>
  <div
    class="relative flex-none grid place-items-center rounded-full font-body font-bold text-white"
    :class="colors[color]"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.4}px` }"
  >
    <img v-if="src" :src="src" class="w-full h-full rounded-full object-cover" alt="">
    <template v-else>{{ initials }}</template>
    <span
      v-if="status"
      :class="cn('absolute -right-px -bottom-px rounded-full border-2 border-paper-0', dotColors[status])"
      :style="{ width: `${size * 0.3}px`, height: `${size * 0.3}px` }"
    />
  </div>
</template>

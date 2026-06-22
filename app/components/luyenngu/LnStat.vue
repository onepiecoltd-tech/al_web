<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  k: string
  v: string | number
  d?: string
  dtone?: '' | 'up' | 'down'
}>(), { dtone: '' })

const dtones: Record<string, string> = {
  '': 'text-ink-3',
  up: 'text-success',
  down: 'text-error capitalize',
}
</script>

<template>
  <div class="bg-paper-0 border border-line rounded-lg-ln p-4 shadow-sm-ln">
    <div class="flex items-center gap-1.5 text-xs text-ink-3">
      <LnIcon v-if="icon" :name="icon" :size="15" />{{ k }}
    </div>
    <div class="mt-2 font-display font-extrabold text-[1.9rem] leading-none tabular-nums">{{ v }}</div>
    <div v-if="d" class="mt-[5px] text-xs" :class="dtones[dtone]">{{ d }}</div>
  </div>
</template>

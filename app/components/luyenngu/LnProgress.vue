<script setup lang="ts">
withDefaults(defineProps<{ value?: number; tone?: '' | 'reu' | 'gold' }>(), {
  value: 0,
  tone: '',
})

const fills: Record<string, string> = {
  '': 'bg-son',
  reu: 'bg-reu',
  gold: 'bg-gold',
}
</script>

<template>
  <div class="h-2 rounded-full bg-paper-3 overflow-hidden">
    <span class="block h-full rounded-full" :class="fills[tone]" :style="{ width: `${value}%` }" />
  </div>
</template>

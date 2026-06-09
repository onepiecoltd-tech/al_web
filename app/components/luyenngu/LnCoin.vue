<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number }>(), { size: 30 })
</script>

<template>
  <span
    class="grid place-items-center flex-none rounded-full text-gold-deep font-display font-black"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.max(size * 0.42, 9)}px`,
      background: 'radial-gradient(circle at 35% 30%, var(--gold-soft), var(--gold) 70%)',
      border: `${size <= 20 ? 1.5 : 2}px solid var(--gold-deep)`,
    }"
  >¥</span>
</template>

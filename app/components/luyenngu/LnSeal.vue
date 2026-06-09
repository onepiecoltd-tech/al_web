<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number; label?: string; light?: boolean }>(), {
  size: 56,
  label: 'LN',
})
const fontSize = computed(() => `${props.size * 0.34}px`)
</script>

<template>
  <div
    class="ln-seal relative grid place-items-center flex-none rounded-[11px]"
    :class="light && 'border-white! text-white!'"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize }"
  >
    {{ label }}
  </div>
</template>

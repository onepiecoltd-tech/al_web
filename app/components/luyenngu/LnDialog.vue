<script setup lang="ts">
const props = withDefaults(defineProps<{ open: boolean; width?: number; elevated?: boolean }>(), { width: 460 })
const emit = defineEmits<{ close: [] }>()
const w = computed(() => Math.min(props.width, 560))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 grid place-items-center p-5" :class="elevated ? 'z-[95]' : 'z-[90]'">
      <div class="fixed inset-0 bg-[rgba(28,24,20,0.5)]" @click="emit('close')" />
      <div
        class="relative bg-paper-0 rounded-xl-ln p-6 shadow-float max-h-[86vh] overflow-y-auto w-full"
        :style="{ width: `${w}px` }"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

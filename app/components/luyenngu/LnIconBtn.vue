<script setup lang="ts">
import { cn } from '~/lib/utils'

withDefaults(defineProps<{ size?: number; dot?: boolean }>(), { size: 38 })
</script>

<template>
  <button
    type="button"
    :class="cn(
      'relative grid place-items-center rounded-md-ln border border-transparent bg-transparent text-ink-2 cursor-pointer transition-colors duration-150 hover:bg-paper-2',
    )"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <slot />
    <span v-if="dot" class="absolute top-[7px] right-2 w-[7px] h-[7px] rounded-full bg-son border-[1.5px] border-paper-bg" />
  </button>
</template>

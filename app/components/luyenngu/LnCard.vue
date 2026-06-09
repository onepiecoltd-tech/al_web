<script setup lang="ts">
import { cn } from '~/lib/utils'

defineProps<{ pop?: boolean }>()
</script>

<template>
  <div
    :class="cn(
      'border border-line rounded-lg-ln p-4',
      pop ? 'bg-paper-0 shadow-card' : 'bg-paper-1',
    )"
  >
    <slot />
  </div>
</template>

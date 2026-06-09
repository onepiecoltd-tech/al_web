<script setup lang="ts">
import { cn } from '~/lib/utils'

defineProps<{
  tabs: { v: string; label: string }[]
  modelValue: string
}>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<template>
  <div class="flex gap-5 border-b border-line">
    <button
      v-for="t in tabs"
      :key="t.v"
      type="button"
      :class="cn(
        'py-3 px-0.5 -mb-px border-b-[3px] border-b-transparent font-body font-semibold text-base text-ink-3 cursor-pointer transition-colors duration-150 hover:text-ink',
        modelValue === t.v && 'text-ink border-b-son font-bold',
      )"
      @click="emit('update:modelValue', t.v)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

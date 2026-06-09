<script setup lang="ts">
import { cn } from '~/lib/utils'

defineProps<{
  options: { v: string | number; label: string }[]
  modelValue: string | number
}>()
const emit = defineEmits<{ 'update:modelValue': [v: string | number] }>()
</script>

<template>
  <div class="inline-flex gap-0.5 p-[3px] rounded-full bg-paper-2 border border-line">
    <button
      v-for="o in options"
      :key="o.v"
      type="button"
      :class="cn(
        'px-4 py-[7px] rounded-full font-body text-[0.8125rem] font-semibold text-ink-2 cursor-pointer transition-all duration-150',
        modelValue === o.v && 'bg-paper-0 text-ink shadow-sm-ln font-bold',
      )"
      @click="emit('update:modelValue', o.v)"
    >
      {{ o.label }}
    </button>
  </div>
</template>

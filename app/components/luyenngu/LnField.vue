<script setup lang="ts">
import { cn } from '~/lib/utils'

defineProps<{
  label?: string
  hint?: string
  error?: string
  type?: string
  placeholder?: string
  autocomplete?: string
}>()
const model = defineModel<string>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="font-body text-[0.8125rem] font-semibold text-ink-2">{{ label }}</label>
    <input
      v-model="model"
      :type="type || 'text'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :class="cn(
        'w-full px-[13px] py-[11px] rounded-md-ln border bg-paper-0 font-body text-[0.9375rem] text-ink',
        'placeholder:text-ink-4 transition-[border-color,box-shadow] duration-150',
        'focus:outline-none focus:border-son focus:shadow-[0_0_0_3px_var(--son-soft)]',
        error ? 'border-error shadow-[0_0_0_3px_var(--error-bg)]' : 'border-line-strong',
      )"
    >
    <span v-if="hint || error" class="text-xs" :class="error ? 'text-error' : 'text-ink-3'">{{ error || hint }}</span>
  </div>
</template>

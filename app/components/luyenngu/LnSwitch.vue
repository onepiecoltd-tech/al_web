<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :class="cn(
      'relative flex-none w-[46px] h-[27px] rounded-full border cursor-pointer transition-colors duration-150',
      modelValue ? 'bg-reu border-reu-deep' : 'bg-paper-3 border-line-strong',
    )"
    @click="emit('update:modelValue', !props.modelValue)"
  >
    <span
      :class="cn(
        'absolute top-0.5 left-0.5 w-[21px] h-[21px] rounded-full bg-paper-0 shadow-sm-ln transition-transform duration-150',
        modelValue && 'translate-x-[19px]',
      )"
    />
  </button>
</template>

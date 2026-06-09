<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold'
  size?: 'sm' | 'lg'
  icon?: string
  iconR?: string
  disabled?: boolean
}>(), {
  variant: 'primary',
})

const variants: Record<string, string> = {
  primary: 'bg-son text-white hover:bg-son-deep',
  secondary: 'bg-reu text-white hover:bg-reu-deep',
  outline: 'bg-paper-0 border-line-strong text-ink hover:bg-paper-2',
  ghost: 'bg-transparent text-son hover:bg-son-soft',
  gold: 'bg-gold text-white hover:bg-gold-deep',
}
const sizes: Record<string, string> = {
  sm: 'px-3.5 py-[7px] text-xs',
  lg: 'px-[26px] py-3.5 text-[0.9rem]',
}
const iconSize = computed(() => (props.size === 'sm' ? 15 : 17))
</script>

<template>
  <button
    :disabled="disabled"
    :class="cn(
      'inline-flex items-center justify-center gap-2 rounded-full border border-transparent font-body font-bold cursor-pointer transition-[transform,background,box-shadow] duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none',
      size ? sizes[size] : 'px-5 py-[11px] text-[0.8125rem]',
      variants[variant],
    )"
  >
    <LnIcon v-if="icon" :name="icon" :size="iconSize" />
    <slot />
    <LnIcon v-if="iconR" :name="iconR" :size="iconSize" />
  </button>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  tone?: 'son' | 'reu' | 'gold' | 'success' | 'error' | 'info' | 'solid'
  status?: boolean
  class?: any
}>(), { tone: 'son' })

defineOptions({ inheritAttrs: false })

const tones: Record<string, string> = {
  son: 'bg-son-soft text-son-deep',
  reu: 'bg-reu-soft text-reu-deep',
  gold: 'bg-gold-soft text-gold-deep',
  success: 'bg-success-bg text-success',
  error: 'bg-error-bg text-error capitalize',
  info: 'bg-info-bg text-info',
  solid: 'bg-son text-white',
}
</script>

<template>
  <span
    v-bind="$attrs"
    :class="cn(
      'inline-block rounded-[5px] px-2 py-[3px] text-xs font-bold leading-[1.4] font-body',
      tones[tone],
      status && 'capitalize tracking-[0.04em] text-[0.68rem]',
      props.class,
    )"
  >
    <slot />
  </span>
</template>

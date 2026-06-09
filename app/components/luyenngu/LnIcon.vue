<script setup lang="ts">
import * as lucide from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  name: string
  size?: number
  sw?: number
}>(), {
  size: 20,
  sw: 1.9,
})

/** kebab/snake-case → PascalCase Lucide export name */
const pascal = (s: string) =>
  s.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase())

const comp = computed(() => {
  const key = pascal(props.name) as keyof typeof lucide
  return (lucide[key] as unknown) ?? lucide.Square
})
</script>

<template>
  <component
    :is="comp"
    :size="size"
    :stroke-width="sw"
    class="ic"
  />
</template>

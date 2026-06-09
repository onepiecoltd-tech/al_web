<script setup lang="ts">
withDefaults(defineProps<{ placeholder?: string }>(), { placeholder: 'Tìm…' })
const model = defineModel<string>()
</script>

<template>
  <div class="flex items-center gap-2 px-[15px] py-[9px] rounded-full bg-paper-2 border border-line">
    <LnIcon name="search" :size="18" class="text-ink-3" />
    <input
      v-model="model"
      :placeholder="placeholder"
      class="w-full border-0 bg-transparent outline-none font-body text-[0.9375rem] text-ink placeholder:text-ink-4"
    >
  </div>
</template>

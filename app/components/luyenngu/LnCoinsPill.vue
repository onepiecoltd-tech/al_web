<script setup lang="ts">
defineProps<{ amount: number }>()
</script>

<template>
  <span class="inline-flex items-center gap-1.5 pl-[5px] pr-2.5 py-1 rounded-full bg-gold-soft border border-gold-line text-gold-deep font-body font-bold text-[0.8rem] tabular-nums">
    <LnCoin :size="20" />{{ amount.toLocaleString('vi') }}
  </span>
</template>

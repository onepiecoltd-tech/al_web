<script setup lang="ts">
const props = defineProps<{ page: number, totalPages: number }>()
const emit = defineEmits<{ 'update:page': [n: number] }>()

function go(n: number) {
  if (n >= 1 && n <= props.totalPages)
    emit('update:page', n)
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center gap-2">
    <LnBtn variant="outline" size="sm" icon="chevron-left" :disabled="page <= 1" @click="go(page - 1)" />
    <span class="text-ink-3 text-xs tabular-nums">Trang {{ page }} / {{ totalPages }}</span>
    <LnBtn variant="outline" size="sm" icon="chevron-right" :disabled="page >= totalPages" @click="go(page + 1)" />
  </div>
</template>

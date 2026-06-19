<script setup lang="ts">
const props = defineProps<{ page: number, totalPages: number, total?: number }>()
const emit = defineEmits<{ 'update:page': [n: number] }>()

const pages = computed(() => {
  const max = props.totalPages || 1
  const cur = props.page
  const delta = 2
  const range: (number | '...')[] = []
  let prev = 0
  for (let i = 1; i <= max; i++) {
    if (i === 1 || i === max || (i >= cur - delta && i <= cur + delta)) {
      if (prev && i - prev > 1) range.push('...')
      range.push(i)
      prev = i
    }
  }
  return range
})

function go(n: number) {
  if (n >= 1 && n <= (props.totalPages || 1))
    emit('update:page', n)
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <LnBtn variant="outline" size="sm" icon="chevron-left" :disabled="page <= 1" @click="go(page - 1)" />
    <template v-for="p in pages" :key="p">
      <span
        v-if="p === '...'"
        class="w-8 text-center text-ink-3 text-sm select-none"
      >…</span>
      <button
        v-else
        type="button"
        class="min-w-[32px] h-8 px-2 rounded-md-ln font-body text-sm font-semibold transition-colors"
        :class="p === page
          ? 'bg-son text-white'
          : 'text-ink-2 hover:bg-paper-2'"
        @click="go(p)"
      >{{ p }}</button>
    </template>
    <LnBtn variant="outline" size="sm" icon="chevron-right" :disabled="page >= (totalPages || 1)" @click="go(page + 1)" />
    <span v-if="total !== undefined" class="ml-2 text-xs text-ink-3 tabular-nums">{{ total.toLocaleString('vi') }} kết quả</span>
  </div>
</template>

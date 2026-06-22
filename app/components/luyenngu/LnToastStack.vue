<script setup lang="ts">
const { toasts, dismiss } = useToast()

const icons: Record<string, string> = { ok: 'check-circle', err: 'x-circle', warn: 'alert-triangle', info: 'info' }
const colors: Record<string, string> = {
  ok: 'bg-success-bg border-success text-success',
  err: 'bg-error-bg border-error text-error capitalize',
  warn: 'bg-warning-bg border-warning text-warning',
  info: 'bg-paper-0 border-line text-ink',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="flex items-center gap-3 px-4 py-3 rounded-lg-ln border shadow-md-ln max-w-[340px] pointer-events-auto cursor-pointer font-body text-[0.9rem]"
          :class="colors[t.tone]"
          @click="dismiss(t.id)"
        >
          <LnIcon :name="icons[t.tone]" :size="17" class="flex-none" />
          <span class="flex-1">{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active { transition: all .22s ease; }
.toast-leave-active { transition: all .18s ease; }
.toast-enter-from { opacity: 0; transform: translateY(10px) scale(.96); }
.toast-leave-to   { opacity: 0; transform: translateX(20px); }
</style>

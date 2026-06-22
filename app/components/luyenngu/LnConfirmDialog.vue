<script setup lang="ts">
const { state, settle } = useConfirm()
</script>

<template>
  <LnDialog :open="state.open" :width="400" @close="settle(false)">
    <div class="flex gap-3.5 items-start">
      <div class="grid place-items-center w-10 h-10 rounded-full flex-none" :class="state.danger ? 'bg-error-bg' : 'bg-son-soft'">
        <LnIcon :name="state.danger ? 'trash-2' : 'help-circle'" :size="20" :class="state.danger ? 'text-error capitalize' : 'text-son'" />
      </div>
      <div class="flex-1 min-w-0">
        <b class="font-display text-[1.1rem] font-bold">{{ state.title }}</b>
        <p class="text-ink-3 font-body text-[0.9375rem] mt-1">{{ state.message }}</p>
      </div>
    </div>
    <div class="flex gap-2.5 mt-5">
      <LnBtn variant="ghost" class="flex-1" @click="settle(false)">{{ state.cancelLabel }}</LnBtn>
      <LnBtn
        :variant="state.danger ? 'outline' : 'primary'"
        :class="state.danger ? 'border-error! text-error capitalize! hover:bg-error-bg!' : ''"
        class="flex-1"
        @click="settle(true)"
      >
        {{ state.confirmLabel }}
      </LnBtn>
    </div>
  </LnDialog>
</template>

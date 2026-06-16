<script setup lang="ts">
definePageMeta({ layout: 'blank' })
useSeoMeta({ title: 'Đang bảo trì — LuyệnNgữ' })
const localePath = useLocalePath()
</script>

<template>
  <div class="h-screen grid place-items-center bg-paper-bg text-center p-6">
    <div class="max-w-[420px]">
      <div class="text-5xl mb-4">🛠️</div>
      <h1 class="font-display font-extrabold text-[1.75rem] mb-2">Hệ thống đang bảo trì</h1>
      <p class="text-ink-3 font-body mb-5">LuyệnNgữ đang được nâng cấp. Vui lòng quay lại sau ít phút.</p>
      <NuxtLink :to="localePath('/login')">
        <LnBtn variant="outline">Đăng nhập quản trị</LnBtn>
      </NuxtLink>
    </div>
  </div>
</template>

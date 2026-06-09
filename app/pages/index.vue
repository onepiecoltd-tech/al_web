<script setup lang="ts">
import LnScreenDashboard from '~/components/luyenngu/screens/LnScreenDashboard.vue'

definePageMeta({ layout: 'luyenngu' })
useSeoMeta({
  title: 'LuyệnNgữ — Luyện thi như một cuộc đấu',
  description: 'Tải nguồn đề của bạn, để AI giải & sinh đề, rồi thách đấu bạn bè và người lạ để giữ nhịp mỗi ngày.',
})
</script>

<template>
  <LnScreenDashboard />
</template>

<script setup lang="ts">
import LnScreenAuth from '~/components/luyenngu/screens/LnScreenAuth.vue'

definePageMeta({ layout: 'blank' })
useSeoMeta({ title: 'Đăng nhập — LuyệnNgữ' })

const localePath = useLocalePath()

function onLogin() {
  navigateTo(localePath('/'))
}
</script>

<template>
  <LnScreenAuth @login="onLogin" />
</template>

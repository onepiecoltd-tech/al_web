<script setup lang="ts">
import LnScreenAuth from '~/components/luyenngu/screens/LnScreenAuth.vue'
import { useLnApp } from '~/composables/useLnData'

definePageMeta({ layout: 'blank' })
useSeoMeta({ title: 'Đăng nhập — LuyệnNgữ' })

const { authed } = useLnApp()
const localePath = useLocalePath()

function onLogin() {
  authed.value = true
  navigateTo(localePath('/'))
}
</script>

<template>
  <LnScreenAuth @login="onLogin" />
</template>

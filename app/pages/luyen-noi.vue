<script setup lang="ts">
// Merged into the unified practice page — redirect to the speaking skill.
const localePath = useLocalePath()
await navigateTo({ path: localePath('/luyen-de'), query: { skill: 'speaking' } }, { redirectCode: 301 })
</script>

<template>
  <div />
</template>

<script setup lang="ts">
import LnScreenLuyenDe from './LnScreenLuyenDe.vue'
import LnScreenLuyenNoi from './LnScreenLuyenNoi.vue'
import { SKILLS } from '~/lib/skills'

// Unified practice screen: pick a skill, then practise only that skill. Speaking
// shows the mic/forecast flow; the other three show exam practice filtered to
// that skill. The choice lives in the URL (?skill=) so it's shareable/back-able.
const route = useRoute()
const router = useRouter()
const codes = SKILLS.map(s => s.code) as string[]
const skill = ref(codes.includes(route.query.skill as string) ? route.query.skill as string : 'reading')
watch(skill, (v) => {
  router.replace({ query: { ...route.query, skill: v } })
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <LnSegment v-model="skill" :options="SKILLS.map(s => ({ v: s.code, label: s.label }))" />

    <Suspense>
      <LnScreenLuyenNoi v-if="skill === 'speaking'" />
      <LnScreenLuyenDe v-else :skill="skill" />
      <template #fallback>
        <div class="text-ink-3 font-body text-[0.9375rem] text-center py-10">Đang tải…</div>
      </template>
    </Suspense>
  </div>
</template>

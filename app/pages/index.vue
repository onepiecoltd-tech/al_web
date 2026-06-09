<script setup lang="ts">
useSeoMeta({
  title: 'Learning Languages',
  description: 'Learn languages effectively with our platform.',
})
</script>

<template>
  <main class="container mx-auto flex min-h-screen flex-col items-center justify-center gap-8 p-8">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold tracking-tight">
        Learning Languages
      </h1>
      <p class="text-muted-foreground text-lg max-w-md">
        A platform built with Nuxt 4, shadcn-vue, and Tailwind CSS.
      </p>
    </div>

    <div class="flex flex-wrap gap-3 justify-center">
      <Button>Get Started</Button>
      <Button variant="outline">Learn More</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  </main>
</template>

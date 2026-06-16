<script setup lang="ts">
import { cn } from '~/lib/utils'
import { ME } from '~/composables/useLnData'
import { useLnCtx } from '~/composables/useLnCtx'
import type { BlogPost, Comment, Paginated } from '~/types/api'

const ctx = useLnCtx()
const open = ref<number | null>(null)
const cats = ['Tất cả', 'IELTS', 'TOEIC', 'Phương pháp', 'Câu chuyện']

const page = ref(1)
const { data: res } = await useFetch<Paginated<BlogPost>>('/api/blog', {
  query: { page, limit: 9 },
  default: () => ({ data: [], meta: { page: 1, limit: 9, total: 0, total_pages: 0 } }),
})
const posts = computed(() => res.value.data)
const totalPages = computed(() => res.value.meta.total_pages)
watch(page, () => { open.value = null })
const post = computed(() => (open.value !== null ? posts.value[open.value] : null))

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}
function fmtReads(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

const comments = ref<Comment[]>([])
const commentBody = ref('')
const sending = ref(false)

const commentPalette = ['son', 'reu', 'gold', 'ink'] as const

watch(() => post.value?.id, async (id) => {
  comments.value = id ? await $fetch<Comment[]>(`/api/blog/${id}/comments`) : []
})

async function sendComment() {
  const id = post.value?.id
  if (!id || !commentBody.value.trim())
    return
  sending.value = true
  try {
    await $fetch(`/api/blog/${id}/comments`, { method: 'POST', body: { body: commentBody.value } })
    commentBody.value = ''
    comments.value = await $fetch<Comment[]>(`/api/blog/${id}/comments`)
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <!-- POST VIEW -->
  <div v-if="post" class="max-w-[720px] mx-auto">
    <LnBtn variant="ghost" size="sm" icon="chevron-left" @click="open = null">Quay lại Blog</LnBtn>
    <span class="block mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-son">{{ post.category }}</span>
    <h1 class="font-display font-extrabold text-[2.5rem] my-2 mb-3.5 tracking-[-0.015em]">{{ post.title }}</h1>
    <div class="flex items-center gap-3 py-[11px]">
      <LnAvatar :name="post.author" color="son" :size="40" />
      <div class="flex-1"><div class="font-body text-base font-semibold">{{ post.author }}</div><div class="text-xs text-ink-3 mt-px">{{ fmtDate(post.created_at) }} · {{ fmtReads(post.reads) }} lượt đọc</div></div>
      <LnBtn variant="outline" size="sm" icon="user-plus">Theo dõi</LnBtn>
    </div>
    <div class="h-[200px] rounded-xl-ln bg-son-soft grid place-items-center my-4"><LnIcon name="lightbulb" :size="44" class="text-son" /></div>
    <div class="font-body text-[1.0625rem] text-ink-2 leading-[1.75]">
      <p class="mb-4">{{ post.excerpt }}</p>
      <p class="mb-4">Bí quyết nằm ở việc coi mỗi gạch đầu dòng như một "chặng" của câu chuyện: mở đầu bằng bối cảnh, dẫn qua hành động, rồi chốt bằng cảm xúc hoặc bài học. Khi luyện, hãy bấm giờ 2 phút và thu âm — nghe lại để bắt những chỗ ngập ngừng.</p>
      <p>Quan trọng nhất: đừng học thuộc. Hãy luyện với cue card forecast mỗi ngày, rồi thách đấu bạn bè để giữ áp lực thật.</p>
    </div>

    <div class="mt-6 flex items-center gap-3.5 bg-son-soft border border-son-line rounded-lg-ln p-4">
      <LnIcon name="swords" :size="24" class="text-son" />
      <div class="flex-1"><div class="font-body text-base font-bold">Sẵn sàng thử sức?</div><div class="text-xs text-ink-3 mt-px">Vào thách đấu Speaking và đo band thật của bạn.</div></div>
      <LnBtn variant="primary" icon="swords" @click="ctx.go('thach-dau')">Vào thách đấu</LnBtn>
    </div>

    <div class="mt-7">
      <b class="font-display text-[1.3125rem] font-bold">Bình luận ({{ comments.length }})</b>
      <div class="flex gap-2.5 mt-3.5">
        <LnAvatar :name="ME.name" color="son" :size="38" />
        <input v-model="commentBody" class="flex-1 px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] placeholder:text-ink-4 focus:outline-none focus:border-son" placeholder="Viết bình luận…" @keyup.enter="sendComment">
        <LnBtn variant="primary" :disabled="sending || !commentBody.trim()" @click="sendComment">Gửi</LnBtn>
      </div>
      <div class="mt-[18px]">
        <p v-if="!comments.length" class="text-ink-3 text-sm py-4">Chưa có bình luận. Hãy là người đầu tiên!</p>
        <div v-for="(cm, i) in comments" :key="cm.id" class="flex gap-3 py-3.5 border-b border-line-soft last:border-0">
          <LnAvatar :name="cm.author" :color="commentPalette[i % commentPalette.length]" :size="38" />
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="font-body text-[0.8125rem] font-semibold">{{ cm.author }}</span>
              <span class="text-ink-3 text-xs">{{ fmtDate(cm.created_at) }}</span>
            </div>
            <p class="font-body text-[0.9375rem] text-ink-2 mt-1">{{ cm.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- LIST VIEW -->
  <div v-else class="flex flex-col gap-5">
    <div class="flex items-center justify-between gap-3">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(c, i) in cats"
          :key="c"
          :class="cn('font-body text-[0.8125rem] rounded-full px-3.5 py-[7px] border cursor-pointer', i === 0 ? 'bg-son-soft border-son-line text-son-deep font-bold' : 'border-line-strong bg-paper-0 text-ink-2')"
        >{{ c }}</span>
      </div>
      <LnBtn variant="outline" icon="pen-line">Viết bài</LnBtn>
    </div>

    <div v-if="posts[0]" class="relative overflow-hidden bg-ink text-white rounded-xl-ln p-8 cursor-pointer before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(120%_130%_at_100%_0%,rgba(220,74,51,.36),transparent_55%)]" @click="open = 0">
      <div class="relative">
        <LnBadge status class="bg-white/15 text-white">{{ posts[0].category }}</LnBadge>
        <h2 class="mt-3 font-display font-extrabold text-[1.9rem] max-w-[20ch]">{{ posts[0].title }}</h2>
        <p class="text-white/70 font-body text-[0.9375rem] mt-1.5 max-w-[52ch]">{{ posts[0].excerpt }}</p>
        <div class="flex items-center gap-2.5 mt-4 text-white/80 text-xs">
          <LnAvatar :name="posts[0].author" color="son" :size="26" /> {{ posts[0].author }} · {{ fmtDate(posts[0].created_at) }} · {{ fmtReads(posts[0].reads) }} lượt đọc
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 max-[1040px]:grid-cols-2 max-[720px]:grid-cols-1">
      <button
        v-for="(p, i) in posts.slice(1)"
        :key="p.id"
        type="button"
        class="text-left cursor-pointer flex flex-col gap-2.5 border border-line bg-paper-0 rounded-lg-ln p-4 transition-colors hover:bg-paper-2"
        @click="open = i + 1"
      >
        <div class="h-[120px] rounded-md-ln grid place-items-center" :class="i % 2 ? 'bg-reu-soft' : 'bg-son-soft'">
          <LnIcon :name="i % 2 ? 'book-open' : 'lightbulb'" :size="30" :class="i % 2 ? 'text-reu' : 'text-son'" />
        </div>
        <span class="text-xs font-extrabold uppercase tracking-[0.12em] text-son">{{ p.category }}</span>
        <div class="font-body text-base font-bold leading-snug">{{ p.title }}</div>
        <div class="text-xs text-ink-3 line-clamp-2">{{ p.excerpt }}</div>
        <div class="flex items-center justify-between mt-auto pt-2">
          <span class="text-ink-3 text-xs">{{ p.author }} · {{ fmtDate(p.created_at) }}</span>
          <span class="text-ink-3 text-xs flex items-center gap-1"><LnIcon name="message-circle" :size="13" />{{ p.comments }}</span>
        </div>
      </button>
    </div>

    <div class="flex justify-center">
      <LnPager v-model:page="page" :total-pages="totalPages" />
    </div>
  </div>
</template>

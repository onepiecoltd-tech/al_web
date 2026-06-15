<script setup lang="ts">
import type { BlogPost, Paginated } from '~/types/api'

const page = ref(1)
const { data: res, refresh } = await useFetch<Paginated<BlogPost>>('/api/blog', {
  query: { page, limit: 10 },
  default: () => ({ data: [], meta: { page: 1, limit: 10, total: 0, total_pages: 0 } }),
})
const posts = computed(() => res.value.data)
const totalPages = computed(() => res.value.meta.total_pages)

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

const statuses: { value: BlogPost['status'], label: string }[] = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'review', label: 'Chờ duyệt' },
  { value: 'published', label: 'Đã đăng' },
]

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const error = ref('')
const form = reactive({ title: '', category: '', excerpt: '', body: '', status: 'draft' as BlogPost['status'] })

function openCreate() {
  editingId.value = null
  Object.assign(form, { title: '', category: '', excerpt: '', body: '', status: 'draft' })
  error.value = ''
  dialogOpen.value = true
}

function openEdit(p: BlogPost) {
  editingId.value = p.id
  Object.assign(form, { title: p.title, category: p.category, excerpt: p.excerpt, body: p.body, status: p.status })
  error.value = ''
  dialogOpen.value = true
}

async function save() {
  error.value = ''
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/blog/${editingId.value}`, { method: 'PUT', body: { ...form } })
    }
    else {
      await $fetch('/api/blog', { method: 'POST', body: { ...form } })
    }
    dialogOpen.value = false
    await refresh()
  }
  catch (e) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    error.value = err.data?.statusMessage ?? err.statusMessage ?? 'Lưu thất bại. Vui lòng thử lại.'
  }
  finally {
    saving.value = false
  }
}

async function remove(id: string) {
  await $fetch(`/api/blog/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-end">
      <LnBtn variant="primary" icon="pen-line" @click="openCreate">Viết bài</LnBtn>
    </div>

    <div class="bg-paper-0 border border-line rounded-lg-ln overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th v-for="h in ['Bài viết', 'Tác giả', 'Lượt đọc', 'Bình luận', 'Trạng thái', '']" :key="h" class="text-left font-body font-bold text-[0.72rem] tracking-[0.04em] uppercase text-ink-3 px-4 py-3 bg-paper-2 border-b border-line whitespace-nowrap">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in posts" :key="b.id" class="transition-colors hover:bg-paper-1">
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <div class="font-body text-[0.8125rem] font-semibold max-w-[360px]">{{ b.title }}</div>
              <div class="text-xs text-ink-3">{{ b.category }} · {{ fmtDate(b.created_at) }}</div>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle text-ink-3">{{ b.author }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-body text-[0.9375rem]">{{ b.reads }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-body text-[0.9375rem]">{{ b.comments }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <span class="ln-spill" :class="b.status === 'review' ? 'warn' : 'ok'">{{ b.status === 'review' ? 'Chờ duyệt' : 'Đã đăng' }}</span>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <div class="flex gap-1 justify-end items-center">
                <LnIconBtn :size="32" title="Sửa" @click="openEdit(b)"><LnIcon name="pen-line" :size="15" class="text-ink-2" /></LnIconBtn>
                <LnIconBtn :size="32" title="Xóa" @click="remove(b.id)"><LnIcon name="trash-2" :size="15" class="text-error" /></LnIconBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-end">
      <LnPager v-model:page="page" :total-pages="totalPages" />
    </div>

    <LnDialog :open="dialogOpen" :width="560" @close="dialogOpen = false">
      <div class="flex items-center justify-between mb-4">
        <b class="font-display text-[1.3125rem] font-bold">{{ editingId ? 'Sửa bài viết' : 'Viết bài mới' }}</b>
        <LnIconBtn @click="dialogOpen = false"><LnIcon name="x" :size="20" /></LnIconBtn>
      </div>

      <div class="flex flex-col gap-3.5">
        <LnField v-model="form.title" label="Tiêu đề" placeholder="Tiêu đề bài viết" />
        <LnField v-model="form.category" label="Chuyên mục" placeholder="VD: IELTS Speaking" />

        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Tóm tắt</label>
          <textarea v-model="form.excerpt" rows="2" placeholder="Mô tả ngắn hiển thị ở danh sách" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] text-ink placeholder:text-ink-4 focus:outline-none focus:border-son resize-y" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Nội dung</label>
          <textarea v-model="form.body" rows="6" placeholder="Nội dung bài viết" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] text-ink placeholder:text-ink-4 focus:outline-none focus:border-son resize-y" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Trạng thái</label>
          <select v-model="form.status" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] text-ink focus:outline-none focus:border-son">
            <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>

        <p v-if="error" class="text-error text-xs">{{ error }}</p>

        <div class="flex gap-2.5 mt-1">
          <LnBtn variant="ghost" class="flex-1" :disabled="saving" @click="dialogOpen = false">Hủy</LnBtn>
          <LnBtn variant="primary" class="flex-1" :disabled="saving" @click="save">
            {{ saving ? 'Đang lưu…' : (editingId ? 'Lưu thay đổi' : 'Đăng bài') }}
          </LnBtn>
        </div>
      </div>
    </LnDialog>
  </div>
</template>

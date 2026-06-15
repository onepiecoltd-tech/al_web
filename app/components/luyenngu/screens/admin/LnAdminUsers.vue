<script setup lang="ts">
import type { AvatarColor } from '~/composables/useLnData'
import type { AdminUser, Paginated } from '~/types/api'

const q = ref('')
const plan = ref<'all' | 'pro' | 'free'>('all')
const page = ref(1)
watch([q, plan], () => { page.value = 1 })

const { data: res, refresh } = await useFetch<Paginated<AdminUser>>('/api/admin/users', {
  query: { q, plan, page, limit: 10 },
  default: () => ({ data: [], meta: { page: 1, limit: 10, total: 0, total_pages: 0 } }),
})
const rows = computed(() => res.value.data)
const totalPages = computed(() => res.value.meta.total_pages)
const total = computed(() => res.value.meta.total)

const avatarPalette: AvatarColor[] = ['son', 'reu', 'gold', 'ink']
const avatarColor = (i: number): AvatarColor => avatarPalette[i % avatarPalette.length]!

// edit / create dialog
const dialogOpen = ref(false)
const editing = ref<AdminUser | null>(null)
const saving = ref(false)
const error = ref('')
const form = reactive({ email: '', name: '', password: '', plan: 'Free', role: 'user' as AdminUser['role'] })

function openCreate() {
  editing.value = null
  Object.assign(form, { email: '', name: '', password: '', plan: 'Free', role: 'user' })
  error.value = ''
  dialogOpen.value = true
}

function openEdit(u: AdminUser) {
  editing.value = u
  Object.assign(form, { email: u.email, name: u.name, password: '', plan: u.plan, role: u.role })
  error.value = ''
  dialogOpen.value = true
}

async function save() {
  error.value = ''
  saving.value = true
  try {
    if (editing.value) {
      await $fetch(`/api/admin/users/${editing.value.id}`, {
        method: 'PUT',
        body: { plan: form.plan, role: form.role, status: editing.value.status },
      })
    }
    else {
      await $fetch('/api/admin/users', {
        method: 'POST',
        body: { email: form.email, name: form.name, password: form.password, plan: form.plan, role: form.role },
      })
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

async function toggleBan(u: AdminUser) {
  await $fetch(`/api/admin/users/${u.id}`, {
    method: 'PUT',
    body: { plan: u.plan, role: u.role, status: u.status === 'active' ? 'banned' : 'active' },
  })
  await refresh()
}
</script>

<template>
  <div class="flex flex-col">
    <!-- toolbar -->
    <div class="flex items-center gap-3 flex-wrap mb-4">
      <div class="max-w-[300px] flex-1 min-w-[200px]">
        <LnSearch v-model="q" placeholder="Tìm theo tên hoặc email…" />
      </div>
      <LnSegment v-model="plan" :options="[{ v: 'all', label: 'Tất cả' }, { v: 'pro', label: 'Pro' }, { v: 'free', label: 'Free' }]" />
      <div class="flex-1" />
      <LnBtn variant="primary" size="sm" icon="user-plus" @click="openCreate">Thêm</LnBtn>
    </div>

    <!-- table -->
    <div class="bg-paper-0 border border-line rounded-lg-ln overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th v-for="h in ['Người dùng', 'Gói', 'ELO', 'Vai trò', 'Trạng thái', 'Tham gia', '']" :key="h" class="text-left font-body font-bold text-[0.72rem] tracking-[0.04em] uppercase text-ink-3 px-4 py-3 bg-paper-2 border-b border-line whitespace-nowrap">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(u, i) in rows" :key="u.id" class="transition-colors hover:bg-paper-1">
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <div class="flex items-center gap-2.5">
                <LnAvatar :name="u.name" :color="avatarColor(i)" :size="34" />
                <div>
                  <div class="font-body text-[0.8125rem] font-semibold">{{ u.name }}</div>
                  <div class="text-xs text-ink-3">{{ u.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <LnBadge v-if="u.plan === 'Pro'" tone="gold" status>Pro</LnBadge>
              <span v-else class="ln-spill mut">Free</span>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle tabular-nums font-body text-[0.9375rem]">{{ u.elo }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <LnBadge v-if="u.role === 'mod'" tone="reu">Mod</LnBadge>
              <LnBadge v-else-if="u.role === 'admin'" tone="gold">Admin</LnBadge>
              <span v-else class="text-ink-3 text-xs">Thành viên</span>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <span class="ln-spill" :class="u.status === 'active' ? 'ok' : 'err'">{{ u.status === 'active' ? 'Hoạt động' : 'Bị khóa' }}</span>
            </td>
            <td class="px-4 py-3 border-b border-line-soft align-middle text-ink-3 text-xs">{{ u.joined }}</td>
            <td class="px-4 py-3 border-b border-line-soft align-middle">
              <div class="flex gap-1 justify-end">
                <LnIconBtn :size="32" title="Sửa" @click="openEdit(u)"><LnIcon name="pen-line" :size="15" /></LnIconBtn>
                <LnIconBtn :size="32" :title="u.status === 'active' ? 'Khóa' : 'Mở khóa'" @click="toggleBan(u)">
                  <LnIcon :name="u.status === 'active' ? 'ban' : 'check'" :size="15" :class="u.status === 'active' ? 'text-error' : 'text-success'" />
                </LnIconBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- footer -->
    <div class="flex items-center justify-between mt-3.5">
      <span class="text-ink-3 text-xs">{{ total }} người dùng</span>
      <LnPager v-model:page="page" :total-pages="totalPages" />
    </div>

    <!-- create / edit dialog -->
    <LnDialog :open="dialogOpen" :width="460" @close="dialogOpen = false">
      <div class="flex items-center justify-between mb-4">
        <b class="font-display text-[1.3125rem] font-bold">{{ editing ? 'Sửa người dùng' : 'Thêm người dùng' }}</b>
        <LnIconBtn @click="dialogOpen = false"><LnIcon name="x" :size="20" /></LnIconBtn>
      </div>

      <div class="flex flex-col gap-3.5">
        <template v-if="!editing">
          <LnField v-model="form.email" label="Email" type="email" placeholder="ban@email.com" />
          <LnField v-model="form.name" label="Tên hiển thị" placeholder="VD: Minh Anh" />
          <LnField v-model="form.password" label="Mật khẩu" type="password" placeholder="••••••••" hint="Tối thiểu 6 ký tự." />
        </template>
        <div v-else class="text-ink-3 text-sm">{{ form.name }} · {{ form.email }}</div>

        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Gói</label>
          <select v-model="form.plan" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] focus:outline-none focus:border-son">
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Vai trò</label>
          <select v-model="form.role" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] focus:outline-none focus:border-son">
            <option value="user">Thành viên</option>
            <option value="mod">Mod</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <p v-if="error" class="text-error text-xs">{{ error }}</p>

        <div class="flex gap-2.5 mt-1">
          <LnBtn variant="ghost" class="flex-1" :disabled="saving" @click="dialogOpen = false">Hủy</LnBtn>
          <LnBtn variant="primary" class="flex-1" :disabled="saving" @click="save">
            {{ saving ? 'Đang lưu…' : (editing ? 'Lưu' : 'Tạo') }}
          </LnBtn>
        </div>
      </div>
    </LnDialog>
  </div>
</template>

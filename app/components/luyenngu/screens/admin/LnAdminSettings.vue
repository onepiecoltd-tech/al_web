<script setup lang="ts">
import type { AdminSetting, CoinPack } from '~/types/api'

const { data: gifts } = await useGifts()
const toast = useToast()

const { data: coinPacks, refresh: refreshPacks } = await useFetch<CoinPack[]>('/api/coin-packs', { default: () => [] })

// coin pack dialog
const packOpen = ref(false)
const editingPack = ref<CoinPack | null>(null)
const packForm = reactive({ vnd: 0, coins: 0, popular: false })
const packSaving = ref(false)

function openPackCreate() {
  editingPack.value = null
  Object.assign(packForm, { vnd: 0, coins: 0, popular: false })
  packOpen.value = true
}
function openPackEdit(p: CoinPack) {
  editingPack.value = p
  Object.assign(packForm, { vnd: p.vnd, coins: p.coins, popular: p.popular })
  packOpen.value = true
}
async function savePack() {
  packSaving.value = true
  const isEdit = !!editingPack.value
  try {
    if (editingPack.value)
      await $fetch(`/api/admin/coin-packs/${editingPack.value.id}`, { method: 'PUT', body: { ...packForm } })
    else
      await $fetch('/api/admin/coin-packs', { method: 'POST', body: { ...packForm } })
    packOpen.value = false
    await refreshPacks()
    toast.ok(isEdit ? 'Đã cập nhật gói xu.' : 'Đã tạo gói xu mới.')
  }
  catch {
    toast.err('Lưu gói xu thất bại.')
  }
  finally {
    packSaving.value = false
  }
}
async function deletePack(p: CoinPack) {
  try {
    await $fetch(`/api/admin/coin-packs/${p.id}`, { method: 'DELETE' })
    await refreshPacks()
    toast.ok(`Đã xóa gói ${p.coins} xu.`)
  }
  catch {
    toast.err('Xóa gói xu thất bại.')
  }
}

const { data: flags, refresh } = await useFetch<AdminSetting[]>('/api/admin/settings', { default: () => [] })

const saving = ref<string | null>(null)
async function toggle(s: AdminSetting, value: boolean) {
  saving.value = s.key
  try {
    await $fetch(`/api/admin/settings/${s.key}`, { method: 'PUT', body: { value } })
    await refresh()
  }
  finally {
    saving.value = null
  }
}
</script>

<template>
  <div class="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[1040px]:grid-cols-1">
    <!-- gifts catalog -->
    <LnCard pop>
      <b class="font-body text-base font-bold">Danh mục quà (gifts)</b>
      <p class="text-ink-3 text-xs mt-1 mb-3">Giá tính bằng xu. Sửa sẽ áp dụng cho mọi livestream.</p>
      <div v-for="g in gifts" :key="g.id" class="flex items-center gap-3 py-[9px] border-b border-line-soft last:border-0">
        <span class="text-2xl leading-none">{{ g.emoji }}</span>
        <span class="flex-1 font-body text-[0.9375rem] font-semibold">{{ g.name }}</span>
        <LnCoinsPill :amount="g.price" />
        <LnIconBtn :size="30"><LnIcon name="pen-line" :size="14" /></LnIconBtn>
      </div>
      <LnBtn variant="outline" size="sm" icon="plus" class="mt-3">Thêm quà</LnBtn>
    </LnCard>

    <div class="flex flex-col gap-4">
      <!-- coin packages -->
      <LnCard>
        <b class="font-body text-base font-bold">Gói nạp xu</b>
        <div class="mt-2.5">
          <div v-for="p in coinPacks" :key="p.id" class="flex items-center gap-3 py-[9px] border-b border-line-soft last:border-0">
            <span class="flex-1 font-body text-[0.9375rem] font-semibold">₫{{ p.vnd.toLocaleString('vi') }}</span>
            <LnBadge v-if="p.popular" tone="gold" status>Phổ biến</LnBadge>
            <span class="text-ink-3">{{ p.coins.toLocaleString('vi') }} xu</span>
            <LnIconBtn :size="30" title="Sửa" @click="openPackEdit(p)"><LnIcon name="pen-line" :size="14" /></LnIconBtn>
            <LnIconBtn :size="30" title="Xóa" @click="deletePack(p)"><LnIcon name="trash-2" :size="14" class="text-error" /></LnIconBtn>
          </div>
        </div>
        <LnBtn variant="outline" size="sm" icon="plus" class="mt-3" @click="openPackCreate">Thêm gói</LnBtn>
      </LnCard>

      <!-- feature flags -->
      <LnCard>
        <b class="font-body text-base font-bold">Cờ tính năng</b>
        <div class="mt-1.5">
          <div
            v-for="(f, i) in flags"
            :key="f.key"
            class="flex items-center justify-between gap-4 py-[13px]"
            :class="i === flags.length - 1 ? '' : 'border-b border-line-soft'"
          >
            <div class="font-body text-[0.9375rem]">{{ f.label }}</div>
            <LnSwitch :model-value="f.value" :disabled="saving === f.key" @update:model-value="(v: boolean) => toggle(f, v)" />
          </div>
        </div>
      </LnCard>
    </div>

    <LnDialog :open="packOpen" :width="380" @close="packOpen = false">
      <div class="flex items-center justify-between mb-4">
        <b class="font-display text-[1.3125rem] font-bold">{{ editingPack ? 'Sửa gói nạp' : 'Thêm gói nạp' }}</b>
        <LnIconBtn @click="packOpen = false"><LnIcon name="x" :size="20" /></LnIconBtn>
      </div>
      <div class="flex flex-col gap-3.5">
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Giá (VND)</label>
          <input v-model.number="packForm.vnd" type="number" min="0" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] focus:outline-none focus:border-son">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.8125rem] font-semibold text-ink-2">Số xu</label>
          <input v-model.number="packForm.coins" type="number" min="0" class="w-full px-[13px] py-[11px] rounded-md-ln border border-line-strong bg-paper-0 font-body text-[0.9375rem] focus:outline-none focus:border-son">
        </div>
        <div class="flex items-center justify-between">
          <span class="font-body text-[0.9375rem]">Đánh dấu "Phổ biến"</span>
          <LnSwitch v-model="packForm.popular" />
        </div>
        <div class="flex gap-2.5 mt-1">
          <LnBtn variant="ghost" class="flex-1" @click="packOpen = false">Hủy</LnBtn>
          <LnBtn variant="primary" class="flex-1" :disabled="packSaving" @click="savePack">Lưu</LnBtn>
        </div>
      </div>
    </LnDialog>
  </div>
</template>

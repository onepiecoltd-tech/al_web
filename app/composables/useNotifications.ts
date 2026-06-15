import type { Notification } from '~/types/api'

// Shared across the bell (count) and the popover (list). The 'notifications'
// key makes useFetch return the same state, so mark-all-read updates both.
export function useNotifications() {
  const { data, refresh } = useFetch<Notification[]>('/api/notifications', {
    default: () => [],
    key: 'notifications',
  })
  const unread = computed(() => data.value.filter(n => !n.read).length)

  async function markAllRead() {
    await $fetch('/api/notifications/read', { method: 'POST' })
    await refresh()
  }

  return { notifs: data, unread, refresh, markAllRead }
}

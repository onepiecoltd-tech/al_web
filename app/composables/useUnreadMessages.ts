// Unread direct-message count, shared (via the 'unread_messages' key) between
// the sidebar badge and the chat screen so marking a conversation read
// updates the badge too. The chat screen keeps it fresh on send/receive;
// elsewhere a slow poll catches messages that arrive while you're on another
// page (the realtime WS only runs on the chat screen).
export function useUnreadMessages() {
  const auth = useAuthStore()
  const { data, refresh } = useFetch<{ count: number }>('/api/messages/unread-count', {
    default: () => ({ count: 0 }),
    key: 'unread_messages',
    immediate: auth.authed,
  })
  const count = computed(() => data.value.count)
  return { count, refresh }
}

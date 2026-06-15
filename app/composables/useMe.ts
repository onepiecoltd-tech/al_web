import type { Profile } from '~/types/api'

// Current user's profile. Shared via the 'me' key so the layout, profile
// screen, and admin gate reuse one fetch.
export function useMe() {
  const { data: me, refresh } = useFetch<Profile | null>('/api/me', { default: () => null, key: 'me' })
  const isAdmin = computed(() => me.value?.role === 'admin' || me.value?.role === 'mod')
  return { me, isAdmin, refresh }
}

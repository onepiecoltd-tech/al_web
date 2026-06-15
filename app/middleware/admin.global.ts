// Role gate for /admin/*: only admin/mod may enter; others are sent home.
// Backend also enforces this (403), but this avoids rendering admin pages.
export default defineNuxtRouteMiddleware(async (to) => {
  const localePath = useLocalePath()
  const path = to.path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
  if (!path.startsWith('/admin'))
    return

  const auth = useAuthStore()
  if (!auth.authed)
    return navigateTo(localePath('/login'))

  // useRequestFetch forwards cookies during SSR so /api/me sees the token.
  const requestFetch = useRequestFetch()
  try {
    const me = await requestFetch<{ role?: string }>('/api/me')
    if (me?.role !== 'admin' && me?.role !== 'mod')
      return navigateTo(localePath('/'))
  }
  catch {
    return navigateTo(localePath('/'))
  }
})

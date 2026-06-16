// When `maintenance` is on, send non-admins to /bao-tri. Admins/mods pass.
// Backend status flag is the source of truth.
export default defineNuxtRouteMiddleware(async (to) => {
  const localePath = useLocalePath()
  const reqFetch = useRequestFetch()

  let status: { maintenance?: boolean } | null = null
  try {
    status = await reqFetch<{ maintenance?: boolean }>('/api/status')
  }
  catch {
    return
  }
  if (!status?.maintenance)
    return

  const path = to.path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
  if (path === '/bao-tri' || path === '/login')
    return

  const auth = useAuthStore()
  if (auth.authed) {
    try {
      const me = await reqFetch<{ role?: string }>('/api/me')
      if (me?.role === 'admin' || me?.role === 'mod')
        return
    }
    catch {}
  }
  return navigateTo(localePath('/bao-tri'))
})

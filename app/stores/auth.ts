export interface AuthUser {
  id: string
  email: string
  display_name: string
  created_at: string
}

// Auth goes through Nitro server routes (BFF): the JWT lives in an httpOnly
// cookie set server-side and is never exposed to JS. This store only tracks
// the readable "authed" marker (for the route gate) and the current user.
export const useAuthStore = defineStore('auth', () => {
  const flag = useCookie<string | null>('authed', {
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  })
  const user = useState<AuthUser | null>('auth_user', () => null)
  const authed = computed(() => !!flag.value)

  async function login(email: string, password: string) {
    const res = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = res.user
    flag.value = '1' // reflect the cookie the server just set, without a reload
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    flag.value = null
  }

  return { user, authed, login, logout }
})

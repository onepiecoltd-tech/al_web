// BFF login: browser → Nitro (same origin) → Go API (server-to-server).
// The JWT is stored in an httpOnly cookie the browser JS can never read; a
// separate readable "authed" marker drives the route gate.
interface GoLoginResponse {
  data: { token: string, user: unknown }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, password?: string }>(event)
  const { apiBase } = useRuntimeConfig(event)

  let res: GoLoginResponse
  try {
    res = await $fetch<GoLoginResponse>(`${apiBase}/api/v1/auth/login`, {
      method: 'POST',
      body,
    })
  }
  catch (e) {
    const err = e as { response?: { status?: number }, data?: { error?: string } }
    throw createError({
      statusCode: err.response?.status ?? 502,
      statusMessage: err.data?.error ?? 'Đăng nhập thất bại. Vui lòng thử lại.',
    })
  }

  const opts = { sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 }
  setCookie(event, 'auth_token', res.data.token, { ...opts, httpOnly: true })
  setCookie(event, 'authed', '1', opts) // readable marker for the route gate

  return { user: res.data.user }
})

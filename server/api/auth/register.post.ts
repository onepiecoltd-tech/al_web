// BFF register: browser → Nitro → Go. Auto-logs in (sets the same cookies as login).
interface GoLoginResponse {
  data: { token: string, user: unknown }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, name?: string, password?: string }>(event)
  const { apiBase } = useRuntimeConfig(event)

  let res: GoLoginResponse
  try {
    res = await $fetch<GoLoginResponse>(`${apiBase}/api/v1/auth/register`, {
      method: 'POST',
      body,
    })
  }
  catch (e) {
    const err = e as { response?: { status?: number }, data?: { error?: string } }
    throw createError({
      statusCode: err.response?.status ?? 502,
      message: err.data?.error ?? 'Đăng ký thất bại. Vui lòng thử lại.',
    })
  }

  const opts = { sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 }
  setCookie(event, 'auth_token', res.data.token, { ...opts, httpOnly: true })
  setCookie(event, 'authed', '1', opts)

  return { user: res.data.user }
})

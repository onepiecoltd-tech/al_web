import type { H3Event } from 'h3'

// Calls the Go API server-side, attaching the httpOnly JWT cookie as a Bearer
// token, and maps Go's { error } body to an H3 error. See memory: web-api-bff-pattern.
export async function backend<T = unknown>(
  event: H3Event,
  path: string,
  opts: Record<string, unknown> = {},
): Promise<T> {
  // Plain-typed alias (resolved at call time, not module load): calling $fetch
  // with a runtime string URL otherwise triggers excessive route-literal inference.
  const apiFetch = $fetch as unknown as (url: string, opts?: Record<string, unknown>) => Promise<unknown>
  const { apiBase } = useRuntimeConfig(event)
  const token = getCookie(event, 'auth_token')
  try {
    return await apiFetch(`${apiBase}${path}`, {
      ...opts,
      headers: {
        ...(opts.headers as Record<string, string> | undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }) as T
  }
  catch (e) {
    const err = e as { response?: { status?: number }, data?: { error?: string } }
    throw createError({
      statusCode: err.response?.status ?? 502,
      statusMessage: err.data?.error ?? 'Lỗi máy chủ. Vui lòng thử lại.',
    })
  }
}

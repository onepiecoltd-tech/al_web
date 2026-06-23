// Giải đề AI: ask a question about one of the current user's exams.
// GET + query param (not POST + body) because the browser consumes this via
// the native EventSource API — manual fetch()+ReadableStream streaming is
// unreliable in Chrome, which buffers the whole response internally before
// releasing any chunks to JS for small/short payloads. EventSource doesn't
// have that problem since it's purpose-built for SSE.
//
// Streams the answer through from Go rather than buffering the full
// response — bypasses the backend() helper (which uses $fetch and awaits the
// whole body) in favor of a raw fetch + piped stream.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const question = getQuery(event).question
  const { apiBase } = useRuntimeConfig(event)
  const token = getCookie(event, 'auth_token')

  const res = await fetch(`${apiBase}/api/v1/exams/${id}/ask?question=${encodeURIComponent(String(question ?? ''))}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}) as { error?: string })
    throw createError({
      statusCode: res.status || 502,
      message: data?.error ?? 'Lỗi máy chủ. Vui lòng thử lại.',
    })
  }

  setResponseHeaders(event, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  })
  return sendStream(event, res.body)
})

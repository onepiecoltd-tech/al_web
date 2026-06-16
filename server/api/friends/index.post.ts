// Add a friend (auth).
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  await backend(event, '/api/v1/friends', { method: 'POST', body })
  return { ok: true }
})

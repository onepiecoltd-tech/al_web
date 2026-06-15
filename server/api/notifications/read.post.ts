// Mark all notifications read (auth): browser → Nitro → Go (token from cookie).
export default defineEventHandler(async (event) => {
  await backend(event, '/api/v1/notifications/read', { method: 'POST' })
  return { ok: true }
})

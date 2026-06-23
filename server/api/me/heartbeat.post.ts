// Presence ping (auth): browser → Nitro → Go. Marks the user online.
export default defineEventHandler(async (event) => {
  await backend(event, '/api/v1/me/heartbeat', { method: 'POST' })
  return { ok: true }
})

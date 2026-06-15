// Notifications (auth): browser → Nitro → Go /api/v1/notifications (token from cookie).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/notifications')
  return res.data
})

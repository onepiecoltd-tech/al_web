// Mark a conversation as read (auth).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await backend(event, `/api/v1/messages/${id}/read`, { method: 'POST' })
  return { ok: true }
})

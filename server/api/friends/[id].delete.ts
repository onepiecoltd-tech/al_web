// Remove a friend (auth).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await backend(event, `/api/v1/friends/${id}`, { method: 'DELETE' })
  return { ok: true }
})

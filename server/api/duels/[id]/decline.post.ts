// Decline a pending duel (auth).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await backend(event, `/api/v1/duels/${id}/decline`, { method: 'POST' })
  return { ok: true }
})

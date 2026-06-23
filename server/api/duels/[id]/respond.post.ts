// Respond to a duel with your score, resolving the match (auth).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ score?: number }>(event)
  const res = await backend<{ data: unknown }>(event, `/api/v1/duels/${id}/respond`, { method: 'POST', body })
  return res.data
})

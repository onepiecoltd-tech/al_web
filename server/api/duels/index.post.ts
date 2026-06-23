// Challenge a friend to a pronunciation duel (auth).
export default defineEventHandler(async (event) => {
  const body = await readBody<{ opponent_id?: string, prompt?: string, score?: number }>(event)
  const res = await backend<{ data: unknown }>(event, '/api/v1/duels', { method: 'POST', body })
  return res.data
})

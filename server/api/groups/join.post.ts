// Join a study group by code — sends a request for owner approval (auth).
export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string }>(event)
  const res = await backend<{ data: { group: unknown, pending: boolean } }>(event, '/api/v1/groups/join', { method: 'POST', body: { code: body?.code } })
  return res.data
})

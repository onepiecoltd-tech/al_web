// Send a direct message to a friend (auth).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ body?: string }>(event)
  const res = await backend<{ data: unknown }>(event, `/api/v1/messages/${id}`, { method: 'POST', body: { body: body?.body } })
  return res.data
})

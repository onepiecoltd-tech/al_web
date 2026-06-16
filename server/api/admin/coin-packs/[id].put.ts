export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, `/api/v1/admin/coin-packs/${id}`, { method: 'PUT', body })
  return res.data
})

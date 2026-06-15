// Admin: toggle a feature setting (auth + admin).
export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, `/api/v1/admin/settings/${key}`, { method: 'PUT', body })
  return res.data
})

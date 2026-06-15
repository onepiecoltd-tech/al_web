// Admin: update a user's plan/role/status (auth + admin).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, `/api/v1/admin/users/${id}`, { method: 'PUT', body })
  return res.data
})

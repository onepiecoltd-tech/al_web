// Admin: update exam (auth + admin).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, `/api/v1/admin/exams/${id}`, { method: 'PUT', body })
  return res.data
})

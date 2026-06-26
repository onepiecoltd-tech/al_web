// Admin: edit a question's prompt and sample answer (auth + admin).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, `/api/v1/admin/questions/${id}`, { method: 'PUT', body })
  return res.data
})

// Admin: get one exam (auth + admin).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<{ data: unknown }>(event, `/api/v1/admin/exams/${id}`)
  return res.data
})

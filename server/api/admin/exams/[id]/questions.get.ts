// Admin: list an exam's questions (auth + admin).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<{ data: unknown }>(event, `/api/v1/admin/exams/${id}/questions`)
  return res.data
})

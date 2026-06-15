// Admin: create exam (auth + admin).
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, '/api/v1/admin/exams', { method: 'POST', body })
  return res.data
})

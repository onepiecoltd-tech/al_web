// Admin: list exams (auth + admin).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/admin/exams')
  return res.data
})

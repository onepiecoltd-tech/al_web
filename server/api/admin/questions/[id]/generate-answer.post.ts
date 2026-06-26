// Admin: generate a sample answer for one question via AI (auth + admin).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<{ data: { sample_answer: string } }>(event, `/api/v1/admin/questions/${id}/generate-answer`, { method: 'POST' })
  return res.data
})

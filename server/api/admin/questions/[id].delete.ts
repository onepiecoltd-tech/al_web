// Admin: delete a question (auth + admin).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await backend(event, `/api/v1/admin/questions/${id}`, { method: 'DELETE' })
  return { ok: true }
})

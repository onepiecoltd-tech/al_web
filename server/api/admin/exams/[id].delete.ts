// Admin: delete exam (auth + admin).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await backend(event, `/api/v1/admin/exams/${id}`, { method: 'DELETE' })
  return { ok: true }
})

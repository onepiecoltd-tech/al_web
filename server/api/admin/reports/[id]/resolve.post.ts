// Admin: resolve a report (dismiss/hide/remove).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, `/api/v1/admin/reports/${id}/resolve`, { method: 'POST', body })
  return res.data
})

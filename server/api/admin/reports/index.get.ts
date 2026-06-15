// Admin: list moderation reports (auth + admin). Forwards ?status.
export default defineEventHandler(async (event) => {
  const status = getQuery(event).status ?? 'open'
  const res = await backend<{ data: unknown[] }>(event, `/api/v1/admin/reports?status=${status}`)
  return res.data
})

// Admin: revenue summary.
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown }>(event, '/api/v1/admin/revenue')
  return res.data
})

// Admin: all transactions (paginated).
export default defineEventHandler(async (event) => {
  const qs = new URLSearchParams(getQuery(event) as Record<string, string>).toString()
  return backend(event, `/api/v1/admin/transactions${qs ? `?${qs}` : ''}`)
})

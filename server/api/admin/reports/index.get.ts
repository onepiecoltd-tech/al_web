// Admin: list reports (paginated, by status). browser → Nitro → Go.
export default defineEventHandler(async (event) => {
  const qs = new URLSearchParams(getQuery(event) as Record<string, string>).toString()
  return backend(event, `/api/v1/admin/reports${qs ? `?${qs}` : ''}`)
})

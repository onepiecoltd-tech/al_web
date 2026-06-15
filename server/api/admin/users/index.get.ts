// Admin: list users (paginated + search). browser → Nitro → Go.
export default defineEventHandler(async (event) => {
  const qs = new URLSearchParams(getQuery(event) as Record<string, string>).toString()
  return backend(event, `/api/v1/admin/users${qs ? `?${qs}` : ''}`)
})

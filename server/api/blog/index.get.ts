// Public blog list (paginated): browser → Nitro → Go /api/v1/blog.
export default defineEventHandler(async (event) => {
  const qs = new URLSearchParams(getQuery(event) as Record<string, string>).toString()
  return backend(event, `/api/v1/blog${qs ? `?${qs}` : ''}`)
})

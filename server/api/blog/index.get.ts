// Public blog list: browser → Nitro → Go /api/v1/blog.
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/blog')
  return res.data
})

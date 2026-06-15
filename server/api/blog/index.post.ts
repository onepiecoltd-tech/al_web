// Create a blog post (auth): browser → Nitro → Go (token from cookie).
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, '/api/v1/blog', { method: 'POST', body })
  return res.data
})

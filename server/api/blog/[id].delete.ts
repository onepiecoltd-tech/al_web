// Delete a blog post (auth): browser → Nitro → Go (token from cookie).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await backend(event, `/api/v1/blog/${id}`, { method: 'DELETE' })
  return { ok: true }
})

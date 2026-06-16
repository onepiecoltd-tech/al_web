// Add a comment (auth). browser → Nitro → Go (token from cookie).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, `/api/v1/blog/${id}/comments`, { method: 'POST', body })
  return res.data
})

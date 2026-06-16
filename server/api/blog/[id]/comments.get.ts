// Public: list comments of a post.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<{ data: unknown[] }>(event, `/api/v1/blog/${id}/comments`)
  return res.data
})

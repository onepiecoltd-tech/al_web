// Admin: get one question (with exam name + language). browser → Nitro → Go.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<{ data: unknown }>(event, `/api/v1/admin/questions/${id}`)
  return res.data
})

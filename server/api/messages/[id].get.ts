// Message history with a friend (auth): browser → Nitro → Go.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<{ data: unknown[] }>(event, `/api/v1/messages/${id}`)
  return res.data
})

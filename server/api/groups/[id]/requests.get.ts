// Pending join requests for a group (auth, owner only).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<{ data: unknown[] }>(event, `/api/v1/groups/${id}/requests`)
  return res.data
})

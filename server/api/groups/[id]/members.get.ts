// A study group's members (auth, members only).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<{ data: unknown[] }>(event, `/api/v1/groups/${id}/members`)
  return res.data
})

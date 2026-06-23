// Accept a pending friend request (auth).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await backend(event, `/api/v1/friends/requests/${id}/accept`, { method: 'POST' })
  return { ok: true }
})

// Reject a pending join request (auth, owner only).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const userId = getRouterParam(event, 'userId')
  await backend(event, `/api/v1/groups/${id}/requests/${userId}/reject`, { method: 'POST' })
  return { ok: true }
})

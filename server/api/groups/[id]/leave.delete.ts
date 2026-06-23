// Leave a study group (auth).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await backend(event, `/api/v1/groups/${id}/leave`, { method: 'DELETE' })
  return { ok: true }
})

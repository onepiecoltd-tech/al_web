export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await backend(event, `/api/v1/admin/coin-packs/${id}`, { method: 'DELETE' })
  return { ok: true }
})

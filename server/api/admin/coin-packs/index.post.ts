export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, '/api/v1/admin/coin-packs', { method: 'POST', body })
  return res.data
})

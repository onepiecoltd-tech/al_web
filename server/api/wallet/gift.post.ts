// Send a gift, spending coins (auth).
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, '/api/v1/wallet/gift', { method: 'POST', body })
  return res.data
})

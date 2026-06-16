// Buy a coin pack (auth).
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await backend<{ data: unknown }>(event, '/api/v1/wallet/topup', { method: 'POST', body })
  return res.data
})

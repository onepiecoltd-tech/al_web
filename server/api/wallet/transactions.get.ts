// My wallet transactions (auth).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/wallet/transactions')
  return res.data
})

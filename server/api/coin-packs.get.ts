// Coin packs (public).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/coin-packs')
  return res.data
})

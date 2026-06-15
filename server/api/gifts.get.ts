// Gift catalog (public): browser → Nitro → Go /api/v1/gifts.
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/gifts')
  return res.data
})

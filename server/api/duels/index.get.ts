// The current user's recent duels (auth).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/duels')
  return res.data
})

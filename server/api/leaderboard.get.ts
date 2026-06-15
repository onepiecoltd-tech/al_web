// Leaderboard (auth): browser → Nitro → Go /api/v1/leaderboard (token from cookie).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/leaderboard')
  return res.data
})

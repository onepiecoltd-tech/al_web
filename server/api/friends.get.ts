// Friends list (auth): browser → Nitro → Go /api/v1/friends (token from cookie).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/friends')
  return res.data
})

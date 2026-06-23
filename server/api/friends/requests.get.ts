// Pending incoming friend requests (auth): browser → Nitro → Go.
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/friends/requests')
  return res.data
})

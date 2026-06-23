// Unread direct-message count (auth): browser → Nitro → Go.
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: { count: number } }>(event, '/api/v1/messages/unread-count')
  return res.data
})

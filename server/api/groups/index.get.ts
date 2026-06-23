// The current user's study groups (auth).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/groups')
  return res.data
})

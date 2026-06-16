// Search users to befriend (auth). Forwards ?q.
export default defineEventHandler(async (event) => {
  const qs = new URLSearchParams(getQuery(event) as Record<string, string>).toString()
  const res = await backend<{ data: unknown[] }>(event, `/api/v1/users/search${qs ? `?${qs}` : ''}`)
  return res.data
})

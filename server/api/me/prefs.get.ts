export default defineEventHandler(async (event) => {
  const res = await backend<{ data: Record<string, boolean> }>(event, '/api/v1/me/prefs')
  return res.data
})

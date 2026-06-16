export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await backend<{ data: Record<string, boolean> }>(event, '/api/v1/me/prefs', { method: 'PUT', body })
  return res.data
})

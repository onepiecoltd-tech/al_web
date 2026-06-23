// Create a study group (auth).
export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string }>(event)
  const res = await backend<{ data: unknown }>(event, '/api/v1/groups', { method: 'POST', body: { name: body?.name } })
  return res.data
})

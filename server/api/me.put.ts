// Update the authenticated user's display name: browser → Nitro → Go.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string }>(event)
  const res = await backend<{ data: unknown }>(event, '/api/v1/me', { method: 'PUT', body: { name: body?.name } })
  return res.data
})

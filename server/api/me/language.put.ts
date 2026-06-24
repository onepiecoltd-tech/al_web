// Set the current user's learning language (auth). Proxies to Go.
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await backend<{ data: { learning_language: string } }>(event, '/api/v1/me/language', { method: 'PUT', body })
  return res.data
})

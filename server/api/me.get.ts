// Authenticated profile: browser → Nitro → Go /api/v1/me (token from cookie).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown }>(event, '/api/v1/me')
  return res.data
})

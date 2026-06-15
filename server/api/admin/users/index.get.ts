// Admin: list users (auth + admin). browser → Nitro → Go (token from cookie).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown[] }>(event, '/api/v1/admin/users')
  return res.data
})

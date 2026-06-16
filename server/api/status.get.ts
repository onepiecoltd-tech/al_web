// Public app status (feature flags affecting all clients).
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: unknown }>(event, '/api/v1/status')
  return res.data
})

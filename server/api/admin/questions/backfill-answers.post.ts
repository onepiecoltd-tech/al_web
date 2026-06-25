// Admin: manually trigger the AI answer-backfill job (auth + admin). Proxies to Go.
export default defineEventHandler(async (event) => {
  const res = await backend<{ data: { started: boolean } }>(
    event,
    '/api/v1/admin/questions/backfill-answers',
    { method: 'POST' },
  )
  return res.data
})

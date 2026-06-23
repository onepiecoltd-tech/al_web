// The published admin question bank, for any user to practice (auth). Proxies to Go.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return backend(event, '/api/v1/exam-bank', { query })
})

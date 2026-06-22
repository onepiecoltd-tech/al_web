// The current user's uploaded exams (auth). Proxies to Go.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return backend(event, '/api/v1/exams/mine', { query })
})

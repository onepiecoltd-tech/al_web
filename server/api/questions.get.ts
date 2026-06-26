// Pool of questions for a skill across exams (auth). Proxies to Go.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const res = await backend<{ data: { questions: unknown[] } }>(event, '/api/v1/questions', { query })
  return res.data
})

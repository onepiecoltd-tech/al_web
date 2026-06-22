// Detail view of one of the current user's own uploaded exams, with its questions.
interface GoExamDetail {
  data: { exam: unknown, questions: unknown[] }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<GoExamDetail>(event, `/api/v1/exams/${id}`)
  return res.data
})

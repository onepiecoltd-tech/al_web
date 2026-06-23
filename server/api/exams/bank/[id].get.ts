// Detail view of one published bank exam, with its questions.
interface GoExamDetail {
  data: { exam: unknown, questions: unknown[] }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<GoExamDetail>(event, `/api/v1/exam-bank/${id}`)
  return res.data
})

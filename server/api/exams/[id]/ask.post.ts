// Giải đề AI: ask a question about one of the current user's exams.
interface GoAskResponse {
  data: { answer: string }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ question?: string }>(event)
  const res = await backend<GoAskResponse>(event, `/api/v1/exams/${id}/ask`, {
    method: 'POST',
    body,
  })
  return res.data
})

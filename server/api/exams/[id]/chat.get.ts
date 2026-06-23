// Giải đề AI: load the persisted conversation for one of the current user's exams.
interface GoChatResponse {
  data: { messages: { id: string, role: string, text: string, created_at: string }[] }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res = await backend<GoChatResponse>(event, `/api/v1/exams/${id}/chat`)
  return res.data
})
